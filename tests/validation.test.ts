import { describe, expect, it } from "vitest";
import {
  assessmentSchema,
  detailsSchema,
  goalSelectionSchema,
} from "@/features/assessment/schema";

describe("BMYFIT Assessment Validation Schemas", () => {
  const validMaleDetails = {
    gender: "male",
    age: 28,
    heightCm: 175,
    weightKg: 70,
    waistIn: 34,
    neckIn: 15,
  };

  const validFemaleDetails = {
    gender: "female",
    age: 26,
    heightCm: 162,
    weightKg: 58,
    waistIn: 30,
    neckIn: 13,
    hipIn: 38,
  };

  describe("detailsSchema", () => {
    it("accepts valid male and female measurements", () => {
      expect(detailsSchema.safeParse(validMaleDetails).success).toBe(true);
      expect(detailsSchema.safeParse(validFemaleDetails).success).toBe(true);
    });

    it("blocks users under 18 with a friendly message", () => {
      const result = detailsSchema.safeParse({ ...validMaleDetails, age: 17 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("BMYFIT is designed for adults 18 and older");
      }
    });

    it("enforces sensible metric and imperial bounds", () => {
      // Age > 80
      expect(detailsSchema.safeParse({ ...validMaleDetails, age: 85 }).success).toBe(false);
      // Height < 120 cm
      expect(detailsSchema.safeParse({ ...validMaleDetails, heightCm: 110 }).success).toBe(false);
      // Height > 230 cm
      expect(detailsSchema.safeParse({ ...validMaleDetails, heightCm: 240 }).success).toBe(false);
      // Weight < 30 kg
      expect(detailsSchema.safeParse({ ...validMaleDetails, weightKg: 25 }).success).toBe(false);
      // Weight > 300 kg
      expect(detailsSchema.safeParse({ ...validMaleDetails, weightKg: 350 }).success).toBe(false);
      // Waist < 15 in
      expect(detailsSchema.safeParse({ ...validMaleDetails, waistIn: 14 }).success).toBe(false);
      // Neck < 8 in
      expect(detailsSchema.safeParse({ ...validMaleDetails, neckIn: 7 }).success).toBe(false);
      // Female Hip < 20 in
      expect(detailsSchema.safeParse({ ...validFemaleDetails, hipIn: 18 }).success).toBe(false);
    });

    it("rejects male when waist <= neck", () => {
      const resultEqual = detailsSchema.safeParse({
        ...validMaleDetails,
        waistIn: 16,
        neckIn: 16,
      });
      expect(resultEqual.success).toBe(false);

      const resultSmaller = detailsSchema.safeParse({
        ...validMaleDetails,
        waistIn: 15,
        neckIn: 17,
      });
      expect(resultSmaller.success).toBe(false);
    });

    it("rejects female when hip is missing", () => {
      const femaleWithoutHip = { ...validFemaleDetails, hipIn: undefined };
      const result = detailsSchema.safeParse(femaleWithoutHip);
      expect(result.success).toBe(false);
      if (!result.success) {
        const hipIssue = result.error.issues.find((i) => i.path.includes("hipIn"));
        expect(hipIssue).toBeDefined();
      }
    });

    it("rejects female when waist + hip <= neck", () => {
      const result = detailsSchema.safeParse({
        ...validFemaleDetails,
        waistIn: 15,
        hipIn: 20,
        neckIn: 36, // 35 <= 36
      });
      expect(result.success).toBe(false);
    });
  });

  describe("goalSelectionSchema", () => {
    it("accepts valid fitness goals and assigns default activity and diet", () => {
      const parsed = goalSelectionSchema.parse({ goal: "muscle-gain" });
      expect(parsed.goal).toBe("muscle-gain");
      expect(parsed.activityLevel).toBe("lightly-active");
      expect(parsed.dietPreference).toBe("vegetarian");
    });

    it("accepts custom activity and diet values", () => {
      const parsed = goalSelectionSchema.parse({
        goal: "fat-loss",
        activityLevel: "moderately-active",
        dietPreference: "non-vegetarian",
      });
      expect(parsed.activityLevel).toBe("moderately-active");
      expect(parsed.dietPreference).toBe("non-vegetarian");
    });

    it("rejects invalid goal values", () => {
      expect(goalSelectionSchema.safeParse({ goal: "bulk-extreme" }).success).toBe(false);
    });
  });

  describe("assessmentSchema (combined)", () => {
    it("validates full payload end-to-end", () => {
      const fullValidPayload = {
        ...validMaleDetails,
        goal: "fat-loss",
        activityLevel: "lightly-active",
        dietPreference: "eggetarian",
      };
      const result = assessmentSchema.safeParse(fullValidPayload);
      expect(result.success).toBe(true);
    });
  });
});
