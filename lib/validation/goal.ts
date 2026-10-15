import { z } from "zod";
import { activityLevelSchema, dietPreferenceSchema } from "./details";

export const fitnessGoalSchema = z.enum(["fat-loss", "weight-loss", "muscle-gain", "weight-gain"]);
export const goalSelectionSchema = z.object({
  goal: fitnessGoalSchema,
  activityLevel: activityLevelSchema.default("lightly-active"),
  dietPreference: dietPreferenceSchema.default("vegetarian"),
});
export type GoalSelectionInput = z.infer<typeof goalSelectionSchema>;
