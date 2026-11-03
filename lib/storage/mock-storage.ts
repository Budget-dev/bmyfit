"use client";

import type { AdminUserRecord, MedicalAssessment, MedicalDocument, UserSubscription, UserBiometrics } from "@/types/admin";
import type { PlanDashboardData, PlanStatus } from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import {
  db,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
} from "@/lib/firebase/client";

export const SAMPLE_MEDICAL_DOCS: MedicalDocument[] = [];

export function isClient(): boolean {
  return typeof window !== "undefined";
}

export function sanitizeAdminUserRecord(raw: Partial<AdminUserRecord>, id: string): AdminUserRecord {
  const name = raw.name?.trim() || "BMYFIT Member";
  const defaultBiometrics: UserBiometrics = {
    gender: "male",
    age: 28,
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 70,
    waistIn: 34,
    neckIn: 15.5,
    bmi: 24.5,
    bmiCategory: "normal",
    bodyFatPercent: 21.0,
    bodyFatCategory: "average",
    bmr: 1700,
    tdee: 2350,
    caloricTarget: 1800,
    proteinTargetGrams: 120,
    activityLevel: "moderately-active",
    dietPreference: "vegetarian",
    waterLitres: 3.5,
    dailyStepGoal: 10000,
  };

  const biometrics: UserBiometrics = {
    ...defaultBiometrics,
    ...(raw.biometrics || {}),
  };

  const plan: PlanDashboardData =
    raw.plan && Array.isArray(raw.plan.weeks) && raw.plan.weeks.length > 0
      ? raw.plan
      : generateDashboardPlan(id, {
        customerName: name,
        status: raw.membershipCategory === "purchased" ? "pending_review" : "active",
        weeksCount: 8,
      });

  return {
    id,
    name,
    email: raw.email || `${id}@client.bmyfit.in`,
    phone: raw.phone || "+91 98000 00000",
    city: raw.city || "Online Client",
    avatar:
      raw.avatar ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    joinedAt: raw.joinedAt || new Date().toISOString(),
    lastActive: raw.lastActive || "Active Today",
    membershipCategory:
      raw.membershipCategory === "membership"
        ? "membership"
        : (raw.membershipCategory === "purchased" ||
          Boolean((raw as { isPaid?: boolean }).isPaid) ||
          raw.order?.status === "paid" ||
          Boolean(raw.order && (raw.order.amountPaise || 0) > 0) ||
          raw.plan?.status === "pending_review")
          ? "purchased"
          : (raw.membershipCategory || "free"),
    membershipTitle:
      raw.membershipTitle ||
      (raw.membershipCategory === "purchased" ? "Purchased Client Plan" : "Free Registered Member"),
    goal: raw.goal || "fat-loss",
    goalDisplay: raw.goalDisplay || "Fat Loss & Conditioning",
    needsPlanReview: raw.needsPlanReview ?? (raw.membershipCategory === "purchased"),
    biometrics,
    plan,
    order: raw.order,
    subscription: raw.subscription,
    medicalAssessment: raw.medicalAssessment,
    taskLogs: raw.taskLogs || {},
  };
}

// In-memory runtime cache (no localStorage) synchronized with Firebase Firestore
const inMemoryUsers = new Map<string, AdminUserRecord>();
const inMemoryPlans = new Map<string, PlanDashboardData>();
const inMemoryConsultations = new Map<string, MedicalAssessment>();
const inMemorySubscriptions = new Map<string, UserSubscription>();
let hasInitializedListeners = false;

