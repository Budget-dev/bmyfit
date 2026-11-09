import { describe, it, expect } from "vitest";
import {
  calculateExtendedBmi,
  calculateBmr,
  calculateTdee,
  calculateIdealWeight,
  calculatePace,
  calculateArmyBodyFat,
  calculateLeanBodyMass,
  calculateHealthyWeight,
  calculateCaloriesBurned,
  calculateOneRepMax,
  calculateTargetHeartRate,
  calculatePeriod,
  calculateMacros,
  calculateCarbohydrates,
  calculateProteinTarget,
  calculateFatIntake,
  calculateGfr,
  calculateBodyType,
  calculateBSA,
  calculateBAC,
} from "@/features/calculator/extended-calculators";

describe("Extended Calculators Suite", () => {
  it("calculates extended BMI correctly with South Asian risk categories", () => {
    const res = calculateExtendedBmi(70, 175);
    expect(res.bmi).toBe(22.9);
    expect(res.category).toBe("Normal Weight");
    expect(res.southAsianCategory).toBe("Normal Weight");
    expect(res.healthyWeightMinKg).toBeGreaterThan(50);
    expect(res.healthyWeightMaxKg).toBeLessThan(80);

    const highRisk = calculateExtendedBmi(80, 175);
    expect(highRisk.bmi).toBe(26.1);
    expect(highRisk.category).toBe("Overweight");
    expect(highRisk.southAsianCategory).toBe("Increased Risk");
  });

  it("calculates BMR using Mifflin-St Jeor and Harris-Benedict", () => {
    const maleBmr = calculateBmr("male", 25, 175, 70);
    // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    expect(maleBmr.mifflinBmr).toBe(1674);
    expect(maleBmr.harrisBenedictBmr).toBeGreaterThan(1500);

    const femaleBmr = calculateBmr("female", 25, 165, 55);
    expect(femaleBmr.mifflinBmr).toBeLessThan(maleBmr.mifflinBmr);
  });

  it("calculates TDEE and caloric thresholds correctly", () => {
    const tdee = calculateTdee("male", 25, 175, 70, "moderately-active");
    expect(tdee.tdee).toBe(Math.round(tdee.bmr * 1.55));
    expect(tdee.weightLossCalories).toBe(tdee.tdee - 500);
    expect(tdee.muscleGainCalories).toBe(tdee.tdee + 500);
  });

  it("calculates Ideal Weight via Devine, Robinson, Miller, and Hamwi formulas", () => {
    // 175 cm is ~68.9 inches -> 8.9 inches over 5 feet
    const res = calculateIdealWeight("male", 175);
    expect(res.devineKg).toBeGreaterThan(65);
    expect(res.devineKg).toBeLessThan(75);
    expect(res.averageIdealKg).toBeGreaterThan(60);
    expect(res.healthyBmiRangeMinKg).toBeCloseTo(56.7, 0);
  });

  it("calculates running pace, speed, and splits accurately", () => {
    // 10 km in 50 minutes (3000 seconds) -> 5:00 min/km, 12 km/h
    const pace = calculatePace(10, 0, 50, 0);
    expect(pace.pacePerKm).toBe("5:00 min/km");
    expect(pace.speedKmh).toBe(12);
    expect(pace.splits.distance5k).toBe("25m 00s");
  });

  it("calculates US Army Body Fat and tests pass/exceed threshold", () => {
    const male = calculateArmyBodyFat("male", 24, 175, 40, 85);
    expect(male.bodyFatPercent).toBeGreaterThan(10);
    expect(male.bodyFatPercent).toBeLessThan(25);
    expect(male.maxAllowablePercent).toBe(22);
  });

  it("calculates Lean Body Mass via Boer and James formulas", () => {
    const lbm = calculateLeanBodyMass("male", 175, 70);
    expect(lbm.boerLbmKg).toBeGreaterThan(50);
    expect(lbm.boerLbmKg).toBeLessThan(65);
    expect(lbm.fatMassKg).toBeGreaterThan(5);
  });

  it("calculates Healthy Weight ranges and status", () => {
    const hw = calculateHealthyWeight(175, 70);
    expect(hw.status).toBe("Healthy Weight");
    expect(hw.differenceToHealthyMaxKg).toBe(0);

    const over = calculateHealthyWeight(175, 85);
    expect(over.status).toBe("Above Healthy Weight");
    expect(over.differenceToHealthyMaxKg).toBeGreaterThan(5);
  });

  it("calculates Calories Burned using MET values", () => {
    // 70kg person running 10km/h (MET 9.8) for 30 minutes (0.5 hr) -> 9.8 * 70 * 0.5 = 343 kcal
    const burned = calculateCaloriesBurned("running_10km", 70, 30);
    expect(burned.caloriesBurned).toBe(343);
  });

  it("calculates One Rep Max (1RM) using Brzycki and Epley", () => {
    // 80kg for 5 reps -> Brzycki: 80 / (1.0278 - 0.0278 * 5) = 80 / 0.8888 = 90.0 kg
    const orm = calculateOneRepMax(80, 5);
    expect(orm.oneRepMaxBrzyckiKg).toBeCloseTo(90, 0);
    expect(orm.averageOneRepMaxKg).toBeGreaterThan(85);
    expect(orm.percentages.length).toBe(8);
  });

  it("calculates Target Heart Rate zones with Tanaka equation", () => {
    // 30 yo -> Tanaka max: 208 - 0.7 * 30 = 187 bpm
    const thr = calculateTargetHeartRate(30, 65);
    expect(thr.maxHeartRateTanaka).toBe(187);
    expect(thr.zones.length).toBe(5);
    expect(thr.zones[0].zone).toBe(1);
    expect(thr.zones[4].zone).toBe(5);
  });

  it("predicts menstrual cycle and fertile windows", () => {
    const period = calculatePeriod("2026-11-01", 28, 5);
    expect(period.cycleLengthDays).toBe(28);
    expect(period.upcomingCycles.length).toBe(3);
    expect(period.estimatedOvulationDate).toBe("2026-11-15");
  });

  it("calculates macronutrient distribution by diet preference", () => {
    const macros = calculateMacros(2000, "balanced");
    expect(macros.dailyCalories).toBe(2000);
    expect(macros.proteinPercent).toBe(30);
    expect(macros.carbsPercent).toBe(45);
    expect(macros.fatPercent).toBe(25);

    const keto = calculateMacros(2000, "keto");
    expect(keto.fatPercent).toBe(75);
  });

  it("calculates carbohydrate targets based on activity intensity", () => {
    const carbs = calculateCarbohydrates(70, "moderate");
    expect(carbs.recommendedCarbsGrams).toBe(Math.round(70 * 4.5));
    expect(carbs.caloriesFromCarbs).toBe(carbs.recommendedCarbsGrams * 4);
  });

  it("calculates protein targets tailored for bodybuilding/fat loss", () => {
    const protein = calculateProteinTarget(70, "muscle-gain");
    expect(protein.dailyProteinGrams).toBe(Math.round(70 * 2.2));
    expect(protein.mealDistribution.threeMeals).toBeGreaterThan(40);
  });

  it("calculates dietary fat intake requirements", () => {
    const fat = calculateFatIntake(2000, "moderate");
    expect(fat.recommendedFatGrams).toBeGreaterThan(40);
    expect(fat.saturatedFatLimitGrams).toBeLessThan(fat.recommendedFatGrams);
  });

  it("calculates clinical GFR using 2021 CKD-EPI race-free equation", () => {
    // 30yo male with creatinine 0.8 mg/dL
    const gfrMale = calculateGfr("male", 30, 0.8);
    expect(gfrMale.gfr).toBeGreaterThan(90);
    expect(gfrMale.stage).toContain("Stage 1");

    // Elevated creatinine
    const gfrHighCreatinine = calculateGfr("male", 65, 2.5);
    expect(gfrHighCreatinine.gfr).toBeLessThan(60);
  });

  it("classifies Somatotype (Ectomorph, Mesomorph, Endomorph)", () => {
    // 180cm, 16cm wrist -> 180 / 16 = 11.25 -> Ectomorph
    const ecto = calculateBodyType("male", 180, 16);
    expect(ecto.somatotype).toBe("Ectomorph");

    // 175cm, 18cm wrist -> 175 / 18 = 9.72 -> Mesomorph
    const meso = calculateBodyType("male", 175, 18);
    expect(meso.somatotype).toBe("Mesomorph");

    // 170cm, 20cm wrist -> 170 / 20 = 8.5 -> Endomorph
    const endo = calculateBodyType("male", 170, 20);
    expect(endo.somatotype).toBe("Endomorph");
  });

  it("calculates Body Surface Area (BSA) via Mosteller and DuBois", () => {
    // 175cm, 70kg -> Mosteller: sqrt((175 * 70) / 3600) = sqrt(3.40277) = 1.84 m^2
    const bsa = calculateBSA(175, 70);
    expect(bsa.mostellerM2).toBe(1.84);
    expect(bsa.averageM2).toBeCloseTo(1.84, 1);
  });

  it("calculates Blood Alcohol Concentration (BAC) and time until sober", () => {
    // 2 beers (330ml 5% = ~13g each), 70kg male, 1 hour elapsed
    const bac = calculateBAC(2, 70, "male", 1, 5.0, 330);
    expect(bac.bacPercent).toBeGreaterThan(0.01);
    expect(bac.hoursUntilSober).toBeGreaterThan(0);
  });
});
