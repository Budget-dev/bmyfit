import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  verifyPaymentHmacSignature,
  verifyWebhookHmacSignature,
} from "@/features/payments/verify-signature";

describe("Razorpay Signature Verification", () => {
  const secret = "test_secret_key_1234567890abcdef";
  const orderId = "order_O1A2B3C4D5E6F7";
  const paymentId = "pay_P1A2B3C4D5E6F7";

  it("verifies genuine payment signature using HMAC SHA256 timingSafeEqual", () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = verifyPaymentHmacSignature(orderId, paymentId, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it("rejects tampered payment signatures", () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = createHmac("sha256", secret).update(payload).digest("hex");

    // Mutate one character
    const tampered =
      validSignature.slice(0, -1) + (validSignature.endsWith("a") ? "b" : "a");

    const isValid = verifyPaymentHmacSignature(orderId, paymentId, tampered, secret);
    expect(isValid).toBe(false);
  });

  it("rejects invalid format, null, or empty signatures without throwing exceptions", () => {
    expect(verifyPaymentHmacSignature(orderId, paymentId, null, secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, undefined, secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, "", secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, "short_invalid_sig", secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, "g".repeat(64), secret)).toBe(false); // Non-hex
  });

  it("verifies webhook signature over raw payload", () => {
    const webhookSecret = "webhook_secret_9876543210fedcba";
    const rawPayload = JSON.stringify({
      entity: "event",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_xyz123",
            order_id: "order_abc789",
            status: "captured",
            amount: 9900,
          },
        },
      },
    });

    const validWebhookSig = createHmac("sha256", webhookSecret).update(rawPayload).digest("hex");
    const isWebhookValid = verifyWebhookHmacSignature(rawPayload, validWebhookSig, webhookSecret);
    expect(isWebhookValid).toBe(true);

    const isTamperedInvalid = verifyWebhookHmacSignature(
      rawPayload + " ", // modified raw body
      validWebhookSig,
      webhookSecret
    );
    expect(isTamperedInvalid).toBe(false);
  });
});