function initFirebaseListeners() {
  if (!isClient() || hasInitializedListeners) return;
  hasInitializedListeners = true;

  try {
    // Listen to Firebase Firestore "users" collection
    onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as AdminUserRecord;
          if (change.type === "removed") {
            inMemoryUsers.delete(change.doc.id);
          } else {
            const existing = inMemoryUsers.get(change.doc.id);
            const sanitized = sanitizeAdminUserRecord(
              {
                ...existing,
                ...data,
                id: change.doc.id,
                plan: data.plan || existing?.plan,
              },
              change.doc.id
            );
            inMemoryUsers.set(change.doc.id, sanitized);
          }
        });
      },
      (err) => {
        console.warn("Firestore users listener info:", err.message);
      }
    );

    // Listen to Firebase Firestore "plans" collection
    onSnapshot(
      collection(db, "plans"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as PlanDashboardData;
          if (change.type === "removed") {
            inMemoryPlans.delete(change.doc.id);
          } else {
            inMemoryPlans.set(change.doc.id, { ...data, id: change.doc.id });
            // Also link into matched user in inMemoryUsers
            for (const [uid, u] of inMemoryUsers.entries()) {
              if (uid === change.doc.id || u.plan?.id === change.doc.id) {
                inMemoryUsers.set(uid, { ...u, plan: { ...data, id: change.doc.id } });
              }
            }
          }
        });
      },
      (err) => {
        console.warn("Firestore plans listener info:", err.message);
      }
    );

    // Listen to Firebase Firestore "subscriptions" collection
    onSnapshot(
      collection(db, "subscriptions"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const subData = change.doc.data() as UserSubscription;
          const sub: UserSubscription = {
            ...subData,
            id: change.doc.id,
          };
          if (change.type === "removed") {
            inMemorySubscriptions.delete(change.doc.id);
          } else {
            inMemorySubscriptions.set(change.doc.id, sub);
            const targetUid = sub.userId || change.doc.id;
            const targetUser = inMemoryUsers.get(targetUid);
            if (targetUser) {
              inMemoryUsers.set(targetUid, {
                ...targetUser,
                membershipCategory: "purchased",
                subscription: sub,
              });
            }
          }
        });
      },
      (err) => {
        console.warn("Firestore subscriptions listener info:", err.message);
      }
    );

    // Listen to Firebase Firestore "user_logs" collection for live adherence
    onSnapshot(
      collection(db, "user_logs"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const logs = change.doc.data();
          const targetUid = change.doc.id.includes("_") ? change.doc.id.split("_")[0] : change.doc.id;
          const targetUser = inMemoryUsers.get(targetUid) || inMemoryUsers.get(change.doc.id);
          if (targetUser) {
            inMemoryUsers.set(targetUser.id, {
              ...targetUser,
              taskLogs: { ...(targetUser.taskLogs || {}), ...logs },
            });
          }
        });
      },
      (err) => {
        console.warn("Firestore user_logs listener info:", err.message);
      }
    );
  } catch (err) {
    console.warn("Firebase listener initialization:", err);
  }
}

if (isClient()) {
  initFirebaseListeners();
}

/**
 * Get all admin users (served from Firebase-synced memory cache)
 */
export function getStoredAdminUsers(): AdminUserRecord[] {
  return Array.from(inMemoryUsers.values())
    .filter(
      (u) => {
        if (
          u.id.startsWith("user_membership_") ||
          u.id.startsWith("user_purchase_") ||
          u.id.startsWith("user_purchased_") ||
          u.id.startsWith("mock_") ||
          u.id === "coach_naveen" ||
          u.id === "nqOlc3cJFVIzJB3oGRVyu4g9r4L2" ||
          u.email?.toLowerCase() === "bmyfitnesscoach@gmail.com"
        ) {
          return false;
        }

        // Strictly exclude test emails and test athlete accounts
        const email = u.email?.toLowerCase().trim() || "";
        if (
          email.includes("@test.com") ||
          email.startsWith("test_") ||
          email.includes("test_1793282473121") ||
          u.name?.toLowerCase().includes("test athlete")
        ) {
          return false;
        }

        const isPaidUser =
          u.membershipCategory === "purchased" ||
          u.membershipCategory === "membership" ||
          Boolean((u as { isPaid?: boolean }).isPaid) ||
          Boolean(u.order && u.order.status === "paid") ||
          Boolean(u.order && (u.order.amountPaise || 0) > 0);

        // For non-paid users: ONLY real authenticated/signed-up accounts are shown in Admin Console
        // Strictly exclude anonymous funnel leads, generated assessment IDs, and fake generated emails
        if (!isPaidUser) {
          if (
            !email ||
            email.length < 5 ||
            !email.includes("@") ||
            !email.includes(".") ||
            email.endsWith("@lead.bmyfit.in") ||
            email.endsWith("@client.bmyfit.in") ||
            (email.endsWith("@example.com") && (u.id.startsWith("plan_") || u.id.startsWith("asm_") || u.id.startsWith("guest_"))) ||
            u.name?.startsWith("Free Score Lead") ||
            u.id.startsWith("plan_") ||
            u.id.startsWith("asm_") ||
            u.id.startsWith("guest_") ||
            u.id.startsWith("anon_") ||
            u.id.startsWith("chat_")
          ) {
            return false;
          }
        }

        return true;
      }
    )
    .map((u) => sanitizeAdminUserRecord(u, u.id));
}

