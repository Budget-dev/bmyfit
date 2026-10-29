import { z } from "zod";
import { DEFAULT_ACTIVITY_LEVEL, DEFAULT_DIET_PREFERENCE } from "@/lib/config";

export const genderSchema = z.enum(["male", "female"], {
  required_error: "Please select your gender",
});

export const activityLevelSchema = z.enum(
  ["sedentary", "lightly-active", "moderately-active", "very-active"],
  { required_error: "Please select your activity level" },
);

export const dietPreferenceSchema = z.enum(
  ["vegetarian", "eggetarian", "non-vegetarian"],
  { required_error: "Please select your diet preference" },
);

export const fitnessGoalSchema = z.enum(
  ["fat-loss", "weight-loss", "muscle-gain", "weight-gain"],
  { required_error: "Please choose a fitness goal" },
);

export const detailsSchema = z
  .object({
    gender: genderSchema,
    age: z.coerce
      .number({ invalid_type_error: "Please enter your age" })
      .int("Age must be a whole number")
      .min(18, "BMYFIT is designed for adults 18 and older. Please consult a guardian/physician.")
      .max(80, "Please enter an age up to 80 years"),
    heightCm: z.coerce
      .number({ invalid_type_error: "Please enter your height" })
      .min(120, "Height must be at least 120 cm")
      .max(230, "Height must be under 230 cm"),
    weightKg: z.coerce
      .number({ invalid_type_error: "Please enter your weight" })
      .min(30, "Weight must be at least 30 kg")
      .max(300, "Weight must be under 300 kg"),
    waistIn: z.coerce
      .number({ invalid_type_error: "Please enter your waist measurement" })
      .min(15, "Waist must be at least 15 inches")
      .max(70, "Waist must be under 70 inches"),
    neckIn: z.coerce
      .number({ invalid_type_error: "Please enter your neck measurement" })
      .min(8, "Neck must be at least 8 inches")
      .max(30, "Neck must be under 30 inches"),
    hipIn: z.coerce
      .number({ invalid_type_error: "Please enter your hip measurement" })
      .min(20, "Hip must be at least 20 inches")
      .max(80, "Hip must be under 80 inches")
      .optional(),
    waistCm: z.coerce.number().optional(),
    neckCm: z.coerce.number().optional(),
    hipCm: z.coerce.number().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.gender === "male") {
      if (val.waistIn <= val.neckIn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["waistIn"],
          message: "Waist measurement must be greater than neck measurement.",
        });
      }
    } else if (val.gender === "female") {
      if (val.hipIn === undefined || Number.isNaN(val.hipIn)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hipIn"],
          message: "Hip measurement is required for females to estimate body fat.",
        });
      } else if (val.waistIn + val.hipIn <= val.neckIn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hipIn"],
          message: "Waist + Hip measurement must be greater than neck measurement.",
        });
      }
    }
  });

export const goalSelectionSchema = z.object({
  goal: fitnessGoalSchema.default("fat-loss"),
  activityLevel: activityLevelSchema.default(DEFAULT_ACTIVITY_LEVEL),
  dietPreference: dietPreferenceSchema.default(DEFAULT_DIET_PREFERENCE),
});

export const assessmentSchema = detailsSchema.and(goalSelectionSchema);

export type DetailsFormValues = z.infer<typeof detailsSchema>;
export type GoalFormValues = z.infer<typeof goalSelectionSchema>;
export type AssessmentFormValues = z.infer<typeof assessmentSchema>;
