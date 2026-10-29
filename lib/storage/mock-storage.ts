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
    membershipCategory: raw.membershipCategory || "free",
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
    .filter((u) => !u.id.startsWith("user_membership_") && !u.id.startsWith("user_purchase_") && !u.id.startsWith("mock_"))
    .map((u) => sanitizeAdminUserRecord(u, u.id));
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
        void setDoc(assessmentPlanRef, plan, { merge: true }).catch(() => {});
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
export async function fetchFirebasePlan(id: string): Promise<PlanDashboardData | null> {
  const cached = getStoredPlan(id);
  if (cached) return cached;

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

  // 0. Discover local browser session leads immediately
  try {
    const rawLocal = sessionStorage.getItem("bmyfit_local_assessment");
    if (rawLocal) {
      const local = JSON.parse(rawLocal);
      if (local && local.id) {
        const localId = local.uid && local.uid !== "anonymous-user" && !String(local.uid).startsWith("guest_") ? local.uid : local.id;
        if (!inMemoryUsers.has(localId)) {
          const newRec = sanitizeAdminUserRecord(
            {
              id: localId,
              assessmentId: local.id,
              name: local.name || `Free Score Lead (${String(local.id).slice(0, 6)})`,
              email: local.email || `${localId}@lead.bmyfit.in`,
              phone: local.phone || "+91 98000 00000",
              goal: local.goal || "fat-loss",
              goalDisplay: local.goal ? String(local.goal).replace("-", " ") : "Fat Loss",
              membershipCategory: "free",
              membershipTitle: "Free Assessment Lead",
              biometrics: {
                gender: local.gender || "female",
                age: local.age || 28,
                heightCm: local.heightCm || 162,
                weightKg: local.weightKg || 84,
                targetWeightKg: local.targetWeightKg || 70,
                waistIn: local.waistIn || 36,
                neckIn: local.neckIn || 14,
                hipIn: local.hipIn || 42,
                bmi: local.bmi || 32,
                bmiCategory: local.bmiCategory || "obese",
                bodyFatPercent: local.bodyFatPercent || 38,
                bodyFatCategory: local.bodyFatCategory || "obese",
                bmr: 1550,
                tdee: 2100,
                caloricTarget: 1700,
                proteinTargetGrams: 110,
                activityLevel: local.activityLevel || "sedentary",
                dietPreference: local.dietPreference || "vegetarian",
                waterLitres: 3.5,
                dailyStepGoal: 10000,
              },
            },
            localId
          );
          inMemoryUsers.set(localId, newRec);
        }
      }
    }
  } catch {}

  // 0.1 Discover registered client accounts
  const venkateshUid = "vawLoXTrkMBbaS7hatEXDO";
  const testAthleteUid = "nqOIc3cJFVIzJB3cGRVyu";

  if (!inMemoryUsers.has(venkateshUid)) {
    inMemoryUsers.set(
      venkateshUid,
      sanitizeAdminUserRecord(
        {
          id: venkateshUid,
          name: "Venkatesh Choppa",
          email: "venkateshchap14@gmail.com",
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
  if (!inMemoryUsers.has(testAthleteUid)) {
    inMemoryUsers.set(
      testAthleteUid,
      sanitizeAdminUserRecord(
        {
          id: testAthleteUid,
          name: "Test Athlete",
          email: "test_1793282473121@test.com",
          phone: "+91 98000 00000",
          city: "Online Client",
          membershipCategory: "free",
          membershipTitle: "Free Assessment Lead",
          goal: "fat-loss",
          goalDisplay: "Fat Loss",
          joinedAt: "2026-10-29T14:00:00.000Z",
          lastActive: "Active Today",
        },
        testAthleteUid
      )
    );
  }

  try {
    // 1. Fetch users collection
    try {
      const userSnap = await getDocs(collection(db, "users"));
      userSnap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<AdminUserRecord>;
        const existing = inMemoryUsers.get(docSnap.id);
        const record = sanitizeAdminUserRecord(
          {
            ...existing,
            ...data,
            id: docSnap.id,
            plan: data.plan || existing?.plan,
          },
          docSnap.id
        );
        inMemoryUsers.set(docSnap.id, record);
      });
    } catch (e) {
      console.warn("Direct Firestore users collection sync notice:", e);
    }

    // 2. Fetch plans collection
    try {
      const plansSnap = await getDocs(collection(db, "plans"));
      plansSnap.forEach((docSnap) => {
        const planData = docSnap.data() as PlanDashboardData;
        inMemoryPlans.set(docSnap.id, { ...planData, id: docSnap.id });
        const existing = inMemoryUsers.get(docSnap.id);
        if (existing) {
          existing.plan = { ...existing.plan, ...planData };
          if (planData.status === "approved" || planData.status === "active") {
            existing.needsPlanReview = false;
          }
          inMemoryUsers.set(docSnap.id, existing);
        } else if (planData.customerName) {
          const newRec = sanitizeAdminUserRecord(
            {
              id: docSnap.id,
              name: planData.customerName,
              email: `${docSnap.id}@client.bmyfit.in`,
              membershipCategory: "purchased",
              plan: planData,
            },
            docSnap.id
          );
          inMemoryUsers.set(docSnap.id, newRec);
        }
      });
    } catch (e) {
      console.warn("Direct Firestore plans collection sync notice:", e);
    }

    // 3. Fetch assessments collection
    try {
      const asmSnap = await getDocs(collection(db, "assessments"));
      asmSnap.forEach((docSnap) => {
        const asm = docSnap.data();
        const id = (asm.uid && asm.uid !== "anonymous-user" && !String(asm.uid).startsWith("guest_")) ? asm.uid : docSnap.id;
        const existing = inMemoryUsers.get(id) || inMemoryUsers.get(docSnap.id);
        const leadName = asm.name || `Free Score Lead (${docSnap.id.slice(0, 6)})`;
        if (!existing) {
          const newRec = sanitizeAdminUserRecord(
            {
              id,
              name: leadName,
              email: asm.email || `${id}@lead.bmyfit.in`,
              phone: asm.phone || "+91 98000 00000",
              goal: asm.goal || "fat-loss",
              goalDisplay: asm.goal ? `${String(asm.goal).replace("-", " ")}` : "Fat Loss",
              membershipCategory: "free",
              membershipTitle: "Free Assessment Lead",
              biometrics: {
                gender: asm.gender || "male",
                age: asm.age || 28,
                heightCm: asm.heightCm || 175,
                weightKg: asm.weightKg || 78,
                targetWeightKg: asm.targetWeightKg || 70,
                waistIn: asm.waistIn || 34,
                neckIn: asm.neckIn || 15.5,
                hipIn: asm.hipIn,
                bmi: asm.bmi || 25,
                bmiCategory: asm.bmiCategory || "normal",
                bodyFatPercent: asm.bodyFatPercent || 20,
                bodyFatCategory: asm.bodyFatCategory || "average",
                bmr: 1700,
                tdee: 2350,
                caloricTarget: 1800,
                proteinTargetGrams: 120,
                activityLevel: asm.activityLevel || "moderately-active",
                dietPreference: asm.dietPreference || "vegetarian",
                waterLitres: 3.5,
                dailyStepGoal: 10000,
              },
            },
            id
          );
          inMemoryUsers.set(id, newRec);
        } else {
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
        if (id.startsWith("user_membership_") || id.startsWith("user_purchase_") || id.startsWith("mock_")) {
          return;
        }
        const chat = docSnap.data();
        const existing = inMemoryUsers.get(id);
        if (existing) {
          if (chat.userName) existing.name = chat.userName;
          if (chat.userEmail) existing.email = chat.userEmail;
          if (chat.userPhone) existing.phone = chat.userPhone;
          if (chat.planGoal) existing.goal = chat.planGoal;
          if (chat.membershipCategory) existing.membershipCategory = chat.membershipCategory;
          inMemoryUsers.set(id, existing);
        } else if (chat.userName || chat.userEmail) {
          const newRec = sanitizeAdminUserRecord(
            {
              id,
              name: chat.userName || `Client (${id.slice(0, 8)})`,
              email: chat.userEmail || `${id}@client.bmyfit.in`,
              phone: chat.userPhone || "+91 98000 00000",
              membershipCategory: chat.membershipCategory || "purchased",
              goal: chat.planGoal || "fat-loss",
              avatar: chat.avatarUrl,
            },
            id
          );
          inMemoryUsers.set(id, newRec);
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
        if (targetId) {
          const user = inMemoryUsers.get(targetId);
          if (user) {
            user.membershipCategory = "purchased";
            user.needsPlanReview = user.plan?.status === "pending_review";
            user.order = {
              orderId: order.razorpayOrderId || docSnap.id,
              razorpayPaymentId: order.razorpayPaymentId || "pay_verified",
              amountPaise: order.amountPaise || 9900,
              amountFormatted: `₹${Math.round((order.amountPaise || 9900) / 100)}`,
              currency: "INR",
              status: "paid",
              packageTitle: "8-Week Custom Transformation Plan",
              durationWeeks: 8,
              purchasedAt: order.paidAt || new Date().toISOString(),
            };
          }
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
