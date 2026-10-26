import "server-only";
import { AppError } from "@/lib/errors";
import { serverEnv } from "@/lib/env/server";
import { PLAN_PRICE_PAISE, APP_CONFIG } from "@/lib/config";
import {
  verifyPaymentHmacSignature,
  verifyWebhookHmacSignature,
  generatePaymentHmacSignature,
  generateWebhookHmacSignature,
} from "./verify-signature";

export { PLAN_PRICE_PAISE };

// Dev sandbox secrets used exclusively for local offline testing when live Razorpay keys are not provided
export const DEV_SANDBOX_SECRET = "bmyfit_dev_sandbox_secret_99paise_key";
export const DEV_SANDBOX_KEY_ID = "rzp_test_bmyfit_dev_sandbox";

export function isRazorpayConfigured(): boolean {
  return Boolean(
    serverEnv.RAZORPAY_KEY_ID &&
    serverEnv.RAZORPAY_KEY_ID.trim() !== "" &&
    serverEnv.RAZORPAY_KEY_SECRET &&
    serverEnv.RAZORPAY_KEY_SECRET.trim() !== ""
  );
}

export function isWebhookConfigured(): boolean {
  return Boolean(
    serverEnv.RAZORPAY_WEBHOOK_SECRET &&
    serverEnv.RAZORPAY_WEBHOOK_SECRET.trim() !== ""
  );
}

function getRequiredSecret(secret: string | undefined, errorCode: string): string {
  if (secret && secret.trim() !== "") {
    return secret;
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

  const keyId = serverEnv.RAZORPAY_KEY_ID!;
  const secret = serverEnv.RAZORPAY_KEY_SECRET!;

  const authHeader = Buffer.from(`${keyId}:${secret}`).toString("base64");
  const payload: Record<string, unknown> = {
    amount: PLAN_PRICE_PAISE,
    currency: "INR",
    receipt: cleanReceipt,
    payment_capture: 1,
    notes: {
      planName: "8-Week Personalized Nutrition & Workout Plan",
      brand: APP_CONFIG.brandName,
      ...options.notes,
    },
  };

  const response = await fetch(`${serverEnv.RAZORPAY_API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("Razorpay order creation failed:", response.status, errorBody);
    throw new AppError("PAYMENT_PROVIDER_ERROR", "Unable to create payment order with gateway", 502);
  }

  const data = (await response.json()) as { id?: unknown; amount?: unknown; currency?: unknown };
  if (typeof data.id !== "string" || !data.id) {
    throw new AppError("PAYMENT_PROVIDER_ERROR", "Invalid response from payment gateway", 502);
  }

  return {
    id: data.id,
    amount: PLAN_PRICE_PAISE,
    currency: "INR",
    isSandbox: false,
    keyId,
  };
}

/**
 * Helper to generate sandbox signature for testing
 */
export function generateDevSandboxPaymentSignature(orderId: string, paymentId: string): string {
  return generatePaymentHmacSignature(orderId, paymentId, DEV_SANDBOX_SECRET);
}
