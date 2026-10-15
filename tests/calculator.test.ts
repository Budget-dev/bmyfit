import { describe, expect, it } from "vitest";
import {
  calculateBmi,
  calculateBodyFat,
  calculateCaloriePlan,
} from "@/features/calculator";

describe("Integrated Calculator Facade", () => {
  it("calculates BMI vectors correctly", () => {
    const bmiResult = calculateBmi(70, 175);
    expect(bmiResult.value).toBe(22.9);
    expect(bmiResult.category).toBe("normal");

    const bmiResult2 = calculateBmi(62, 162);
    expect(bmiResult2.value).toBe(23.6);
  });

  it("calculates body fat vectors for male and female", () => {
    const maleBf = calculateBodyFat({
      gender: "male",
      heightCm: 175,
      waistIn: 34,
      neckIn: 15,
    });
    expect(maleBf.value).toBeCloseTo(17.9, 0.2);

    const femaleBf = calculateBodyFat({
      gender: "female",
      heightCm: 162,
      waistIn: 34,
      hipIn: 40,
      neckIn: 13,
    });
    expect(femaleBf.value).toBeCloseTo(36.5, 0.2);
  });

  it("applies calorie floors and goal differences", () => {
    const femaleUnderweight = calculateCaloriePlan({
      gender: "female",
      age: 30,
      heightCm: 160,
      weightKg: 40,
      activityLevel: "lightly-active",
      goal: "fat-loss",
    });
    expect(femaleUnderweight.calories).toBeGreaterThanOrEqual(1200);

    const base = {
      gender: "male" as const,
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: "lightly-active" as const,
    };
    expect(calculateCaloriePlan({ ...base, goal: "muscle-gain" }).calories).toBeGreaterThan(
      calculateCaloriePlan({ ...base, goal: "fat-loss" }).calories
    );
  });
});
