import "server-only";
import { assessmentSchema } from "./schema";
import { calculateBmi, calculateBodyFat } from "@/features/calculator";
import { createAssessment, getAssessment, getAssessmentById } from "@/lib/firestore/repositories";
import type { Assessment, AssessmentInput } from "@/types/fitness";

export async function processAndStoreAssessment(
  uid: string,
  rawInput: unknown,
): Promise<{ assessmentId: string; assessment: Assessment }> {
  // Always validate on server - never trust client numbers
  const input = assessmentSchema.parse(rawInput) as AssessmentInput;

  const bmiResult = calculateBmi(input.weightKg, input.heightCm);
  const bodyFatResult = calculateBodyFat(input);

  const computed = {
    bmi: bmiResult.value,
    bmiCategory: bmiResult.category,
    bodyFatPercent: bodyFatResult.value,
    bodyFatCategory: bodyFatResult.category,
    ...(bodyFatResult.plausible ? {} : { bodyFatWarning: "Please re-check your measurements" }),
  };

  const assessmentId = await createAssessment(uid, input, computed);
  const created: Assessment = {
    id: assessmentId,
    uid,
    ...input,
    ...computed,
  };

  return { assessmentId, assessment: created };
}

export async function fetchUserAssessment(uid: string, assessmentId: string): Promise<Assessment> {
  return getAssessment(uid, assessmentId);
}

export async function fetchAssessmentByIdUnchecked(assessmentId: string): Promise<Assessment> {
  return getAssessmentById(assessmentId);
}
