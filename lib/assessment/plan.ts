import { calculateBmi, calculateBodyFat } from "@/features/calculator";
import type { AssessmentInput } from "@/types/fitness";

export function calculateAssessment(input: AssessmentInput) {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const bodyFat = calculateBodyFat(input);
  return { bmi: bmi.value, bmiCategory: bmi.category, bodyFatPercent: bodyFat.value, bodyFatCategory: bodyFat.category, ...(bodyFat.plausible ? {} : { bodyFatWarning: "Please re-check your measurements" }) };
}
