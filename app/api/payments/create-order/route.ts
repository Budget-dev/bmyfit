import { z } from "zod";
import { optionalUser } from "@/lib/firebase/auth";
import { getAssessment, reservePaymentOrder, attachProviderOrder } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import {
  createRazorpayOrder,
  PLAN_PRICE_PAISE,
  isRazorpayConfigured,
  DEV_SANDBOX_KEY_ID,
} from "@/lib/payments/razorpay";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";

export const runtime = "nodejs";

const requestSchema = z.object({
  assessmentId: z.string().min(1).max(200),
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
      `guest_${input.assessmentId}`;

    enforceRateLimit(requestKey(request, "payment-create", uid), 20);

    // Verify assessment exists or initialize default
    await getAssessment(uid, input.assessmentId);

    const idempotencyKey =
      request.headers.get("Idempotency-Key")?.trim() || `${uid}:${input.assessmentId}`;
    if (idempotencyKey.length > 200) {
      throw new AppError("INVALID_REQUEST", "The idempotency key is invalid", 400);
    }

    // Authoritative server-side price: PLAN_PRICE_PAISE (9900 = Rs. 99)
    const order = await reservePaymentOrder(uid, input.assessmentId, idempotencyKey, PLAN_PRICE_PAISE);

    let isSandbox = !isRazorpayConfigured();
    let keyId = serverEnv.RAZORPAY_KEY_ID || publicEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID || DEV_SANDBOX_KEY_ID;

    if (!order.razorpayOrderId) {
      const receipt = `rcpt_${order.id}`.slice(0, 40);
      const providerOrder = await createRazorpayOrder({
        receipt,
        notes: {
          assessmentId: input.assessmentId,
          uid,
          planVersion: "rules-v1",
        },
        customer: {
          name: input.customerName,
          email: input.customerEmail,
          contact: input.customerPhone,
        },
      });

      await attachProviderOrder(order.id, providerOrder.id);
      order.razorpayOrderId = providerOrder.id;
      isSandbox = providerOrder.isSandbox;
      keyId = providerOrder.keyId;
    }

    return Response.json({
      orderId: order.razorpayOrderId,
      amount: PLAN_PRICE_PAISE,
      currency: "INR",
      keyId,
      isSandbox,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
