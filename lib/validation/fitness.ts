import { z } from "zod";
export { assessmentSchema } from "./assessment";
export { detailsSchema, genderSchema, sexSchema, activityLevelSchema, dietPreferenceSchema, userDetailsSchema } from "./details";
export { fitnessGoalSchema, goalSelectionSchema } from "./goal";
export const mealSchema = z.object({ mealType: z.string().min(2), name: z.string().trim().min(2).max(100), calories: z.number().int().min(0).max(5000), proteinGrams: z.number().min(0).max(500) });
export const progressSchema = z.object({ date: z.string().date(), weightKg: z.number().positive().max(500).optional(), bodyFatPercent: z.number().min(1).max(70).optional(), notes: z.string().max(500).optional() });
export const goalSchema = z.object({ name: z.string().trim().min(2).max(100), target: z.number().positive(), unit: z.string().trim().min(1).max(30), current: z.number().min(0) });
export { createOrderSchema, paymentDetailsSchema, paymentSchema, verifyPaymentSchema } from "./payment";
