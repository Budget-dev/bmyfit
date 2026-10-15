import { describe, expect, it } from "vitest";
import { generatePlan } from "@/features/plan";
import type { AssessmentInput } from "@/types/fitness";

const maleInput: AssessmentInput = {
  gender: "male",
  age: 25,
  heightCm: 180,
  weightKg: 80,
  waistIn: 32,
  neckIn: 15,
  goal: "muscle-gain",
  activityLevel: "lightly-active",
  dietPreference: "vegetarian",
};

const femaleInput: AssessmentInput = {
  gender: "female",
  age: 28,
  heightCm: 162,
  weightKg: 60,
  waistIn: 30,
  neckIn: 13,
  hipIn: 38,
  goal: "fat-loss",
  activityLevel: "lightly-active",
  dietPreference: "non-vegetarian",
};

describe("Deterministic Paid Plan", () => {
  it("returns seven-day plan with workouts for valid inputs", () => {
    const plan = generatePlan(maleInput, "a1");
    expect(plan.nutrition.days).toHaveLength(7);
    expect(plan.workouts.length).toBeGreaterThan(0);
    expect(plan.workouts[0].title).toContain("Push");
  });

  it("changes the workout split and calories by goal", () => {
    const gain = generatePlan(maleInput, "a1");
    const loss = generatePlan(femaleInput, "a2");

    expect(gain.snapshot.calories).toBeGreaterThan(loss.snapshot.calories);
    expect(loss.workouts[0].title).toMatch(/Resistance|Conditioning|Cardio/);
  });
});
