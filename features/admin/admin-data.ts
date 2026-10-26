import type { AdminUserRecord, AdminStats, UserBiometrics, UserPurchaseOrder } from "@/types/admin";
import type { PlanDashboardData, PlanStatus, WeekPlanData } from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// In-memory cache for fast desktop administration & fallback when Firestore is offline/local
declare global {
  // eslint-disable-next-line no-var
  var __bmyfit_admin_store__: Map<string, AdminUserRecord> | undefined;
}

const memoryStore: Map<string, AdminUserRecord> =
  globalThis.__bmyfit_admin_store__ || new Map<string, AdminUserRecord>();
globalThis.__bmyfit_admin_store__ = memoryStore;

export const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: "user_purchased_01",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98201 44821",
    city: "Mumbai, MH",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-24T10:15:00Z",
    lastActive: "12 minutes ago",
    membershipCategory: "purchased",
    membershipTitle: "8-Week Custom Fat Loss Transformation",
    goal: "fat-loss",
    goalDisplay: "Fat Loss & Metabolic Reset",
    biometrics: {
      gender: "male",
      age: 32,
      heightCm: 178,
      weightKg: 86.5,
      targetWeightKg: 76.0,
      waistIn: 36.5,
      neckIn: 16.0,
      hipIn: 39.0,
      bmi: 27.3,
      bmiCategory: "overweight",
      bodyFatPercent: 24.2,
      bodyFatCategory: "average",
      bmr: 1785,
      tdee: 2450,
      caloricTarget: 1850,
      proteinTargetGrams: 135,
      activityLevel: "sedentary",
      dietPreference: "non-vegetarian",
      allergies: "None reported",
      medicalConditions: "Mild lower back stiffness from desk work; avoid heavy spinal axial loading",
      waterLitres: 3.5,
      dailyStepGoal: 9000,
      whr: 0.93,
    },
    order: {
      orderId: "ord_bmyfit_88291",
      razorpayPaymentId: "pay_Qe9102Klm12",
      amountPaise: 99900,
      amountFormatted: "₹999",
      currency: "INR",
      status: "paid",
      packageTitle: "8-Week Personalized Nutrition & Workout Plan",
      durationWeeks: 8,
      purchasedAt: "2026-10-24T10:20:00Z",
    },
    plan: generateDashboardPlan("user_purchased_01", {
      customerName: "Rahul Sharma",
      goal: "fat-loss",
      weeksCount: 8,
      status: "pending_review",
      bmi: 27.3,
      bodyFatPercent: 24.2,
      calorieTarget: 1850,
      proteinTargetGrams: 135,
      workoutDaysPerWeek: 4,
      coachNotes: "Awaiting Coach Customization: Emphasize 135g protein target and replace high-GI snacks with roasted chana and boiled eggs. Back-safe exercise split selected.",
    }),
  },
  {
    id: "user_purchased_02",
    name: "Ananya Roy",
    email: "ananya.roy@yahoo.co.in",
    phone: "+91 97412 88390",
    city: "Bengaluru, KA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-25T08:30:00Z",
    lastActive: "1 hour ago",
    membershipCategory: "purchased",
    membershipTitle: "12-Week Lean Hypertrophy & Toning",
    goal: "muscle-gain",
    goalDisplay: "Muscle Gain & Posture",
    biometrics: {
      gender: "female",
      age: 28,
      heightCm: 164,
      weightKg: 68.0,
      targetWeightKg: 59.0,
      waistIn: 30.0,
      neckIn: 13.5,
      hipIn: 39.5,
      bmi: 25.3,
      bmiCategory: "overweight",
      bodyFatPercent: 28.5,
      bodyFatCategory: "average",
      bmr: 1420,
      tdee: 2050,
      caloricTarget: 1650,
      proteinTargetGrams: 110,
      activityLevel: "moderately-active",
      dietPreference: "vegetarian",
      allergies: "Lactose sensitive (prefers almond milk & plant protein)",
      medicalConditions: "None",
      waterLitres: 3.0,
      dailyStepGoal: 10000,
      whr: 0.76,
    },
    order: {
      orderId: "ord_bmyfit_88304",
      razorpayPaymentId: "pay_Rf3882Jda99",
      amountPaise: 149900,
      amountFormatted: "₹1,499",
      currency: "INR",
      status: "paid",
      packageTitle: "12-Week Transformation Bundle with Weekly Adjustments",
      durationWeeks: 12,
      purchasedAt: "2026-10-25T08:35:00Z",
    },
    plan: generateDashboardPlan("user_purchased_02", {
      customerName: "Ananya Roy",
      goal: "muscle-gain",
      weeksCount: 12,
      status: "pending_review",
      bmi: 25.3,
      bodyFatPercent: 28.5,
      calorieTarget: 1650,
      proteinTargetGrams: 110,
      workoutDaysPerWeek: 4,
      coachNotes: "Pending Push: Pure vegetarian plan with paneer, tofu, and pea protein isolate. 12-week hypertrophy curve focusing on glute and shoulder symmetry.",
    }),
  },
  {
    id: "user_purchased_03",
    name: "Vikram Malhotra",
    email: "vikram.m@outlook.com",
    phone: "+91 98110 55432",
    city: "New Delhi, DL",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-20T14:00:00Z",
    lastActive: "Active Now",
    membershipCategory: "purchased",
    membershipTitle: "16-Week Elite Athlete Strength Pack",
    goal: "weight-gain",
    goalDisplay: "Strength & Bulking",
    biometrics: {
      gender: "male",
      age: 35,
      heightCm: 182,
      weightKg: 89.0,
      targetWeightKg: 82.0,
      waistIn: 35.0,
      neckIn: 16.5,
      hipIn: 40.0,
      bmi: 26.9,
      bmiCategory: "overweight",
      bodyFatPercent: 21.0,
      bodyFatCategory: "fitness",
      bmr: 1890,
      tdee: 2650,
      caloricTarget: 2200,
      proteinTargetGrams: 155,
      activityLevel: "very-active",
      dietPreference: "non-vegetarian",
      allergies: "None",
      medicalConditions: "Past rotator cuff strain (cleared for overhead pressing with warm-up)",
      waterLitres: 4.0,
      dailyStepGoal: 11000,
      whr: 0.87,
    },
    order: {
      orderId: "ord_bmyfit_87901",
      razorpayPaymentId: "pay_Kk10398Xls3",
      amountPaise: 249900,
      amountFormatted: "₹2,499",
      currency: "INR",
      status: "paid",
      packageTitle: "16-Week Advanced Hypertrophy & Periodization",
      durationWeeks: 16,
      purchasedAt: "2026-10-20T14:10:00Z",
    },
    plan: (() => {
      const p = generateDashboardPlan("user_purchased_03", {
        customerName: "Vikram Malhotra",
        goal: "weight-gain",
        weeksCount: 16,
        status: "approved",
        bmi: 26.9,
        bodyFatPercent: 21.0,
        calorieTarget: 2200,
        proteinTargetGrams: 155,
        workoutDaysPerWeek: 5,
        coachNotes: "APPROVED & PUSHED: 16-Week powerbuilding routine. Client is in Week 1 with 100% meal compliance.",
      });
      p.approvedAt = "2026-10-21T09:00:00Z";
      return p;
    })(),
  },
  {
    id: "user_purchased_04",
    name: "Pooja Mehta",
    email: "pooja.mehta@gmail.com",
    phone: "+91 99304 22910",
    city: "Ahmedabad, GJ",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-22T11:45:00Z",
    lastActive: "3 hours ago",
    membershipCategory: "purchased",
    membershipTitle: "8-Week Post-Festive Detox & Toning",
    goal: "weight-loss",
    goalDisplay: "Weight Loss & Satiety",
    biometrics: {
      gender: "female",
      age: 31,
      heightCm: 160,
      weightKg: 65.5,
      targetWeightKg: 56.0,
      waistIn: 32.0,
      neckIn: 13.0,
      hipIn: 38.0,
      bmi: 25.6,
      bmiCategory: "overweight",
      bodyFatPercent: 29.8,
      bodyFatCategory: "average",
      bmr: 1380,
      tdee: 1950,
      caloricTarget: 1500,
      proteinTargetGrams: 105,
      activityLevel: "lightly-active",
      dietPreference: "vegetarian",
      allergies: "None",
      medicalConditions: "PCOS symptoms; low GI complex carbohydrates prioritized",
      waterLitres: 3.2,
      dailyStepGoal: 8500,
      whr: 0.84,
    },
    order: {
      orderId: "ord_bmyfit_88120",
      razorpayPaymentId: "pay_Pp882190Aas",
      amountPaise: 99900,
      amountFormatted: "₹999",
      currency: "INR",
      status: "paid",
      packageTitle: "8-Week Custom PCOS-Friendly Nutrition & Toning",
      durationWeeks: 8,
      purchasedAt: "2026-10-22T11:50:00Z",
    },
    plan: (() => {
      const p = generateDashboardPlan("user_purchased_04", {
        customerName: "Pooja Mehta",
        goal: "weight-loss",
        weeksCount: 8,
        status: "approved",
        bmi: 25.6,
        bodyFatPercent: 29.8,
        calorieTarget: 1500,
        proteinTargetGrams: 105,
        workoutDaysPerWeek: 4,
        coachNotes: "APPROVED & PUSHED: High-fiber, anti-inflammatory vegetarian meal plan with spearmint tea and seed cycling guidance.",
      });
      p.approvedAt = "2026-10-22T16:00:00Z";
      return p;
    })(),
  },
  {
    id: "user_membership_01",
    name: "Devendra Kulkarni",
    email: "dev.kulkarni@tcs.com",
    phone: "+91 98220 90123",
    city: "Pune, MH",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-09-15T09:00:00Z",
    lastActive: "Active 45m ago",
    membershipCategory: "membership",
    membershipTitle: "BMYFIT PRO VIP Club (Annual Member)",
    goal: "fat-loss",
    goalDisplay: "Fat Loss & Endurance",
    biometrics: {
      gender: "male",
      age: 42,
      heightCm: 175,
      weightKg: 81.0,
      targetWeightKg: 73.0,
      waistIn: 35.0,
      neckIn: 15.5,
      hipIn: 39.0,
      bmi: 26.4,
      bmiCategory: "overweight",
      bodyFatPercent: 23.5,
      bodyFatCategory: "average",
      bmr: 1690,
      tdee: 2350,
      caloricTarget: 1800,
      proteinTargetGrams: 130,
      activityLevel: "moderately-active",
      dietPreference: "eggetarian",
      allergies: "None",
      medicalConditions: "Mild hypertension (stage 1); sodium kept below 2,000mg/day",
      waterLitres: 3.5,
      dailyStepGoal: 10000,
      whr: 0.89,
    },
    order: {
      orderId: "ord_sub_vip_001",
      amountPaise: 499900,
      amountFormatted: "₹4,999/yr",
      currency: "INR",
      status: "paid",
      packageTitle: "Annual Pro VIP Tier with Unlimited Plan Regenerations",
      durationWeeks: 12,
      purchasedAt: "2026-09-15T09:05:00Z",
    },
    plan: (() => {
      const p = generateDashboardPlan("user_membership_01", {
        customerName: "Devendra Kulkarni",
        goal: "fat-loss",
        weeksCount: 12,
        status: "approved",
        bmi: 26.4,
        bodyFatPercent: 23.5,
        calorieTarget: 1800,
        proteinTargetGrams: 130,
        workoutDaysPerWeek: 4,
        coachNotes: "Active Pro Member. Month 2 progression. Heart health cardiovascular focus with egg white scrambles & low GI grains.",
      });
      p.approvedAt = "2026-09-16T10:00:00Z";
      return p;
    })(),
  },
  {
    id: "user_membership_02",
    name: "Simran Kaur",
    email: "simran.fitness@gmail.com",
    phone: "+91 98881 23456",
    city: "Chandigarh, PB",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-08-10T12:00:00Z",
    lastActive: "Yesterday",
    membershipCategory: "membership",
    membershipTitle: "BMYFIT PRO (Quarterly Member)",
    goal: "muscle-gain",
    goalDisplay: "Athletic Conditioning",
    biometrics: {
      gender: "female",
      age: 26,
      heightCm: 169,
      weightKg: 62.0,
      targetWeightKg: 64.0,
      waistIn: 27.5,
      neckIn: 12.8,
      hipIn: 37.0,
      bmi: 21.7,
      bmiCategory: "normal",
      bodyFatPercent: 21.4,
      bodyFatCategory: "fitness",
      bmr: 1410,
      tdee: 2200,
      caloricTarget: 2100,
      proteinTargetGrams: 125,
      activityLevel: "very-active",
      dietPreference: "non-vegetarian",
      allergies: "None",
      medicalConditions: "None",
      waterLitres: 3.5,
      dailyStepGoal: 12000,
      whr: 0.74,
    },
    order: {
      orderId: "ord_sub_q_049",
      amountPaise: 199900,
      amountFormatted: "₹1,999/qtr",
      currency: "INR",
      status: "paid",
      packageTitle: "Quarterly Pro Subscription",
      durationWeeks: 8,
      purchasedAt: "2026-08-10T12:05:00Z",
    },
    plan: (() => {
      const p = generateDashboardPlan("user_membership_02", {
        customerName: "Simran Kaur",
        goal: "muscle-gain",
        weeksCount: 8,
        status: "approved",
        bmi: 21.7,
        bodyFatPercent: 21.4,
        calorieTarget: 2100,
        proteinTargetGrams: 125,
        workoutDaysPerWeek: 5,
        coachNotes: "Active Pro Athlete. Clean lean bulk with progressive dumbbell bench and deadlifts.",
      });
      p.approvedAt = "2026-08-11T09:00:00Z";
      return p;
    })(),
  },
  {
    id: "user_membership_03",
    name: "Arjun Reddy",
    email: "arjun.reddy@hyderabad.tech",
    phone: "+91 99490 11223",
    city: "Hyderabad, TS",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-01T15:30:00Z",
    lastActive: "Active 2h ago",
    membershipCategory: "membership",
    membershipTitle: "BMYFIT PRO (Monthly Active)",
    goal: "fat-loss",
    goalDisplay: "Fat Loss & Core",
    biometrics: {
      gender: "male",
      age: 29,
      heightCm: 180,
      weightKg: 84.5,
      targetWeightKg: 77.0,
      waistIn: 34.5,
      neckIn: 15.8,
      hipIn: 39.5,
      bmi: 26.1,
      bmiCategory: "overweight",
      bodyFatPercent: 22.8,
      bodyFatCategory: "average",
      bmr: 1810,
      tdee: 2500,
      caloricTarget: 1900,
      proteinTargetGrams: 140,
      activityLevel: "moderately-active",
      dietPreference: "non-vegetarian",
      allergies: "Shellfish allergy",
      medicalConditions: "None",
      waterLitres: 4.0,
      dailyStepGoal: 10000,
      whr: 0.87,
    },
    order: {
      orderId: "ord_sub_m_112",
      amountPaise: 79900,
      amountFormatted: "₹799/mo",
      currency: "INR",
      status: "paid",
      packageTitle: "Monthly Pro Membership",
      durationWeeks: 4,
      purchasedAt: "2026-10-01T15:35:00Z",
    },
    plan: (() => {
      const p = generateDashboardPlan("user_membership_03", {
        customerName: "Arjun Reddy",
        goal: "fat-loss",
        weeksCount: 4,
        status: "approved",
        bmi: 26.1,
        bodyFatPercent: 22.8,
        calorieTarget: 1900,
        proteinTargetGrams: 140,
        workoutDaysPerWeek: 4,
        coachNotes: "Pro monthly client. Week 4 deload and metabolic ramp-up.",
      });
      p.approvedAt = "2026-10-02T10:00:00Z";
      return p;
    })(),
  },
  {
    id: "user_free_01",
    name: "Neha Gupta",
    email: "neha.gupta99@gmail.com",
    phone: "+91 98199 77123",
    city: "Jaipur, RJ",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-25T17:20:00Z",
    lastActive: "Today 7:15 AM",
    membershipCategory: "free",
    membershipTitle: "Free Assessment Complete (Lead)",
    goal: "fat-loss",
    goalDisplay: "Fat Loss (Free Tier)",
    biometrics: {
      gender: "female",
      age: 24,
      heightCm: 162,
      weightKg: 64.0,
      targetWeightKg: 55.0,
      waistIn: 31.0,
      neckIn: 13.0,
      hipIn: 38.0,
      bmi: 24.4,
      bmiCategory: "normal",
      bodyFatPercent: 27.2,
      bodyFatCategory: "average",
      bmr: 1390,
      tdee: 1890,
      caloricTarget: 1450,
      proteinTargetGrams: 95,
      activityLevel: "sedentary",
      dietPreference: "vegetarian",
      allergies: "None",
      medicalConditions: "None",
      waterLitres: 2.8,
      dailyStepGoal: 8000,
      whr: 0.81,
    },
    plan: generateDashboardPlan("user_free_01", {
      customerName: "Neha Gupta",
      goal: "fat-loss",
      weeksCount: 4,
      status: "pending_review",
      bmi: 24.4,
      bodyFatPercent: 27.2,
      calorieTarget: 1450,
      proteinTargetGrams: 95,
      workoutDaysPerWeek: 3,
      coachNotes: "Free Assessment Completed. Client calculated 24.4 BMI and requested consultation for home dumbbell workouts.",
    }),
  },
  {
    id: "user_free_02",
    name: "Siddharth Varma",
    email: "sid.varma@gmail.com",
    phone: "+91 97118 66290",
    city: "Noida, UP",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-25T14:10:00Z",
    lastActive: "5 hours ago",
    membershipCategory: "free",
    membershipTitle: "Free Assessment Complete (Lead)",
    goal: "muscle-gain",
    goalDisplay: "Muscle Gain (Free Tier)",
    biometrics: {
      gender: "male",
      age: 26,
      heightCm: 172,
      weightKg: 73.0,
      targetWeightKg: 70.0,
      waistIn: 33.0,
      neckIn: 15.0,
      hipIn: 37.5,
      bmi: 24.7,
      bmiCategory: "normal",
      bodyFatPercent: 19.8,
      bodyFatCategory: "fitness",
      bmr: 1650,
      tdee: 2280,
      caloricTarget: 2100,
      proteinTargetGrams: 130,
      activityLevel: "lightly-active",
      dietPreference: "eggetarian",
      allergies: "None",
      medicalConditions: "None",
      waterLitres: 3.5,
      dailyStepGoal: 9000,
      whr: 0.88,
    },
    plan: generateDashboardPlan("user_free_02", {
      customerName: "Siddharth Varma",
      goal: "muscle-gain",
      weeksCount: 4,
      status: "pending_review",
      bmi: 24.7,
      bodyFatPercent: 19.8,
      calorieTarget: 2100,
      proteinTargetGrams: 130,
      workoutDaysPerWeek: 4,
      coachNotes: "Free Member exploring hypertrophy splits. Recommended upgrade to 8-Week Custom Plan.",
    }),
  },
  {
    id: "user_free_03",
    name: "Ritu Singhania",
    email: "ritu.s@rediffmail.com",
    phone: "+91 98300 44551",
    city: "Kolkata, WB",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    joinedAt: "2026-10-24T20:15:00Z",
    lastActive: "Yesterday",
    membershipCategory: "free",
    membershipTitle: "Free Account Explorer",
    goal: "weight-loss",
    goalDisplay: "Weight Loss (Free Tier)",
    biometrics: {
      gender: "female",
      age: 38,
      heightCm: 166,
      weightKg: 73.5,
      targetWeightKg: 64.0,
      waistIn: 34.0,
      neckIn: 13.5,
      hipIn: 41.0,
      bmi: 26.7,
      bmiCategory: "overweight",
      bodyFatPercent: 31.5,
      bodyFatCategory: "average",
      bmr: 1450,
      tdee: 1980,
      caloricTarget: 1550,
      proteinTargetGrams: 100,
      activityLevel: "sedentary",
      dietPreference: "vegetarian",
      allergies: "Soy allergy",
      medicalConditions: "Thyroid (hypothyroidism); sluggish metabolism; low sodium & high iodine balanced diet",
      waterLitres: 3.0,
      dailyStepGoal: 7500,
      whr: 0.83,
    },
    plan: generateDashboardPlan("user_free_03", {
      customerName: "Ritu Singhania",
      goal: "weight-loss",
      weeksCount: 4,
      status: "pending_review",
      bmi: 26.7,
      bodyFatPercent: 31.5,
      calorieTarget: 1550,
      proteinTargetGrams: 100,
      workoutDaysPerWeek: 3,
      coachNotes: "Free assessment completed. Thyroid-aware meal suggestions needed.",
    }),
  },
];

