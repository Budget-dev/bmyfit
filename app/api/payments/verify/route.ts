import { z } from "zod";
import { optionalUser } from "@/lib/firebase/auth";
import {
  getAssessmentById,
  findPaymentOrderByProviderId,
  getPaymentOrderForUser,
  markPaymentPaid,
  storePlan,
  storeDashboardPlan,
} from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { PLAN_PRICE_PAISE, verifyPaymentSignature } from "@/lib/payments/razorpay";
import { generatePlan } from "@/features/plan";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { registerPurchasedClient } from "@/features/admin/admin-data";

export const runtime = "nodejs";

const requestSchema = z.object({
  razorpay_order_id: z.string().min(1).max(200),
  razorpay_payment_id: z.string().min(1).max(200),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid signature format"),
  customerName: z.string().max(100).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().max(30).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await optionalUser();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "The request payload is invalid", 400);
    }
    const input = requestSchema.parse(body);

    const uid =
      user?.uid ||
      request.headers.get("x-session-id")?.trim() ||
      "guest_client";

    enforceRateLimit(requestKey(request, "payment-verify", uid), 20);

    // Cryptographically verify HMAC-SHA256 signature using timingSafeEqual
    const isValidSignature = verifyPaymentSignature(
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature,
    );

    if (!isValidSignature) {
      throw new AppError("PAYMENT_INVALID", "Payment signature verification failed", 400);
    }

    // Lookup corresponding server-side order
    let order = await findPaymentOrderByProviderId(input.razorpay_order_id);
    if (!order && user) {
      try {
        order = await getPaymentOrderForUser(user.uid, input.razorpay_order_id);
      } catch {}
    }

    if (!order) {
      throw new AppError("NOT_FOUND", "Payment order not found on server", 404);
    }

    // Strict validation: amount and currency must match server configuration
    if (order.amountPaise !== PLAN_PRICE_PAISE || order.currency !== "INR") {
      throw new AppError("PAYMENT_INVALID", "Payment amount or currency mismatch", 400);
    }

    // Idempotently mark order as paid
    if (order.status !== "paid") {
      await markPaymentPaid(order.id, input.razorpay_payment_id);
      order.status = "paid";
      order.razorpayPaymentId = input.razorpay_payment_id;
    }

    // Fetch assessment and generate tailored plans
    const assessment = await getAssessmentById(order.assessmentId);
    const detailedPlan = generatePlan(assessment, order.assessmentId);
    await storePlan(order.uid, order.assessmentId, detailedPlan);

    const customerName = input.customerName || "Fit Member";
    const dashboardPlan = generateDashboardPlan(order.assessmentId, {
      status: "pending_review",
      goal: assessment.goal,
      bmi: assessment.bmi ?? undefined,
      bodyFatPercent: assessment.bodyFatPercent ?? undefined,
      weeksCount: 8,
      customerName,
      coachNotes: "NEW PURCHASE (Verified via Razorpay): 8-Week plan created in pending review status. Awaiting Coach review and dispatch.",
    });
    await storeDashboardPlan(order.uid, order.assessmentId, dashboardPlan);

    // Register into Admin Console store so the user immediately shows up under "Purchased Clients" and "Needs Coach Push"
    await registerPurchasedClient({
      userId: order.uid,
      assessmentId: order.assessmentId,
      razorpayOrderId: input.razorpay_order_id,
      razorpayPaymentId: input.razorpay_payment_id,
      amountPaise: PLAN_PRICE_PAISE,
      customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      goal: assessment.goal,
      goalDisplay: assessment.goal === "fat-loss" ? "Fat Loss & Metabolic Reset" : assessment.goal === "muscle-gain" ? "Hypertrophy & Conditioning" : "Weight Loss",
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

    return Response.json({
      verified: true,
      assessmentId: order.assessmentId,
      orderId: input.razorpay_order_id,
      status: "paid",
      planUrl: `/plan/${order.assessmentId}`,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
