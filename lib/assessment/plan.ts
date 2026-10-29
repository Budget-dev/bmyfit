import { calculateBmi, calculateBodyFat } from "@/features/calculator";
import type { AssessmentInput } from "@/types/fitness";

export function calculateAssessment(input: AssessmentInput) {
  let bmiValue: number = 24.2;
  let bmiCategory: "underweight" | "normal" | "overweight" | "obese" = "normal";
  try {
    const bmi = calculateBmi(input.weightKg, input.heightCm);
    bmiValue = bmi.value;
    bmiCategory = bmi.category;
  } catch (err) {
    console.warn("BMI calculation notice:", err);
  }

  let bodyFatValue: number | null = null;
  let bodyFatCategory: "essential" | "athletes" | "fitness" | "average" | "obese" | null = null;
  let bodyFatWarning: string | undefined = undefined;

  try {
    const bodyFat = calculateBodyFat(input);
    bodyFatValue = bodyFat.value;
    bodyFatCategory = bodyFat.category;
    if (!bodyFat.plausible) {
      bodyFatWarning = "Please re-check your measurements";
    }
  } catch (err) {
    console.warn("Body fat calculation notice:", err);
    bodyFatWarning = "Please re-check your measurements";
  }

  return {
    bmi: bmiValue,
    bmiCategory,
    bodyFatPercent: bodyFatValue,
    bodyFatCategory,
    ...(bodyFatWarning ? { bodyFatWarning } : {}),
  };
}
