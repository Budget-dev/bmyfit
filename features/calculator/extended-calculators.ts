/**
 * Extended Fitness and Health Calculators Suite
 * Comprehensive clinical, anthropometric, nutritional, and physiological calculators.
 */

import type { Gender, ActivityLevel, FitnessGoal } from "@/types/fitness";

// ---------------------------------------------------------------------------
// 1. BMI CALCULATOR (Extended)
// ---------------------------------------------------------------------------
export interface ExtendedBmiResult {
  bmi: number;
  category: "Underweight" | "Normal Weight" | "Overweight" | "Obese";
  southAsianCategory: "Underweight" | "Normal Weight" | "Increased Risk" | "High Risk (Obese)";
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
  southAsianWeightMaxKg: number;
  primeRatio: number; // BMI / 25
  ponderalIndex: number; // kg / m^3
}

export function calculateExtendedBmi(weightKg: number, heightCm: number): ExtendedBmiResult {
  if (!Number.isFinite(weightKg) || weightKg <= 0) throw new RangeError("Weight must be greater than 0");
  if (!Number.isFinite(heightCm) || heightCm <= 0) throw new RangeError("Height must be greater than 0");

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  const ponderalIndex = Number((weightKg / (heightM * heightM * heightM)).toFixed(2));
  const primeRatio = Number((bmi / 25).toFixed(2));

  let category: ExtendedBmiResult["category"] = "Normal Weight";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 25 && bmi < 30) category = "Overweight";
  else if (bmi >= 30) category = "Obese";

  let southAsianCategory: ExtendedBmiResult["southAsianCategory"] = "Normal Weight";
  if (bmi < 18.5) southAsianCategory = "Underweight";
  else if (bmi >= 23 && bmi < 27.5) southAsianCategory = "Increased Risk";
  else if (bmi >= 27.5) southAsianCategory = "High Risk (Obese)";

  const healthyWeightMinKg = Number((18.5 * heightM * heightM).toFixed(1));
  const healthyWeightMaxKg = Number((24.9 * heightM * heightM).toFixed(1));
  const southAsianWeightMaxKg = Number((22.9 * heightM * heightM).toFixed(1));

  return {
    bmi,
    category,
    southAsianCategory,
    healthyWeightMinKg,
    healthyWeightMaxKg,
    southAsianWeightMaxKg,
    primeRatio,
    ponderalIndex,
  };
}

// ---------------------------------------------------------------------------
// 2. BMR CALCULATOR (Basal Metabolic Rate)
// ---------------------------------------------------------------------------
export interface BmrResult {
  mifflinBmr: number;
  harrisBenedictBmr: number;
  katchMcArdleBmr?: number;
  hourlyCalories: number;
}

export function calculateBmr(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number,
  bodyFatPercent?: number
): BmrResult {
  if (age <= 0 || heightCm <= 0 || weightKg <= 0) {
    throw new RangeError("Age, height, and weight must be positive numbers");
  }

  // Mifflin-St Jeor (clinical gold standard)
  const mifflin =
    10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);

  // Revised Harris-Benedict (1984)
  const harrisBenedict =
    gender === "male"
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;

  let katchMcArdle: number | undefined;
  if (typeof bodyFatPercent === "number" && bodyFatPercent > 0 && bodyFatPercent < 100) {
    const leanMassKg = weightKg * (1 - bodyFatPercent / 100);
    katchMcArdle = Math.round(370 + 21.6 * leanMassKg);
  }

  const mifflinBmr = Math.round(mifflin);

  return {
    mifflinBmr,
    harrisBenedictBmr: Math.round(harrisBenedict),
    ...(katchMcArdle ? { katchMcArdleBmr: katchMcArdle } : {}),
    hourlyCalories: Number((mifflinBmr / 24).toFixed(1)),
  };
}

// ---------------------------------------------------------------------------
// 3. TDEE CALCULATOR (Total Daily Energy Expenditure)
// ---------------------------------------------------------------------------
export interface TdeeResult {
  bmr: number;
  tdee: number;
  maintenanceCalories: number;
  mildLossCalories: number; // -250 kcal (~0.25 kg/wk)
  weightLossCalories: number; // -500 kcal (~0.5 kg/wk)
  extremeLossCalories: number; // -750 kcal (~0.75 kg/wk)
  mildGainCalories: number; // +250 kcal
  muscleGainCalories: number; // +500 kcal
}

const TDEE_ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
};

export function calculateTdee(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel
): TdeeResult {
  const bmrResult = calculateBmr(gender, age, heightCm, weightKg);
  const bmr = bmrResult.mifflinBmr;
  const multiplier = TDEE_ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.375;
  const tdee = Math.round(bmr * multiplier);

  const floor = gender === "male" ? 1500 : 1200;

  return {
    bmr,
    tdee,
    maintenanceCalories: tdee,
    mildLossCalories: Math.max(floor, tdee - 250),
    weightLossCalories: Math.max(floor, tdee - 500),
    extremeLossCalories: Math.max(floor, tdee - 750),
    mildGainCalories: tdee + 250,
    muscleGainCalories: tdee + 500,
  };
}

// ---------------------------------------------------------------------------
// 4. IDEAL WEIGHT CALCULATOR
// ---------------------------------------------------------------------------
export interface IdealWeightResult {
  devineKg: number;
  robinsonKg: number;
  millerKg: number;
  hamwiKg: number;
  healthyBmiRangeMinKg: number;
  healthyBmiRangeMaxKg: number;
  southAsianHealthyMaxKg: number;
  averageIdealKg: number;
}

