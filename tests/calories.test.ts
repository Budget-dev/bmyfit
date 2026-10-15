import { describe, expect, it } from "vitest";
import { calculateCaloriePlan } from "@/features/calculator/calories";

describe("Calorie and Macro Calculator (Mifflin-St Jeor)", () => {
  it("calculates BMR and TDEE correctly for males and females", () => {
    // Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    // TDEE sedentary (1.2) = 1673.75 * 1.2 = 2008.5 -> 2009
    const malePlan = calculateCaloriePlan({
      gender: "male",
      age: 25,
      heightCm: 175,
      weightKg: 70,
      activityLevel: "sedentary",
      goal: "muscle-gain",
    });
    expect(malePlan.bmr).toBe(1674);
    expect(malePlan.tdee).toBe(2009);

    // Female: 10*60 + 6.25*160 - 5*30 - 161 = 600 + 1000 - 150 - 161 = 1289
    // TDEE lightly-active (1.375) = 1289 * 1.375 = 1772.375 -> 1772
    const femalePlan = calculateCaloriePlan({
      gender: "female",
      age: 30,
      heightCm: 160,
      weightKg: 60,
      activityLevel: "lightly-active",
      goal: "fat-loss",
    });
    expect(femalePlan.bmr).toBe(1289);
    expect(femalePlan.tdee).toBe(1772);
  });

  it("applies goal calorie adjustments correctly", () => {
    const base = {
      gender: "male" as const,
      age: 28,
      heightCm: 178,
      weightKg: 75,
      activityLevel: "moderately-active" as const,
    };

    const fatLoss = calculateCaloriePlan({ ...base, goal: "fat-loss" });
    const weightLoss = calculateCaloriePlan({ ...base, goal: "weight-loss" });
    const muscleGain = calculateCaloriePlan({ ...base, goal: "muscle-gain" });
    const weightGain = calculateCaloriePlan({ ...base, goal: "weight-gain" });

    // Fat Loss should be TDEE - 20%
    expect(fatLoss.calories).toBe(Math.round(fatLoss.tdee * 0.8));
    // Weight Loss should be TDEE - 18%
    expect(weightLoss.calories).toBe(Math.round(weightLoss.tdee * 0.82));
    // Muscle Gain should be TDEE + 10%
    expect(muscleGain.calories).toBe(Math.round(muscleGain.tdee * 1.1));
    // Weight Gain should be TDEE + 15%
    expect(weightGain.calories).toBe(Math.round(weightGain.tdee * 1.15));

    // Proper calorie ordering
    expect(fatLoss.calories).toBeLessThan(muscleGain.calories);
    expect(muscleGain.calories).toBeLessThan(weightGain.calories);
  });

  it("enforces safety floors (1500 kcal for male, 1200 kcal for female)", () => {
    // Very light male on severe deficit: floor 1500
    const lowMale = calculateCaloriePlan({
      gender: "male",
      age: 40,
      heightCm: 155,
      weightKg: 50,
      activityLevel: "sedentary",
      goal: "fat-loss",
    });
    expect(lowMale.calories).toBeGreaterThanOrEqual(1500);

    // Very light female on severe deficit: floor 1200
    const lowFemale = calculateCaloriePlan({
      gender: "female",
      age: 45,
      heightCm: 150,
      weightKg: 42,
      activityLevel: "sedentary",
      goal: "fat-loss",
    });
    expect(lowFemale.calories).toBeGreaterThanOrEqual(1200);
  });

  it("prevents deficit plans when BMI < 18.5 and issues safety guidance", () => {
    // Underweight user: 42kg at 170cm (BMI = 14.5)
    const underweightPlan = calculateCaloriePlan({
      gender: "female",
      age: 22,
      heightCm: 170,
      weightKg: 42,
      activityLevel: "lightly-active",
      goal: "fat-loss",
    });

    expect(underweightPlan.safetyWarning).toBeDefined();
    expect(underweightPlan.safetyWarning).toContain("BMI indicates you are underweight");
    // Should NOT be a deficit relative to TDEE
    expect(underweightPlan.calories).toBeGreaterThanOrEqual(underweightPlan.tdee);
  });

  it("computes macros with ~25% fat, high protein, and ~35ml/kg water intake", () => {
    const plan = calculateCaloriePlan({
      gender: "male",
      age: 26,
      heightCm: 180,
      weightKg: 80,
      activityLevel: "lightly-active",
      goal: "muscle-gain",
    });

    // Protein: 80kg * 2.0 = 160g
    expect(plan.macros.proteinGrams).toBe(160);

    // Fat: ~25% of calories
    const fatCalories = plan.macros.fatGrams * 9;
    const fatRatio = fatCalories / plan.calories;
    expect(fatRatio).toBeGreaterThanOrEqual(0.23);
    expect(fatRatio).toBeLessThanOrEqual(0.27);

    // Carbs: remainder
    const totalMacroKcal =
      plan.macros.proteinGrams * 4 + plan.macros.fatGrams * 9 + plan.macros.carbsGrams * 4;
    expect(Math.abs(totalMacroKcal - plan.calories)).toBeLessThanOrEqual(15);

    // Water: 80 * 0.035 = 2.8 L
    expect(plan.waterLitres).toBe(2.8);
  });
});
