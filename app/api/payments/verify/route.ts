import { z } from "zod";
import { requireUser } from "@/lib/firebase/auth";
import { getAssessmentById, getPaymentOrderForUser, markPaymentPaid, storePlan } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { PLAN_PRICE_PAISE, verifyPaymentSignature } from "@/lib/payments/razorpay";
import { generatePlan } from "@/features/plan";

export const runtime = "nodejs";
const requestSchema = z.object({ razorpay_order_id: z.string().min(1).max(200), razorpay_payment_id: z.string().min(1).max(200), razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i) });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    enforceRateLimit(requestKey(request, "payment-verify", user.uid), 20);
    let body: unknown;
    try { body = await request.json(); } catch { throw new AppError("INVALID_REQUEST", "The request payload is invalid", 400); }
    const input = requestSchema.parse(body);
    const order = await getPaymentOrderForUser(user.uid, input.razorpay_order_id);
    if (order.amountPaise !== PLAN_PRICE_PAISE || order.currency !== "INR") throw new AppError("PAYMENT_INVALID", "Payment could not be verified", 400);
    if (!verifyPaymentSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) throw new AppError("PAYMENT_INVALID", "Payment could not be verified", 400);
    const assessment = await getAssessmentById(order.assessmentId);
    if (order.status !== "paid") await markPaymentPaid(order.id, input.razorpay_payment_id);
    await storePlan(user.uid, order.assessmentId, generatePlan(assessment, order.assessmentId));
    return Response.json({ verified: true, assessmentId: order.assessmentId });
  } catch (error) {
    return toErrorResponse(error);
  }
}
