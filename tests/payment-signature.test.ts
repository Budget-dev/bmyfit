import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  verifyPaymentHmacSignature,
  verifyWebhookHmacSignature,
  generatePaymentHmacSignature,
  generateWebhookHmacSignature,
} from "@/features/payments/verify-signature";
import { PLAN_PRICE_PAISE } from "@/lib/config";

describe("Razorpay Security & Signature Verification", () => {
  const secret = "test_secret_key_1234567890abcdef";
  const orderId = "order_O1A2B3C4D5E6F7";
  const paymentId = "pay_P1A2B3C4D5E6F7";

  it("verifies genuine payment signature using HMAC SHA256 timingSafeEqual", () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = verifyPaymentHmacSignature(orderId, paymentId, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it("generates and verifies signatures seamlessly with helper methods", () => {
    const signature = generatePaymentHmacSignature(orderId, paymentId, secret);
    expect(signature).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(signature)).toBe(true);

    const verified = verifyPaymentHmacSignature(orderId, paymentId, signature, secret);
    expect(verified).toBe(true);
  });

  it("rejects tampered payment signatures", () => {
    const validSignature = generatePaymentHmacSignature(orderId, paymentId, secret);

    // Mutate one character
    const tampered =
      validSignature.slice(0, -1) + (validSignature.endsWith("a") ? "b" : "a");

    const isValid = verifyPaymentHmacSignature(orderId, paymentId, tampered, secret);
    expect(isValid).toBe(false);
  });

  it("rejects signature when orderId or paymentId is swapped or altered", () => {
    const validSignature = generatePaymentHmacSignature(orderId, paymentId, secret);

    expect(verifyPaymentHmacSignature("order_different", paymentId, validSignature, secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, "pay_different", validSignature, secret)).toBe(false);
    // Swapped order
    expect(verifyPaymentHmacSignature(paymentId, orderId, validSignature, secret)).toBe(false);
  });

  it("rejects invalid format, null, undefined, or empty signatures without throwing exceptions", () => {
    expect(verifyPaymentHmacSignature(orderId, paymentId, null, secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, undefined, secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, "", secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, "short_invalid_sig", secret)).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, "g".repeat(64), secret)).toBe(false); // Non-hex
    expect(verifyPaymentHmacSignature(orderId, paymentId, " " + "a".repeat(64), secret)).toBe(false); // Leading space
  });

  it("rejects when secret is empty or missing", () => {
    const signature = generatePaymentHmacSignature(orderId, paymentId, secret);
    expect(verifyPaymentHmacSignature(orderId, paymentId, signature, "")).toBe(false);
    expect(verifyPaymentHmacSignature(orderId, paymentId, signature, "   ")).toBe(false);
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
            amount: PLAN_PRICE_PAISE,
          },
        },
      },
    });

    const validWebhookSig = generateWebhookHmacSignature(rawPayload, webhookSecret);
    const isWebhookValid = verifyWebhookHmacSignature(rawPayload, validWebhookSig, webhookSecret);
    expect(isWebhookValid).toBe(true);

    const isTamperedInvalid = verifyWebhookHmacSignature(
      rawPayload + " ", // modified raw body
      validWebhookSig,
      webhookSecret
    );
    expect(isTamperedInvalid).toBe(false);
  });

  it("enforces authoritative plan price of exactly 9900 paise (Rs. 99)", () => {
    expect(PLAN_PRICE_PAISE).toBe(9900);
  });
});
