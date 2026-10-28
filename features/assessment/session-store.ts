import type { AssessmentInput, FitnessGoal, Gender, ActivityLevel, DietPreference } from "@/types/fitness";
import { DEFAULT_ACTIVITY_LEVEL, DEFAULT_DIET_PREFERENCE } from "@/lib/config";

const DETAILS_STORAGE_KEY = "bmyfit_draft_details_v1";
const GOAL_STORAGE_KEY = "bmyfit_draft_goal_v1";

export interface StoredDetails {
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
}

export interface StoredGoal {
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietPreference?: DietPreference;
}

export function saveDraftDetails(details: StoredDetails): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function loadDraftDetails(): StoredDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DETAILS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDetails) : null;
  } catch {
    return null;
  }
}

export function saveDraftGoal(goal: StoredGoal): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function loadDraftGoal(): StoredGoal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GOAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredGoal) : null;
  } catch {
    return null;
  }
}

export function clearDraftFunnel(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DETAILS_STORAGE_KEY);
    sessionStorage.removeItem(GOAL_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

export function getFullDraftInput(): AssessmentInput | null {
  const details = loadDraftDetails();
  const goal = loadDraftGoal();

  if (
    !details?.gender ||
    !details?.age ||
    !details?.heightCm ||
    !details?.weightKg ||
    !goal?.goal
  ) {
    return null;
  }

  const waistIn =
    details.waistIn ??
    (details.gender === "male"
      ? Math.round(details.weightKg * 0.46)
      : Math.round(details.weightKg * 0.42));
  const neckIn = details.neckIn ?? (details.gender === "male" ? 15.5 : 13.5);
  const hipIn =
    details.hipIn ??
    (details.gender === "female" ? Math.round(waistIn * 1.25) : undefined);

  return {
    gender: details.gender,
    age: details.age,
    heightCm: details.heightCm,
    weightKg: details.weightKg,
    waistIn,
    neckIn,
    hipIn,
    waistCm: details.waistCm,
    neckCm: details.neckCm,
    hipCm: details.hipCm,
    goal: goal.goal,
    activityLevel: goal.activityLevel ?? DEFAULT_ACTIVITY_LEVEL,
    dietPreference: goal.dietPreference ?? DEFAULT_DIET_PREFERENCE,
  };
}