/**
 * Promote a free user/lead to Paid Customer in client memory & Firestore
 */
export function promoteStoredUserToPaid(
  userId: string,
  options?: {
    paymentMethod?: "cash" | "upi" | "upi_manual" | "razorpay";
    transactionId?: string;
    notes?: string;
    amountPaise?: number;
  }
): AdminUserRecord | null {
  const user = inMemoryUsers.get(userId);
  if (!user) return null;

  const now = new Date().toISOString();
  const orderId = `ord_manual_${Date.now()}`;
  const isCash = options?.paymentMethod === "cash";
  const cleanTxnId = options?.transactionId?.trim();
  const methodLabel = isCash
    ? "Cash Received by Hand"
    : cleanTxnId
    ? `UPI (Txn: ${cleanTxnId})`
    : "Manual Entry";
  const amountPaise = options?.amountPaise || 9900;
  const amountFormatted = `₹${Math.round(amountPaise / 100)}`;

  const paidOrder = {
    orderId,
    razorpayPaymentId: isCash ? `cash_${Date.now()}` : (cleanTxnId || `promo_${Date.now()}`),
    utr: !isCash && cleanTxnId ? cleanTxnId : undefined,
    paymentMethod: (isCash ? "cash" : "upi_manual") as "phonepe" | "razorpay" | "upi_manual" | "cash",
    amountPaise,
    amountFormatted,
    currency: "INR" as const,
    status: "paid" as const,
    packageTitle: `Custom 8-Week Transformation Plan (${methodLabel})`,
    durationWeeks: user.plan?.weeksCount || 8,
    purchasedAt: now,
  };

  user.membershipCategory = "purchased";
  user.membershipTitle = "Purchased Client Plan";
  user.isPaid = true;
  user.order = paidOrder;
  const notesText = options?.notes?.trim() ? ` Notes: ${options.notes.trim()}` : "";
  const coachNote = `PROMOTED TO PAID (${amountFormatted} via ${methodLabel}): Upgraded manually by Coach Naveen.${notesText}`;
  if (!user.plan) {
    user.plan = generateDashboardPlan(user.id, {
      customerName: user.name,
      status: "pending_review",
      weeksCount: 8,
      coachNotes: coachNote,
    });
  } else {
    user.plan.coachNotes = coachNote;
  }
  if (user.plan.status !== "approved") {
    user.plan.status = "pending_review";
    user.needsPlanReview = true;
  }

  upsertStoredAdminUser(user);

  if (isClient()) {
    try {
      void setDoc(
        doc(db, "orders", orderId),
        {
          id: orderId,
          orderId,
          uid: user.id,
          userId: user.id,
          assessmentId: user.assessmentId || user.plan?.id || user.id,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          amount: Math.round(amountPaise / 100),
          amountPaise,
          amountFormatted,
          currency: "INR",
          status: "paid",
          paymentMethod: isCash ? "cash" : "upi_manual",
          utr: !isCash && cleanTxnId ? cleanTxnId : undefined,
          upiTransactionId: !isCash && cleanTxnId ? cleanTxnId : undefined,
          razorpayPaymentId: isCash ? `cash_${Date.now()}` : (cleanTxnId || `promo_${Date.now()}`),
          packageTitle: paidOrder.packageTitle,
          createdAt: now,
          paidAt: now,
          updatedAt: now,
        },
        { merge: true }
      ).catch(() => { });
      void setDoc(
        doc(db, "users", user.id),
        {
          id: user.id,
          uid: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          membershipCategory: "purchased",
          membershipTitle: "Purchased Client Plan",
          isPaid: true,
          needsPlanReview: user.needsPlanReview,
          order: paidOrder,
          plan: user.plan,
          updatedAt: now,
        },
        { merge: true }
      ).catch(() => { });
      if (user.plan?.id) {
        void setDoc(
          doc(db, "plans", user.plan.id),
          {
            ...user.plan,
            status: user.plan.status,
            updatedAt: now,
          },
          { merge: true }
        ).catch(() => { });
      }
    } catch { }
  }

  return user;
}

