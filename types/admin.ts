import type {
  Gender,
  ActivityLevel,
  DietPreference,
  BmiCategory,
  BodyFatCategory,
  FitnessGoal,
} from "./fitness";
import type { PlanDashboardData, PlanStatus } from "./plan-dashboard";

export type MembershipCategory = "free" | "membership" | "purchased";

export interface UserBiometrics {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  waistIn: number;
  neckIn: number;
  hipIn?: number;
  bmi: number;
  bmiCategory: BmiCategory;
  bodyFatPercent: number;
  bodyFatCategory: BodyFatCategory;
  bmr: number;
  tdee: number;
  caloricTarget: number;
  proteinTargetGrams: number;
  activityLevel: ActivityLevel;
  dietPreference: DietPreference;
  allergies?: string;
  medicalConditions?: string;
  waterLitres: number;
  dailyStepGoal: number;
  whr?: number; // Waist to hip ratio
}

export interface UserPurchaseOrder {
  orderId: string;
  razorpayPaymentId?: string;
  amountPaise: number;
  amountFormatted: string;
  currency: "INR";
  status: "paid" | "created" | "refunded";
  packageTitle: string;
  durationWeeks: number;
  purchasedAt: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
  joinedAt: string;
  lastActive: string;
  membershipCategory: MembershipCategory;
  membershipTitle: string; // e.g. "Free Assessment Lead", "Pro VIP Annual", "8-Week Custom Transformation"
  goal: FitnessGoal;
  goalDisplay: string;
  biometrics: UserBiometrics;
  order?: UserPurchaseOrder;
  plan: PlanDashboardData;
}

export interface AdminStats {
  totalUsers: number;
  freeMembersCount: number;
  activeMembershipsCount: number;
  purchasedPlansCount: number;
  pendingReviewCount: number;
  approvedCount: number;
  totalRevenueINR: number;
}
