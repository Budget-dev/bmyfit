import "server-only";
import { AppError } from "@/lib/errors";
import { serverEnv } from "@/lib/env/server";
import { PLAN_PRICE_PAISE } from "@/lib/config";
import { verifyPaymentHmacSignature, verifyWebhookHmacSignature } from "./verify-signature";

export { PLAN_PRICE_PAISE };

function getRequiredSecret(secret: string | undefined, errorCode: string): string {
  if (!secret || secret.trim() === "") {
    throw new AppError(errorCode, "Payment service credentials are not configured", 503);
  }
  return secret;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string | null | undefined,
): boolean {
  const secret = getRequiredSecret(serverEnv.RAZORPAY_KEY_SECRET, "PAYMENT_NOT_CONFIGURED");
  return verifyPaymentHmacSignature(orderId, paymentId, signature, secret);
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
): boolean {
  const secret = getRequiredSecret(serverEnv.RAZORPAY_WEBHOOK_SECRET, "WEBHOOK_NOT_CONFIGURED");
  return verifyWebhookHmacSignature(rawBody, signature, secret);
}

export async function createRazorpayOrder(receipt: string): Promise<{ id: string }> {
  const keyId = getRequiredSecret(serverEnv.RAZORPAY_KEY_ID, "PAYMENT_NOT_CONFIGURED");
  const secret = getRequiredSecret(serverEnv.RAZORPAY_KEY_SECRET, "PAYMENT_NOT_CONFIGURED");

  const authHeader = Buffer.from(`${keyId}:${secret}`).toString("base64");
  const response = await fetch(`${serverEnv.RAZORPAY_API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: PLAN_PRICE_PAISE,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    throw new AppError("PAYMENT_PROVIDER_ERROR", "Unable to create payment order with gateway", 502);
  }

  const data = (await response.json()) as { id?: unknown };
  if (typeof data.id !== "string" || !data.id) {
    throw new AppError("PAYMENT_PROVIDER_ERROR", "Invalid response from payment gateway", 502);
  }

  return { id: data.id };
}
