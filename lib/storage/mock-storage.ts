"use client";

import type { AdminUserRecord, MedicalAssessment, MedicalDocument, UserSubscription } from "@/types/admin";
import type { PlanDashboardData, PlanStatus } from "@/types/plan-dashboard";
import {
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
} from "@/lib/firebase/client";

export const SAMPLE_MEDICAL_DOCS: MedicalDocument[] = [
  {
    id: "doc_sample_blood",
    name: "Complete_Blood_Count_Lipid_Panel.pdf",
    type: "pdf",
    sizeFormatted: "248 KB",
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    category: "blood_test",
  },
  {
    id: "doc_sample_thyroid",
    name: "Thyroid_T3_T4_TSH_Report.pdf",
    type: "pdf",
    sizeFormatted: "185 KB",
    uploadedAt: new Date(Date.now() - 1800000).toISOString(),
    category: "blood_test",
  },
  {
    id: "doc_sample_spine",
    name: "Doctor_Spine_Clearance_Note.jpg",
    type: "image",
    sizeFormatted: "412 KB",
    uploadedAt: new Date(Date.now() - 900000).toISOString(),
    category: "prescription",
  },
];

export function isClient(): boolean {
  return typeof window !== "undefined";
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
            inMemoryUsers.set(change.doc.id, {
              ...existing,
              ...data,
              id: change.doc.id,
              plan: data.plan || existing?.plan,
            });
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
  return Array.from(inMemoryUsers.values());
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
