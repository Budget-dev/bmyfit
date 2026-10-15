import { z } from "zod";

export const genderSchema = z.enum(["male", "female"]);
export const activityLevelSchema = z.enum(["sedentary", "lightly-active", "moderately-active", "very-active"]);
export const dietPreferenceSchema = z.enum(["vegetarian", "eggetarian", "non-vegetarian"]);

export const detailsSchema = z.object({
  gender: genderSchema,
  age: z.coerce.number().int().min(18, "BMYFIT is for adults 18 and over.").max(80),
  heightCm: z.coerce.number().finite().min(120).max(230),
  weightKg: z.coerce.number().finite().min(30).max(300),
  waistIn: z.coerce.number().finite().min(15).max(70),
  neckIn: z.coerce.number().finite().min(8).max(30),
  hipIn: z.coerce.number().finite().min(20).max(80).optional(),
}).superRefine((value, ctx) => {
  if (value.gender === "male" && value.waistIn <= value.neckIn) ctx.addIssue({ code: "custom", path: ["waistIn"], message: "Waist must be larger than neck." });
  if (value.gender === "female") {
    if (value.hipIn === undefined) ctx.addIssue({ code: "custom", path: ["hipIn"], message: "Hip measurement is required for female estimates." });
    else if (value.waistIn + value.hipIn <= value.neckIn) ctx.addIssue({ code: "custom", path: ["hipIn"], message: "Waist plus hip must be larger than neck." });
  }
});

export type DetailsInput = z.infer<typeof detailsSchema>;
export const sexSchema = genderSchema;
export const userDetailsSchema = detailsSchema;
