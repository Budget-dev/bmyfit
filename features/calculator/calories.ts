import type { ActivityLevel, CaloriePlan, FitnessGoal, Gender } from "@/types/fitness";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
};

export interface CaloriePlanInput {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  bmi?: number;
}

export function calculateCaloriePlan(input: {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  bmi?: number;
}): CaloriePlan & { safetyWarning?: string } {
  if (!Number.isFinite(input.age) || input.age <= 0) {
    throw new RangeError("age must be a positive number");
  }
  if (!Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    throw new RangeError("heightCm must be a positive number");
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
    throw new RangeError("weightKg must be a positive number");
  }

  // Mifflin-St Jeor Equation
  const bmr =
    10 * input.weightKg +
    6.25 * input.heightCm -
    5 * input.age +
    (input.gender === "male" ? 5 : -161);

  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel] ?? 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Safety floor check: 1500 kcal for male, 1200 kcal for female
  const floor = input.gender === "male" ? 1500 : 1200;

  // Calculate current BMI if not passed
  const currentBmi = input.bmi ?? Number((input.weightKg / ((input.heightCm / 100) ** 2)).toFixed(1));
  let safetyWarning: string | undefined;

  let targetCalories: number;
  let proteinRate: number; // grams per kg

  if (currentBmi < 18.5 && (input.goal === "fat-loss" || input.goal === "weight-loss")) {
    // Safety check: Underweight users should not be on a caloric deficit!
    safetyWarning =
      "Your BMI indicates you are underweight. We do not recommend a caloric deficit. A weight maintenance or gentle surplus plan with medical guidance is advised.";
    // Set to maintenance or slight surplus rather than deficit
    targetCalories = Math.max(floor, tdee);
    proteinRate = 1.8;
  } else {
    switch (input.goal) {
      case "fat-loss":
        // TDEE - 20%
        targetCalories = Math.max(floor, Math.round(tdee * 0.8));
        proteinRate = 2.0;
        break;
      case "weight-loss":
        // TDEE - 18% (between 15-20%)
        targetCalories = Math.max(floor, Math.round(tdee * 0.82));
        proteinRate = 1.8;
        break;
      case "muscle-gain":
        // TDEE + 10%
        targetCalories = Math.round(tdee * 1.1);
        proteinRate = 2.0; // 1.8-2.2 g/kg range
        break;
      case "weight-gain":
        // TDEE + 15%
        targetCalories = Math.round(tdee * 1.15);
        proteinRate = 1.8; // 1.6-2.0 g/kg range
        break;
    }
  }

  // Macros:
  // Protein: weightKg * proteinRate
  // Fat: ~25% of total calories (9 kcal/g)
  // Carbs: remaining calories (4 kcal/g)
  const proteinGrams = Math.round(input.weightKg * proteinRate);
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - proteinGrams * 4 - fatGrams * 9);
  const carbsGrams = Math.round(remainingCaloriesForCarbs / 4);

  // Water intake: ~35 ml per kg of body weight
  const waterLitres = Number((input.weightKg * 0.035).toFixed(1));

  return {
    bmr: Math.round(bmr),
    tdee,
    calories: targetCalories,
    macros: {
      proteinGrams,
      carbsGrams,
      fatGrams,
    },
    waterLitres,
    ...(safetyWarning ? { safetyWarning } : {}),
  };
}

export const calculateCalories = calculateCaloriePlan;
