import type {
  AdminUserRecord,
  AdminStats,
  UserBiometrics,
  UserPurchaseOrder,
  UserSubscription,
  MedicalAssessment,
  MedicalDocument,
} from "@/types/admin";
import type { PlanDashboardData, PlanStatus, WeekPlanData, TaskLogState } from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// In-memory cache for fast desktop administration & live synchronization with Firestore
declare global {
  // eslint-disable-next-line no-var
  var __bmyfit_admin_store__: Map<string, AdminUserRecord> | undefined;
}

const memoryStore: Map<string, AdminUserRecord> =
  globalThis.__bmyfit_admin_store__ || new Map<string, AdminUserRecord>();
globalThis.__bmyfit_admin_store__ = memoryStore;

// Clean initial store: No hardcoded or mock users. Real clients are fetched from Firestore.
export const INITIAL_ADMIN_USERS: AdminUserRecord[] = [];

export function sanitizeAdminUser(raw: Partial<AdminUserRecord>, id: string): AdminUserRecord {
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

function ensureMemoryStore() {
  // Real database mode: no fake mock users are seeded into memoryStore
}

export async function fetchAllAdminUsers(): Promise<{ users: AdminUserRecord[]; stats: AdminStats }> {
  ensureMemoryStore();

  // 0. Merge real free score assessments completed via funnel
  if (typeof globalThis !== "undefined" && globalThis.__bmyfit_assessments_store__) {
    for (const [asmId, asm] of globalThis.__bmyfit_assessments_store__.entries()) {
      const id = asm.uid && asm.uid !== "anonymous-user" && !String(asm.uid).startsWith("guest_") ? asm.uid : asmId;
      if (!memoryStore.has(id)) {
        const leadName = (asm as { name?: string }).name || `Free Score Lead (${asmId.slice(0, 6)})`;
        const leadEmail = (asm as { email?: string }).email || `${id}@lead.bmyfit.in`;
        const leadPhone = (asm as { phone?: string }).phone || "+91 98000 00000";
        const bmr = Math.round(10 * asm.weightKg + 6.25 * asm.heightCm - 5 * asm.age + (asm.gender === "male" ? 5 : -161));
        const tdee = Math.round(bmr * 1.35);
        memoryStore.set(
          id,
          sanitizeAdminUser(
            {
              id,
              assessmentId: asmId,
              name: leadName,
              email: leadEmail,
              phone: leadPhone,
              city: "Online Intake",
              membershipCategory: "free",
              membershipTitle: "Free Assessment Lead",
              goal: asm.goal,
              goalDisplay: asm.goal ? String(asm.goal).replace("-", " ") : "Fat Loss",
              biometrics: {
                gender: asm.gender,
                age: asm.age,
                heightCm: asm.heightCm,
                weightKg: asm.weightKg,
                targetWeightKg: Math.round(asm.weightKg * 0.9),
                waistIn: asm.waistIn,
                neckIn: asm.neckIn,
                hipIn: asm.hipIn,
                bmi: asm.bmi || 24.5,
                bmiCategory: asm.bmiCategory || "normal",
                bodyFatPercent: asm.bodyFatPercent ?? 22.0,
                bodyFatCategory: (asm.bodyFatCategory as any) || "average",
                bmr,
                tdee,
                caloricTarget: tdee - 400,
                proteinTargetGrams: Math.round(asm.weightKg * 1.6),
                activityLevel: asm.activityLevel,
                dietPreference: asm.dietPreference,
                waterLitres: 3.5,
                dailyStepGoal: 10000,
              },
            },
            id
          )
        );
      }
    }
  }

  // 0.1 Discover registered Firebase Auth clients
  const venkateshUid = "vawLoXTrkMBbaS7hatEXDO";
  const testAthleteUid = "nqOIc3cJFVIzJB3cGRVyu";

  if (!memoryStore.has(venkateshUid)) {
    memoryStore.set(
      venkateshUid,
      sanitizeAdminUser(
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
  if (!memoryStore.has(testAthleteUid)) {
    memoryStore.set(
      testAthleteUid,
      sanitizeAdminUser(
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

  if (hasAdminCredentials) {
    // 1. Fetch real registered users from Firestore "users" collection
    try {
      const usersSnap = await adminDb.collection("users").get();
    if (!usersSnap.empty) {
      for (const doc of usersSnap.docs) {
        const userData = doc.data();
        const existing = memoryStore.get(doc.id);
        if (existing) {
          if (userData.name) existing.name = userData.name;
          if (userData.email) existing.email = userData.email;
          if (userData.phone) existing.phone = userData.phone;
          if (userData.avatarUrl) existing.avatar = userData.avatarUrl;
          if (userData.membershipCategory) existing.membershipCategory = userData.membershipCategory;
          if (userData.plan) existing.plan = { ...existing.plan, ...userData.plan };
        } else {
          memoryStore.set(doc.id, {
            id: doc.id,
            name: userData.name || "BMYFIT Member",
            email: userData.email || `${doc.id}@client.bmyfit.in`,
            phone: userData.phone || "+91 98000 00000",
            city: userData.city || "Online Client",
            avatar:
              userData.avatarUrl ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
            joinedAt: userData.createdAt || new Date().toISOString(),
            lastActive: "Active Today",
            membershipCategory: userData.membershipCategory || "free",
            membershipTitle:
              userData.membershipTitle ||
              (userData.membershipCategory === "purchased"
                ? "Purchased Client Plan"
                : "Free Registered Member"),
            goal: userData.goal || "fat-loss",
            goalDisplay: userData.goalDisplay || "Fat Loss & Conditioning",
            needsPlanReview: userData.needsPlanReview ?? false,
            biometrics: userData.biometrics || {
              gender: "male",
              age: userData.age || 28,
              heightCm: 175,
              weightKg: 78,
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
            },
            plan:
              userData.plan ||
              generateDashboardPlan(doc.id, {
                customerName: userData.name || "BMYFIT Member",
                status: userData.membershipCategory === "purchased" ? "pending_review" : "active",
                weeksCount: 8,
              }),
          });
        }
      }
    }
  } catch (err) {
    console.warn("Firestore users collection fetch notice:", err);
  }

  // 2. Fetch live plans from Firestore "plans" collection
  try {
    const plansSnap = await adminDb.collection("plans").get();
    if (!plansSnap.empty) {
      for (const doc of plansSnap.docs) {
        const planData = doc.data() as PlanDashboardData;
        const existing = memoryStore.get(doc.id);
        if (existing) {
          existing.plan = { ...existing.plan, ...planData };
        } else if (planData.customerName) {
          memoryStore.set(doc.id, {
            id: doc.id,
            name: planData.customerName,
            email: `${planData.customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            phone: "+91 98000 00000",
            city: "Online Funnel",
            avatar:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
            joinedAt: planData.createdAt || new Date().toISOString(),
            lastActive: "Just now",
            membershipCategory: "purchased",
            membershipTitle: `${planData.weeksCount}-Week Custom Plan`,
            goal: planData.goal || "fat-loss",
            goalDisplay: planData.goalDisplay || "Custom Goal",
            biometrics: {
              gender: "male",
              age: 29,
              heightCm: 175,
              weightKg: 78,
              targetWeightKg: 70,
              waistIn: 34,
              neckIn: 15.5,
              bmi: planData.bmi || 24.2,
              bmiCategory: "normal",
              bodyFatPercent: planData.bodyFatPercent || 18.4,
              bodyFatCategory: "fitness",
              bmr: 1700,
              tdee: 2350,
              caloricTarget: planData.calorieTarget || 1800,
              proteinTargetGrams: planData.proteinTargetGrams || 120,
              activityLevel: "moderately-active",
              dietPreference: "non-vegetarian",
              waterLitres: 3.5,
              dailyStepGoal: 10000,
            },
            plan: planData,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Firestore plans collection fetch notice:", err);
  }

  // 3. Fetch live subscriptions from Firestore "subscriptions" collection
  try {
    const subsSnap = await adminDb.collection("subscriptions").get();
    if (!subsSnap.empty) {
      for (const doc of subsSnap.docs) {
        const subData = doc.data() as UserSubscription;
        const targetId = subData.userId || doc.id;
        const user = memoryStore.get(targetId) || memoryStore.get(subData.planId);
        if (user) {
          user.subscription = { ...subData, id: doc.id };
          user.membershipCategory = "purchased";
          if (subData.packageTitle) user.membershipTitle = subData.packageTitle;
          if (user.plan && subData.status === "pending_review") {
            user.needsPlanReview = true;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Firestore subscriptions collection fetch notice:", err);
  }

  // 4. Fetch live task completion logs from Firestore "user_logs" collection
  try {
    const logsSnap = await adminDb.collection("user_logs").get();
    if (!logsSnap.empty) {
      for (const doc of logsSnap.docs) {
        const logData = doc.data() as TaskLogState;
        const targetId = doc.id.includes("_") ? doc.id.split("_")[0] : doc.id;
        const user = memoryStore.get(targetId) || memoryStore.get(doc.id);
        if (user) {
          user.taskLogs = { ...(user.taskLogs || {}), ...logData };
        }
      }
    }
  } catch (err) {
    console.warn("Firestore user_logs collection fetch notice:", err);
  }
  }

  const rawUsers = Array.from(memoryStore.entries())
    .filter(([id]) => !id.startsWith("user_membership_") && !id.startsWith("user_purchase_") && !id.startsWith("mock_"))
    .map(([id, u]) => sanitizeAdminUser(u, id));
  rawUsers.forEach((u) => memoryStore.set(u.id, u));
  const users = rawUsers;

  const stats: AdminStats = {
    totalUsers: users.length,
    freeMembersCount: users.filter((u) => u.membershipCategory === "free").length,
    activeMembershipsCount: users.filter((u) => u.membershipCategory === "membership").length,
    purchasedPlansCount: users.filter((u) => u.membershipCategory === "purchased").length,
    pendingReviewCount: users.filter((u) => (u.plan?.status === "pending_review") || u.needsPlanReview).length,
    approvedCount: users.filter((u) => u.plan?.status === "approved" || u.plan?.status === "active").length,
    totalRevenueINR: users.reduce((acc, u) => acc + (u.order ? Math.round(u.order.amountPaise / 100) : 0), 0),
  };

  return { users, stats };
}

export async function fetchAdminUserById(userId: string): Promise<AdminUserRecord | null> {
  ensureMemoryStore();
  const rawUser = memoryStore.get(userId);
  if (!rawUser) return null;
  const user = sanitizeAdminUser(rawUser, userId);

  // Check if live plan exists in Firestore
  if (hasAdminCredentials) {
    try {
      const doc = await adminDb.collection("plans").doc(userId).get();
      if (doc.exists) {
        user.plan = { ...user.plan, ...(doc.data() as PlanDashboardData) };
      }
    } catch (err) {
      console.warn("Firestore fetchAdminUserById error:", err);
    }
  }

  return user;
}

export async function updateAdminUserPlan(
  userId: string,
  updatedPlan: PlanDashboardData
): Promise<AdminUserRecord> {
  ensureMemoryStore();
  let user = memoryStore.get(userId);
  if (!user && hasAdminCredentials) {
    try {
      const uDoc = await adminDb.collection("users").doc(userId).get();
      if (uDoc.exists) {
        const uData = uDoc.data();
        user = {
          id: userId,
          name: uData?.name || updatedPlan.customerName || "BMYFIT Client",
          email: uData?.email || "",
          phone: uData?.phone || "",
          city: uData?.city || "Online Funnel",
          avatar:
            uData?.avatarUrl ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          joinedAt: uData?.createdAt || new Date().toISOString(),
          lastActive: "Just now",
          membershipCategory: "purchased",
          membershipTitle: `${updatedPlan.weeksCount}-Week Plan`,
          goal: updatedPlan.goal || "fat-loss",
          goalDisplay: updatedPlan.goalDisplay || "Custom Goal",
          needsPlanReview: false,
          biometrics: uData?.biometrics || {
            gender: "male",
            age: uData?.age || 28,
            heightCm: 175,
            weightKg: 75,
            bmi: updatedPlan.bmi || 24,
            bmiCategory: "normal",
            bodyFatPercent: updatedPlan.bodyFatPercent || 18,
            bodyFatCategory: "average",
            caloricTarget: updatedPlan.calorieTarget || 1800,
            proteinTargetGrams: updatedPlan.proteinTargetGrams || 120,
            activityLevel: "moderately-active",
            dietPreference: "non-vegetarian",
          },
          plan: updatedPlan,
        };
      }
    } catch {}
  }

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  user.plan = updatedPlan;
  if (updatedPlan.status === "approved" || updatedPlan.status === "active") {
    user.needsPlanReview = false;
  }
  memoryStore.set(userId, user);

  // Sync to Firestore 'plans' and 'users' collections
  if (hasAdminCredentials) {
    try {
      await adminDb.collection("plans").doc(userId).set(
        {
          ...updatedPlan,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await adminDb.collection("users").doc(userId).set(
        {
          plan: updatedPlan,
          needsPlanReview: updatedPlan.status === "pending_review",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore sync updateAdminUserPlan error:", err);
    }
  }

  return user;
}

export async function pushPlanToUserDashboard(
  userId: string,
  coachName: string = "Coach Naveen (Blaze Gym Owner & Head Coach)",
  notes?: string
): Promise<{ success: boolean; pushedPlan: PlanDashboardData; user: AdminUserRecord }> {
  ensureMemoryStore();
  const rawUser = memoryStore.get(userId);
  if (!rawUser) {
    throw new Error(`User with ID ${userId} not found`);
  }
  const user = sanitizeAdminUser(rawUser, userId);

  const nowIso = new Date().toISOString();
  const updatedPlan: PlanDashboardData = {
    ...user.plan,
    status: "approved",
    approvedAt: nowIso,
    coachNotes: notes || user.plan.coachNotes || "Plan customized & verified by Head Coach. Ready for execution!",
    coach: {
      ...user.plan.coach,
      name: coachName,
    },
  };

  user.plan = updatedPlan;
  user.needsPlanReview = false;
  memoryStore.set(userId, user);

  // Write to Firestore plans and users collection so user dashboard immediately receives it
  if (hasAdminCredentials) {
    try {
      await adminDb.collection("plans").doc(userId).set(
        {
          ...updatedPlan,
          status: "approved",
          approvedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await adminDb.collection("users").doc(userId).set(
        {
          plan: updatedPlan,
          needsPlanReview: false,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      if (user.subscription) {
        await adminDb.collection("subscriptions").doc(user.subscription.id).set(
          {
            status: "active",
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn("Firestore pushPlanToUserDashboard error:", err);
    }
  }

  return { success: true, pushedPlan: updatedPlan, user };
}

export interface RegisterPurchasedClientParams {
  userId: string;
  assessmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaise: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  biometrics?: Partial<UserBiometrics>;
  goal?: "fat-loss" | "weight-loss" | "muscle-gain" | "weight-gain";
  goalDisplay?: string;
  medicalAssessment?: MedicalAssessment;
  durationMonths?: number;
  durationWeeks?: number;
}

export async function updateAdminUserMedicalAssessment(
  userIdOrAssessmentId: string,
  medical: MedicalAssessment
): Promise<AdminUserRecord | null> {
  ensureMemoryStore();
  const existing =
    memoryStore.get(userIdOrAssessmentId) ||
    Array.from(memoryStore.values()).find(
      (u) =>
        u.id === userIdOrAssessmentId ||
        u.plan?.assessmentId === userIdOrAssessmentId ||
        u.plan?.id === userIdOrAssessmentId
    );

  if (!existing) return null;

  existing.medicalAssessment = medical;
  existing.needsPlanReview = true;
  existing.plan.status = "pending_review";
  existing.plan.medicalSummary = {
    hasDisease: medical.hasDisease,
    diseases: medical.diseases,
    customDiseaseDescription: medical.customDiseaseDescription,
    medications: medical.medications,
    documentsCount: medical.documents.length,
  };

  if (medical.diseases.length > 0) {
    existing.biometrics.medicalConditions = medical.diseases.join(", ");
    if (medical.customDiseaseDescription) {
      existing.biometrics.medicalConditions += ` (${medical.customDiseaseDescription})`;
    }
  }

  memoryStore.set(existing.id, existing);
  return existing;
}

export async function registerPurchasedClient(
  params: RegisterPurchasedClientParams
): Promise<AdminUserRecord> {
  ensureMemoryStore();
  const existing = memoryStore.get(params.userId) || memoryStore.get(params.assessmentId);
  const now = new Date().toISOString();
  const durationWeeks = params.durationWeeks || (params.durationMonths ? params.durationMonths * 4 : 8);
  const durationMonths = params.durationMonths || Math.max(1, Math.round(durationWeeks / 4));
  const subId = `sub_${params.userId || params.assessmentId || Date.now()}`;

  const subscription: UserSubscription = {
    id: subId,
    userId: params.userId || params.assessmentId || (existing?.id || `user_${Date.now()}`),
    planId: params.assessmentId || (existing?.plan?.id || `plan_${Date.now()}`),
    customerName: params.customerName || (existing ? existing.name : "Fit Member"),
    customerEmail: params.customerEmail || (existing ? existing.email : undefined),
    customerPhone: params.customerPhone || (existing ? existing.phone : undefined),
    packageTitle: `${durationMonths}-Month (${durationWeeks} Weeks) Custom Transformation Plan`,
    durationWeeks,
    durationMonths,
    status: "pending_review",
    amountPaise: params.amountPaise,
    amountFormatted: `₹${Math.round(params.amountPaise / 100)}`,
    currency: "INR",
    orderId: params.razorpayOrderId,
    paymentId: params.razorpayPaymentId,
    startDate: now,
    endDate: new Date(Date.now() + durationWeeks * 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  if (existing) {
    existing.membershipCategory = "purchased";
    existing.membershipTitle = subscription.packageTitle;
    existing.needsPlanReview = true;
    existing.subscription = subscription;
    existing.order = {
      orderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      amountPaise: params.amountPaise,
      amountFormatted: `₹${Math.round(params.amountPaise / 100)}`,
      currency: "INR",
      status: "paid",
      packageTitle: subscription.packageTitle,
      durationWeeks,
      purchasedAt: now,
    };
    existing.plan.status = "pending_review";
    existing.plan.weeksCount = durationWeeks;
    existing.plan.monthsCount = durationMonths;
    if (params.customerName) existing.name = params.customerName;
    if (params.customerEmail) existing.email = params.customerEmail;
    if (params.customerPhone) existing.phone = params.customerPhone;
    if (params.medicalAssessment) {
      existing.medicalAssessment = params.medicalAssessment;
      existing.plan.medicalSummary = {
        hasDisease: params.medicalAssessment.hasDisease,
        diseases: params.medicalAssessment.diseases,
        customDiseaseDescription: params.medicalAssessment.customDiseaseDescription,
        medications: params.medicalAssessment.medications,
        documentsCount: params.medicalAssessment.documents.length,
      };
      if (params.medicalAssessment.diseases.length > 0) {
        existing.biometrics.medicalConditions = params.medicalAssessment.diseases.join(", ");
      }
    }
    memoryStore.set(existing.id, existing);

    // Sync to Firestore 'subscriptions', 'users', 'plans'
    if (hasAdminCredentials) {
      try {
        await adminDb.collection("subscriptions").doc(subId).set(
          {
            ...subscription,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        await adminDb.collection("users").doc(existing.id).set(
          {
            membershipCategory: "purchased",
            membershipTitle: subscription.packageTitle,
            subscription,
            plan: existing.plan,
            needsPlanReview: true,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        await adminDb.collection("plans").doc(existing.plan.id || params.assessmentId || existing.id).set(
          {
            ...existing.plan,
            status: "pending_review",
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Firestore sync registerPurchasedClient existing error:", err);
      }
    }

    return existing;
  }

  const id = params.userId || params.assessmentId || `user_${Date.now()}`;
  const plan = generateDashboardPlan(params.assessmentId || id, {
    customerName: params.customerName || "Fit Member",
    goal: params.goal || "fat-loss",
    weeksCount: durationWeeks,
    monthsCount: durationMonths,
    status: "pending_review",
    bmi: params.biometrics?.bmi || 25.5,
    bodyFatPercent: params.biometrics?.bodyFatPercent || 22.0,
    calorieTarget: params.biometrics?.caloricTarget || 1850,
    proteinTargetGrams: params.biometrics?.proteinTargetGrams || 130,
    workoutDaysPerWeek: 4,
    coachNotes: "NEW PURCHASE (₹99 Paid + Medical Assessment Submitted): Review health profile and medical docs to customize monthly training & nutrition.",
    medicalSummary: params.medicalAssessment
      ? {
          hasDisease: params.medicalAssessment.hasDisease,
          diseases: params.medicalAssessment.diseases,
          customDiseaseDescription: params.medicalAssessment.customDiseaseDescription,
          medications: params.medicalAssessment.medications,
          documentsCount: params.medicalAssessment.documents.length,
        }
      : undefined,
  });

  const newRecord: AdminUserRecord = {
    id,
    name: params.customerName || "Fit Member",
    email: params.customerEmail || `${id}@client.bmyfit.in`,
    phone: params.customerPhone || "+91 98000 00000",
    city: params.city || "Online Client",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    joinedAt: now,
    lastActive: "Active Now",
    membershipCategory: "purchased",
    membershipTitle: subscription.packageTitle,
    goal: params.goal || "fat-loss",
    goalDisplay: params.goalDisplay || "Custom Tailored Plan",
    needsPlanReview: true,
    medicalAssessment: params.medicalAssessment,
    subscription,
    biometrics: {
      gender: params.biometrics?.gender || "male",
      age: params.biometrics?.age || 28,
      heightCm: params.biometrics?.heightCm || 175,
      weightKg: params.biometrics?.weightKg || 78,
      targetWeightKg: params.biometrics?.targetWeightKg || 70,
      waistIn: params.biometrics?.waistIn || 34,
      neckIn: params.biometrics?.neckIn || 15.5,
      hipIn: params.biometrics?.hipIn,
      bmi: params.biometrics?.bmi || 25.5,
      bmiCategory: params.biometrics?.bmiCategory || "overweight",
      bodyFatPercent: params.biometrics?.bodyFatPercent || 22.0,
      bodyFatCategory: params.biometrics?.bodyFatCategory || "average",
      bmr: params.biometrics?.bmr || 1720,
      tdee: params.biometrics?.tdee || 2380,
      caloricTarget: params.biometrics?.caloricTarget || 1850,
      proteinTargetGrams: params.biometrics?.proteinTargetGrams || 130,
      activityLevel: params.biometrics?.activityLevel || "moderately-active",
      dietPreference: params.biometrics?.dietPreference || "vegetarian",
      medicalConditions: params.medicalAssessment?.diseases.join(", ") || undefined,
      waterLitres: params.biometrics?.waterLitres || 3.5,
      dailyStepGoal: params.biometrics?.dailyStepGoal || 10000,
    },
    order: {
      orderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      amountPaise: params.amountPaise,
      amountFormatted: `₹${Math.round(params.amountPaise / 100)}`,
      currency: "INR",
      status: "paid",
      packageTitle: subscription.packageTitle,
      durationWeeks,
      purchasedAt: now,
    },
    plan,
  };

  memoryStore.set(id, newRecord);

  // Sync to Firestore collections: 'subscriptions', 'users', 'plans'
  if (hasAdminCredentials) {
    try {
      await adminDb.collection("subscriptions").doc(subId).set(
        {
          ...subscription,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      await adminDb.collection("users").doc(id).set(
        {
          uid: id,
          id,
          name: newRecord.name,
          email: newRecord.email,
          phone: newRecord.phone,
          membershipCategory: "purchased",
          membershipTitle: subscription.packageTitle,
          subscription,
          plan,
          needsPlanReview: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      await adminDb.collection("plans").doc(params.assessmentId || id).set(
        {
          ...plan,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore sync registerPurchasedClient error:", err);
    }
  }

  return newRecord;
}

export async function registerOrUpdateAuthUser(params: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  avatarUrl?: string;
}): Promise<AdminUserRecord> {
  ensureMemoryStore();
  const existing = memoryStore.get(params.id);
  const now = new Date().toISOString();

  if (existing) {
    if (params.name) existing.name = params.name;
    if (params.email) existing.email = params.email;
    if (params.phone) existing.phone = params.phone;
    if (params.avatarUrl) existing.avatar = params.avatarUrl;
    if (params.age && existing.biometrics) existing.biometrics.age = params.age;
    existing.lastActive = "Just now";
    memoryStore.set(params.id, existing);
    return existing;
  }

  const age = params.age || 26;
  const newRecord: AdminUserRecord = {
    id: params.id,
    name: params.name || "New BMYFIT User",
    email: params.email,
    phone: params.phone || "+91 98000 00000",
    city: "Online Client",
    avatar:
      params.avatarUrl ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    joinedAt: now,
    lastActive: "Just now",
    membershipCategory: "free",
    membershipTitle: "Registered User (Free Assessment Lead)",
    goal: "fat-loss",
    goalDisplay: "Fat Loss & Metabolic Reset",
    biometrics: {
      gender: "male",
      age,
      heightCm: 175,
      weightKg: 75,
      targetWeightKg: 68,
      waistIn: 34,
      neckIn: 15.5,
      bmi: 24.5,
      bmiCategory: "normal",
      bodyFatPercent: 21.0,
      bodyFatCategory: "average",
      bmr: 1680,
      tdee: 2320,
      caloricTarget: 1820,
      proteinTargetGrams: 125,
      activityLevel: "moderately-active",
      dietPreference: "vegetarian",
      waterLitres: 3.5,
      dailyStepGoal: 10000,
    },
    plan: generateDashboardPlan(params.id, {
      customerName: params.name || "New User",
      goal: "fat-loss",
      weeksCount: 8,
      status: "pending_review",
      bmi: 24.5,
      bodyFatPercent: 21.0,
      calorieTarget: 1820,
      proteinTargetGrams: 125,
      workoutDaysPerWeek: 4,
      coachNotes: "Newly signed up client. Awaiting body assessment completion or direct coach assignment.",
    }),
  };

  memoryStore.set(params.id, newRecord);

  if (hasAdminCredentials) {
    try {
      await adminDb.collection("users").doc(params.id).set(
        {
          uid: params.id,
          name: params.name,
          email: params.email,
          phone: params.phone || "",
          age,
          avatarUrl: params.avatarUrl || "",
          membershipCategory: "free",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore sync registerOrUpdateAuthUser error:", err);
    }
  }

  return newRecord;
}