/**
 * Save all admin users to Firebase Firestore
 */
export function saveStoredAdminUsers(users: AdminUserRecord[]): void {
  users.forEach((user) => upsertStoredAdminUser(user));
}

/**
 * Upsert a single admin user in Firebase Firestore
 */
export function upsertStoredAdminUser(user: AdminUserRecord): void {
  inMemoryUsers.set(user.id, user);

  if (isClient()) {
    try {
      const userRef = doc(db, "users", user.id);
      void setDoc(userRef, user, { merge: true }).catch((err) => {
        console.warn("Firebase upsert user notice:", err);
      });
    } catch (err) {
      console.warn("Firebase upsert user dispatch error:", err);
    }
  }
}

/**
 * Save medical consultation for an assessment to Firebase Firestore
 */
export function saveStoredMedicalConsultation(
  assessmentId: string,
  assessment: MedicalAssessment
): void {
  inMemoryConsultations.set(assessmentId, assessment);

  // Update in-memory user record
  const existingUser = inMemoryUsers.get(assessmentId);
  if (existingUser) {
    const updatedPlan: PlanDashboardData = {
      ...existingUser.plan,
      medicalSummary: {
        hasDisease: assessment.hasDisease,
        diseases: assessment.diseases,
        customDiseaseDescription: assessment.customDiseaseDescription,
        medications: assessment.medications,
        documentsCount: assessment.documents.length,
      },
    };
    const updatedUser: AdminUserRecord = {
      ...existingUser,
      medicalAssessment: assessment,
      needsPlanReview: true,
      plan: updatedPlan,
    };
    upsertStoredAdminUser(updatedUser);
  }

  if (isClient()) {
    try {
      const consultationRef = doc(db, "medical_consultations", assessmentId);
      void setDoc(consultationRef, assessment, { merge: true }).catch((err) => {
        console.warn("Firebase medical consultation sync notice:", err);
      });
    } catch (err) {
      console.warn("Firebase save medical consultation dispatch error:", err);
    }
  }
}

/**
 * Get medical consultation for an assessment from Firebase cache
 */
export function getStoredMedicalConsultation(assessmentId: string): MedicalAssessment | null {
  return inMemoryConsultations.get(assessmentId) || null;
}

/**
 * Fetch medical consultation asynchronously from Firebase Firestore
 */
export async function fetchFirebaseMedicalConsultation(
  assessmentId: string
): Promise<MedicalAssessment | null> {
  const cached = inMemoryConsultations.get(assessmentId);
  if (cached) return cached;

  if (!isClient()) return null;
  try {
    const snapshot = await getDoc(doc(db, "medical_consultations", assessmentId));
    if (snapshot.exists()) {
      const data = snapshot.data() as MedicalAssessment;
      inMemoryConsultations.set(assessmentId, data);
      return data;
    }
  } catch (err) {
    console.warn("Firebase fetch medical consultation notice:", err);
  }
  return null;
}

/**
 * Save a plan directly in Firebase Firestore
 */
export function saveStoredPlan(plan: PlanDashboardData): void {
  inMemoryPlans.set(plan.id, plan);
  if (plan.assessmentId) {
    inMemoryPlans.set(plan.assessmentId, plan);
  }

  // Also update user plan in inMemoryUsers if matched
  for (const [uid, user] of inMemoryUsers.entries()) {
    if (uid === plan.id || uid === plan.assessmentId || user.plan?.id === plan.id) {
      inMemoryUsers.set(uid, { ...user, plan });
      break;
    }
  }

  if (isClient()) {
    try {
      const planRef = doc(db, "plans", plan.id);
      void setDoc(planRef, plan, { merge: true }).catch((err) => {
        console.warn("Firebase save plan notice:", err);
      });
      if (plan.assessmentId && plan.assessmentId !== plan.id) {
        const assessmentPlanRef = doc(db, "plans", plan.assessmentId);
        void setDoc(assessmentPlanRef, plan, { merge: true }).catch(() => { });
      }
    } catch (err) {
      console.warn("Firebase save plan dispatch error:", err);
    }
  }
}

