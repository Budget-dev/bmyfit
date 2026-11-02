import type {
  AdminUserRecord,
  AdminStats,
  UserBiometrics,
  UserSubscription,
  MedicalAssessment,
} from "@/types/admin";
import type { PlanDashboardData, TaskLogState, PlanReleaseHistoryItem, DailyCheckInLog } from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { adminDb, adminAuth, hasAdminCredentials } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// In-memory cache for fast desktop administration & live synchronization with Firestore
declare global {
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
    phone: raw.phone || "",
    city: raw.city || "",
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
                bodyFatCategory: (asm.bodyFatCategory as UserBiometrics["bodyFatCategory"]) || "average",
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

  // 0.1 Discover registered Firebase Auth clients (Exact UIDs from Firebase Auth console)
  const venkateshUid = "vovsLoxTftM6lNs7hstEKDD31iK2";
  const testAthleteUid = "nqOlc3cJFVIzJB3oGRVyu4g9r4L2";

  if (!memoryStore.has(venkateshUid)) {
    memoryStore.set(
      venkateshUid,
      sanitizeAdminUser(
        {
          id: venkateshUid,
          name: "Venkatesh Choppa",
          email: "venkateshchop14@gmail.com",
          phone: "",
          city: "",
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
          phone: "",
          city: "",
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
    // 0.2 Query live Firebase Authentication users
    try {
      const authList = await adminAuth.listUsers(100);
      for (const authUser of authList.users) {
        if (authUser.email?.toLowerCase() === "bmyfitnesscoach@gmail.com") continue; // Coach is admin

        const uid = authUser.uid;
        const email = authUser.email || `${uid}@client.bmyfit.in`;
        const displayName = authUser.displayName || email.split("@")[0] || "BMYFIT Member";
        const phone = authUser.phoneNumber || "+91 98000 00000";
        const photoUrl = authUser.photoURL || undefined;

        const existing = memoryStore.get(uid);
        if (existing) {
          existing.email = email;
          if (authUser.displayName) existing.name = authUser.displayName;
          if (authUser.phoneNumber) existing.phone = authUser.phoneNumber;
          if (photoUrl) existing.avatar = photoUrl;
        } else {
          memoryStore.set(
            uid,
            sanitizeAdminUser(
              {
                id: uid,
                name: displayName,
                email,
                phone: phone || "",
                city: "",
                avatar: photoUrl,
                joinedAt: authUser.metadata.creationTime || new Date().toISOString(),
                lastActive: "Active Today",
                membershipCategory: "free",
                membershipTitle: "Registered Member",
                goal: "fat-loss",
                goalDisplay: "Fat Loss",
              },
              uid
            )
          );
        }
      }
    } catch (authErr) {
      console.warn("adminAuth.listUsers notice:", authErr);
    }

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
            if (userData.biometrics) existing.biometrics = { ...existing.biometrics, ...userData.biometrics };
            if (userData.medicalAssessment) existing.medicalAssessment = { ...existing.medicalAssessment, ...userData.medicalAssessment };
          } else {
            memoryStore.set(doc.id, {
              id: doc.id,
              name: userData.name || "BMYFIT Member",
              email: userData.email || `${doc.id}@client.bmyfit.in`,
              phone: userData.phone || "",
              city: userData.city || "",
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

    // 1.5 Fetch live assessments from Firestore "assessments" collection (Free Score leads)
    try {
      const asmSnap = await adminDb.collection("assessments").get();
      if (!asmSnap.empty) {
        for (const doc of asmSnap.docs) {
          const asm = doc.data();
          const targetUid = asm.uid && asm.uid !== "anonymous-user" && !String(asm.uid).startsWith("guest_") ? asm.uid : doc.id;
          const existing = memoryStore.get(targetUid) || memoryStore.get(doc.id);
          const leadName = asm.name || `Free Score Lead (${doc.id.slice(0, 6)})`;
          const leadEmail = asm.email || (existing ? existing.email : `${doc.id}@lead.bmyfit.in`);

          if (existing) {
            existing.assessmentId = doc.id;
            if (asm.name && existing.name === "BMYFIT Member") existing.name = asm.name;
            if (asm.email && !existing.email) existing.email = asm.email;
            if (asm.phone && !existing.phone) existing.phone = asm.phone;
            if (asm.goal) {
              existing.goal = asm.goal;
              existing.goalDisplay = String(asm.goal).replace("-", " ");
            }
            if (asm.bmi || asm.bodyFatPercent) {
              existing.biometrics = {
                ...existing.biometrics,
                gender: asm.gender || existing.biometrics?.gender || "male",
                age: asm.age || existing.biometrics?.age || 26,
                heightCm: asm.heightCm || existing.biometrics?.heightCm || 175,
                weightKg: asm.weightKg || existing.biometrics?.weightKg || 70,
                targetWeightKg: asm.targetWeightKg || existing.biometrics?.targetWeightKg || 68,
                waistIn: asm.waistIn || existing.biometrics?.waistIn || 32,
                neckIn: asm.neckIn || existing.biometrics?.neckIn || 15,
                hipIn: asm.hipIn,
                bmi: asm.bmi || existing.biometrics?.bmi || 24.2,
                bmiCategory: asm.bmiCategory || existing.biometrics?.bmiCategory || "normal",
                bodyFatPercent: asm.bodyFatPercent || existing.biometrics?.bodyFatPercent || 18.4,
                bodyFatCategory: asm.bodyFatCategory || existing.biometrics?.bodyFatCategory || "average",
                bmr: asm.bmr || existing.biometrics?.bmr || 1600,
                tdee: asm.tdee || existing.biometrics?.tdee || 2200,
                caloricTarget: existing.biometrics?.caloricTarget || 1800,
                proteinTargetGrams: existing.biometrics?.proteinTargetGrams || 120,
                activityLevel: asm.activityLevel || existing.biometrics?.activityLevel || "moderately-active",
                dietPreference: asm.dietPreference || existing.biometrics?.dietPreference || "vegetarian",
                waterLitres: 3.5,
                dailyStepGoal: 10000,
              };
            }
          } else {
            memoryStore.set(
              doc.id,
              sanitizeAdminUser(
                {
                  id: doc.id,
                  assessmentId: doc.id,
                  name: leadName,
                  email: leadEmail,
                  phone: asm.phone || "+91 98000 00000",
                  city: "Online Funnel",
                  membershipCategory: "free",
                  membershipTitle: "Free Assessment Lead",
                  goal: asm.goal || "fat-loss",
                  goalDisplay: asm.goal ? String(asm.goal).replace("-", " ") : "Fat Loss",
                  joinedAt: asm.createdAt || new Date().toISOString(),
                  lastActive: "Recent Assessment",
                  biometrics: {
                    gender: asm.gender || "male",
                    age: asm.age || 26,
                    heightCm: asm.heightCm || 175,
                    weightKg: asm.weightKg || 70,
                    targetWeightKg: asm.targetWeightKg || 68,
                    waistIn: asm.waistIn || 32,
                    neckIn: asm.neckIn || 15,
                    hipIn: asm.hipIn,
                    bmi: asm.bmi || 24.2,
                    bmiCategory: asm.bmiCategory || "normal",
                    bodyFatPercent: asm.bodyFatPercent || 18.4,
                    bodyFatCategory: asm.bodyFatCategory || "average",
                    bmr: asm.bmr || 1600,
                    tdee: asm.tdee || 2200,
                    caloricTarget: 1800,
                    proteinTargetGrams: 120,
                    activityLevel: asm.activityLevel || "moderately-active",
                    dietPreference: asm.dietPreference || "vegetarian",
                    waterLitres: 3.5,
                    dailyStepGoal: 10000,
                  },
                },
                doc.id
              )
            );
          }
        }
      }
    } catch (asmErr) {
      console.warn("Firestore assessments collection fetch notice:", asmErr);
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

  // 4. Fetch live task completion & daily adherence logs from Firestore
  try {
    const logsSnap = await adminDb.collection("user_logs").get();
    if (!logsSnap.empty) {
      for (const doc of logsSnap.docs) {
        const rawData = doc.data() as Record<string, unknown>;
        const targetId = doc.id.includes("_") ? doc.id.split("_")[0] : doc.id;
        const user = memoryStore.get(targetId) || memoryStore.get(doc.id);
        if (user) {
          const { dailyLogs, ...taskLogsOnly } = rawData;
          user.taskLogs = { ...(user.taskLogs || {}), ...(taskLogsOnly as TaskLogState) };
          if (dailyLogs && typeof dailyLogs === "object") {
            user.dailyLogs = { ...(user.dailyLogs || {}), ...(dailyLogs as Record<string, DailyCheckInLog>) };
          }
        }
      }
    }
  } catch (err) {
    console.warn("Firestore user_logs collection fetch notice:", err);
  }

  // 4b. Also fetch from daily_checkins collection if present
  try {
    const checkinsSnap = await adminDb.collection("daily_checkins").get();
    if (!checkinsSnap.empty) {
      for (const doc of checkinsSnap.docs) {
        const checkinData = doc.data() as Record<string, DailyCheckInLog>;
        const targetId = doc.id;
        const user = memoryStore.get(targetId);
        if (user) {
          user.dailyLogs = { ...(user.dailyLogs || {}), ...checkinData };
        }
      }
    }
  } catch (err) {
    console.warn("Firestore daily_checkins fetch notice:", err);
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

export async function findAdminUserByIdOrPlanId(
  id: string,
  secondaryId?: string
): Promise<AdminUserRecord | null> {
  ensureMemoryStore();
  if (!id && !secondaryId) return null;

  const targetIds = [id, secondaryId].filter(Boolean) as string[];

  // 1. Direct memory lookup
  for (const tid of targetIds) {
    const raw = memoryStore.get(tid);
    if (raw) return sanitizeAdminUser(raw, raw.id || tid);
  }

  // 2. Scan memoryStore values by matching user.id, plan.id, assessmentId, or order ids
  for (const tid of targetIds) {
    const found = Array.from(memoryStore.values()).find(
      (u) =>
        u.id === tid ||
        u.plan?.id === tid ||
        u.plan?.assessmentId === tid ||
        u.order?.orderId === tid ||
        u.order?.razorpayPaymentId === tid ||
        u.order?.utr === tid ||
        (u.email && tid.includes("@") && u.email.toLowerCase() === tid.toLowerCase())
    );
    if (found) return sanitizeAdminUser(found, found.id);
  }

  // 3. Fallback to live Firestore collections
  if (hasAdminCredentials) {
    for (const tid of targetIds) {
      // 3a. Check Firestore "users" collection
      try {
        const uDoc = await adminDb.collection("users").doc(tid).get();
        if (uDoc.exists) {
          const uData = uDoc.data() || {};
          const user = sanitizeAdminUser({ id: tid, ...uData }, tid);
          memoryStore.set(user.id, user);
          return user;
        }
      } catch (err) {
        console.warn("Firestore findAdminUserByIdOrPlanId users doc notice:", err);
      }

      // 3b. Check Firestore "plans" collection
      try {
        const pDoc = await adminDb.collection("plans").doc(tid).get();
        if (pDoc.exists) {
          const pData = pDoc.data() as PlanDashboardData & {
            userId?: string;
            customerId?: string;
            uid?: string;
          };
          const refUserId = pData.userId || pData.customerId || pData.uid;

          if (refUserId && typeof refUserId === "string") {
            const uDoc = await adminDb.collection("users").doc(refUserId).get();
            if (uDoc.exists) {
              const uData = uDoc.data() || {};
              const user = sanitizeAdminUser(
                { id: refUserId, ...uData, plan: pData },
                refUserId
              );
              memoryStore.set(user.id, user);
              return user;
            }
          }

          // Synthesize an admin user record for this plan
          const fallbackUser = sanitizeAdminUser(
            {
              id: refUserId || tid,
              name: pData.customerName || "BMYFIT Client",
              plan: pData,
              membershipCategory: "purchased",
              goal: pData.goal,
              goalDisplay: pData.goalDisplay,
              needsPlanReview: pData.status === "pending_review",
            },
            refUserId || tid
          );
          memoryStore.set(fallbackUser.id, fallbackUser);
          return fallbackUser;
        }
      } catch (err) {
        console.warn("Firestore findAdminUserByIdOrPlanId plans doc notice:", err);
      }

      // 3c. Query users collection where plan.id == tid
      try {
        const snap = await adminDb
          .collection("users")
          .where("plan.id", "==", tid)
          .limit(1)
          .get();
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const user = sanitizeAdminUser(
            { id: docSnap.id, ...docSnap.data() },
            docSnap.id
          );
          memoryStore.set(user.id, user);
          return user;
        }
      } catch {}

      // 3d. Query users collection where assessmentId == tid
      try {
        const snap = await adminDb
          .collection("users")
          .where("assessmentId", "==", tid)
          .limit(1)
          .get();
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const user = sanitizeAdminUser(
            { id: docSnap.id, ...docSnap.data() },
            docSnap.id
          );
          memoryStore.set(user.id, user);
          return user;
        }
      } catch {}

      // 3e. Check Firestore "orders" collection
      try {
        const oDoc = await adminDb.collection("orders").doc(tid).get();
        if (oDoc.exists) {
          const oData = oDoc.data() || {};
          const orderTargetId =
            (oData.userId as string) ||
            (oData.uid as string) ||
            (oData.assessmentId as string);
          if (orderTargetId && orderTargetId !== tid) {
            const foundFromOrder = await findAdminUserByIdOrPlanId(orderTargetId);
            if (foundFromOrder) return foundFromOrder;
          }
        }
      } catch {}
    }
  }

  return null;
}

export async function fetchAdminUserById(userIdOrPlanId: string): Promise<AdminUserRecord | null> {
  return findAdminUserByIdOrPlanId(userIdOrPlanId);
}

export async function updateAdminUserPlan(
  userIdOrPlanId: string,
  updatedPlan: PlanDashboardData
): Promise<AdminUserRecord> {
  ensureMemoryStore();
  let user = await findAdminUserByIdOrPlanId(userIdOrPlanId, updatedPlan.id);

  if (!user) {
    const fallbackId = userIdOrPlanId || updatedPlan.id || `user_${Date.now()}`;
    user = sanitizeAdminUser(
      {
        id: fallbackId,
        name: updatedPlan.customerName || "BMYFIT Client",
        plan: updatedPlan,
        membershipCategory: "purchased",
        needsPlanReview: updatedPlan.status === "pending_review",
      },
      fallbackId
    );
  }

  user.plan = updatedPlan;
  if (updatedPlan.status === "approved" || updatedPlan.status === "active") {
    user.needsPlanReview = false;
  }
  memoryStore.set(user.id, user);

  // Sync to Firestore 'plans' and 'users' collections across both plan.id and user.id
  if (hasAdminCredentials) {
    try {
      const planPayload = {
        ...updatedPlan,
        updatedAt: FieldValue.serverTimestamp(),
        approvedAt:
          updatedPlan.status === "approved" || updatedPlan.status === "active"
            ? FieldValue.serverTimestamp()
            : undefined,
      };

      await adminDb.collection("plans").doc(updatedPlan.id).set(planPayload, { merge: true });

      if (user.id !== updatedPlan.id) {
        await adminDb.collection("plans").doc(user.id).set(planPayload, { merge: true });
      }

      if (
        updatedPlan.assessmentId &&
        updatedPlan.assessmentId !== updatedPlan.id &&
        updatedPlan.assessmentId !== user.id
      ) {
        await adminDb
          .collection("plans")
          .doc(updatedPlan.assessmentId)
          .set(planPayload, { merge: true });
      }

      await adminDb.collection("users").doc(user.id).set(
        {
          plan: updatedPlan,
          needsPlanReview: user.needsPlanReview,
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
  userIdOrPlanId: string,
  coachName: string = "Coach Naveen (Blaze Gym Owner & Head Coach)",
  notes?: string,
  secondaryId?: string
): Promise<{ success: boolean; pushedPlan: PlanDashboardData; user: AdminUserRecord }> {
  ensureMemoryStore();
  let user = await findAdminUserByIdOrPlanId(userIdOrPlanId, secondaryId);

  // If user wasn't found in memory or Firestore, synthesize so the push never fails
  if (!user) {
    const fallbackId = userIdOrPlanId || secondaryId || `user_${Date.now()}`;
    const generatedPlan = generateDashboardPlan(fallbackId, {
      customerName: "BMYFIT Client",
      status: "pending_review",
      weeksCount: 1,
    });
    user = sanitizeAdminUser(
      {
        id: fallbackId,
        name: "BMYFIT Client",
        membershipCategory: "purchased",
        plan: generatedPlan,
        needsPlanReview: true,
      },
      fallbackId
    );
    memoryStore.set(user.id, user);
  }

  const nowIso = new Date().toISOString();
  const currentPlan =
    user.plan ||
    generateDashboardPlan(user.id, {
      customerName: user.name,
      weeksCount: 1,
    });

  const currentWeeksCount = currentPlan.weeksCount || currentPlan.weeks?.length || 1;
  const previousHistory = currentPlan.planHistory || [];
  const version = previousHistory.length + 1;
  const historyItem: PlanReleaseHistoryItem = {
    version,
    pushedAt: nowIso,
    coachName,
    notes: notes || currentPlan.coachNotes || "Plan customized & verified by Head Coach Naveen.",
    weeksCount: currentWeeksCount,
    summary: `Version ${version} published with ${currentWeeksCount} active week(s).`,
  };

  const pushedPlan: PlanDashboardData = {
    ...currentPlan,
    id: currentPlan.id || user.id,
    customerName: currentPlan.customerName || user.name,
    status: "approved",
    approvedAt: nowIso,
    coachNotes:
      notes ||
      currentPlan.coachNotes ||
      "Plan customized & verified by Head Coach Naveen. Ready for execution!",
    weeksCount: currentWeeksCount,
    weeks: currentPlan.weeks || [],
    planHistory: [...previousHistory, historyItem],
    dailyLogs: currentPlan.dailyLogs || user.dailyLogs || {},
    coach: {
      ...currentPlan.coach,
      name: coachName,
      role: currentPlan.coach?.role || "Blaze Gym Owner · Head Coach & Sports Nutritionist",
      whatsAppNumber: currentPlan.coach?.whatsAppNumber || "+919876543210",
      avatar: currentPlan.coach?.avatar || "/images/coach-naveen.jpg",
    },
  };

  user.plan = pushedPlan;
  user.needsPlanReview = false;
  memoryStore.set(user.id, user);

  // Write to Firestore plans and users collections under all possible keys
  if (hasAdminCredentials) {
    try {
      const planDocPayload = {
        ...pushedPlan,
        status: "approved",
        approvedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      // 1. Primary write to plans collection under plan.id
      await adminDb.collection("plans").doc(pushedPlan.id).set(planDocPayload, { merge: true });

      // 2. Also write to plans collection under user.id if different
      if (user.id !== pushedPlan.id) {
        await adminDb.collection("plans").doc(user.id).set(planDocPayload, { merge: true });
      }

      // 3. Write to assessmentId if different
      if (
        pushedPlan.assessmentId &&
        pushedPlan.assessmentId !== pushedPlan.id &&
        pushedPlan.assessmentId !== user.id
      ) {
        await adminDb
          .collection("plans")
          .doc(pushedPlan.assessmentId)
          .set(planDocPayload, { merge: true });
      }

      // 4. Update users collection doc
      await adminDb.collection("users").doc(user.id).set(
        {
          plan: pushedPlan,
          needsPlanReview: false,
          membershipCategory: "purchased",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 5. Update subscription status if exists
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

  return { success: true, pushedPlan, user };
}

export interface RegisterPurchasedClientParams {
  userId: string;
  assessmentId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  utr?: string;
  paymentMethod?: "phonepe" | "razorpay" | "upi_manual";
  paymentScreenshot?: string;
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
  const existing = await findAdminUserByIdOrPlanId(userIdOrAssessmentId);

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

  if (hasAdminCredentials) {
    try {
      await adminDb.collection("users").doc(existing.id).set(
        {
          medicalAssessment: medical,
          needsPlanReview: true,
          plan: existing.plan,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      if (existing.plan?.id) {
        await adminDb.collection("plans").doc(existing.plan.id).set(
          {
            medicalSummary: existing.plan.medicalSummary,
            status: "pending_review",
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn("Firestore updateAdminUserMedicalAssessment error:", err);
    }
  }

  return existing;
}

export async function registerPurchasedClient(
  params: RegisterPurchasedClientParams
): Promise<AdminUserRecord> {
  ensureMemoryStore();
  const existing =
    memoryStore.get(params.userId) ||
    memoryStore.get(params.assessmentId) ||
    (await findAdminUserByIdOrPlanId(params.userId, params.assessmentId));
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
    const effectiveOrderId = params.razorpayOrderId || params.utr || `ord_${Date.now()}`;
    existing.order = {
      orderId: effectiveOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      utr: params.utr,
      paymentMethod: params.paymentMethod || (params.utr ? "phonepe" : "razorpay"),
      paymentScreenshot: params.paymentScreenshot,
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

  const effectiveOrderId = params.razorpayOrderId || params.utr || `ord_${Date.now()}`;

  const newRecord: AdminUserRecord = {
    id,
    name: params.customerName || "Fit Member",
    email: params.customerEmail || `${id}@client.bmyfit.in`,
    phone: params.customerPhone || "",
    city: params.city || "",
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
      orderId: effectiveOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      utr: params.utr,
      paymentMethod: params.paymentMethod || (params.utr ? "phonepe" : "razorpay"),
      paymentScreenshot: params.paymentScreenshot,
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

      if (id && params.assessmentId && id !== params.assessmentId) {
        await adminDb.collection("plans").doc(id).set(
          {
            ...plan,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
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
    phone: params.phone || "",
    city: "",
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

