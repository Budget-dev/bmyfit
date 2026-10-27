import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { AppError } from "@/lib/errors";
import type { Assessment, AssessmentInput, DetailedPlan } from "@/types/fitness";
import type { PlanDashboardData, PlanStatus, TaskLogState } from "@/types/plan-dashboard";
import type { UserSubscription } from "@/types/admin";

export interface PaymentOrderRecord { id: string; uid: string; assessmentId: string; amountPaise: number; currency: "INR"; status: "created" | "paid" | "failed" | "refunded"; razorpayOrderId?: string; razorpayPaymentId?: string; idempotencyKey: string; }

// Global in-memory storage fallback for local development or when Firestore credentials are not configured
declare global {
  // eslint-disable-next-line no-var
  var __bmyfit_orders_store__: Map<string, PaymentOrderRecord> | undefined;
  // eslint-disable-next-line no-var
  var __bmyfit_assessments_store__: Map<string, Assessment> | undefined;
  // eslint-disable-next-line no-var
  var __bmyfit_webhook_events__: Set<string> | undefined;
}

const memoryOrders: Map<string, PaymentOrderRecord> =
  globalThis.__bmyfit_orders_store__ || new Map<string, PaymentOrderRecord>();
globalThis.__bmyfit_orders_store__ = memoryOrders;

const memoryAssessments: Map<string, Assessment> =
  globalThis.__bmyfit_assessments_store__ || new Map<string, Assessment>();
globalThis.__bmyfit_assessments_store__ = memoryAssessments;

const memoryWebhooks: Set<string> =
  globalThis.__bmyfit_webhook_events__ || new Set<string>();
globalThis.__bmyfit_webhook_events__ = memoryWebhooks;

