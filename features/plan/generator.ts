import { calculateBmi, calculateBodyFat, calculateCaloriePlan } from "@/features/calculator";
import { APP_CONFIG } from "@/lib/config";
import type { AssessmentInput, DetailedPlan, FitnessGoal } from "@/types/fitness";
import { buildNutritionPlan } from "./builder-nutrition";
import { buildWorkoutPlan } from "./builder-workout";

export const MEDICAL_DISCLAIMER = APP_CONFIG.medicalDisclaimer;

const TIMELINE_BY_GOAL: Record<FitnessGoal, string> = {
  "fat-loss":
    "Aim for 0.5–0.7 kg of fat reduction per week (approx. 2–3 kg per month). Consistency in nutrition with resistance training preserves lean tissue.",
  "weight-loss":
    "Safe, sustainable target is 0.5–0.75 kg per week. Focus on daily step count and a consistent, unhurried caloric deficit.",
  "muscle-gain":
    "Realistic lean hypertrophy is 0.25–0.5 kg of total body mass per month for natural trainees. Progressive overload in the gym is paramount.",
  "weight-gain":
    "Aim for 0.3–0.5 kg weight increase per week by maintaining a steady 300–400 kcal surplus and prioritizing compound resistance lifts.",
};

const HABITS_BY_GOAL: Record<FitnessGoal, string[]> = {
  "fat-loss": [
    "Daily Steps: Target 8,000–10,000 steps distributed across the day (morning walk + 10-min post-meal walks).",
    "Sleep Hygiene: 7 to 9 hours of uninterrupted sleep every night to control hunger hormones (ghrelin/leptin).",
    "Hydration: Drink your target water intake before 8:00 PM to minimize nighttime wakefulness.",
    "Meal Timing: Keep an 11–12 hour overnight digestive rest window (e.g., finish dinner by 8:30 PM, breakfast at 8:00 AM).",
    "Protein Distribution: Consume at least 20–30g of protein at each main meal to maintain high satiety.",
  ],
  "weight-loss": [
    "Daily Steps: Build up to 7,500–9,000 steps daily. Even three 10-minute strolls make a dramatic difference.",
    "Sleep Hygiene: Sleep 7.5 to 8.5 hours. Cortisol spikes from sleep deprivation stall weight loss.",
    "Hydration: Drink 1 full glass of water 20 minutes before lunch and dinner.",
    "Mindful Eating: Avoid screens while having meals. Chew thoroughly and stop when 80% full.",
    "Liquid Calories: Avoid sodas, packaged juices, and excessive sugar in chai/coffee.",
  ],
  "muscle-gain": [
    "Daily Steps: 6,000–8,000 steps for cardiovascular health without excessive caloric expenditure.",
    "Sleep & Recovery: 8 to 9 hours nightly. Muscle tissue repairs and grows predominantly during deep sleep stages.",
    "Pre & Post Workout Nutrition: 20-25g protein + carbohydrates 60-90 minutes before lifting, and within 2 hours after.",
    "Hydration: Maintain 3.5+ litres of water daily to support intracellular muscle hydration and strength.",
    "Log Every Session: Track weights lifted, sets, and reps in a notebook or phone app to ensure progressive overload.",
  ],
  "weight-gain": [
    "Caloric Density: Add healthy calorie-dense foods like peanut butter, nuts, ghee, and bananas to regular meals.",
    "Liquid Nutrition: Consume 1 home-made smoothie daily (milk, oats, banana, peanut butter) between meals.",
    "Sleep: Minimum 8 hours of quality sleep for hormonal balance and cellular growth.",
    "Hydration: Sip water throughout the day, but avoid drinking large quantities immediately before meals.",
    "Avoid Excessive Cardio: Keep intense cardio to 1-2 short sessions weekly to prevent burning excess calories.",
  ],
};

const DOS_AND_DONTS = {
  dos: [
    "DO prioritize home-cooked Indian meals made with measured oil/ghee (1-2 tsp per meal).",
    "DO include raw salads (cucumber, tomato, carrot) or vegetable soups before lunch and dinner.",
    "DO practice progressive overload in workouts: attempt 1 extra rep or slightly better form every week.",
    "DO remain consistent on weekends: stay within 10-15% of your weekday caloric targets.",
    "DO listen to your joints: pain is a warning signal to modify form, not an obstacle to push through blindly.",
  ],
  donts: [
    "DON'T starve yourself below the recommended safety floors (1500 kcal for men, 1200 kcal for women).",
    "DON'T skip meals thinking it speeds up fat loss; it often triggers uncontrollable evening binge-eating.",
    "DON'T weigh yourself multiple times daily. Water retention, sodium, and bowel movements cause natural fluctuations.",
    "DON'T consume unregulated fat burners, crash detox teas, or unauthorized supplements.",
    "DON'T rush the process. True, lasting body transformation takes 8 to 16 weeks of steady dedication.",
  ],
};

const TRACKING_GUIDE = [
  "Weigh-ins: Weigh yourself 2–3 mornings per week after using the washroom, on an empty stomach. Calculate the weekly average.",
  "Tape Measurements: Measure your waist (at navel) and hips every 14 days under identical morning conditions.",
  "Progress Photos: Take 3 photos (front, side, back) in consistent lighting every 2 to 3 weeks.",
  "Caloric Review: Review your progress every 2–3 weeks. If weight hasn't moved for 3 consecutive weeks, adjust calories by ±100–150 kcal.",
  "Biofeedback: Monitor your daily energy, mood, workout performance, and sleep quality as key health indicators.",
];

export function generatePlan(
  input: AssessmentInput,
  assessmentId: string,
  createdAt?: string,
): DetailedPlan {
  const bmiResult = calculateBmi(input.weightKg, input.heightCm);
  const bodyFatResult = calculateBodyFat(input);
  const caloriePlan = calculateCaloriePlan({
    gender: input.gender,
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    activityLevel: input.activityLevel,
    goal: input.goal,
    bmi: bmiResult.value,
  });

  const nutrition = buildNutritionPlan(
    caloriePlan.calories,
    caloriePlan.macros.proteinGrams,
    input.dietPreference,
  );

  const workoutResult = buildWorkoutPlan(input.goal);

  return {
    assessmentId,
    planVersion: "rules-v1",
    snapshot: {
      bmi: bmiResult.value,
      bmiCategory: bmiResult.category,
      bodyFatPercent: bodyFatResult.value,
      goal: input.goal,
      calories: caloriePlan.calories,
      macros: caloriePlan.macros,
      waterLitres: caloriePlan.waterLitres,
      timeline: TIMELINE_BY_GOAL[input.goal] ?? TIMELINE_BY_GOAL["fat-loss"],
    },
    nutrition: {
      days: nutrition.days,
      groceryList: nutrition.groceryList,
    },
    workouts: workoutResult.workouts,
    habits: HABITS_BY_GOAL[input.goal] ?? HABITS_BY_GOAL["fat-loss"],
    tracking: [...TRACKING_GUIDE],
    dos: [...DOS_AND_DONTS.dos],
    donts: [...DOS_AND_DONTS.donts],
    safetyNote: MEDICAL_DISCLAIMER,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

export const generateFitnessPlan = generatePlan;
