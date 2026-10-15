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
    !details?.waistIn ||
    !details?.neckIn ||
    !goal?.goal
  ) {
    return null;
  }

  return {
    gender: details.gender,
    age: details.age,
    heightCm: details.heightCm,
    weightKg: details.weightKg,
    waistIn: details.waistIn,
    neckIn: details.neckIn,
    hipIn: details.hipIn,
    goal: goal.goal,
    activityLevel: goal.activityLevel ?? DEFAULT_ACTIVITY_LEVEL,
    dietPreference: goal.dietPreference ?? DEFAULT_DIET_PREFERENCE,
  };
}
