import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies Razorpay payment signature using HMAC SHA256 with timing-safe comparison.
 * The payload is `${orderId}|${paymentId}`.
 */
export function verifyPaymentHmacSignature(
  orderId: string,
  paymentId: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  if (!secret || secret.trim() === "") {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(payload, "utf8").digest();
  const received = Buffer.from(signature, "hex");

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

/**
 * Verifies Razorpay webhook signature over the raw request body.
 */
export function verifyWebhookHmacSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  if (!secret || secret.trim() === "") {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const received = Buffer.from(signature, "hex");

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
