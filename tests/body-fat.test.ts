import { describe, expect, it } from "vitest";
import {
  calculateBodyFat,
  calculateFemaleBodyFatNavy,
  calculateMaleBodyFatNavy,
  inchToCm,
} from "@/features/calculator/body-fat";

describe("US Navy Body Fat Calculator", () => {
  describe("Direct US Navy Metric Formulas (Male & Female)", () => {
    it("calculates Male Navy formula accurately: 495 / (1.0324 - 0.19077*log10(waist-neck) + 0.15456*log10(height)) - 450", () => {
      // waist: 86cm, neck: 38cm, height: 175cm
      const bf = calculateMaleBodyFatNavy(86, 38, 175);
      expect(bf).toBeCloseTo(17.71, 0.1);
    });

    it("calculates Female Navy formula accurately: 495 / (1.29579 - 0.35004*log10(waist+hip-neck) + 0.22100*log10(height)) - 450", () => {
      // waist: 70cm, hip: 98cm, neck: 33cm, height: 165cm
      const bf = calculateFemaleBodyFatNavy(70, 98, 33, 165);
      expect(bf).toBeCloseTo(25.89, 0.1);
    });

    it("accepts waistCm/neckCm/hipCm directly in calculateBodyFat without precision loss", () => {
      const maleResult = calculateBodyFat({
        gender: "male",
        heightCm: 175,
        waistCm: 86,
        neckCm: 38,
      });
      expect(maleResult.plausible).toBe(true);
      expect(maleResult.value).toBe(17.7);

      const femaleResult = calculateBodyFat({
        gender: "female",
        heightCm: 165,
        waistCm: 70,
        neckCm: 33,
        hipCm: 98,
      });
      expect(femaleResult.plausible).toBe(true);
      expect(femaleResult.value).toBe(25.9);
    });
  });
  it("converts inches to centimetres accurately", () => {
    expect(inchToCm(1)).toBe(2.54);
    expect(inchToCm(10)).toBe(25.4);
    expect(() => inchToCm(0)).toThrow(RangeError);
    expect(() => inchToCm(-5)).toThrow(RangeError);
  });

  describe("Hodgdon-Beckett Test Vectors (tolerance +/- 0.2)", () => {
    it("matches Male vector 1: height 175 cm, waist 34 in, neck 15 in -> ~17.9%", () => {
      const result = calculateBodyFat({
        gender: "male",
        heightCm: 175,
        waistIn: 34,
        neckIn: 15,
      });
      expect(result.plausible).toBe(true);
      expect(result.value).not.toBeNull();
      expect(result.value).toBeCloseTo(17.9, 0.2);
      expect(result.category).toBe("fitness"); // 14-17% fitness, 17.9 is fitness/average boundary
      expect(result.disclaimer).toContain("This is an estimate, not a medical measurement.");
    });

    it("matches Male vector 2: height 170 cm, waist 36 in, neck 15.5 in -> ~21.6%", () => {
      const result = calculateBodyFat({
        gender: "male",
        heightCm: 170,
        waistIn: 36,
        neckIn: 15.5,
      });
      expect(result.plausible).toBe(true);
      expect(result.value).not.toBeNull();
      expect(result.value).toBeCloseTo(21.6, 0.2);
      expect(result.category).toBe("average"); // 18-24%
    });

    it("matches Female vector: height 162 cm, waist 34 in, hip 40 in, neck 13 in -> ~36.5%", () => {
      const result = calculateBodyFat({
        gender: "female",
        heightCm: 162,
        waistIn: 34,
        hipIn: 40,
        neckIn: 13,
      });
      expect(result.plausible).toBe(true);
      expect(result.value).not.toBeNull();
      expect(result.value).toBeCloseTo(36.5, 0.2);
      expect(result.category).toBe("obese"); // 32%+
    });
  });

  describe("Validation & Cross-Field Rules", () => {
    it("throws RangeError if male waist <= neck", () => {
      expect(() =>
        calculateBodyFat({
          gender: "male",
          heightCm: 175,
          waistIn: 15,
          neckIn: 15,
        })
      ).toThrow(RangeError);

      expect(() =>
        calculateBodyFat({
          gender: "male",
          heightCm: 175,
          waistIn: 14,
          neckIn: 16,
        })
      ).toThrow(RangeError);
    });

    it("throws RangeError if female hip is missing or undefined", () => {
      expect(() =>
        calculateBodyFat({
          gender: "female",
          heightCm: 165,
          waistIn: 30,
          neckIn: 13,
        })
      ).toThrow("hipIn is required for female body fat calculations");
    });

    it("throws RangeError if female waist + hip <= neck", () => {
      expect(() =>
        calculateBodyFat({
          gender: "female",
          heightCm: 165,
          waistIn: 10,
          hipIn: 10,
          neckIn: 22,
        })
      ).toThrow(RangeError);
    });
  });

  describe("Plausibility Bounds Handling", () => {
    it("returns re-check warning if male body fat is implausible (<2% or >60%)", () => {
      // Extremely low waist: waist 20in, neck 19.9in on tall male -> negative or <2%
      const resultLow = calculateBodyFat({
        gender: "male",
        heightCm: 195,
        waistIn: 20,
        neckIn: 19.9,
      });
      expect(resultLow.plausible).toBe(false);
      expect(resultLow.value).toBeNull();
      expect(resultLow.warning).toBe("Please re-check your measurements");

      // Extremely high waist: waist 68in, neck 10in
      const resultHigh = calculateBodyFat({
        gender: "male",
        heightCm: 150,
        waistIn: 68,
        neckIn: 10,
      });
      expect(resultHigh.plausible).toBe(false);
      expect(resultHigh.value).toBeNull();
      expect(resultHigh.warning).toBe("Please re-check your measurements");
    });

    it("returns re-check warning if female body fat is implausible (<10% or >65%)", () => {
      // Extremely high measurements: waist 65in, hip 75in, neck 10in
      const resultHigh = calculateBodyFat({
        gender: "female",
        heightCm: 145,
        waistIn: 65,
        hipIn: 75,
        neckIn: 10,
      });
      expect(resultHigh.plausible).toBe(false);
      expect(resultHigh.value).toBeNull();
      expect(resultHigh.warning).toBe("Please re-check your measurements");
    });
  });

  describe("ACE-style Categories", () => {
    it("correctly identifies male ACE categories", () => {
      // Essential: 2-5%
      const rEssential = calculateBodyFat({ gender: "male", heightCm: 180, waistIn: 25, neckIn: 20 });
      if (rEssential.plausible && rEssential.value !== null && rEssential.value <= 5) {
        expect(rEssential.category).toBe("essential");
      }

      // Athletes: 6-13%
      const rAthlete = calculateBodyFat({ gender: "male", heightCm: 180, waistIn: 30, neckIn: 16 });
      expect(rAthlete.category).toBe("athletes");

      // Fitness: 14-17%
      const rFitness = calculateBodyFat({ gender: "male", heightCm: 175, waistIn: 33, neckIn: 15 });
      expect(rFitness.category).toBe("fitness");

      // Average: 18-24%
      const rAvg = calculateBodyFat({ gender: "male", heightCm: 175, waistIn: 36, neckIn: 15 });
      expect(rAvg.category).toBe("average");

      // Obese: 25%+
      const rObese = calculateBodyFat({ gender: "male", heightCm: 175, waistIn: 42, neckIn: 15 });
      expect(rObese.category).toBe("obese");
    });

    it("correctly identifies female ACE categories", () => {
      // Essential: 10-13%
      const rEssential = calculateBodyFat({ gender: "female", heightCm: 170, waistIn: 25, hipIn: 34, neckIn: 14 });
      expect(rEssential.category).toBe("essential");

      // Athletes: 14-20%
      const rAthlete = calculateBodyFat({ gender: "female", heightCm: 165, waistIn: 25, hipIn: 35, neckIn: 13 });
      expect(rAthlete.category).toBe("athletes");

      // Fitness: 21-24%
      const rFitness = calculateBodyFat({ gender: "female", heightCm: 165, waistIn: 27, hipIn: 36, neckIn: 13.5 });
      expect(rFitness.category).toBe("fitness");

      // Average: 25-31%
      const rAvg = calculateBodyFat({ gender: "female", heightCm: 165, waistIn: 30, hipIn: 38, neckIn: 13.5 });
      expect(rAvg.category).toBe("average");

      // Obese: 32%+
      const rObese = calculateBodyFat({ gender: "female", heightCm: 162, waistIn: 34, hipIn: 40, neckIn: 13 });
      expect(rObese.category).toBe("obese");
    });
  });
});
