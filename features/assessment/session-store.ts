import type { AssessmentInput, FitnessGoal, Gender, ActivityLevel, DietPreference } from "@/types/fitness";
import { DEFAULT_ACTIVITY_LEVEL, DEFAULT_DIET_PREFERENCE } from "@/lib/config";

const DETAILS_STORAGE_KEY = "bmyfit_draft_details_v1";
const GOAL_STORAGE_KEY = "bmyfit_draft_goal_v1";
const ASSESSMENT_STORAGE_KEY = "bmyfit_local_assessment";
const CALCULATED_STORAGE_KEY = "bmyfit_local_calculated";

export interface StoredDetails {
  step?: 1 | 2;
  gender?: Gender;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  waistIn?: number;
  neckIn?: number;
  hipIn?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  heightUnit?: "cm" | "ft";
  weightUnit?: "kg" | "lbs";
  waistUnit?: "cm" | "in";
  neckUnit?: "cm" | "in";
  hipUnit?: "cm" | "in";
  rawAge?: string | number;
  rawHeight?: string | number;
  rawWeight?: string | number;
  rawWaist?: string | number;
  rawNeck?: string | number;
  rawHip?: string | number;
}

export interface StoredGoal {
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietPreference?: DietPreference;
}

export function saveDraftDetails(details: StoredDetails): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(details);
  try {
    sessionStorage.setItem(DETAILS_STORAGE_KEY, json);
  } catch {}
  try {
    localStorage.setItem(DETAILS_STORAGE_KEY, json);
  } catch {}
}

export function loadDraftDetails(): StoredDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DETAILS_STORAGE_KEY) || localStorage.getItem(DETAILS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDetails) : null;
  } catch {
    return null;
  }
}

export function saveDraftGoal(goal: StoredGoal): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(goal);
  try {
    sessionStorage.setItem(GOAL_STORAGE_KEY, json);
  } catch {}
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, json);
  } catch {}
}

export function loadDraftGoal(): StoredGoal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GOAL_STORAGE_KEY) || localStorage.getItem(GOAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredGoal) : null;
  } catch {
    return null;
  }
}

export function saveLocalAssessment(assessment: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(assessment);
  try {
    sessionStorage.setItem(ASSESSMENT_STORAGE_KEY, json);
  } catch {}
  try {
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, json);
    if (assessment.id) {
      localStorage.setItem(`bmyfit_assessment_${assessment.id}`, json);
    }
  } catch {}
}

export function loadLocalAssessment(id?: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      (id && id !== "local" ? localStorage.getItem(`bmyfit_assessment_${id}`) : null) ||
      sessionStorage.getItem(ASSESSMENT_STORAGE_KEY) ||
      localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function saveLocalCalculated(calc: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(calc);
  try {
    sessionStorage.setItem(CALCULATED_STORAGE_KEY, json);
  } catch {}
  try {
    localStorage.setItem(CALCULATED_STORAGE_KEY, json);
  } catch {}
}

export function loadLocalCalculated(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CALCULATED_STORAGE_KEY) || localStorage.getItem(CALCULATED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function clearDraftFunnel(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DETAILS_STORAGE_KEY);
    sessionStorage.removeItem(GOAL_STORAGE_KEY);
    localStorage.removeItem(DETAILS_STORAGE_KEY);
    localStorage.removeItem(GOAL_STORAGE_KEY);
  } catch {}
}

export function getFullDraftInput(): AssessmentInput | null {
  const details = loadDraftDetails();
  const goal = loadDraftGoal();

  const gender = details?.gender || "male";
  const age = Number(details?.rawAge) || details?.age || 26;
  let heightCm = Number(details?.rawHeight) || details?.heightCm || 175;
  if (details?.heightUnit === "ft" && details.rawHeight) {
    heightCm = Math.round(Number(details.rawHeight) * 30.48);
  }
  let weightKg = Number(details?.rawWeight) || details?.weightKg || 72;
  if (details?.weightUnit === "lbs" && details.rawWeight) {
    weightKg = Math.round(Number(details.rawWeight) * 0.453592);
  }
  const effectiveGoal = goal?.goal || "fat-loss";

  const waistIn =
    details?.waistIn ??
    (details?.rawWaist
      ? details.waistUnit === "in"
        ? Number(details.rawWaist)
        : Math.round((Number(details.rawWaist) / 2.54) * 10) / 10
      : gender === "male"
      ? Math.round(weightKg * 0.46)
      : Math.round(weightKg * 0.42));

  const neckIn =
    details?.neckIn ??
    (details?.rawNeck
      ? details.neckUnit === "in"
        ? Number(details.rawNeck)
        : Math.round((Number(details.rawNeck) / 2.54) * 10) / 10
      : gender === "male"
      ? 15.5
      : 13.5);

  const hipIn =
    details?.hipIn ??
    (details?.rawHip
      ? details.hipUnit === "in"
        ? Number(details.rawHip)
        : Math.round((Number(details.rawHip) / 2.54) * 10) / 10
      : gender === "female"
      ? Math.round(waistIn * 1.25)
      : undefined);

  return {
    gender,
    age,
    heightCm,
    weightKg,
    waistIn,
    neckIn,
    hipIn,
    waistCm: details?.waistCm,
    neckCm: details?.neckCm,
    hipCm: details?.hipCm,
    goal: effectiveGoal,
    activityLevel: goal?.activityLevel ?? DEFAULT_ACTIVITY_LEVEL,
    dietPreference: goal?.dietPreference ?? DEFAULT_DIET_PREFERENCE,
  };
}