// Seed initial memory store
function ensureMemoryStore() {
  if (memoryStore.size === 0) {
    for (const u of INITIAL_ADMIN_USERS) {
      memoryStore.set(u.id, JSON.parse(JSON.stringify(u)));
    }
  }
}

export async function fetchAllAdminUsers(): Promise<{ users: AdminUserRecord[]; stats: AdminStats }> {
  ensureMemoryStore();

  // Try fetching live plans from Firestore
  try {
    const plansSnap = await adminDb.collection("plans").get();
    if (!plansSnap.empty) {
      for (const doc of plansSnap.docs) {
        const planData = doc.data() as PlanDashboardData;
        const existing = memoryStore.get(doc.id);
        if (existing) {
          existing.plan = { ...existing.plan, ...planData };
        } else if (planData.customerName) {
          // Add dynamically created assessment plan
          memoryStore.set(doc.id, {
            id: doc.id,
            name: planData.customerName,
            email: `${planData.customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            phone: "+91 98000 00000",
            city: "Online Funnel",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
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
    // Firestore might be unconfigured in dev/demo mode; gracefully proceed with memoryStore
    console.warn("Firestore fetchAllAdminUsers fallback to local store:", err);
  }

  const users = Array.from(memoryStore.values());

  const stats: AdminStats = {
    totalUsers: users.length,
    freeMembersCount: users.filter((u) => u.membershipCategory === "free").length,
    activeMembershipsCount: users.filter((u) => u.membershipCategory === "membership").length,
    purchasedPlansCount: users.filter((u) => u.membershipCategory === "purchased").length,
    pendingReviewCount: users.filter((u) => u.plan.status === "pending_review").length,
    approvedCount: users.filter((u) => u.plan.status === "approved" || u.plan.status === "active").length,
    totalRevenueINR: users.reduce((acc, u) => acc + (u.order ? Math.round(u.order.amountPaise / 100) : 0), 0),
  };

  return { users, stats };
}

export async function fetchAdminUserById(userId: string): Promise<AdminUserRecord | null> {
  ensureMemoryStore();
  const user = memoryStore.get(userId);
  if (!user) return null;

  // Check if live plan exists in Firestore
  try {
    const doc = await adminDb.collection("plans").doc(userId).get();
    if (doc.exists) {
      user.plan = { ...user.plan, ...(doc.data() as PlanDashboardData) };
    }
  } catch (err) {
    console.warn("Firestore fetchAdminUserById error:", err);
  }

  return user;
}

export async function updateAdminUserPlan(
  userId: string,
  updatedPlan: PlanDashboardData
): Promise<AdminUserRecord> {
  ensureMemoryStore();
  let user = memoryStore.get(userId);
  if (!user) {
    user = INITIAL_ADMIN_USERS[0];
  }

  user.plan = updatedPlan;
  memoryStore.set(userId, user);

  // Sync to Firestore
  try {
    await adminDb.collection("plans").doc(userId).set(
      {
        ...updatedPlan,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore sync updateAdminUserPlan error:", err);
  }

  return user;
}

export async function pushPlanToUserDashboard(
  userId: string,
  coachName: string = "Aryan Sharma (Head Coach)",
  notes?: string
): Promise<{ success: boolean; pushedPlan: PlanDashboardData; user: AdminUserRecord }> {
  ensureMemoryStore();
  const user = memoryStore.get(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

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
  memoryStore.set(userId, user);

  // Write to Firestore plans collection so user dashboard immediately receives it
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
  } catch (err) {
    console.warn("Firestore pushPlanToUserDashboard error:", err);
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
}

export async function registerPurchasedClient(
  params: RegisterPurchasedClientParams
): Promise<AdminUserRecord> {
  ensureMemoryStore();
  const existing = memoryStore.get(params.userId) || memoryStore.get(params.assessmentId);
  const now = new Date().toISOString();

  if (existing) {
    existing.membershipCategory = "purchased";
    existing.order = {
      orderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      amountPaise: params.amountPaise,
      amountFormatted: `₹${Math.round(params.amountPaise / 100)}`,
      currency: "INR",
      status: "paid",
      packageTitle: "8-Week Personalized Nutrition & Workout Plan",
      durationWeeks: 8,
      purchasedAt: now,
    };
    existing.plan.status = "pending_review";
    if (params.customerName) existing.name = params.customerName;
    if (params.customerEmail) existing.email = params.customerEmail;
    if (params.customerPhone) existing.phone = params.customerPhone;
    memoryStore.set(existing.id, existing);
    return existing;
  }

  const id = params.userId || params.assessmentId || `user_${Date.now()}`;
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
    membershipTitle: "8-Week Personalized Nutrition & Workout Plan",
    goal: params.goal || "fat-loss",
    goalDisplay: params.goalDisplay || "8-Week Custom Plan",
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
      packageTitle: "8-Week Personalized Nutrition & Workout Plan",
      durationWeeks: 8,
      purchasedAt: now,
    },
    plan: generateDashboardPlan(params.assessmentId || id, {
      customerName: params.customerName || "Fit Member",
      goal: params.goal || "fat-loss",
      weeksCount: 8,
      status: "pending_review",
      bmi: params.biometrics?.bmi || 25.5,
      bodyFatPercent: params.biometrics?.bodyFatPercent || 22.0,
      calorieTarget: params.biometrics?.caloricTarget || 1850,
      proteinTargetGrams: params.biometrics?.proteinTargetGrams || 130,
      workoutDaysPerWeek: 4,
      coachNotes: "NEW PURCHASE (Verified via Razorpay): 8-Week plan generated in pending review status. Customize meal and workout split before pushing to client dashboard.",
    }),
  };

  memoryStore.set(id, newRecord);

  // Sync to Firestore if available
  try {
    await adminDb.collection("plans").doc(params.assessmentId || id).set(
      {
        ...newRecord.plan,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore sync registerPurchasedClient error:", err);
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

  return newRecord;
}


