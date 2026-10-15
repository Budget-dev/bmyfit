import { describe, expect, it } from "vitest";
import { calculateBmi } from "@/features/calculator/bmi";

describe("BMI Calculator", () => {
  it("calculates exact BMI test vectors rounded to 1 decimal", () => {
    // 70 kg, 175 cm -> 70 / (1.75^2) = 22.857... -> 22.9
    const result1 = calculateBmi(70, 175);
    expect(result1.value).toBe(22.9);
    expect(result1.category).toBe("normal");
    expect(result1.isSouthAsianElevatedRisk).toBe(false);

    // 62 kg, 162 cm -> 62 / (1.62^2) = 23.623... -> 23.6
    const result2 = calculateBmi(62, 162);
    expect(result2.value).toBe(23.6);
    expect(result2.category).toBe("normal");
    expect(result2.isSouthAsianElevatedRisk).toBe(true);
    expect(result2.note).toContain("For South Asian adults, health risk can begin at lower BMI (about 23+).");
  });

  it("classifies all WHO categories correctly", () => {
    // Underweight: < 18.5
    expect(calculateBmi(45, 170).category).toBe("underweight");
    // Normal: 18.5 - 24.9
    expect(calculateBmi(65, 170).category).toBe("normal");
    // Overweight: 25.0 - 29.9
    expect(calculateBmi(75, 170).category).toBe("overweight");
    // Obese: >= 30.0
    expect(calculateBmi(95, 170).category).toBe("obese");
  });

  it("throws RangeError on non-positive or non-finite inputs", () => {
    expect(() => calculateBmi(-70, 175)).toThrow(RangeError);
    expect(() => calculateBmi(70, 0)).toThrow(RangeError);
    expect(() => calculateBmi(NaN, 175)).toThrow(RangeError);
    expect(() => calculateBmi(70, Infinity)).toThrow(RangeError);
  });
});
