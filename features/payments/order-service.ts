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
  storeDashboardPlan,
} from "@/lib/firestore/repositories";
import { generatePlan } from "@/features/plan";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { registerPurchasedClient } from "@/features/admin/admin-data";
import type { PaymentOrderRecord, VerifyPaymentRequest } from "@/types/payment";

export async function createOrderForUser(
  uid: string,
  assessmentId: string,
  idempotencyKey?: string,
): Promise<{ order: PaymentOrderRecord; razorpayOrderId: string; amountPaise: number }> {
  // Ensure assessment exists and belongs to this user or session
  await getAssessment(uid, assessmentId);

  const key = idempotencyKey?.trim() || `${uid}:${assessmentId}`;
  if (key.length > 200) {
    throw new AppError("INVALID_REQUEST", "The idempotency key is invalid", 400);
  }

  // Reserve order with authoritative server price: PLAN_PRICE_PAISE (9900)
  const order = await reservePaymentOrder(uid, assessmentId, key, PLAN_PRICE_PAISE);

  if (!order.razorpayOrderId) {
    const receipt = `rcpt_${order.id}`.slice(0, 40);
    const providerOrder = await createRazorpayOrder({
      receipt,
      notes: {
        assessmentId,
        uid,
        planVersion: "rules-v1",
      },
    });
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
    order.status = "paid";
  }

  // Generate and store the detailed plan
  const assessment = await getAssessmentById(order.assessmentId);
  const plan = generatePlan(assessment, order.assessmentId);
  await storePlan(uid, order.assessmentId, plan);

  const dashboardPlan = generateDashboardPlan(order.assessmentId, {
    status: "pending_review",
    goal: assessment.goal,
    bmi: assessment.bmi ?? undefined,
    bodyFatPercent: assessment.bodyFatPercent ?? undefined,
    weeksCount: 8,
    customerName: "Fit Member",
    coachNotes: "NEW PURCHASE (Verified via Razorpay): 8-Week plan generated and placed in pending review for Coach push.",
  });
  await storeDashboardPlan(uid, order.assessmentId, dashboardPlan);

  await registerPurchasedClient({
    userId: uid,
    assessmentId: order.assessmentId,
    razorpayOrderId: payload.razorpay_order_id,
    razorpayPaymentId: payload.razorpay_payment_id,
    amountPaise: PLAN_PRICE_PAISE,
    customerName: "Fit Member",
    goal: assessment.goal,
    biometrics: {
      gender: assessment.gender,
      age: assessment.age,
      heightCm: assessment.heightCm,
      weightKg: assessment.weightKg,
      waistIn: assessment.waistIn,
      neckIn: assessment.neckIn,
      hipIn: assessment.hipIn,
      bmi: assessment.bmi,
      bmiCategory: assessment.bmiCategory,
      bodyFatPercent: assessment.bodyFatPercent ?? undefined,
      bodyFatCategory: assessment.bodyFatCategory ?? undefined,
      dietPreference: assessment.dietPreference,
      activityLevel: assessment.activityLevel,
    },
  });

  return { verified: true, assessmentId: order.assessmentId };
}
