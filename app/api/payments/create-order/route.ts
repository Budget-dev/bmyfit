import { z } from "zod";
import { requireUser } from "@/lib/firebase/auth";
import { getAssessment, reservePaymentOrder, attachProviderOrder } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { createRazorpayOrder, PLAN_PRICE_PAISE } from "@/lib/payments/razorpay";
import { publicEnv } from "@/lib/env/public";

export const runtime = "nodejs";
const requestSchema = z.object({ assessmentId: z.string().min(1).max(200) });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    enforceRateLimit(requestKey(request, "payment-create", user.uid), 10);
    let body: unknown;
    try { body = await request.json(); } catch { throw new AppError("INVALID_REQUEST", "The request payload is invalid", 400); }
    const input = requestSchema.parse(body);
    await getAssessment(user.uid, input.assessmentId);
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() || `${user.uid}:${input.assessmentId}`;
    if (idempotencyKey.length > 200) throw new AppError("INVALID_REQUEST", "The idempotency key is invalid", 400);
    const order = await reservePaymentOrder(user.uid, input.assessmentId, idempotencyKey, PLAN_PRICE_PAISE);
    if (!order.razorpayOrderId) {
      const providerOrder = await createRazorpayOrder(`bmyfit_${order.id}`);
      await attachProviderOrder(order.id, providerOrder.id);
      order.razorpayOrderId = providerOrder.id;
    }
    return Response.json({ orderId: order.razorpayOrderId, amount: PLAN_PRICE_PAISE, currency: "INR", keyId: publicEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID });
  } catch (error) {
    return toErrorResponse(error);
  }
}
