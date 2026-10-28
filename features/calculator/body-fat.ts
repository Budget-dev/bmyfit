import type { BodyFatCategory, Gender } from "@/types/fitness";
import { classifyBodyFat, ESTIMATE_DISCLAIMER_NOTE } from "./categories";

export interface BodyFatInput {
  gender: Gender;
  heightCm: number;
  waistIn?: number;
  neckIn?: number;
  hipIn?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}

export interface BodyFatResult {
  value: number | null;
  rawValue: number;
  category: BodyFatCategory | null;
  plausible: boolean;
  warning?: string;
  disclaimer: string;
}

/**
 * Helper function to convert inches to centimetres.
 * Hodgdon-Beckett formulas require all measurements in centimetres.
 */
export function inchToCm(inches: number): number {
  if (!Number.isFinite(inches) || inches <= 0) {
    throw new RangeError("Measurement in inches must be a positive number");
  }
  return inches * 2.54;
}

/**
 * Calculate accurate Male Body Fat % using US Navy formula:
 * Body Fat % = 495 / (1.0324 - 0.19077 × log10(Waist - Neck) + 0.15456 × log10(Height)) - 450
 * All measurements in cm.
 */
export function calculateMaleBodyFatNavy(
  waistCm: number,
  neckCm: number,
  heightCm: number
): number {
  if (waistCm <= neckCm) {
    throw new RangeError("Waist measurement must be greater than neck measurement");
  }
  const waistMinusNeckCm = waistCm - neckCm;
  if (waistMinusNeckCm <= 0) {
    throw new RangeError("Waist must be strictly larger than neck in cm");
  }
  const denominator =
    1.0324 - 0.19077 * Math.log10(waistMinusNeckCm) + 0.15456 * Math.log10(heightCm);
  return 495 / denominator - 450;
}

/**
 * Calculate accurate Female Body Fat % using US Navy formula:
 * Body Fat % = 495 / (1.29579 - 0.35004 × log10(Waist + Hip - Neck) + 0.22100 × log10(Height)) - 450
 * All measurements in cm.
 */
export function calculateFemaleBodyFatNavy(
  waistCm: number,
  hipCm: number,
  neckCm: number,
  heightCm: number
): number {
  if (waistCm + hipCm <= neckCm) {
    throw new RangeError("Waist plus hip must be greater than neck measurement");
  }
  const circumferenceCm = waistCm + hipCm - neckCm;
  if (circumferenceCm <= 0) {
    throw new RangeError("Circumference (waist + hip - neck) must be positive");
  }
  const denominator =
    1.29579 - 0.35004 * Math.log10(circumferenceCm) + 0.22100 * Math.log10(heightCm);
  return 495 / denominator - 450;
}

export function calculateBodyFat(input: BodyFatInput): BodyFatResult {
  if (!Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    throw new RangeError("heightCm must be a positive number");
  }
  if (input.waistIn !== undefined && (!Number.isFinite(input.waistIn) || input.waistIn <= 0)) {
    throw new RangeError("waistIn must be a positive number");
  }
  if (input.neckIn !== undefined && (!Number.isFinite(input.neckIn) || input.neckIn <= 0)) {
    throw new RangeError("neckIn must be a positive number");
  }

  // Resolve waist in cm (from waistCm directly or waistIn converted)
  const waistCm =
    input.waistCm !== undefined && Number.isFinite(input.waistCm) && input.waistCm > 0
      ? input.waistCm
      : input.waistIn !== undefined
      ? inchToCm(input.waistIn)
      : NaN;

  if (!Number.isFinite(waistCm) || waistCm <= 0) {
    throw new RangeError("waistIn must be a positive number");
  }

  // Resolve neck in cm (from neckCm directly or neckIn converted)
  const neckCm =
    input.neckCm !== undefined && Number.isFinite(input.neckCm) && input.neckCm > 0
      ? input.neckCm
      : input.neckIn !== undefined
      ? inchToCm(input.neckIn)
      : NaN;

  if (!Number.isFinite(neckCm) || neckCm <= 0) {
    throw new RangeError("neckIn must be a positive number");
  }

  const heightCm = input.heightCm;
  let rawValue: number;

  if (input.gender === "male") {
    rawValue = calculateMaleBodyFatNavy(waistCm, neckCm, heightCm);
  } else {
    // Female requires hip measurement
    const hipCm =
      input.hipCm !== undefined && Number.isFinite(input.hipCm) && input.hipCm > 0
        ? input.hipCm
        : input.hipIn !== undefined
        ? inchToCm(input.hipIn)
        : undefined;

    if (hipCm === undefined || !Number.isFinite(hipCm) || hipCm <= 0) {
      throw new RangeError("hipIn is required for female body fat calculations");
    }

    rawValue = calculateFemaleBodyFatNavy(waistCm, hipCm, neckCm, heightCm);
  }

  const rounded = Number(rawValue.toFixed(1));

  // Plausibility check (ACE ranges):
  // Male plausible: 2% to 60%
  // Female plausible: 10% to 65%
  const isPlausible =
    input.gender === "male"
      ? rounded >= 2 && rounded <= 60
      : rounded >= 10 && rounded <= 65;

  if (!isPlausible) {
    return {
      value: null,
      rawValue: rounded,
      category: null,
      plausible: false,
      warning: "Please re-check your measurements",
      disclaimer: ESTIMATE_DISCLAIMER_NOTE,
    };
  }

  return {
    value: rounded,
    rawValue: rounded,
    category: classifyBodyFat(rounded, input.gender),
    plausible: true,
    disclaimer: ESTIMATE_DISCLAIMER_NOTE,
  };
}

export const calculateBodyFatPercentage = (input: BodyFatInput) => calculateBodyFat(input).value;
