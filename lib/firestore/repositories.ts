import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { AppError } from "@/lib/errors";
import type { Assessment, AssessmentInput, DetailedPlan } from "@/types/fitness";
import type { PlanDashboardData, PlanStatus, TaskLogState } from "@/types/plan-dashboard";

export interface PaymentOrderRecord { id: string; uid: string; assessmentId: string; amountPaise: number; currency: "INR"; status: "created" | "paid" | "failed" | "refunded"; razorpayOrderId?: string; razorpayPaymentId?: string; idempotencyKey: string; }

export async function createAssessment(uid: string, input: AssessmentInput, computed: Pick<Assessment, "bmi" | "bmiCategory" | "bodyFatPercent" | "bodyFatCategory" | "bodyFatWarning">) {
  const ref = adminDb.collection("assessments").doc();
  await ref.set({ uid, ...input, ...computed, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return ref.id;
}
export async function getAssessment(uid: string, assessmentId: string): Promise<Assessment> {
  const snapshot = await adminDb.collection("assessments").doc(assessmentId).get();
  const data = snapshot.data();
  if (!snapshot.exists || !data || data.uid !== uid) throw new AppError("NOT_FOUND", "Assessment not found", 404);
  return { id: snapshot.id, ...data } as Assessment;
}
export async function getAssessmentById(assessmentId: string) {
  const snapshot = await adminDb.collection("assessments").doc(assessmentId).get();
  const data = snapshot.data();
  if (!snapshot.exists || !data) throw new AppError("NOT_FOUND", "Assessment not found", 404);
  return { id: snapshot.id, ...data } as Assessment;
}

function idempotencyId(uid: string, key: string) { return createHash("sha256").update(`${uid}:${key}`).digest("hex"); }
export async function reservePaymentOrder(uid: string, assessmentId: string, idempotencyKey: string, amountPaise: number) {
  const ref = adminDb.collection("orders").doc(idempotencyId(uid, idempotencyKey));
  return adminDb.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      const data = existing.data() as Omit<PaymentOrderRecord, "id">;
      if (data.uid !== uid || data.assessmentId !== assessmentId || data.amountPaise !== amountPaise) throw new AppError("IDEMPOTENCY_CONFLICT", "The idempotency key was already used", 409);
      return { id: ref.id, ...data } as PaymentOrderRecord;
    }
    const data: Omit<PaymentOrderRecord, "id"> = { uid, assessmentId, amountPaise, currency: "INR", status: "created", idempotencyKey };
    transaction.create(ref, { ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return { id: ref.id, ...data } as PaymentOrderRecord;
  });
}
export async function attachProviderOrder(orderId: string, razorpayOrderId: string) { await adminDb.collection("orders").doc(orderId).update({ razorpayOrderId, updatedAt: FieldValue.serverTimestamp() }); }
export async function getPaymentOrderForUser(uid: string, razorpayOrderId: string) {
  const snap = await adminDb.collection("orders").where("uid", "==", uid).where("razorpayOrderId", "==", razorpayOrderId).limit(1).get();
  if (snap.empty) throw new AppError("NOT_FOUND", "Payment order not found", 404);
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentOrderRecord;
}
export async function markPaymentPaid(orderId: string, razorpayPaymentId: string) { await adminDb.collection("orders").doc(orderId).set({ status: "paid", razorpayPaymentId, paidAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true }); }
export async function findPaymentOrderByProviderId(razorpayOrderId: string) {
  const snap = await adminDb.collection("orders").where("razorpayOrderId", "==", razorpayOrderId).limit(1).get();
  return snap.empty ? undefined : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentOrderRecord);
}
export async function storePlan(uid: string, assessmentId: string, plan: DetailedPlan) { await adminDb.collection("plans").doc(assessmentId).set({ ...plan, uid, assessmentId, createdAt: FieldValue.serverTimestamp() }, { merge: true }); }
export async function getPaidPlanForUser(uid: string, assessmentId: string) {
  await getAssessment(uid, assessmentId);
  const order = await adminDb.collection("orders").where("uid", "==", uid).where("assessmentId", "==", assessmentId).where("status", "==", "paid").limit(1).get();
  if (order.empty) throw new AppError("PAYMENT_REQUIRED", "Complete payment to unlock this plan", 402);
  const snapshot = await adminDb.collection("plans").doc(assessmentId).get();
  if (!snapshot.exists) throw new AppError("PLAN_NOT_READY", "Your plan is being prepared", 202);
  return snapshot.data() as DetailedPlan;
}
export async function recordWebhookOnce(eventId: string) {
  const ref = adminDb.collection("paymentWebhooks").doc(createHash("sha256").update(eventId).digest("hex"));
  return adminDb.runTransaction(async (transaction) => { const existing = await transaction.get(ref); if (existing.exists) return false; transaction.create(ref, { eventId, createdAt: FieldValue.serverTimestamp() }); return true; });
}

export async function storeDashboardPlan(uid: string, assessmentId: string, plan: PlanDashboardData) {
  try {
    await adminDb.collection("plans").doc(assessmentId).set(
      { ...plan, uid, assessmentId, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore storeDashboardPlan skipped or failed:", err);
  }
}

export async function getDashboardPlanById(assessmentId: string): Promise<PlanDashboardData | null> {
  try {
    const snapshot = await adminDb.collection("plans").doc(assessmentId).get();
    if (!snapshot.exists) return null;
    return snapshot.data() as PlanDashboardData;
  } catch (err) {
    console.warn("Firestore getDashboardPlanById error:", err);
    return null;
  }
}

export async function listAllDashboardPlans(): Promise<PlanDashboardData[]> {
  try {
    const snapshot = await adminDb.collection("plans").orderBy("createdAt", "desc").limit(50).get();
    return snapshot.docs.map((doc) => doc.data() as PlanDashboardData);
  } catch (err) {
    console.warn("Firestore listAllDashboardPlans error:", err);
    return [];
  }
}

export async function updateDashboardPlanStatus(
  planId: string,
  status: PlanStatus,
  updates?: Partial<PlanDashboardData>
) {
  try {
    await adminDb.collection("plans").doc(planId).set(
      {
        ...updates,
        status,
        approvedAt: status === "approved" || status === "active" ? FieldValue.serverTimestamp() : undefined,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore updateDashboardPlanStatus error:", err);
  }
}

export async function saveUserTaskLogInDb(uid: string, planId: string, taskKey: string, completed: boolean) {
  try {
    await adminDb.collection("user_logs").doc(`${uid}_${planId}`).set(
      {
        [taskKey]: completed,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore saveUserTaskLogInDb error:", err);
  }
}

export async function getUserTaskLogsFromDb(uid: string, planId: string): Promise<TaskLogState> {
  try {
    const doc = await adminDb.collection("user_logs").doc(`${uid}_${planId}`).get();
    if (!doc.exists) return {};
    return (doc.data() || {}) as TaskLogState;
  } catch (err) {
    console.warn("Firestore getUserTaskLogsFromDb error:", err);
    return {};
  }
}

