import type { ActivityLevel, DietPreference } from "@/types/fitness";

export const APP_CONFIG = {
  brandName: "BMYFIT",
  tagline: "Know your Body | Transform your Body",
  description:
    "A quick, private fitness assessment for Indian adults with scientifically calculated BMI, estimated body fat %, and an affordable personalized nutrition & workout plan.",
  url: "https://bmyfit.in",
  pricing: {
    amountInr: 99,
    amountPaise: 9900,
    formatted: "Rs. 99",
  },
  /**
   * Safe defaults for optional extras added to enhance the paid plan:
   * 1. Activity level (default: 'lightly-active')
   * 2. Diet preference (default: 'vegetarian')
   */
  funnelDefaults: {
    activityLevel: "lightly-active" as ActivityLevel,
    dietPreference: "vegetarian" as DietPreference,
  },
  medicalDisclaimer:
    "BMYFIT provides general fitness information and estimates. It is not medical advice. Consult a doctor before starting any diet or exercise programme, especially if you have a medical condition, are pregnant, or are under 18.",
  supportEmail: "support@bmyfit.in",
} as const;

export const PLAN_PRICE_INR = APP_CONFIG.pricing.amountInr;
export const PLAN_PRICE_PAISE = APP_CONFIG.pricing.amountPaise;
export const DEFAULT_ACTIVITY_LEVEL = APP_CONFIG.funnelDefaults.activityLevel;
export const DEFAULT_DIET_PREFERENCE = APP_CONFIG.funnelDefaults.dietPreference;
