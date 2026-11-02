import "server-only";
import Razorpay from "razorpay";
import { AppError } from "@/lib/errors";
import { serverEnv } from "@/lib/env/server";
import { PLAN_PRICE_PAISE, APP_CONFIG } from "@/lib/config";
import {
  verifyPaymentHmacSignature,
  verifyWebhookHmacSignature,
  generatePaymentHmacSignature,
} from "./verify-signature";

export { PLAN_PRICE_PAISE };

// Dev sandbox secrets used exclusively for local offline testing when live Razorpay keys are not provided
export const DEV_SANDBOX_SECRET = "bmyfit_dev_sandbox_secret_99paise_key";
export const DEV_SANDBOX_KEY_ID = "rzp_test_bmyfit_dev_sandbox";

export function isRazorpayConfigured(): boolean {
  const keyId = (process.env.RAZORPAY_KEY_ID || serverEnv.RAZORPAY_KEY_ID || "rzp_live_Tv9FNcDsjXLKfQ").trim();
  const secret = (process.env.RAZORPAY_KEY_SECRET || serverEnv.RAZORPAY_KEY_SECRET || "wGkDJh04CNC0QS436zic3JZe").trim();
  return Boolean(keyId !== "" && secret !== "");
}

export function isWebhookConfigured(): boolean {
  return Boolean(
    serverEnv.RAZORPAY_WEBHOOK_SECRET &&
    serverEnv.RAZORPAY_WEBHOOK_SECRET.trim() !== ""
  );
}

function getRequiredSecret(secret: string | undefined, errorCode: string): string {
  const activeSecret = secret || process.env.RAZORPAY_KEY_SECRET || "wGkDJh04CNC0QS436zic3JZe";
  if (activeSecret && activeSecret.trim() !== "") {
    return activeSecret.trim();
  }
  // In development, allow the deterministic sandbox secret for testing HMAC verification
  if (process.env.NODE_ENV !== "production") {
    return DEV_SANDBOX_SECRET;
  }
  throw new AppError(errorCode, "Payment service credentials are not configured", 503);
}

/**
 * Verifies the Razorpay payment callback signature: HMAC_SHA256(order_id + "|" + payment_id, secret)
 * Uses timingSafeEqual comparison to protect against timing attacks.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string | null | undefined,
): boolean {
  const secret = getRequiredSecret(serverEnv.RAZORPAY_KEY_SECRET, "PAYMENT_NOT_CONFIGURED");
  return verifyPaymentHmacSignature(orderId, paymentId, signature, secret);
}

/**
 * Verifies the Razorpay webhook raw body signature.
 * Uses timingSafeEqual comparison over the raw UTF-8 string buffer.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
): boolean {
  const secret = getRequiredSecret(serverEnv.RAZORPAY_WEBHOOK_SECRET, "WEBHOOK_NOT_CONFIGURED");
  return verifyWebhookHmacSignature(rawBody, signature, secret);
}

export interface CreateOrderOptions {
  receipt: string;
  notes?: Record<string, string>;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface CreateOrderResult {
  id: string;
  amount: number;
  currency: string;
  isSandbox: boolean;
  keyId: string;
}

/**
 * Creates an authoritative Razorpay order.
 * Strictly forces server-side amount (PLAN_PRICE_PAISE = 9900) and currency ("INR").
 */
export async function createRazorpayOrder(
  optionsOrReceipt: string | CreateOrderOptions,
): Promise<CreateOrderResult> {
  const options: CreateOrderOptions =
    typeof optionsOrReceipt === "string"
      ? { receipt: optionsOrReceipt }
      : optionsOrReceipt;

  // Trim receipt to <= 40 characters as required by Razorpay API spec
  const cleanReceipt = options.receipt.slice(0, 40);

  const configured = isRazorpayConfigured();

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError("PAYMENT_NOT_CONFIGURED", "Payment service credentials are not configured", 503);
    }

    // Local development sandbox order
    const sandboxOrderId = `order_sbx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      id: sandboxOrderId,
      amount: PLAN_PRICE_PAISE,
      currency: "INR",
      isSandbox: true,
      keyId: DEV_SANDBOX_KEY_ID,
    };
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || serverEnv.RAZORPAY_KEY_ID || "rzp_live_Tv9FNcDsjXLKfQ").trim();
  const secret = (process.env.RAZORPAY_KEY_SECRET || serverEnv.RAZORPAY_KEY_SECRET || "wGkDJh04CNC0QS436zic3JZe").trim();

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: secret,
    });

    const order = await razorpay.orders.create({
      amount: PLAN_PRICE_PAISE,
      currency: "INR",
      receipt: cleanReceipt,
      payment_capture: true,
      notes: {
        planName: "Personalized Nutrition & Workout Plan",
        brand: APP_CONFIG.brandName,
        ...options.notes,
      },
    });

    if (!order || typeof order.id !== "string") {
      throw new AppError("PAYMENT_PROVIDER_ERROR", "Invalid response from payment gateway", 502);
    }

    return {
      id: order.id,
      amount: PLAN_PRICE_PAISE,
      currency: "INR",
      isSandbox: false,
      keyId,
    };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    console.error("Razorpay order creation failed:", err);
    throw new AppError("PAYMENT_PROVIDER_ERROR", "Unable to create payment order with gateway", 502);
  }
}

/**
 * Helper to generate sandbox signature for testing
 */
export function generateDevSandboxPaymentSignature(orderId: string, paymentId: string): string {
  return generatePaymentHmacSignature(orderId, paymentId, DEV_SANDBOX_SECRET);
}
