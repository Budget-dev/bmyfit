import type { BodyFatCategory, Gender } from "@/types/fitness";
import { classifyBodyFat, ESTIMATE_DISCLAIMER_NOTE } from "./categories";

export interface BodyFatInput {
  gender: Gender;
  heightCm: number;
  waistIn: number;
  neckIn: number;
  hipIn?: number;
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
 * Single helper function to convert inches to centimetres.
 * Hodgdon-Beckett formulas require all measurements in centimetres.
 */
export function inchToCm(inches: number): number {
  if (!Number.isFinite(inches) || inches <= 0) {
    throw new RangeError("Measurement in inches must be a positive number");
  }
  return inches * 2.54;
}

export function calculateBodyFat(input: BodyFatInput): BodyFatResult {
  if (!Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    throw new RangeError("heightCm must be a positive number");
  }
  if (!Number.isFinite(input.waistIn) || input.waistIn <= 0) {
    throw new RangeError("waistIn must be a positive number");
  }
  if (!Number.isFinite(input.neckIn) || input.neckIn <= 0) {
    throw new RangeError("neckIn must be a positive number");
  }

  const heightCm = input.heightCm;
  const waistCm = inchToCm(input.waistIn);
  const neckCm = inchToCm(input.neckIn);

  let rawValue: number;

  if (input.gender === "male") {
    if (input.waistIn <= input.neckIn) {
      throw new RangeError("Waist measurement must be greater than neck measurement");
    }
    const waistMinusNeckCm = waistCm - neckCm;
    if (waistMinusNeckCm <= 0) {
      throw new RangeError("Waist must be strictly larger than neck in cm");
    }
    const denominator =
      1.0324 - 0.19077 * Math.log10(waistMinusNeckCm) + 0.15456 * Math.log10(heightCm);
    rawValue = 495 / denominator - 450;
  } else {
    // Female requires hip
    if (input.hipIn === undefined || !Number.isFinite(input.hipIn) || input.hipIn <= 0) {
      throw new RangeError("hipIn is required for female body fat calculations");
    }
    if (input.waistIn + input.hipIn <= input.neckIn) {
      throw new RangeError("Waist plus hip must be greater than neck measurement");
    }
    const hipCm = inchToCm(input.hipIn);
    const circumferenceCm = waistCm + hipCm - neckCm;
    if (circumferenceCm <= 0) {
      throw new RangeError("Circumference (waist + hip - neck) must be positive");
    }
    const denominator =
      1.29579 - 0.35004 * Math.log10(circumferenceCm) + 0.221 * Math.log10(heightCm);
    rawValue = 495 / denominator - 450;
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
