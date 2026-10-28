export type Gender = "male" | "female";
export type Sex = Gender;

export type FitnessGoal = "fat-loss" | "weight-loss" | "muscle-gain" | "weight-gain";

export type ActivityLevel =
  | "sedentary"
  | "lightly-active"
  | "moderately-active"
  | "very-active";

export type DietPreference = "vegetarian" | "eggetarian" | "non-vegetarian";

export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

export type BodyFatCategory =
  | "essential"
  | "athletes"
  | "fitness"
  | "average"
  | "obese";

export interface DetailsInput {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  waistIn: number;
  neckIn: number;
  hipIn?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}

export type DetailsDraft = Partial<DetailsInput>;

export interface AssessmentInput extends DetailsInput {
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietPreference: DietPreference;
}

export interface Assessment extends AssessmentInput {
  id: string;
  uid: string;
  bmi: number;
  bmiCategory: BmiCategory;
  bodyFatPercent: number | null;
  bodyFatCategory: BodyFatCategory | null;
  bodyFatWarning?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MacroTargets {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface CaloriePlan {
  bmr: number;
  tdee: number;
  calories: number;
  macros: MacroTargets;
  waterLitres: number;
  safetyWarning?: string;
}

export interface Meal {
  slot: string; // e.g. "Breakfast", "Mid-Morning", "Lunch", "Evening Snack", "Dinner"
  name: string;
  portion: string;
  calories: number;
  proteinGrams: number;
}

export interface Workout {
  day: string; // e.g. "Monday", "Day 1"
  title: string;
  exercises: string[];
  durationMinutes: number;
  homeAlternative?: string;
}

export interface DetailedPlan {
  assessmentId: string;
  planVersion: "rules-v1";
  snapshot: {
    bmi: number;
    bmiCategory: BmiCategory;
    bodyFatPercent: number | null;
    goal: FitnessGoal;
    calories: number;
    macros: MacroTargets;
    waterLitres: number;
    timeline: string;
  };
  nutrition: {
    days: Array<{
      day: string;
      meals: Meal[];
    }>;
    groceryList: string[];
  };
  workouts: Workout[];
  habits: string[];
  tracking: string[];
  dos: string[];
  donts: string[];
  safetyNote: string;
  createdAt: string;
}
