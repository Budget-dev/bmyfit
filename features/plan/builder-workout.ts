import type { FitnessGoal, Workout } from "@/types/fitness";
import { COOL_DOWN_ROUTINE, WARM_UP_ROUTINE, WORKOUT_SCHEDULES } from "./workouts-data";

export function buildWorkoutPlan(goal: FitnessGoal): {
  workouts: Workout[];
  warmUp: string[];
  coolDown: string[];
} {
  const baseSchedule = WORKOUT_SCHEDULES[goal] ?? WORKOUT_SCHEDULES["fat-loss"];

  // Clone workouts
  const workouts = baseSchedule.map((w) => ({
    ...w,
    exercises: [...w.exercises],
  }));

  return {
    workouts,
    warmUp: [...WARM_UP_ROUTINE],
    coolDown: [...COOL_DOWN_ROUTINE],
  };
}
