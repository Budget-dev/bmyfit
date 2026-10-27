import type {
  Gender,
  ActivityLevel,
  DietPreference,
  BmiCategory,
  BodyFatCategory,
  FitnessGoal,
} from "./fitness";
import type { PlanDashboardData, PlanStatus, TaskLogState } from "./plan-dashboard";

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

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  packageTitle: string;
  durationWeeks: number;
  durationMonths: number;
  status: "active" | "pending_review" | "expired" | "cancelled";
  amountPaise: number;
  amountFormatted: string;
  currency: "INR";
  orderId?: string;
  paymentId?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalDocument {
  id: string;
  name: string;
  type: string; // "pdf" | "image" | "doc"
  sizeFormatted: string;
  dataUrl?: string; // base64 representation or URL
  fileUrl?: string; // interchangeable alias for document URL
  uploadedAt: string;
  category?: "blood_test" | "prescription" | "scans" | "other";
}

export interface MedicalAssessment {
  hasDisease: boolean;
  diseases: string[];
  customDiseaseDescription?: string;
  medications?: string;
  documents: MedicalDocument[];
  submittedAt: string;
}

export interface AdminUserRecord {
  id: string;
  assessmentId?: string;
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
  subscription?: UserSubscription;
  plan: PlanDashboardData;
  medicalAssessment?: MedicalAssessment;
  needsPlanReview?: boolean;
  taskLogs?: TaskLogState;
}

export interface AdminStats {
  totalUsers: number;
  freeMembersCount: number;
  activeMembershipsCount: number;
  purchasedPlansCount: number;
  pendingReviewCount: number;
  approvedCount: number;
  liveApprovedCount?: number;
  totalRevenueINR: number;
}
