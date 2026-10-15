import type { BmiCategory } from "@/types/fitness";
import { classifyBmi, SOUTH_ASIAN_BMI_NOTE } from "./categories";

export interface BmiResult {
  value: number;
  category: BmiCategory;
  note: string;
  isSouthAsianElevatedRisk: boolean;
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new RangeError("weightKg must be a positive number");
  }
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    throw new RangeError("heightCm must be a positive number");
  }

  const heightM = heightCm / 100;
  const rawValue = weightKg / (heightM * heightM);
  const value = Number(rawValue.toFixed(1));

  return {
    value,
    category: classifyBmi(value),
    note: SOUTH_ASIAN_BMI_NOTE,
    isSouthAsianElevatedRisk: value >= 23,
  };
}

export const calculateBMI = calculateBmi;
