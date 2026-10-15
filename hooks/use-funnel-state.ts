"use client";

import { useEffect, useState, useCallback } from "react";
import type { AssessmentInput } from "@/types/fitness";
import {
  clearDraftFunnel,
  getFullDraftInput,
  loadDraftDetails,
  loadDraftGoal,
  saveDraftDetails,
  saveDraftGoal,
  type StoredDetails,
  type StoredGoal,
} from "@/features/assessment/session-store";
import { DEFAULT_ACTIVITY_LEVEL, DEFAULT_DIET_PREFERENCE } from "@/lib/config";

export function useFunnelState() {
  const [details, setDetails] = useState<StoredDetails>({});
  const [goal, setGoal] = useState<StoredGoal>({
    activityLevel: DEFAULT_ACTIVITY_LEVEL,
    dietPreference: DEFAULT_DIET_PREFERENCE,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedDetails = loadDraftDetails();
    const savedGoal = loadDraftGoal();

    if (savedDetails) setDetails(savedDetails);
    if (savedGoal) {
      setGoal({
        goal: savedGoal.goal,
        activityLevel: savedGoal.activityLevel ?? DEFAULT_ACTIVITY_LEVEL,
        dietPreference: savedGoal.dietPreference ?? DEFAULT_DIET_PREFERENCE,
      });
    }
    setHydrated(true);
  }, []);

  const updateDetails = useCallback((newDetails: Partial<StoredDetails>) => {
    setDetails((prev) => {
      const updated = { ...prev, ...newDetails };
      saveDraftDetails(updated);
      return updated;
    });
  }, []);

  const updateGoal = useCallback((newGoal: Partial<StoredGoal>) => {
    setGoal((prev) => {
      const updated = { ...prev, ...newGoal };
      saveDraftGoal(updated);
      return updated;
    });
  }, []);

  const resetFunnel = useCallback(() => {
    clearDraftFunnel();
    setDetails({});
    setGoal({
      activityLevel: DEFAULT_ACTIVITY_LEVEL,
      dietPreference: DEFAULT_DIET_PREFERENCE,
    });
  }, []);

  const getFullInput = useCallback((): AssessmentInput | null => {
    return getFullDraftInput();
  }, []);

  const isDetailsComplete = Boolean(
    details.gender &&
      details.age &&
      details.heightCm &&
      details.weightKg &&
      details.waistIn &&
      details.neckIn &&
      (details.gender === "male" || details.hipIn),
  );

  const isGoalSelected = Boolean(goal.goal);

  return {
    hydrated,
    details,
    goal,
    updateDetails,
    updateGoal,
    resetFunnel,
    getFullInput,
    isDetailsComplete,
    isGoalSelected,
  };
}