export function calculateIdealWeight(gender: Gender, heightCm: number): IdealWeightResult {
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    throw new RangeError("Height must be a positive number");
  }

  const heightInches = heightCm / 2.54;
  const inchesOver5Ft = Math.max(0, heightInches - 60);

  // Devine (1974)
  const devine =
    gender === "male" ? 50.0 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft;

  // Robinson (1983)
  const robinson =
    gender === "male" ? 52.0 + 1.9 * inchesOver5Ft : 49.0 + 1.7 * inchesOver5Ft;

  // Miller (1983)
  const miller =
    gender === "male" ? 56.2 + 1.41 * inchesOver5Ft : 53.1 + 1.36 * inchesOver5Ft;

  // Hamwi (1964)
  const hamwi =
    gender === "male" ? 48.0 + 2.7 * inchesOver5Ft : 45.5 + 2.2 * inchesOver5Ft;

  const heightM = heightCm / 100;
  const healthyBmiRangeMinKg = Number((18.5 * heightM * heightM).toFixed(1));
  const healthyBmiRangeMaxKg = Number((24.9 * heightM * heightM).toFixed(1));
  const southAsianHealthyMaxKg = Number((22.9 * heightM * heightM).toFixed(1));

  const averageIdealKg = Number(
    ((devine + robinson + miller + hamwi) / 4).toFixed(1)
  );

  return {
    devineKg: Number(devine.toFixed(1)),
    robinsonKg: Number(robinson.toFixed(1)),
    millerKg: Number(miller.toFixed(1)),
    hamwiKg: Number(hamwi.toFixed(1)),
    healthyBmiRangeMinKg,
    healthyBmiRangeMaxKg,
    southAsianHealthyMaxKg,
    averageIdealKg,
  };
}

// ---------------------------------------------------------------------------
// 5. PACE CALCULATOR
// ---------------------------------------------------------------------------
export interface PaceResult {
  pacePerKm: string; // "5:30 min/km"
  pacePerMile: string; // "8:51 min/mi"
  speedKmh: number;
  speedMph: number;
  splits: {
    distance5k: string;
    distance10k: string;
    halfMarathon: string;
    marathon: string;
  };
}

function formatMinutesAndSeconds(totalMinutes: number): string {
  const mins = Math.floor(totalMinutes);
  const secs = Math.round((totalMinutes - mins) * 60);
  const formattedSecs = secs === 60 ? "00" : secs.toString().padStart(2, "0");
  const actualMins = secs === 60 ? mins + 1 : mins;
  return `${actualMins}:${formattedSecs}`;
}

function formatHoursMinutesSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}h ${m}m ${s.toString().padStart(2, "0")}s`;
  }
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function calculatePace(
  distanceKm: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): PaceResult {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new RangeError("Distance must be greater than 0");
  }
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  if (totalSeconds <= 0) {
    throw new RangeError("Duration must be greater than 0");
  }

  const secondsPerKm = totalSeconds / distanceKm;
  const pacePerKmMin = secondsPerKm / 60;
  const secondsPerMile = secondsPerKm * 1.609344;
  const pacePerMileMin = secondsPerMile / 60;

  const totalHours = totalSeconds / 3600;
  const speedKmh = Number((distanceKm / totalHours).toFixed(2));
  const speedMph = Number((speedKmh / 1.609344).toFixed(2));

  return {
    pacePerKm: `${formatMinutesAndSeconds(pacePerKmMin)} min/km`,
    pacePerMile: `${formatMinutesAndSeconds(pacePerMileMin)} min/mi`,
    speedKmh,
    speedMph,
    splits: {
      distance5k: formatHoursMinutesSeconds(secondsPerKm * 5),
      distance10k: formatHoursMinutesSeconds(secondsPerKm * 10),
      halfMarathon: formatHoursMinutesSeconds(secondsPerKm * 21.0975),
      marathon: formatHoursMinutesSeconds(secondsPerKm * 42.195),
    },
  };
}

// ---------------------------------------------------------------------------
// 6. ARMY BODY FAT CALCULATOR (US DoD / Army AR 600-9 Standard)
// ---------------------------------------------------------------------------
export interface ArmyBodyFatResult {
  bodyFatPercent: number;
  category: "Passes Standard" | "Exceeds Standard";
  maxAllowablePercent: number;
  waistCircumferenceIn: number;
  neckCircumferenceIn: number;
  hipCircumferenceIn?: number;
}

export function calculateArmyBodyFat(
  gender: Gender,
  age: number,
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm?: number
): ArmyBodyFatResult {
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0 || age <= 0) {
    throw new RangeError("Height, neck, waist, and age must be positive numbers");
  }

  const heightIn = heightCm / 2.54;
  const neckIn = neckCm / 2.54;
  const waistIn = waistCm / 2.54;

  let bodyFatRaw: number;

  if (gender === "male") {
    if (waistIn <= neckIn) throw new RangeError("Waist must be larger than neck");
    // Male DoD formula (inches): 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
    bodyFatRaw =
      86.01 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  } else {
    if (typeof hipCm !== "number" || hipCm <= 0) {
      throw new RangeError("Hip circumference is required for females");
    }
    const hipIn = hipCm / 2.54;
    if (waistIn + hipIn <= neckIn) throw new RangeError("Waist + Hip must be larger than neck");
    // Female DoD formula (inches): 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
    bodyFatRaw =
      163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
  }

  const bodyFatPercent = Math.max(3, Math.min(65, Number(bodyFatRaw.toFixed(1))));

  // Army AR 600-9 standards by age
  let maxAllowablePercent = 20;
  if (gender === "male") {
    if (age <= 20) maxAllowablePercent = 20;
    else if (age <= 27) maxAllowablePercent = 22;
    else if (age <= 39) maxAllowablePercent = 24;
    else maxAllowablePercent = 26;
  } else {
    if (age <= 20) maxAllowablePercent = 30;
    else if (age <= 27) maxAllowablePercent = 32;
    else if (age <= 39) maxAllowablePercent = 34;
    else maxAllowablePercent = 36;
  }

  return {
    bodyFatPercent,
    category: bodyFatPercent <= maxAllowablePercent ? "Passes Standard" : "Exceeds Standard",
    maxAllowablePercent,
    waistCircumferenceIn: Number(waistIn.toFixed(1)),
    neckCircumferenceIn: Number(neckIn.toFixed(1)),
    ...(hipCm ? { hipCircumferenceIn: Number((hipCm / 2.54).toFixed(1)) } : {}),
  };
}

// ---------------------------------------------------------------------------
// 7. LEAN BODY MASS (LBM) CALCULATOR
// ---------------------------------------------------------------------------
export interface LeanBodyMassResult {
  boerLbmKg: number;
  jamesLbmKg: number;
  humeLbmKg: number;
  fatMassKg: number;
  bodyFatPercent: number;
}

export function calculateLeanBodyMass(
  gender: Gender,
  heightCm: number,
  weightKg: number,
  knownBodyFatPercent?: number
): LeanBodyMassResult {
  if (heightCm <= 0 || weightKg <= 0) {
    throw new RangeError("Height and weight must be positive numbers");
  }

  // Boer Formula
  const boer =
    gender === "male"
      ? 0.407 * weightKg + 0.267 * heightCm - 19.2
      : 0.252 * weightKg + 0.473 * heightCm - 48.3;

  // James Formula
  const james =
    gender === "male"
      ? 1.1 * weightKg - 128 * Math.pow(weightKg / heightCm, 2)
      : 1.07 * weightKg - 148 * Math.pow(weightKg / heightCm, 2);

  // Hume Formula
  const hume =
    gender === "male"
      ? 0.3281 * weightKg + 0.33929 * heightCm - 29.5336
      : 0.29569 * weightKg + 0.41813 * heightCm - 43.2933;

  let bodyFatPercent = 0;
  let fatMassKg = 0;

  if (typeof knownBodyFatPercent === "number" && knownBodyFatPercent > 0) {
    bodyFatPercent = knownBodyFatPercent;
    fatMassKg = Number(((weightKg * bodyFatPercent) / 100).toFixed(1));
  } else {
    // Derive from Boer formula
    const leanKg = Math.max(20, boer);
    fatMassKg = Number(Math.max(0, weightKg - leanKg).toFixed(1));
    bodyFatPercent = Number(((fatMassKg / weightKg) * 100).toFixed(1));
  }

  return {
    boerLbmKg: Number(Math.max(10, boer).toFixed(1)),
    jamesLbmKg: Number(Math.max(10, james).toFixed(1)),
    humeLbmKg: Number(Math.max(10, hume).toFixed(1)),
    fatMassKg,
    bodyFatPercent,
  };
}

// ---------------------------------------------------------------------------
// 8. HEALTHY WEIGHT CALCULATOR
// ---------------------------------------------------------------------------
export interface HealthyWeightResult {
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
  southAsianHealthyMinKg: number;
  southAsianHealthyMaxKg: number;
  differenceToHealthyMaxKg?: number;
  status: "Underweight" | "Healthy Weight" | "Above Healthy Weight";
}

export function calculateHealthyWeight(
  heightCm: number,
  currentWeightKg?: number
): HealthyWeightResult {
  if (heightCm <= 0) throw new RangeError("Height must be greater than 0");

  const heightM = heightCm / 100;
  const healthyWeightMinKg = Number((18.5 * heightM * heightM).toFixed(1));
  const healthyWeightMaxKg = Number((24.9 * heightM * heightM).toFixed(1));
  const southAsianHealthyMinKg = Number((18.5 * heightM * heightM).toFixed(1));
  const southAsianHealthyMaxKg = Number((22.9 * heightM * heightM).toFixed(1));

  let status: HealthyWeightResult["status"] = "Healthy Weight";
  let differenceToHealthyMaxKg: number | undefined;

  if (typeof currentWeightKg === "number" && currentWeightKg > 0) {
    if (currentWeightKg < healthyWeightMinKg) {
      status = "Underweight";
      differenceToHealthyMaxKg = Number((currentWeightKg - healthyWeightMinKg).toFixed(1));
    } else if (currentWeightKg > healthyWeightMaxKg) {
      status = "Above Healthy Weight";
      differenceToHealthyMaxKg = Number((currentWeightKg - healthyWeightMaxKg).toFixed(1));
    } else {
      status = "Healthy Weight";
      differenceToHealthyMaxKg = 0;
    }
  }

  return {
    healthyWeightMinKg,
    healthyWeightMaxKg,
    southAsianHealthyMinKg,
    southAsianHealthyMaxKg,
    ...(differenceToHealthyMaxKg !== undefined ? { differenceToHealthyMaxKg } : {}),
    status,
  };
}

// ---------------------------------------------------------------------------
// 9. CALORIES BURNED CALCULATOR (MET based)
// ---------------------------------------------------------------------------
export interface CaloriesBurnedResult {
  caloriesBurned: number;
  activityName: string;
  metValue: number;
  durationMinutes: number;
}

export const MET_ACTIVITIES: Record<string, { name: string; met: number }> = {
  walking_moderate: { name: "Walking (moderate, 4.8 km/h)", met: 3.5 },
  walking_brisk: { name: "Brisk Walking (6.0 km/h)", met: 4.3 },
  running_8km: { name: "Running (8 km/h / 5 mph)", met: 8.3 },
  running_10km: { name: "Running (10 km/h / 6.2 mph)", met: 9.8 },
  running_12km: { name: "Running (12 km/h / 7.5 mph)", met: 11.8 },
  cycling_moderate: { name: "Cycling (moderate, 20 km/h)", met: 7.5 },
  cycling_vigorous: { name: "Cycling (vigorous, >25 km/h)", met: 10.0 },
  swimming_moderate: { name: "Swimming (freestyle, moderate)", met: 7.0 },
  weight_training_moderate: { name: "Weight Training (moderate intensity)", met: 3.5 },
  weight_training_vigorous: { name: "Weight Training (vigorous / heavy)", met: 6.0 },
  hiit_circuit: { name: "HIIT / Circuit Training", met: 8.0 },
  jump_rope: { name: "Jump Rope (moderate to fast)", met: 11.5 },
  yoga: { name: "Yoga / Stretching", met: 2.8 },
  badminton: { name: "Badminton / Tennis", met: 7.0 },
  cricket: { name: "Cricket (batting/bowling/fielding)", met: 5.0 },
  football: { name: "Football / Soccer", met: 10.0 },
};

export function calculateCaloriesBurned(
  activityKey: string,
  weightKg: number,
  durationMinutes: number
): CaloriesBurnedResult {
  if (weightKg <= 0 || durationMinutes <= 0) {
    throw new RangeError("Weight and duration must be greater than 0");
  }

  const activity = MET_ACTIVITIES[activityKey] ?? MET_ACTIVITIES.running_10km;
  // Formula: MET * Weight(kg) * Duration(hrs)
  const durationHours = durationMinutes / 60;
  const burned = Math.round(activity.met * weightKg * durationHours);

  return {
    caloriesBurned: burned,
    activityName: activity.name,
    metValue: activity.met,
    durationMinutes,
  };
}

// ---------------------------------------------------------------------------
// 10. ONE REP MAX (1RM) CALCULATOR
// ---------------------------------------------------------------------------
export interface OneRepMaxResult {
  oneRepMaxBrzyckiKg: number;
  oneRepMaxEpleyKg: number;
  oneRepMaxLanderKg: number;
  averageOneRepMaxKg: number;
  percentages: Array<{
    percent: number;
    weightKg: number;
    recommendedReps: number;
  }>;
}

export function calculateOneRepMax(weightLiftedKg: number, reps: number): OneRepMaxResult {
  if (weightLiftedKg <= 0 || reps <= 0) {
    throw new RangeError("Weight lifted and reps must be positive numbers");
  }

  if (reps === 1) {
    const val = Number(weightLiftedKg.toFixed(1));
    return {
      oneRepMaxBrzyckiKg: val,
      oneRepMaxEpleyKg: val,
      oneRepMaxLanderKg: val,
      averageOneRepMaxKg: val,
      percentages: [
        { percent: 100, weightKg: val, recommendedReps: 1 },
        { percent: 95, weightKg: Number((val * 0.95).toFixed(1)), recommendedReps: 2 },
        { percent: 90, weightKg: Number((val * 0.9).toFixed(1)), recommendedReps: 4 },
        { percent: 85, weightKg: Number((val * 0.85).toFixed(1)), recommendedReps: 6 },
        { percent: 80, weightKg: Number((val * 0.8).toFixed(1)), recommendedReps: 8 },
        { percent: 75, weightKg: Number((val * 0.75).toFixed(1)), recommendedReps: 10 },
        { percent: 70, weightKg: Number((val * 0.7).toFixed(1)), recommendedReps: 12 },
        { percent: 65, weightKg: Number((val * 0.65).toFixed(1)), recommendedReps: 15 },
      ],
    };
  }

  // Brzycki: Weight / (1.0278 - 0.0278 * Reps)
  const brzycki = reps < 37 ? weightLiftedKg / (1.0278 - 0.0278 * reps) : weightLiftedKg * 2;
  // Epley: Weight * (1 + Reps / 30)
  const epley = weightLiftedKg * (1 + reps / 30);
  // Lander: (100 * Weight) / (101.3 - 2.67123 * Reps)
  const lander = reps < 37 ? (100 * weightLiftedKg) / (101.3 - 2.67123 * reps) : weightLiftedKg * 2;

  const avg = Number(((brzycki + epley + lander) / 3).toFixed(1));

  const percentages = [
    { percent: 100, weightKg: avg, recommendedReps: 1 },
    { percent: 95, weightKg: Number((avg * 0.95).toFixed(1)), recommendedReps: 2 },
    { percent: 90, weightKg: Number((avg * 0.9).toFixed(1)), recommendedReps: 4 },
    { percent: 85, weightKg: Number((avg * 0.85).toFixed(1)), recommendedReps: 6 },
    { percent: 80, weightKg: Number((avg * 0.8).toFixed(1)), recommendedReps: 8 },
    { percent: 75, weightKg: Number((avg * 0.75).toFixed(1)), recommendedReps: 10 },
    { percent: 70, weightKg: Number((avg * 0.7).toFixed(1)), recommendedReps: 12 },
    { percent: 65, weightKg: Number((avg * 0.65).toFixed(1)), recommendedReps: 15 },
  ];

  return {
    oneRepMaxBrzyckiKg: Number(brzycki.toFixed(1)),
    oneRepMaxEpleyKg: Number(epley.toFixed(1)),
    oneRepMaxLanderKg: Number(lander.toFixed(1)),
    averageOneRepMaxKg: avg,
    percentages,
  };
}

// ---------------------------------------------------------------------------
// 11. TARGET HEART RATE (THR) CALCULATOR
// ---------------------------------------------------------------------------
export interface HeartRateZone {
  zone: number;
  name: string;
  intensityPercentRange: string;
  minBpm: number;
  maxBpm: number;
  description: string;
}

export interface TargetHeartRateResult {
  maxHeartRateTanaka: number;
  maxHeartRateTraditional: number;
  restingHeartRate: number;
  zones: HeartRateZone[];
}

export function calculateTargetHeartRate(
  age: number,
  restingHeartRate: number = 70
): TargetHeartRateResult {
  if (age <= 0 || age > 120) throw new RangeError("Age must be between 1 and 120");

  // Tanaka equation (more accurate across age ranges): 208 - 0.7 * age
  const maxTanaka = Math.round(208 - 0.7 * age);
  const maxTraditional = Math.round(220 - age);

  // Karvonen formula if resting HR provided: (MaxHR - RestHR) * Intensity + RestHR
  const calcBpm = (intensity: number) => {
    return Math.round((maxTanaka - restingHeartRate) * intensity + restingHeartRate);
  };

  const zones: HeartRateZone[] = [
    {
      zone: 1,
      name: "Zone 1: Active Recovery",
      intensityPercentRange: "50% - 60%",
      minBpm: calcBpm(0.5),
      maxBpm: calcBpm(0.6),
      description: "Warm-up, active recovery, and gentle cardiovascular maintenance.",
    },
    {
      zone: 2,
      name: "Zone 2: Fat Burning & Base Aerobic",
      intensityPercentRange: "60% - 70%",
      minBpm: calcBpm(0.6),
      maxBpm: calcBpm(0.7),
      description: "Optimal zone for fat oxidation and mitochondrial aerobic base building.",
    },
    {
      zone: 3,
      name: "Zone 3: Aerobic Fitness",
      intensityPercentRange: "70% - 80%",
      minBpm: calcBpm(0.7),
      maxBpm: calcBpm(0.8),
      description: "Improves cardiovascular capacity and steady-state stamina.",
    },
    {
      zone: 4,
      name: "Zone 4: Anaerobic / Lactate Threshold",
      intensityPercentRange: "80% - 90%",
      minBpm: calcBpm(0.8),
      maxBpm: calcBpm(0.9),
      description: "Increases lactate tolerance, speed endurance, and athletic power.",
    },
    {
      zone: 5,
      name: "Zone 5: Maximum Performance",
      intensityPercentRange: "90% - 100%",
      minBpm: calcBpm(0.9),
      maxBpm: maxTanaka,
      description: "Peak sprint intervals, neuromuscular training, and maximum effort.",
    },
  ];

  return {
    maxHeartRateTanaka: maxTanaka,
    maxHeartRateTraditional: maxTraditional,
    restingHeartRate,
    zones,
  };
}

// ---------------------------------------------------------------------------
// 12. PERIOD & OVULATION CALCULATOR
// ---------------------------------------------------------------------------
export interface PeriodCyclePrediction {
  cycleNumber: number;
  periodStartDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodDate: string;
}

export interface PeriodResult {
  cycleLengthDays: number;
  periodDurationDays: number;
  nextPeriodStartDate: string;
  estimatedOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  upcomingCycles: PeriodCyclePrediction[];
}

export function calculatePeriod(
  lastPeriodStartDate: string, // YYYY-MM-DD
  cycleLengthDays: number = 28,
  periodDurationDays: number = 5
): PeriodResult {
  const startDate = new Date(lastPeriodStartDate);
  if (isNaN(startDate.getTime())) {
    throw new RangeError("Invalid start date");
  }
  if (cycleLengthDays < 20 || cycleLengthDays > 50) {
    throw new RangeError("Cycle length typically ranges from 20 to 50 days");
  }

  const addDays = (base: Date, days: number): Date => {
    const copy = new Date(base);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const formatDate = (d: Date): string => d.toISOString().split("T")[0];

  const upcomingCycles: PeriodCyclePrediction[] = [];

  for (let i = 1; i <= 3; i++) {
    const cycleStart = addDays(startDate, (i - 1) * cycleLengthDays);
    const nextStart = addDays(cycleStart, cycleLengthDays);
    const ovulation = addDays(cycleStart, cycleLengthDays - 14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);

    upcomingCycles.push({
      cycleNumber: i,
      periodStartDate: formatDate(cycleStart),
      ovulationDate: formatDate(ovulation),
      fertileWindowStart: formatDate(fertileStart),
      fertileWindowEnd: formatDate(fertileEnd),
      nextPeriodDate: formatDate(nextStart),
    });
  }

  const firstNext = upcomingCycles[0];

  return {
    cycleLengthDays,
    periodDurationDays,
    nextPeriodStartDate: upcomingCycles[1]?.periodStartDate || firstNext.nextPeriodDate,
    estimatedOvulationDate: firstNext.ovulationDate,
    fertileWindowStart: firstNext.fertileWindowStart,
    fertileWindowEnd: firstNext.fertileWindowEnd,
    upcomingCycles,
  };
}

// ---------------------------------------------------------------------------
// 13. MACRO CALCULATOR
// ---------------------------------------------------------------------------
export interface MacroResult {
  dailyCalories: number;
  proteinGrams: number;
  proteinCalories: number;
  proteinPercent: number;
  carbsGrams: number;
  carbsCalories: number;
  carbsPercent: number;
  fatGrams: number;
  fatCalories: number;
  fatPercent: number;
  dietPlanName: string;
}

export function calculateMacros(
  dailyCalories: number,
  dietType: "balanced" | "high-protein" | "low-carb" | "keto" = "balanced"
): MacroResult {
  if (dailyCalories <= 0) throw new RangeError("Daily calories must be greater than 0");

  let pPct = 0.3;
  let cPct = 0.45;
  let fPct = 0.25;
  let dietPlanName = "Balanced Nutrition";

  if (dietType === "high-protein") {
    pPct = 0.35;
    cPct = 0.4;
    fPct = 0.25;
    dietPlanName = "High-Protein Muscle Builder";
  } else if (dietType === "low-carb") {
    pPct = 0.35;
    cPct = 0.2;
    fPct = 0.45;
    dietPlanName = "Low Carbohydrate Athletic";
  } else if (dietType === "keto") {
    pPct = 0.2;
    cPct = 0.05;
    fPct = 0.75;
    dietPlanName = "Ketogenic Diet";
  }

  const proteinCalories = Math.round(dailyCalories * pPct);
  const carbsCalories = Math.round(dailyCalories * cPct);
  const fatCalories = Math.round(dailyCalories * fPct);

  return {
    dailyCalories,
    proteinGrams: Math.round(proteinCalories / 4),
    proteinCalories,
    proteinPercent: Math.round(pPct * 100),
    carbsGrams: Math.round(carbsCalories / 4),
    carbsCalories,
    carbsPercent: Math.round(cPct * 100),
    fatGrams: Math.round(fatCalories / 9),
    fatCalories,
    fatPercent: Math.round(fPct * 100),
    dietPlanName,
  };
}

// ---------------------------------------------------------------------------
// 14. CARBOHYDRATE CALCULATOR
// ---------------------------------------------------------------------------
export interface CarbohydrateResult {
  weightKg: number;
  intensityLevel: "light" | "moderate" | "heavy" | "endurance";
  gramsPerKg: number;
  recommendedCarbsGrams: number;
  caloriesFromCarbs: number;
  mealsBreakdownGrams: {
    threeMeals: number;
    fourMeals: number;
  };
}

export function calculateCarbohydrates(
  weightKg: number,
  intensityLevel: "light" | "moderate" | "heavy" | "endurance" = "moderate"
): CarbohydrateResult {
  if (weightKg <= 0) throw new RangeError("Weight must be greater than 0");

  let gramsPerKg = 4.0;
  if (intensityLevel === "light") gramsPerKg = 3.0; // Sedentary or light gym
  else if (intensityLevel === "moderate") gramsPerKg = 4.5; // 1 hr workout
  else if (intensityLevel === "heavy") gramsPerKg = 6.0; // 1-2 hr intense gym/training
  else if (intensityLevel === "endurance") gramsPerKg = 8.0; // 2+ hours daily athletic output

  const recommendedCarbsGrams = Math.round(weightKg * gramsPerKg);
  const caloriesFromCarbs = recommendedCarbsGrams * 4;

  return {
    weightKg,
    intensityLevel,
    gramsPerKg,
    recommendedCarbsGrams,
    caloriesFromCarbs,
    mealsBreakdownGrams: {
      threeMeals: Math.round(recommendedCarbsGrams / 3),
      fourMeals: Math.round(recommendedCarbsGrams / 4),
    },
  };
}

// ---------------------------------------------------------------------------
// 15. PROTEIN CALCULATOR
// ---------------------------------------------------------------------------
export interface ProteinResult {
  weightKg: number;
  goal: FitnessGoal;
  recommendedGramsPerKg: number;
  dailyProteinGrams: number;
  proteinCalories: number;
  mealDistribution: {
    threeMeals: number;
    fourMeals: number;
    fiveMeals: number;
  };
}

export function calculateProteinTarget(
  weightKg: number,
  goal: FitnessGoal = "muscle-gain"
): ProteinResult {
  if (weightKg <= 0) throw new RangeError("Weight must be greater than 0");

  let gramsPerKg = 1.8;
  if (goal === "fat-loss" || goal === "weight-loss") {
    gramsPerKg = 2.0; // Higher protein preserves lean mass in deficit
  } else if (goal === "muscle-gain") {
    gramsPerKg = 2.2; // Hypertrophy optimal range
  } else if (goal === "weight-gain") {
    gramsPerKg = 1.8;
  }

  const dailyProteinGrams = Math.round(weightKg * gramsPerKg);
  const proteinCalories = dailyProteinGrams * 4;

  return {
    weightKg,
    goal,
    recommendedGramsPerKg: gramsPerKg,
    dailyProteinGrams,
    proteinCalories,
    mealDistribution: {
      threeMeals: Math.round(dailyProteinGrams / 3),
      fourMeals: Math.round(dailyProteinGrams / 4),
      fiveMeals: Math.round(dailyProteinGrams / 5),
    },
  };
}

// ---------------------------------------------------------------------------
// 16. FAT INTAKE CALCULATOR
// ---------------------------------------------------------------------------
export interface FatIntakeResult {
  dailyCalories: number;
  recommendedFatGrams: number;
  caloriesFromFat: number;
  fatPercent: number;
  saturatedFatLimitGrams: number; // < 10% total calories
  heartHealthyFatGrams: number;
}

export function calculateFatIntake(
  dailyCalories: number,
  fatTier: "low-fat" | "moderate" | "keto" = "moderate"
): FatIntakeResult {
  if (dailyCalories <= 0) throw new RangeError("Calories must be greater than 0");

  let pct = 0.25;
  if (fatTier === "low-fat") pct = 0.18;
  else if (fatTier === "keto") pct = 0.7;

  const caloriesFromFat = Math.round(dailyCalories * pct);
  const recommendedFatGrams = Math.round(caloriesFromFat / 9);
  const saturatedFatLimitGrams = Math.round((dailyCalories * 0.08) / 9);
  const heartHealthyFatGrams = Math.max(0, recommendedFatGrams - saturatedFatLimitGrams);

  return {
    dailyCalories,
    recommendedFatGrams,
    caloriesFromFat,
    fatPercent: Math.round(pct * 100),
    saturatedFatLimitGrams,
    heartHealthyFatGrams,
  };
}

// ---------------------------------------------------------------------------
// 17. GFR CALCULATOR (Glomerular Filtration Rate - 2021 CKD-EPI Race-Free)
// ---------------------------------------------------------------------------
export interface GfrResult {
  gfr: number;
  stage: string;
  stageDescription: string;
  clinicalNote: string;
}

export function calculateGfr(
  gender: Gender,
  age: number,
  serumCreatinineMgDl: number
): GfrResult {
  if (age <= 0 || serumCreatinineMgDl <= 0) {
    throw new RangeError("Age and Serum Creatinine must be positive numbers");
  }

  // 2021 CKD-EPI Race-Free Refit equation
  let gfrRaw = 0;
  if (gender === "female") {
    const kappa = 0.7;
    const alpha = -0.241;
    const minRatio = Math.min(serumCreatinineMgDl / kappa, 1);
    const maxRatio = Math.max(serumCreatinineMgDl / kappa, 1);
    gfrRaw =
      142 *
      Math.pow(minRatio, alpha) *
      Math.pow(maxRatio, -1.2) *
      Math.pow(0.9938, age) *
      1.012;
  } else {
    const kappa = 0.9;
    const alpha = -0.302;
    const minRatio = Math.min(serumCreatinineMgDl / kappa, 1);
    const maxRatio = Math.max(serumCreatinineMgDl / kappa, 1);
    gfrRaw =
      142 *
      Math.pow(minRatio, alpha) *
      Math.pow(maxRatio, -1.2) *
      Math.pow(0.9938, age);
  }

  const gfr = Math.round(gfrRaw);

  let stage = "Stage 1 (Normal)";
  let stageDescription = "Normal or high kidney function (eGFR ≥ 90 mL/min/1.73m²)";

  if (gfr >= 90) {
    stage = "Stage 1 (Normal / Optimal)";
    stageDescription = "Normal kidney filtration";
  } else if (gfr >= 60 && gfr < 90) {
    stage = "Stage 2 (Mildly Decreased)";
    stageDescription = "Mild decrease in kidney filtration";
  } else if (gfr >= 45 && gfr < 60) {
    stage = "Stage 3a (Mild to Moderately Decreased)";
    stageDescription = "Mild to moderate filtration reduction";
  } else if (gfr >= 30 && gfr < 45) {
    stage = "Stage 3b (Moderately to Severely Decreased)";
    stageDescription = "Moderate to severe filtration reduction";
  } else if (gfr >= 15 && gfr < 30) {
    stage = "Stage 4 (Severely Decreased)";
    stageDescription = "Severe filtration impairment; specialist consultation advised";
  } else {
    stage = "Stage 5 (Kidney Failure)";
    stageDescription = "End-stage kidney disease; immediate medical attention required";
  }

  return {
    gfr,
    stage,
    stageDescription,
    clinicalNote:
      "Calculated via the 2021 CKD-EPI race-free equation. For clinical diagnosis or medication clearance, always consult your physician.",
  };
}

// ---------------------------------------------------------------------------
// 18. BODY TYPE CALCULATOR (Somatotype Classification)
// ---------------------------------------------------------------------------
export type Somatotype = "Ectomorph" | "Mesomorph" | "Endomorph";

export interface BodyTypeResult {
  somatotype: Somatotype;
  frameSize: "Small" | "Medium" | "Large";
  heightToWristRatio: number;
  dietAdvice: string;
  trainingAdvice: string;
}

export function calculateBodyType(
  gender: Gender,
  heightCm: number,
  wristCircumferenceCm: number
): BodyTypeResult {
  if (heightCm <= 0 || wristCircumferenceCm <= 0) {
    throw new RangeError("Height and wrist circumference must be positive numbers");
  }

  const ratio = Number((heightCm / wristCircumferenceCm).toFixed(2));

  let somatotype: Somatotype = "Mesomorph";
  let frameSize: "Small" | "Medium" | "Large" = "Medium";

  if (gender === "male") {
    if (ratio > 10.4) {
      somatotype = "Ectomorph";
      frameSize = "Small";
    } else if (ratio >= 9.6 && ratio <= 10.4) {
      somatotype = "Mesomorph";
      frameSize = "Medium";
    } else {
      somatotype = "Endomorph";
      frameSize = "Large";
    }
  } else {
    if (ratio > 10.9) {
      somatotype = "Ectomorph";
      frameSize = "Small";
    } else if (ratio >= 9.9 && ratio <= 10.9) {
      somatotype = "Mesomorph";
      frameSize = "Medium";
    } else {
      somatotype = "Endomorph";
      frameSize = "Large";
    }
  }

  let dietAdvice = "";
  let trainingAdvice = "";

  if (somatotype === "Ectomorph") {
    dietAdvice =
      "Higher carbohydrate tolerance (50-60% calories), caloric surplus needed to build muscle, frequent meals with protein density.";
    trainingAdvice =
      "Heavy compound weight training with lower volume and longer rest periods. Limit excess cardio to conserve muscle mass.";
  } else if (somatotype === "Mesomorph") {
    dietAdvice =
      "Balanced macro ratio (40% carbs, 30% protein, 30% fat). Responds exceptionally well to caloric moderation and progressive overload.";
    trainingAdvice =
      "Combination of strength training and moderate-intensity cardio/HIIT. Responds rapidly to hypertrophy stimulus.";
  } else {
    dietAdvice =
      "Moderate carb control (25-35% carbs, higher healthy fats and protein). Keep caloric deficits disciplined for fat loss.";
    trainingAdvice =
      "High-density resistance training, circuit workouts, and regular Zone-2 cardio to maximize daily caloric expenditure.";
  }

  return {
    somatotype,
    frameSize,
    heightToWristRatio: ratio,
    dietAdvice,
    trainingAdvice,
  };
}

// ---------------------------------------------------------------------------
// 19. BODY SURFACE AREA (BSA) CALCULATOR
// ---------------------------------------------------------------------------
export interface BsaResult {
  mostellerM2: number;
  duboisM2: number;
  haycockM2: number;
  gehanGeorgeM2: number;
  averageM2: number;
}

export function calculateBSA(heightCm: number, weightKg: number): BsaResult {
  if (heightCm <= 0 || weightKg <= 0) {
    throw new RangeError("Height and weight must be positive numbers");
  }

  // Mosteller Formula: sqrt((Height * Weight) / 3600)
  const mosteller = Math.sqrt((heightCm * weightKg) / 3600);

  // DuBois Formula: 0.007184 * Height^0.725 * Weight^0.425
  const dubois = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);

  // Haycock Formula: 0.024265 * Height^0.3964 * Weight^0.5378
  const haycock = 0.024265 * Math.pow(heightCm, 0.3964) * Math.pow(weightKg, 0.5378);

  // Gehan and George: 0.0235 * Height^0.42246 * Weight^0.51456
  const gehan = 0.0235 * Math.pow(heightCm, 0.42246) * Math.pow(weightKg, 0.51456);

  const avg = (mosteller + dubois + haycock + gehan) / 4;

  return {
    mostellerM2: Number(mosteller.toFixed(2)),
    duboisM2: Number(dubois.toFixed(2)),
    haycockM2: Number(haycock.toFixed(2)),
    gehanGeorgeM2: Number(gehan.toFixed(2)),
    averageM2: Number(avg.toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// 20. BLOOD ALCOHOL CONCENTRATION (BAC) CALCULATOR
// ---------------------------------------------------------------------------
export interface BacResult {
  bacPercent: number;
  status: "Sober / Negligible" | "Mild Impairment" | "Legally Intoxicated" | "Severe Impairment";
  legalToDriveIndia: boolean; // India limit is 0.03% (30mg / 100ml)
  hoursUntilSober: number;
  effects: string;
}

export function calculateBAC(
  drinksCount: number,
  weightKg: number,
  gender: Gender,
  hoursElapsed: number = 1,
  abvPercent: number = 5.0,
  drinkVolumeMl: number = 330
): BacResult {
  if (weightKg <= 0) throw new RangeError("Weight must be greater than 0");

  // Pure alcohol grams = Volume(ml) * (ABV / 100) * 0.789 (density of ethanol)
  const gramsPerDrink = drinkVolumeMl * (abvPercent / 100) * 0.789;
  const totalAlcoholGrams = drinksCount * gramsPerDrink;

  const weightGrams = weightKg * 1000;
  // Gender distribution ratio (Widmark r factor)
  const r = gender === "male" ? 0.68 : 0.55;

  // Widmark formula: [Alcohol(g) / (Weight(g) * r)] * 100 - (Beta * hours)
  const rawBac = (totalAlcoholGrams / (weightGrams * r)) * 100;
  const metabolismElimination = 0.015 * Math.max(0, hoursElapsed);
  const bacPercent = Number(Math.max(0, rawBac - metabolismElimination).toFixed(3));

  const hoursUntilSober = Number((bacPercent / 0.015).toFixed(1));
  const legalToDriveIndia = bacPercent < 0.03;

  let status: BacResult["status"] = "Sober / Negligible";
  let effects = "Normal behavior, no apparent impairment.";

  if (bacPercent >= 0.02 && bacPercent < 0.05) {
    status = "Mild Impairment";
    effects = "Mild euphoria, relaxation, slight loss of fine motor precision.";
  } else if (bacPercent >= 0.05 && bacPercent < 0.08) {
    status = "Legally Intoxicated";
    effects = "Noticeable impairment of coordination, slower reaction times, reduced alertness.";
  } else if (bacPercent >= 0.08) {
    status = "Severe Impairment";
    effects = "Gross motor impairment, slurred speech, severely delayed reaction time. NEVER drive.";
  }

  return {
    bacPercent,
    status,
    legalToDriveIndia,
    hoursUntilSober,
    effects,
  };
}
