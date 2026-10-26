import { z } from "zod";
import { AppError, toErrorResponse } from "@/lib/errors";
import {
  findPaymentOrderByProviderId,
  getAssessmentById,
  markPaymentPaid,
  recordWebhookOnce,
  storePlan,
  storeDashboardPlan,
} from "@/lib/firestore/repositories";
import { verifyWebhookSignature, PLAN_PRICE_PAISE } from "@/lib/payments/razorpay";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { generatePlan } from "@/features/plan";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { registerPurchasedClient } from "@/features/admin/admin-data";

export const runtime = "nodejs";

const eventSchema = z
  .object({
    id: z.string().min(1).max(200).optional(),
    event: z.string().optional(),
    payload: z
      .object({
        payment: z
          .object({
            entity: z
              .object({
                id: z.string().optional(),
                order_id: z.string().optional(),
                amount: z.number().optional(),
                currency: z.string().optional(),
                status: z.string().optional(),
                email: z.string().optional(),
                contact: z.string().optional(),
                notes: z.record(z.string()).optional(),
              })
              .passthrough(),
          })
          .optional(),
        order: z
          .object({
            entity: z
              .object({
                id: z.string().optional(),
                amount: z.number().optional(),
                currency: z.string().optional(),
                status: z.string().optional(),
                receipt: z.string().optional(),
              })
              .passthrough(),
          })
          .optional(),
      })
      .optional(),
  })
  .passthrough();

export async function POST(request: Request) {
  try {
    enforceRateLimit(requestKey(request, "payment-webhook"), 120);

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Strictly verify webhook HMAC-SHA256 signature over raw string body
    if (!verifyWebhookSignature(rawBody, signature)) {
      throw new AppError("INVALID_WEBHOOK", "Webhook signature is invalid", 400);
    }

    let parsed: z.infer<typeof eventSchema>;
    try {
      parsed = eventSchema.parse(JSON.parse(rawBody));
    } catch {
      throw new AppError("INVALID_WEBHOOK", "Webhook payload is invalid", 400);
    }

    const eventId = request.headers.get("x-razorpay-event-id") || parsed.id;
    if (!eventId) {
      throw new AppError("INVALID_WEBHOOK", "Webhook event ID missing", 400);
    }

    // Replay attack prevention: process each unique webhook event ID exactly once
    const isFirstTime = await recordWebhookOnce(eventId);
    if (!isFirstTime) {
      return Response.json({ received: true, duplicate: true });
    }

    const payment = parsed.payload?.payment?.entity;
    const orderId = payment?.order_id || parsed.payload?.order?.entity.id;
    const paymentId = payment?.id || orderId;

    if (orderId && paymentId && (parsed.event === "payment.captured" || parsed.event === "order.paid")) {
      const order = await findPaymentOrderByProviderId(orderId);

      // Verify that order amount matches authoritative server price
      if (
        order &&
        order.amountPaise === PLAN_PRICE_PAISE &&
        (!payment?.amount || payment.amount === PLAN_PRICE_PAISE)
      ) {
        if (order.status !== "paid") {
          await markPaymentPaid(order.id, paymentId);
          order.status = "paid";
        }

        const assessment = await getAssessmentById(order.assessmentId);
        const detailedPlan = generatePlan(assessment, order.assessmentId);
        await storePlan(order.uid, order.assessmentId, detailedPlan);

        const customerName = payment?.notes?.customerName || "Fit Member";
        const dashboardPlan = generateDashboardPlan(order.assessmentId, {
          status: "pending_review",
          goal: assessment.goal,
          bmi: assessment.bmi ?? undefined,
          bodyFatPercent: assessment.bodyFatPercent ?? undefined,
          weeksCount: 8,
          customerName,
          coachNotes: "WEBHOOK FULFILLMENT: Payment captured by Razorpay. 8-Week plan created in pending review status for Coach dispatch.",
        });
        await storeDashboardPlan(order.uid, order.assessmentId, dashboardPlan);

        // Register in Admin store
        await registerPurchasedClient({
          userId: order.uid,
          assessmentId: order.assessmentId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          amountPaise: PLAN_PRICE_PAISE,
          customerName,
          customerEmail: payment?.email,
          customerPhone: payment?.contact,
          goal: assessment.goal,
          goalDisplay: assessment.goal === "fat-loss" ? "Fat Loss & Metabolic Reset" : "Custom Goal",
          biometrics: {
            gender: assessment.gender,
            age: assessment.age,
            heightCm: assessment.heightCm,
            weightKg: assessment.weightKg,
            waistIn: assessment.waistIn,
            neckIn: assessment.neckIn,
            hipIn: assessment.hipIn,
            bmi: assessment.bmi,
            bmiCategory: assessment.bmiCategory,
            bodyFatPercent: assessment.bodyFatPercent ?? undefined,
            bodyFatCategory: assessment.bodyFatCategory ?? undefined,
            dietPreference: assessment.dietPreference,
            activityLevel: assessment.activityLevel,
          },
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
