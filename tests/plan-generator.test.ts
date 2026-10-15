import { describe, expect, it } from "vitest";
import { generatePlan } from "@/features/plan/generator";
import type { AssessmentInput } from "@/types/fitness";

describe("Plan Generator Engine", () => {
  const youngMaleMuscleGain: AssessmentInput = {
    gender: "male",
    age: 25,
    heightCm: 180,
    weightKg: 78,
    waistIn: 32,
    neckIn: 15.5,
    goal: "muscle-gain",
    activityLevel: "moderately-active",
    dietPreference: "non-vegetarian",
  };

  const matureFemaleFatLoss: AssessmentInput = {
    gender: "female",
    age: 40,
    heightCm: 160,
    weightKg: 68,
    waistIn: 33,
    neckIn: 13,
    hipIn: 40,
    goal: "fat-loss",
    activityLevel: "lightly-active",
    dietPreference: "vegetarian",
  };

  it("produces deterministic plans for identical inputs", () => {
    const fixedTimestamp = "2026-10-14T10:00:00.000Z";
    const planA = generatePlan(youngMaleMuscleGain, "asmt-123", fixedTimestamp);
    const planB = generatePlan(youngMaleMuscleGain, "asmt-123", fixedTimestamp);

    expect(planA).toEqual(planB);
  });

  it("includes all 7 required plan sections", () => {
    const plan = generatePlan(youngMaleMuscleGain, "asmt-001");

    // 1. Snapshot
    expect(plan.snapshot.bmi).toBeGreaterThan(0);
    expect(plan.snapshot.bodyFatPercent).toBeGreaterThan(0);
    expect(plan.snapshot.calories).toBeGreaterThan(0);
    expect(plan.snapshot.macros.proteinGrams).toBeGreaterThan(0);
    expect(plan.snapshot.macros.carbsGrams).toBeGreaterThan(0);
    expect(plan.snapshot.macros.fatGrams).toBeGreaterThan(0);
    expect(plan.snapshot.waterLitres).toBeGreaterThan(0);
    expect(plan.snapshot.timeline).toBeDefined();

    // 2. Nutrition (7 days, each with 5 slots)
    expect(plan.nutrition.days).toHaveLength(7);
    for (const day of plan.nutrition.days) {
      expect(day.meals).toHaveLength(5);
      const slots = day.meals.map((m) => m.slot);
      expect(slots).toEqual(["Breakfast", "Mid-Morning", "Lunch", "Evening Snack", "Dinner"]);
      for (const meal of day.meals) {
        expect(meal.name.length).toBeGreaterThan(0);
        expect(meal.portion.length).toBeGreaterThan(0);
        expect(meal.calories).toBeGreaterThan(0);
      }
    }
    expect(plan.nutrition.groceryList.length).toBeGreaterThan(0);

    // 3. Workouts (with sets, reps, home alternatives)
    expect(plan.workouts.length).toBeGreaterThan(0);
    for (const workout of plan.workouts) {
      expect(workout.title.length).toBeGreaterThan(0);
      expect(workout.exercises.length).toBeGreaterThan(0);
      expect(workout.homeAlternative).toBeDefined();
      expect(workout.homeAlternative!.length).toBeGreaterThan(0);
    }

    // 4. Daily Habits
    expect(plan.habits.length).toBeGreaterThanOrEqual(4);

    // 5. Progress Tracking Guide
    expect(plan.tracking.length).toBeGreaterThanOrEqual(4);

    // 6. Do's and Don'ts
    expect(plan.dos.length).toBeGreaterThanOrEqual(4);
    expect(plan.donts.length).toBeGreaterThanOrEqual(4);

    // 7. Safety note / Medical disclaimer
    expect(plan.safetyNote).toContain("BMYFIT provides general fitness information");
  });

  it("differentiates 25yo male muscle-gain from 40yo female fat-loss significantly", () => {
    const malePlan = generatePlan(youngMaleMuscleGain, "male-01");
    const femalePlan = generatePlan(matureFemaleFatLoss, "female-01");

    // Calories: Male muscle gain should be higher than female fat loss
    expect(malePlan.snapshot.calories).toBeGreaterThan(femalePlan.snapshot.calories + 500);

    // Protein: Male target higher in absolute grams due to body weight & surplus
    expect(malePlan.snapshot.macros.proteinGrams).toBeGreaterThan(
      femalePlan.snapshot.macros.proteinGrams
    );

    // Workout split: Male muscle gain has hypertrophy split vs female fat loss cardio/strength circuit
    const maleTitles = malePlan.workouts.map((w) => w.title.toLowerCase()).join(" ");
    const femaleTitles = femalePlan.workouts.map((w) => w.title.toLowerCase()).join(" ");

    expect(maleTitles).toContain("push");
    expect(femaleTitles).toMatch(/resistance|conditioning|circuit/);

    // Nutrition: Non-veg contains eggs/chicken, vegetarian does not
    const maleMealNames = malePlan.nutrition.days
      .flatMap((d) => d.meals)
      .map((m) => m.name.toLowerCase())
      .join(" ");
    const femaleMealNames = femalePlan.nutrition.days
      .flatMap((d) => d.meals)
      .map((m) => m.name.toLowerCase())
      .join(" ");

    expect(maleMealNames).toMatch(/egg|chicken|fish/);
    expect(femaleMealNames).not.toMatch(/chicken|fish|mutton/);
  });

  it("adapts meal portions based on total target calories", () => {
    const highCalorieInput: AssessmentInput = {
      ...youngMaleMuscleGain,
      weightKg: 95,
      goal: "weight-gain",
    };
    const lowCalorieInput: AssessmentInput = {
      ...matureFemaleFatLoss,
      weightKg: 50,
      goal: "weight-loss",
    };

    const highPlan = generatePlan(highCalorieInput, "high-01");
    const lowPlan = generatePlan(lowCalorieInput, "low-01");

    expect(highPlan.snapshot.calories).toBeGreaterThan(lowPlan.snapshot.calories);

    const highDay1Calories = highPlan.nutrition.days[0].meals.reduce((sum, m) => sum + m.calories, 0);
    const lowDay1Calories = lowPlan.nutrition.days[0].meals.reduce((sum, m) => sum + m.calories, 0);

    expect(highDay1Calories).toBeGreaterThan(lowDay1Calories);
  });
});
