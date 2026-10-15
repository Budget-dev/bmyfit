import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "@/lib/errors";
import { serverEnv } from "@/lib/env/server";

export const PLAN_PRICE_PAISE = 9900;

function requiredSecret(value: string | undefined, code: string): string {
  if (!value) throw new AppError(code, "Payment service is not configured", 503);
  return value;
}

export function verifyHmac(payload: string, suppliedSignature: string | null | undefined, secret: string): boolean {
  if (!suppliedSignature || !/^[a-f0-9]{64}$/i.test(suppliedSignature)) return false;
  const expected = createHmac("sha256", secret).update(payload, "utf8").digest();
  const received = Buffer.from(suppliedSignature, "hex");
  return received.length === expected.length && timingSafeEqual(expected, received);
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string | null | undefined) {
  return verifyHmac(`${orderId}|${paymentId}`, signature, requiredSecret(serverEnv.RAZORPAY_KEY_SECRET, "PAYMENT_NOT_CONFIGURED"));
}

export function verifyWebhookSignature(payload: string, signature: string | null | undefined) {
  return verifyHmac(payload, signature, requiredSecret(serverEnv.RAZORPAY_WEBHOOK_SECRET, "WEBHOOK_NOT_CONFIGURED"));
}

export async function createRazorpayOrder(receipt: string) {
  const keyId = requiredSecret(serverEnv.RAZORPAY_KEY_ID, "PAYMENT_NOT_CONFIGURED");
  const secret = requiredSecret(serverEnv.RAZORPAY_KEY_SECRET, "PAYMENT_NOT_CONFIGURED");
  const response = await fetch(`${serverEnv.RAZORPAY_API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: PLAN_PRICE_PAISE, currency: "INR", receipt, payment_capture: 1 }),
  });
  if (!response.ok) throw new AppError("PAYMENT_PROVIDER_ERROR", "Unable to create payment order", 502);
  const data = (await response.json()) as { id?: unknown };
  if (typeof data.id !== "string" || !data.id) throw new AppError("PAYMENT_PROVIDER_ERROR", "Unable to create payment order", 502);
  return { id: data.id };
}
