import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import { POST as createOrderHandler } from "@/app/api/create-order/route";
import { POST as verifyPaymentHandler } from "@/app/api/verify-payment/route";

describe("Razorpay Standard Checkout Endpoints", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      RAZORPAY_KEY_ID: "rzp_test_Tv8FVtCJC1WhXF",
      RAZORPAY_KEY_SECRET: "M0qJ21yHzkGOFMalpe3Pyak5",
      NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_test_Tv8FVtCJC1WhXF",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("POST /api/create-order", () => {
    it("rejects amount below minimum 100 paise with 400", async () => {
      const request = new Request("http://localhost:3000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50 }),
      });

      const res = await createOrderHandler(request);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/must be at least 100 paise/);
    });

    it("returns 401 when Razorpay credentials are missing", async () => {
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;

      const request = new Request("http://localhost:3000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 9900 }),
      });

      const res = await createOrderHandler(request);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/Payment credentials are not configured/);
    });
  });

  describe("POST /api/verify-payment", () => {
    const keySecret = "M0qJ21yHzkGOFMalpe3Pyak5";
    const orderId = "order_test_123456789";
    const paymentId = "pay_test_987654321";

    it("returns 400 when required fields are missing", async () => {
      const request = new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });

      const res = await verifyPaymentHandler(request);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/Missing required fields/);
    });

    it("returns 400 on signature mismatch", async () => {
      const fakeSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const request = new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature: fakeSignature,
        }),
      });

      const res = await verifyPaymentHandler(request);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Signature mismatch/);
    });

    it("returns 200 with success: true when signature is valid", async () => {
      const validSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const request = new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature: validSignature,
        }),
      });

      const res = await verifyPaymentHandler(request);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toMatch(/verified successfully/);
      expect(data.order_id).toBe(orderId);
      expect(data.payment_id).toBe(paymentId);
    });

    it("also accepts razorpay_order_id, razorpay_payment_id, razorpay_signature keys", async () => {
      const validSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const request = new Request("http://localhost:3000/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await verifyPaymentHandler(request);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});