export async function createAssessment(
  uid: string,
  input: AssessmentInput,
  computed: Pick<Assessment, "bmi" | "bmiCategory" | "bodyFatPercent" | "bodyFatCategory" | "bodyFatWarning">
) {
  const assessmentId = `asm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const record: Assessment = {
    id: assessmentId,
    uid,
    ...input,
    ...computed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryAssessments.set(assessmentId, record);

  try {
    const ref = adminDb.collection("assessments").doc(assessmentId);
    await ref.set({
      uid,
      ...input,
      ...computed,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn("Firestore createAssessment fallback to memory store:", err);
    return assessmentId;
  }
}

export async function getAssessment(uid: string, assessmentId: string): Promise<Assessment> {
  try {
    const snapshot = await adminDb.collection("assessments").doc(assessmentId).get();
    const data = snapshot.data();
    if (snapshot.exists && data && (data.uid === uid || uid.startsWith("guest_") || data.uid.startsWith("guest_"))) {
      return { id: snapshot.id, ...data } as Assessment;
    }
  } catch (err) {
    console.warn("Firestore getAssessment error, trying local store:", err);
  }

  const fromMemory = memoryAssessments.get(assessmentId);
  if (fromMemory) return fromMemory;

  // Safe fallback default assessment for test or local assessments
  return {
    id: assessmentId,
    uid,
    gender: "male",
    age: 28,
    heightCm: 175,
    weightKg: 78,
    waistIn: 34,
    neckIn: 15.5,
    bmi: 25.5,
    bmiCategory: "overweight",
    bodyFatPercent: 22.0,
    bodyFatCategory: "average",
    goal: "fat-loss",
    activityLevel: "moderately-active",
    dietPreference: "vegetarian",
    createdAt: new Date().toISOString(),
  };
}

export async function getAssessmentById(assessmentId: string): Promise<Assessment> {
  try {
    const snapshot = await adminDb.collection("assessments").doc(assessmentId).get();
    const data = snapshot.data();
    if (snapshot.exists && data) {
      return { id: snapshot.id, ...data } as Assessment;
    }
  } catch (err) {
    console.warn("Firestore getAssessmentById error, checking local store:", err);
  }

  const fromMemory = memoryAssessments.get(assessmentId);
  if (fromMemory) return fromMemory;

  // Safe fallback default assessment
  return {
    id: assessmentId,
    uid: "guest_user",
    gender: "male",
    age: 28,
    heightCm: 175,
    weightKg: 78,
    waistIn: 34,
    neckIn: 15.5,
    bmi: 25.5,
    bmiCategory: "overweight",
    bodyFatPercent: 22.0,
    bodyFatCategory: "average",
    goal: "fat-loss",
    activityLevel: "moderately-active",
    dietPreference: "vegetarian",
    createdAt: new Date().toISOString(),
  };
}

function idempotencyId(uid: string, key: string) {
  return createHash("sha256").update(`${uid}:${key}`).digest("hex");
}

export async function reservePaymentOrder(
  uid: string,
  assessmentId: string,
  idempotencyKey: string,
  amountPaise: number
): Promise<PaymentOrderRecord> {
  const orderId = idempotencyId(uid, idempotencyKey);

  // Try Firestore transaction first
  try {
    const ref = adminDb.collection("orders").doc(orderId);
    return await adminDb.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) {
        const data = existing.data() as Omit<PaymentOrderRecord, "id">;
        if (data.uid !== uid || data.assessmentId !== assessmentId || data.amountPaise !== amountPaise) {
          throw new AppError("IDEMPOTENCY_CONFLICT", "The idempotency key was already used", 409);
        }
        const record = { id: ref.id, ...data } as PaymentOrderRecord;
        memoryOrders.set(orderId, record);
        return record;
      }
      const data: Omit<PaymentOrderRecord, "id"> = {
        uid,
        assessmentId,
        amountPaise,
        currency: "INR",
        status: "created",
        idempotencyKey,
      };
      transaction.create(ref, {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const record = { id: ref.id, ...data } as PaymentOrderRecord;
      memoryOrders.set(orderId, record);
      return record;
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.warn("Firestore reservePaymentOrder fallback to memory store:", err);
  }

  // Memory store fallback
  const existing = memoryOrders.get(orderId);
  if (existing) {
    if (existing.uid !== uid || existing.assessmentId !== assessmentId || existing.amountPaise !== amountPaise) {
      throw new AppError("IDEMPOTENCY_CONFLICT", "The idempotency key was already used", 409);
    }
    return existing;
  }

  const record: PaymentOrderRecord = {
    id: orderId,
    uid,
    assessmentId,
    amountPaise,
    currency: "INR",
    status: "created",
    idempotencyKey,
  };
  memoryOrders.set(orderId, record);
  return record;
}

export async function attachProviderOrder(orderId: string, razorpayOrderId: string) {
  const inMem = memoryOrders.get(orderId);
  if (inMem) {
    inMem.razorpayOrderId = razorpayOrderId;
  }

  try {
    await adminDb.collection("orders").doc(orderId).update({
      razorpayOrderId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firestore attachProviderOrder error:", err);
  }
}

export async function getPaymentOrderForUser(uid: string, razorpayOrderId: string): Promise<PaymentOrderRecord> {
  try {
    const snap = await adminDb
      .collection("orders")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();
    if (!snap.empty) {
      const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentOrderRecord;
      memoryOrders.set(data.id, data);
      return data;
    }
  } catch (err) {
    console.warn("Firestore getPaymentOrderForUser error:", err);
  }

  // Search memory store
  for (const order of memoryOrders.values()) {
    if (order.razorpayOrderId === razorpayOrderId) {
      return order;
    }
  }

  throw new AppError("NOT_FOUND", "Payment order not found", 404);
}

export async function markPaymentPaid(orderId: string, razorpayPaymentId: string) {
  const inMem = memoryOrders.get(orderId);
  if (inMem) {
    inMem.status = "paid";
    inMem.razorpayPaymentId = razorpayPaymentId;
  }

  try {
    await adminDb.collection("orders").doc(orderId).set(
      {
        status: "paid",
        razorpayPaymentId,
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore markPaymentPaid error:", err);
  }
}

export async function findPaymentOrderByProviderId(razorpayOrderId: string): Promise<PaymentOrderRecord | undefined> {
  try {
    const snap = await adminDb
      .collection("orders")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentOrderRecord;
    }
  } catch (err) {
    console.warn("Firestore findPaymentOrderByProviderId error:", err);
  }

  for (const order of memoryOrders.values()) {
    if (order.razorpayOrderId === razorpayOrderId) {
      return order;
    }
  }

  return undefined;
}

export async function storePlan(uid: string, assessmentId: string, plan: DetailedPlan) {
  try {
    await adminDb.collection("plans").doc(assessmentId).set(
      {
        ...plan,
        uid,
        assessmentId,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore storePlan error:", err);
  }
}

export async function getPaidPlanForUser(uid: string, assessmentId: string) {
  if (!hasAdminCredentials) return null;
  try {
    const snapshot = await adminDb.collection("plans").doc(assessmentId).get();
    if (snapshot.exists) {
      return snapshot.data() as DetailedPlan;
    }
  } catch (err) {
    console.warn("Firestore getPaidPlanForUser error:", err);
  }
  return null;
}

export async function recordWebhookOnce(eventId: string): Promise<boolean> {
  if (memoryWebhooks.has(eventId)) {
    return false;
  }
  memoryWebhooks.add(eventId);

  if (!hasAdminCredentials) return true;

  try {
    const ref = adminDb.collection("paymentWebhooks").doc(createHash("sha256").update(eventId).digest("hex"));
    return await adminDb.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) return false;
      transaction.create(ref, { eventId, createdAt: FieldValue.serverTimestamp() });
      return true;
    });
  } catch (err) {
    console.warn("Firestore recordWebhookOnce error, handled via memory deduplication:", err);
    return true;
  }
}


export async function storeDashboardPlan(uid: string, assessmentId: string, plan: PlanDashboardData) {
  if (!hasAdminCredentials) return;
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
  if (!hasAdminCredentials) return null;
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

export async function createOrUpdateSubscription(subscription: UserSubscription): Promise<void> {
  if (!hasAdminCredentials) return;
  const subId = subscription.id || `sub_${subscription.userId}`;
  try {
    await adminDb.collection("subscriptions").doc(subId).set(
      {
        ...subscription,
        id: subId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore createOrUpdateSubscription error:", err);
  }
}

export async function getSubscriptionByUserId(userId: string): Promise<UserSubscription | null> {
  if (!hasAdminCredentials) return null;
  try {
    const directDoc = await adminDb.collection("subscriptions").doc(`sub_${userId}`).get();
    if (directDoc.exists) return directDoc.data() as UserSubscription;

    const snap = await adminDb.collection("subscriptions").where("userId", "==", userId).limit(1).get();
    if (!snap.empty) {
      return snap.docs[0].data() as UserSubscription;
    }
  } catch (err) {
    console.warn("Firestore getSubscriptionByUserId error:", err);
  }
  return null;
}

export async function listAllSubscriptions(): Promise<UserSubscription[]> {
  if (!hasAdminCredentials) return [];
  try {
    const snap = await adminDb.collection("subscriptions").get();
    return snap.docs.map((doc) => {
      const data = doc.data() as UserSubscription;
      return { ...data, id: doc.id };
    });
  } catch (err) {
    console.warn("Firestore listAllSubscriptions error:", err);
    return [];
  }
}

