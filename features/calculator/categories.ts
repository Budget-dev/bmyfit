import type { BmiCategory, BodyFatCategory, Gender } from "@/types/fitness";

export const SOUTH_ASIAN_BMI_NOTE =
  "For South Asian adults, health risk can begin at lower BMI (about 23+).";

export const ESTIMATE_DISCLAIMER_NOTE =
  "This is an estimate, not a medical measurement.";

export function classifyBmi(value: number): BmiCategory {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("BMI must be a positive finite number");
  }
  if (value < 18.5) return "underweight";
  if (value < 25) return "normal";
  if (value < 30) return "overweight";
  return "obese";
}

export const getBmiCategory = classifyBmi;

export function classifyBodyFat(value: number, gender: Gender): BodyFatCategory {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("Body fat percentage must be a positive finite number");
  }

  if (gender === "male") {
    if (value < 6) return "essential"; // 2-5%
    if (value < 14) return "athletes"; // 6-13%
    if (value < 18) return "fitness"; // 14-17%
    if (value < 25) return "average"; // 18-24%
    return "obese"; // 25%+
  }

  // female
  if (value < 14) return "essential"; // 10-13%
  if (value < 21) return "athletes"; // 14-20%
  if (value < 25) return "fitness"; // 21-24%
  if (value < 32) return "average"; // 25-31%
  return "obese"; // 32%+
}

export function getBmiLabel(category: BmiCategory): string {
  switch (category) {
    case "underweight":
      return "Underweight";
    case "normal":
      return "Normal Weight";
    case "overweight":
      return "Overweight";
    case "obese":
      return "Obese";
  }
}

export function getBodyFatLabel(category: BodyFatCategory): string {
  switch (category) {
    case "essential":
      return "Essential Fat";
    case "athletes":
      return "Athletes";
    case "fitness":
      return "Fitness";
    case "average":
      return "Average";
    case "obese":
      return "Obese";
  }
}
