import { z } from "zod";
import { AppError, toErrorResponse } from "@/lib/errors";
import { findPaymentOrderByProviderId, getAssessmentById, markPaymentPaid, recordWebhookOnce, storePlan } from "@/lib/firestore/repositories";
import { verifyWebhookSignature, PLAN_PRICE_PAISE } from "@/lib/payments/razorpay";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { generatePlan } from "@/features/plan";

export const runtime = "nodejs";
const eventSchema = z.object({ id: z.string().min(1).max(200).optional(), event: z.string().optional(), payload: z.object({ payment: z.object({ entity: z.object({ id: z.string().optional(), order_id: z.string().optional(), amount: z.number().optional() }).passthrough() }).optional(), order: z.object({ entity: z.object({ id: z.string().optional(), amount: z.number().optional() }).passthrough() }).optional() }).optional() }).passthrough();

export async function POST(request: Request) {
  try {
    enforceRateLimit(requestKey(request, "payment-webhook"), 120);
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!verifyWebhookSignature(rawBody, signature)) throw new AppError("INVALID_WEBHOOK", "Webhook signature is invalid", 400);
    let parsed: z.infer<typeof eventSchema>;
    try { parsed = eventSchema.parse(JSON.parse(rawBody)); } catch { throw new AppError("INVALID_WEBHOOK", "Webhook payload is invalid", 400); }
    const eventId = request.headers.get("x-razorpay-event-id") || parsed.id;
    if (!eventId) throw new AppError("INVALID_WEBHOOK", "Webhook event is invalid", 400);
    const payment = parsed.payload?.payment?.entity;
    const orderId = payment?.order_id || parsed.payload?.order?.entity.id;
    const paymentId = payment?.id || orderId;
    if (orderId && paymentId && (parsed.event === "payment.captured" || parsed.event === "order.paid")) {
      const order = await findPaymentOrderByProviderId(orderId);
       if (order && order.amountPaise === PLAN_PRICE_PAISE && (!payment?.amount || payment.amount === PLAN_PRICE_PAISE)) {
         await markPaymentPaid(order.id, paymentId);
         const assessment = await getAssessmentById(order.assessmentId);
         await storePlan(order.uid, order.assessmentId, generatePlan(assessment, order.assessmentId));
       }
    }
    // Mark the event only after the provider state has been applied. Replayed
    // events remain harmless because the paid update is itself idempotent.
    await recordWebhookOnce(eventId);
    return Response.json({ received: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
