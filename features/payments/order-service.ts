import "server-only";
import { AppError } from "@/lib/errors";
import { PLAN_PRICE_PAISE, createRazorpayOrder, verifyPaymentSignature } from "./razorpay";
import {
  attachProviderOrder,
  getAssessment,
  getAssessmentById,
  getPaymentOrderForUser,
  markPaymentPaid,
  reservePaymentOrder,
  storePlan,
} from "@/lib/firestore/repositories";
import { generatePlan } from "@/features/plan";
import type { PaymentOrderRecord, VerifyPaymentRequest } from "@/types/payment";

export async function createOrderForUser(
  uid: string,
  assessmentId: string,
  idempotencyKey?: string,
): Promise<{ order: PaymentOrderRecord; razorpayOrderId: string; amountPaise: number }> {
  // Ensure assessment exists and belongs to this user
  await getAssessment(uid, assessmentId);

  const key = idempotencyKey?.trim() || `${uid}:${assessmentId}`;
  if (key.length > 200) {
    throw new AppError("INVALID_REQUEST", "The idempotency key is invalid", 400);
  }

  // Reserve order in Firestore transaction
  const order = await reservePaymentOrder(uid, assessmentId, key, PLAN_PRICE_PAISE);

  if (!order.razorpayOrderId) {
    const providerOrder = await createRazorpayOrder(`bmyfit_${order.id}`);
    await attachProviderOrder(order.id, providerOrder.id);
    order.razorpayOrderId = providerOrder.id;
  }

  return {
    order,
    razorpayOrderId: order.razorpayOrderId,
    amountPaise: PLAN_PRICE_PAISE,
  };
}

export async function verifyUserPayment(
  uid: string,
  payload: VerifyPaymentRequest,
): Promise<{ verified: boolean; assessmentId: string }> {
  const order = await getPaymentOrderForUser(uid, payload.razorpay_order_id);

  if (order.amountPaise !== PLAN_PRICE_PAISE || order.currency !== "INR") {
    throw new AppError("PAYMENT_INVALID", "Payment amount or currency mismatch", 400);
  }

  const isValid = verifyPaymentSignature(
    payload.razorpay_order_id,
    payload.razorpay_payment_id,
    payload.razorpay_signature,
  );

  if (!isValid) {
    throw new AppError("PAYMENT_INVALID", "Payment signature verification failed", 400);
  }

  // Idempotently mark order as paid
  if (order.status !== "paid") {
    await markPaymentPaid(order.id, payload.razorpay_payment_id);
  }

  // Generate and store the detailed plan
  const assessment = await getAssessmentById(order.assessmentId);
  const plan = generatePlan(assessment, order.assessmentId);
  await storePlan(uid, order.assessmentId, plan);

  return { verified: true, assessmentId: order.assessmentId };
}