/**
 * Get plan directly from Firebase-synced memory cache
 */
export function getStoredPlan(id: string): PlanDashboardData | null {
  const plan = inMemoryPlans.get(id);
  if (plan) return plan;

  // Search inside admin users cache
  for (const user of inMemoryUsers.values()) {
    if (user.id === id || user.plan?.id === id || user.plan?.assessmentId === id) {
      return user.plan || null;
    }
  }

  return null;
}

/**
 * Fetch plan directly from Firebase Firestore
 */
export async function fetchFirebasePlan(
  id: string,
  forceFresh = false
): Promise<PlanDashboardData | null> {
  if (!forceFresh) {
    const cached = getStoredPlan(id);
    if (cached && (cached.status === "approved" || cached.status === "active")) {
      return cached;
    }
  }

  if (!isClient()) return null;
  try {
    const snapshot = await getDoc(doc(db, "plans", id));
    if (snapshot.exists()) {
      const data = snapshot.data() as PlanDashboardData;
      inMemoryPlans.set(id, data);
      return data;
    }
  } catch (err) {
    console.warn("Firebase fetch plan notice:", err);
  }
  return null;
}

/**
 * Update plan status (e.g. approved / active / pending_review) in Firebase Firestore
 */
export function updateStoredPlanStatus(
  planId: string,
  status: PlanStatus,
  coachNotes?: string
): PlanDashboardData | null {
  const plan = getStoredPlan(planId);
  if (!plan) return null;
  plan.status = status;
  if (coachNotes) plan.coachNotes = coachNotes;
  if (status === "approved" || status === "active") {
    plan.approvedAt = new Date().toISOString();
  }
  saveStoredPlan(plan);
  return plan;
}

/**
 * Direct real-time fetch from client Firestore:
 * Queries "users", "plans", "assessments", "orders", "subscriptions", "medical_consultations"
 * and updates in-memory store so newly registered users and funnel leads sync immediately.
 */
