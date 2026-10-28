import type { FitnessGoal } from "./fitness";

export type PlanStatus = "pending_review" | "approved" | "active";

export interface MealSlotItem {
  id: string;
  slot: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  name: string;
  itemsDescription: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  image: string;
  recipeNotes?: string[];
}

export interface WorkoutDayItem {
  id: string;
  day: string; // e.g. "Day 1", "Day 2"
  title: string; // e.g. "Day 1 - Upper Body"
  focus: string; // e.g. "Chest, Shoulders, Triceps"
  image: string;
  durationMinutes: number;
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    rest: string;
    tips?: string;
  }>;
}

export interface WeekPlanData {
  weekNumber: number;
  phaseTitle: string; // e.g. "Build your foundation"
  phaseSubtitle: string;
  nutrition: {
    calories: number;
    proteinGrams: number;
    description: string;
    meals: MealSlotItem[];
  };
  workouts: {
    daysPerWeek: number;
    description: string;
    days: WorkoutDayItem[];
  };
}

export interface PlanVideo {
  url: string;
  title?: string;
  aspectRatio: "16:9" | "9:16";
  notes?: string;
}

export interface PlanSupplementRecommendation {
  productId: string;
  name: string;
  subtitle?: string;
  affiliateUrl: string;
  price: number;
  originalPrice?: number;
  image: string;
  customCoachNote?: string;
}

export interface PlanDashboardData {
  id: string;
  assessmentId: string;
  customerName: string;
  weeksCount: number; // e.g. 8 (dynamic: can be 4, 8, 12, 16 etc.)
  monthsCount?: number; // e.g. 1, 2, 3, 6, 12 months
  status: PlanStatus;
  goal: FitnessGoal;
  goalDisplay: string; // e.g. "Fat Loss"
  bmi: number;
  bodyFatPercent: number;
  calorieTarget: number;
  proteinTargetGrams: number;
  workoutDaysPerWeek: number;
  progressTrackingFrequency: string; // e.g. "Weekly"
  coach: {
    name: string;
    role: string;
    whatsAppNumber: string;
    avatar: string;
  };
  weeks: WeekPlanData[];
  createdAt: string;
  approvedAt?: string;
  coachNotes?: string;
  waterLitres?: number;
  dailyStepGoal?: number;
  video?: PlanVideo;
  suggestedSupplements?: PlanSupplementRecommendation[];
  medicalSummary?: {
    hasDisease: boolean;
    diseases: string[];
    customDiseaseDescription?: string;
    medications?: string;
    documentsCount?: number;
  };
}

export interface TaskLogState {
  [taskKey: string]: boolean; // key format: `w${weekNumber}_${type}_${id}` -> true/false
}