export async function syncFirestoreUsersDirectly(): Promise<AdminUserRecord[]> {
  if (!isClient()) return getStoredAdminUsers();

  // Clear out test athlete if previously stored
  inMemoryUsers.delete("nqOlc3cJFVIzJB3oGRVyu4g9r4L2");

  // 0.1 Discover registered client accounts (Exact UIDs from Firebase Auth console)
  const venkateshUid = "v0vsUoxTrkMGbNs7hstEXODyD2f2";
  const knownAuthClients = [
    {
      id: "v0vsUoxTrkMGbNs7hstEXODyD2f2",
      name: "Venkatesh Choppa",
      email: "venkateshchop14@gmail.com",
      phone: "+91 98490 12345",
      city: "Bengaluru, KA",
      goal: "fat-loss" as const,
      goalDisplay: "Fat Loss & Muscle",
      joinedAt: "2026-10-28T12:00:00.000Z",
    },
    {
      id: "RLUiNcGHWgTmdYmBkkr2fSL7v6A2",
      name: "Athlete",
      email: "www.arjunshiva@gmail.com",
      phone: "+91 98000 00000",
      city: "Online Client",
      goal: "fat-loss" as const,
      goalDisplay: "Fat Loss & Conditioning",
      joinedAt: "2026-11-02T12:00:00.000Z",
    },
    {
      id: "ilSFiN2OmBNTBgHwVr1UZJV1vgh1",
      name: "DevOps Frontend",
      email: "devopsfrontend64@gmail.com",
      phone: "+91 98000 00000",
      city: "Online Client",
      goal: "fat-loss" as const,
      goalDisplay: "Fat Loss & Conditioning",
      joinedAt: "2026-10-31T12:00:00.000Z",
    },
    {
      id: "YFMqdXMQFzSilXzb32qMJrP53vB3",
      name: "Hradsh",
      email: "hradsh@gmail.com",
      phone: "+91 98000 00000",
      city: "Online Client",
      goal: "fat-loss" as const,
      goalDisplay: "Fat Loss & Conditioning",
      joinedAt: "2026-10-30T12:00:00.000Z",
    },
    {
      id: "rMIFPh8BFGTaCXvS9YGRKRo24g72",
      name: "Haradah",
      email: "haradah@gmail.com",
      phone: "+91 98000 00000",
      city: "Online Client",
      goal: "fat-loss" as const,
      goalDisplay: "Fat Loss & Conditioning",
      joinedAt: "2026-10-30T12:00:00.000Z",
    },
  ];

  if (!inMemoryUsers.has(venkateshUid)) {
    inMemoryUsers.set(
      venkateshUid,
      sanitizeAdminUserRecord(
        {
          id: venkateshUid,
          name: "Venkatesh Choppa",
          email: "venkateshchop14@gmail.com",
          phone: "+91 98490 12345",
          city: "Bengaluru, KA",
          membershipCategory: "free",
          membershipTitle: "Registered Member",
          goal: "fat-loss",
          goalDisplay: "Fat Loss & Muscle",
          joinedAt: "2026-10-28T12:00:00.000Z",
          lastActive: "Active Today",
        },
        venkateshUid
      )
    );
  }
  for (const client of knownAuthClients) {
      if (!inMemoryUsers.has(client.id)) {
        inMemoryUsers.set(
          client.id,
          sanitizeAdminUserRecord(
            {
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              city: client.city,
              membershipCategory: "free",
              membershipTitle: "Registered Member",
              goal: client.goal,
              goalDisplay: client.goalDisplay,
              joinedAt: client.joinedAt,
              lastActive: "Active Today",
            },
            client.id
          )
        );
      }
    }

    try {
      // 1. Fetch users collection
      // 1. Fetch users collection (strictly real accounts or paid customers)
      try {
        const userSnap = await getDocs(collection(db, "users"));
        userSnap.forEach((docSnap) => {
          const data = docSnap.data() as Partial<AdminUserRecord> & { isPaid?: boolean; paymentStatus?: string };
          const email = (data.email || "").toLowerCase();
          if (
            email === "bmyfitnesscoach@gmail.com" ||
            docSnap.id === "nqOlc3cJFVIzJB3oGRVyu4g9r4L2" ||
            email.includes("@test.com") ||
            email.startsWith("test_") ||
            data.name?.toLowerCase().includes("test athlete")
          ) {
            return;
          }

          const isPurchased =
            data.membershipCategory === "purchased" ||
            data.membershipCategory === "membership" ||
            data.isPaid === true ||
            data.paymentStatus === "paid" ||
            data.order?.status === "paid" ||
            Boolean(data.order && (data.order.amountPaise || 0) > 0) ||
            data.plan?.status === "pending_review" ||
            data.needsPlanReview === true;

          // For non-purchased users: ONLY real authenticated/signed-up users
          if (!isPurchased) {
            if (
              !email ||
              email.length < 5 ||
              !email.includes("@") ||
              !email.includes(".") ||
              email.endsWith("@lead.bmyfit.in") ||
              email.endsWith("@client.bmyfit.in") ||
              (email.endsWith("@example.com") && (docSnap.id.startsWith("plan_") || docSnap.id.startsWith("asm_") || docSnap.id.startsWith("guest_"))) ||
              data.name?.startsWith("Free Score Lead") ||
              docSnap.id.startsWith("plan_") ||
              docSnap.id.startsWith("asm_") ||
              docSnap.id.startsWith("guest_") ||
              docSnap.id.startsWith("anon_") ||
              docSnap.id.startsWith("chat_")
            ) {
              return;
            }
          }

          const existing =
            inMemoryUsers.get(docSnap.id) ||
            (email
              ? Array.from(inMemoryUsers.values()).find(
                  (u) => u.email && u.email.toLowerCase() === email
                )
              : undefined);
          const primaryId = existing?.id || docSnap.id;
          const effectiveCategory = data.membershipCategory === "membership"
            ? "membership"
            : isPurchased
              ? "purchased"
              : (data.membershipCategory || existing?.membershipCategory || "free");

          const record = sanitizeAdminUserRecord(
            {
              ...existing,
              ...data,
              id: primaryId,
              isPaid: isPurchased || Boolean(existing?.isPaid),
              membershipCategory: effectiveCategory,
              needsPlanReview: data.plan?.status === "approved" ? false : (isPurchased || Boolean(data.needsPlanReview)),
              plan: data.plan || existing?.plan,
            },
            primaryId
          );
          inMemoryUsers.set(primaryId, record);
        });
      } catch (e) {
        console.warn("Direct Firestore users collection sync notice:", e);
      }

      // 2. Fetch plans collection
      // 2. Fetch plans collection (Plans ONLY attach to registered/paid users; never create synthetic users)
      try {
        const plansSnap = await getDocs(collection(db, "plans"));
        plansSnap.forEach((docSnap) => {
          const planData = docSnap.data() as PlanDashboardData;
          inMemoryPlans.set(docSnap.id, { ...planData, id: docSnap.id });
          const existing = inMemoryUsers.get(docSnap.id);
          const isPending = planData.status === "pending_review";
          if (existing) {
            existing.plan = { ...existing.plan, ...planData };
            if (planData.status === "approved" || planData.status === "active") {
              existing.needsPlanReview = false;
            }
            if (isPending) {
              existing.membershipCategory = "purchased";
              existing.needsPlanReview = true;
            }
            inMemoryUsers.set(docSnap.id, existing);
          }
        });
      } catch (e) {
        console.warn("Direct Firestore plans collection sync notice:", e);
      }

      // 3. Fetch assessments collection (attach biometrics only to registered users)
      try {
        const asmSnap = await getDocs(collection(db, "assessments"));
        asmSnap.forEach((docSnap) => {
          const asm = docSnap.data();
          const id = (asm.uid && asm.uid !== "anonymous-user" && !String(asm.uid).startsWith("guest_")) ? asm.uid : null;
          if (!id) return; // Do NOT create synthetic users for anonymous visitors checking free scores
          const existing = inMemoryUsers.get(id) || inMemoryUsers.get(docSnap.id);
          if (existing) {
            if (asm.weightKg && existing.biometrics) {
              existing.biometrics.weightKg = asm.weightKg;
              existing.biometrics.heightCm = asm.heightCm || existing.biometrics.heightCm;
              existing.biometrics.bmi = asm.bmi || existing.biometrics.bmi;
              existing.biometrics.bodyFatPercent = asm.bodyFatPercent || existing.biometrics.bodyFatPercent;
            }
          }
        });
      } catch (e) {
        console.warn("Direct Firestore assessments collection sync notice:", e);
      }

      // 4. Fetch chats collection to discover active client threads (ignoring mock seed IDs)
      try {
        const chatsSnap = await getDocs(collection(db, "chats"));
        chatsSnap.forEach((docSnap) => {
          const id = docSnap.id;
          if (
            id.startsWith("user_membership_") ||
            id.startsWith("user_purchase_") ||
            id.startsWith("user_purchased_") ||
            id.startsWith("mock_") ||
            id === "coach_naveen"
          ) {
            return;
          }
          const chat = docSnap.data();
          if (!chat.userName || chat.userName === "Client") {
            return;
          }
          const existing = inMemoryUsers.get(id);
          if (existing) {
            if (chat.userName) existing.name = chat.userName;
            if (chat.userEmail) existing.email = chat.userEmail;
            if (chat.userPhone) existing.phone = chat.userPhone;
            if (chat.planGoal) existing.goal = chat.planGoal;
            if (chat.membershipCategory) existing.membershipCategory = chat.membershipCategory;
            inMemoryUsers.set(id, existing);
          }
        });
      } catch (e) {
        console.warn("Direct Firestore chats collection sync notice:", e);
      }

      // 4. Fetch orders collection
      try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        ordersSnap.forEach((docSnap) => {
          const order = docSnap.data();
          const targetId = order.uid || order.userId;
          const isOrderPaid =
            order.status === "paid" ||
            order.status === "submitted" ||
            order.status === "verified";
          if (!isOrderPaid) return;

          // Try finding existing user by ID, assessmentId, email, or phone
          const user =
            (targetId ? inMemoryUsers.get(targetId) : null) ||
            (order.assessmentId ? inMemoryUsers.get(order.assessmentId) : null) ||
            Array.from(inMemoryUsers.values()).find(
              (u) =>
                (order.customerEmail &&
                  u.email &&
                  u.email.toLowerCase() === String(order.customerEmail).toLowerCase()) ||
                (order.customerPhone && u.phone && u.phone === order.customerPhone) ||
                (order.assessmentId &&
                  (u.assessmentId === order.assessmentId ||
                    u.id === order.assessmentId ||
                    u.plan?.id === order.assessmentId))
            );

          const orderRecord = {
            orderId: order.razorpayOrderId || order.orderId || docSnap.id,
            razorpayPaymentId:
              order.razorpayPaymentId ||
              order.upiTransactionId ||
              order.utr ||
              "pay_verified",
            amountPaise:
              order.amountPaise ||
              (order.amount ? Math.round(order.amount * 100) : 9900),
            amountFormatted:
              order.amountFormatted ||
              `₹${Math.round(
                (order.amountPaise ||
                  (order.amount ? order.amount * 100 : 9900)) /
                100
              )}`,
            currency: order.currency || "INR",
            status: "paid" as const,
            packageTitle: order.packageTitle || "Custom 8-Week Transformation Plan",
            durationWeeks: order.durationWeeks || 8,
            purchasedAt:
              order.paidAt ||
              order.submittedAt ||
              order.createdAt ||
              new Date().toISOString(),
          };

          if (user) {
            user.membershipCategory = "purchased";
            user.membershipTitle = "Purchased Client Plan";
            user.needsPlanReview = user.plan?.status === "approved" ? false : true;
            user.order = orderRecord;
            user.isPaid = true;
            if (user.plan && user.plan.status !== "approved") {
              user.plan.status = "pending_review";
            }
            inMemoryUsers.set(user.id, user);
          } else {
            // Discover purchased client directly from paid order document so they are NEVER missing!
            const primaryId = targetId || order.assessmentId || docSnap.id;
            const newRec = sanitizeAdminUserRecord(
              {
                id: primaryId,
                assessmentId: order.assessmentId,
                name: order.customerName || "Purchased Client",
                email: order.customerEmail || `${primaryId}@client.bmyfit.in`,
                phone: order.customerPhone || "+91 98000 00000",
                membershipCategory: "purchased",
                membershipTitle: "Purchased Client Plan",
                needsPlanReview: true,
                isPaid: true,
                order: orderRecord,
                plan: generateDashboardPlan(order.assessmentId || primaryId, {
                  customerName: order.customerName || "Purchased Client",
                  status: "pending_review",
                  weeksCount: 8,
                  coachNotes:
                    "NEW PURCHASE (₹99 Paid): Discovered from verified order record.",
                }),
              },
              primaryId
            );
            inMemoryUsers.set(primaryId, newRec);
          }
        });
      } catch (e) {
        console.warn("Direct Firestore orders collection sync notice:", e);
      }

      // 5. Fetch subscriptions collection
      try {
        const subsSnap = await getDocs(collection(db, "subscriptions"));
        subsSnap.forEach((docSnap) => {
          const sub = docSnap.data() as UserSubscription;
          const targetId = sub.userId || docSnap.id.replace("sub_", "");
          const user = inMemoryUsers.get(targetId);
          if (user) {
            user.subscription = { ...sub, id: docSnap.id };
            user.membershipCategory = "purchased";
            if (sub.packageTitle) user.membershipTitle = sub.packageTitle;
          }
        });
      } catch (e) {
        console.warn("Direct Firestore subscriptions collection sync notice:", e);
      }

      // 6. Fetch medical_consultations collection
      try {
        const medSnap = await getDocs(collection(db, "medical_consultations"));
        medSnap.forEach((docSnap) => {
          const med = docSnap.data() as MedicalAssessment & { userId?: string };
          const targetId = med.userId || docSnap.id;
          const user = inMemoryUsers.get(targetId);
          if (user) {
            user.medicalAssessment = {
              hasDisease: Boolean(med.hasDisease),
              diseases: Array.isArray(med.diseases) ? med.diseases : [],
              customDiseaseDescription: med.customDiseaseDescription,
              medications: med.medications,
              documents: Array.isArray(med.documents) ? med.documents : [],
              submittedAt: med.submittedAt || new Date().toISOString(),
            };
            if (med.diseases && med.diseases.length > 0 && user.biometrics) {
              user.biometrics.medicalConditions = med.diseases.join(", ");
            }
          }
        });
      } catch (e) {
        console.warn("Direct Firestore medical_consultations sync notice:", e);
      }
    } catch (err) {
      console.warn("syncFirestoreUsersDirectly error:", err);
    }

    return getStoredAdminUsers();
  }
