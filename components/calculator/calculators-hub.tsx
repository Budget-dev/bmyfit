"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { Gender, ActivityLevel, FitnessGoal } from "@/types/fitness";
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
  MET_ACTIVITIES,
} from "@/features/calculator/extended-calculators";

export type CalculatorId =
  | "bmi"
  | "calories"
  | "body_fat"
  | "bmr"
  | "ideal_weight"
  | "pace"
  | "army_body_fat"
  | "lean_body_mass"
  | "healthy_weight"
  | "calories_burned"
  | "one_rep_max"
  | "target_heart_rate"
  | "period"
  | "macros"
  | "carbohydrate"
  | "protein"
  | "fat_intake"
  | "tdee"
  | "gfr"
  | "body_type"
  | "bsa"
  | "bac";

interface CalculatorMeta {
  id: CalculatorId;
  name: string;
  category: "fitness" | "other";
  description: string;
  formulaNote: string;
  badge: string;
}

export const CALCULATORS_LIST: CalculatorMeta[] = [
  // FITNESS
  {
    id: "bmi",
    name: "BMI Calculator",
    category: "fitness",
    description: "Calculate your clinical Body Mass Index and South Asian metabolic cutoff.",
    formulaNote: "Weight (kg) / Height (m)² (WHO & South Asian calibrated)",
    badge: "Clinical Core",
  },
  {
    id: "calorie",
    name: "Calorie Calculator",
    category: "fitness",
    description: "Daily calorie targets tailored to fat loss, maintenance, or muscle gain.",
    formulaNote: "Mifflin-St Jeor BMR × Physical Activity Factor",
    badge: "Nutrition Core",
  } as unknown as CalculatorMeta,
  {
    id: "body_fat",
    name: "Body Fat Calculator",
    category: "fitness",
    description: "Accurate body fat percentage using US Navy circumference method.",
    formulaNote: "US Navy Anthropometric Hodgdon-Beckett Logarithmic Equation",
    badge: "Gold Standard",
  },
  {
    id: "bmr",
    name: "BMR Calculator",
    category: "fitness",
    description: "Basal Metabolic Rate: calories burned by your body at complete rest.",
    formulaNote: "Mifflin-St Jeor & Revised Harris-Benedict (1984)",
    badge: "Metabolism",
  },
  {
    id: "ideal_weight",
    name: "Ideal Weight Calculator",
    category: "fitness",
    description: "Target body weight based on Devine, Robinson, Miller, and Hamwi medical standards.",
    formulaNote: "Devine (1974) & Healthy BMI Range (18.5 - 24.9)",
    badge: "Anthropometry",
  },
  {
    id: "pace",
    name: "Pace Calculator",
    category: "fitness",
    description: "Running and walking pace, split times, speed in km/h, and race projections.",
    formulaNote: "Time / Distance (min/km, min/mi, 5K, 10K, Marathon splits)",
    badge: "Cardio & Running",
  },
  {
    id: "army_body_fat",
    name: "Army Body Fat Calculator",
    category: "fitness",
    description: "Official US DoD / Army Regulation 600-9 circumference body composition test.",
    formulaNote: "DoD AR 600-9 log10 Abdomen/Hip/Neck Circumference",
    badge: "Military Standard",
  },
  {
    id: "lean_body_mass",
    name: "Lean Body Mass Calculator",
    category: "fitness",
    description: "Weight of your body minus fat: Boer, James, and Hume clinical formulas.",
    formulaNote: "Boer (1984) & James (1976) Skeletal Lean Mass Equations",
    badge: "Body Composition",
  },
  {
    id: "healthy_weight",
    name: "Healthy Weight Calculator",
    category: "fitness",
    description: "Discover your optimal healthy weight range for South Asian and global health.",
    formulaNote: "WHO BMI Range 18.5–24.9 & South Asian 18.5–22.9 Bounds",
    badge: "Health Benchmark",
  },
  {
    id: "calories_burned",
    name: "Calories Burned Calculator",
    category: "fitness",
    description: "Calculate energy expended across 16 sports, gym exercises, and activities.",
    formulaNote: "Compendium of Physical Activities MET × Body Weight (kg) × Hours",
    badge: "Energy Expenditure",
  },
  {
    id: "one_rep_max",
    name: "One Rep Max (1RM) Calculator",
    category: "fitness",
    description: "Maximum weight you can lift for 1 rep with Brzycki and Epley equations.",
    formulaNote: "Brzycki (1993) & Epley (1985) Resistance Equations",
    badge: "Strength Training",
  },
  {
    id: "target_heart_rate",
    name: "Target Heart Rate Calculator",
    category: "fitness",
    description: "Target heart rate training zones for fat burning, cardio, and peak performance.",
    formulaNote: "Tanaka Equation (208 - 0.7 × Age) & Karvonen Reserve",
    badge: "Heart Zones",
  },

  // OTHER / NUTRITION & CLINICAL
  {
    id: "period",
    name: "Period & Ovulation Calculator",
    category: "other",
    description: "Menstrual cycle forecasting, next period dates, and estimated fertile window.",
    formulaNote: "Standard Luteal Phase Tracking (Cycle Length - 14 Days)",
    badge: "Women's Health",
  },
  {
    id: "macros",
    name: "Macro Calculator",
    category: "other",
    description: "Optimal daily protein, carb, and fat distribution for your fitness goals.",
    formulaNote: "Balanced, High-Protein, Low-Carb & Ketogenic Ratios",
    badge: "Diet & Macros",
  },
  {
    id: "carbohydrate",
    name: "Carbohydrate Calculator",
    category: "other",
    description: "Daily carb requirements in grams according to training intensity.",
    formulaNote: "ISSN & ACSM Guidelines (3.0g to 8.0g/kg body weight)",
    badge: "Nutrient Fuel",
  },
  {
    id: "protein",
    name: "Protein Calculator",
    category: "other",
    description: "Optimal daily protein intake and per-meal distribution for muscle & fat loss.",
    formulaNote: "ACSM / ISSN Hypertrophy & Satiety Protocols (1.2g to 2.4g/kg)",
    badge: "Muscle Synthesis",
  },
  {
    id: "fat_intake",
    name: "Fat Intake Calculator",
    category: "other",
    description: "Healthy dietary fat requirements, hormonal health, and saturated fat caps.",
    formulaNote: "AHA & WHO Dietary Guidelines (15% to 30% Daily Calories)",
    badge: "Lipid Balance",
  },
  {
    id: "tdee",
    name: "TDEE Calculator",
    category: "other",
    description: "Total Daily Energy Expenditure with maintenance, deficit, and surplus plans.",
    formulaNote: "Mifflin-St Jeor BMR × Physical Activity Factor",
    badge: "Daily Energy",
  },
  {
    id: "gfr",
    name: "GFR Calculator",
    category: "other",
    description: "Glomerular Filtration Rate kidney function based on 2021 CKD-EPI equation.",
    formulaNote: "2021 CKD-EPI Race-Free Serum Creatinine Refit Equation",
    badge: "Clinical Kidney",
  },
  {
    id: "body_type",
    name: "Body Type Calculator",
    category: "other",
    description: "Identify your somatotype: Ectomorph, Mesomorph, or Endomorph frame.",
    formulaNote: "Heath-Carter Anthropometric Height-to-Wrist Circumference Ratio",
    badge: "Somatotype",
  },
  {
    id: "bsa",
    name: "Body Surface Area (BSA) Calculator",
    category: "other",
    description: "Total external surface area of the body used in clinical dosage and metabolic index.",
    formulaNote: "Mosteller Formula: √((Height × Weight) / 3600)",
    badge: "Clinical Index",
  },
  {
    id: "bac",
    name: "BAC Calculator",
    category: "other",
    description: "Estimate Blood Alcohol Concentration, legal driving status, and time to sober.",
    formulaNote: "Widmark Equation with Gender Specific Volume Distribution",
    badge: "Physiology",
  },
];

export function CalculatorsHub({
  initialCalculator = "ideal_weight",
  onSelectCalculator,
}: {
  initialCalculator?: CalculatorId;
  onSelectCalculator?: (id: CalculatorId) => void;
}) {
  const [activeId, setActiveId] = useState<CalculatorId>(initialCalculator);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "fitness" | "other">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Shared Form Inputs
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number>(25);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderately-active");
  const [goal, setGoal] = useState<FitnessGoal>("muscle-gain");

  // Specific Calculator Inputs
  // Pace
  const [paceDistanceKm, setPaceDistanceKm] = useState<number>(10);
  const [paceHours, setPaceHours] = useState<number>(0);
  const [paceMinutes, setPaceMinutes] = useState<number>(50);
  const [paceSeconds, setPaceSeconds] = useState<number>(0);

  // Army Body Fat / Circumference
  const [neckCm, setNeckCm] = useState<number>(38);
  const [waistCm, setWaistCm] = useState<number>(82);
  const [hipCm, setHipCm] = useState<number>(95);

  // Calories Burned
  const [burnedActivityKey, setBurnedActivityKey] = useState<string>("running_10km");
  const [burnedDurationMins, setBurnedDurationMins] = useState<number>(45);

  // 1RM
  const [oneRepWeight, setOneRepWeight] = useState<number>(80);
  const [oneRepReps, setOneRepReps] = useState<number>(5);

  // Heart Rate
  const [restingHr, setRestingHr] = useState<number>(68);

  // Period
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(
    new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0]
  );
  const [cycleDays, setCycleDays] = useState<number>(28);

  // Diet / Macros
  const [dietCalories, setDietCalories] = useState<number>(2000);
  const [dietType, setDietType] = useState<"balanced" | "high-protein" | "low-carb" | "keto">("balanced");
  const [trainingIntensity, setTrainingIntensity] = useState<"light" | "moderate" | "heavy" | "endurance">("moderate");

  // Clinical GFR
  const [serumCreatinine, setSerumCreatinine] = useState<number>(0.9);

  // Body Type Wrist
  const [wristCm, setWristCm] = useState<number>(17.5);

  // BAC
  const [drinksCount, setDrinksCount] = useState<number>(2);
  const [drinkVolumeMl, setDrinkVolumeMl] = useState<number>(330);
  const [drinkAbv, setDrinkAbv] = useState<number>(5.0);
  const [hoursElapsed, setHoursElapsed] = useState<number>(1.5);

  const filteredList = useMemo(() => {
    return CALCULATORS_LIST.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  const activeMeta = useMemo(() => {
    return CALCULATORS_LIST.find((c) => c.id === activeId) || CALCULATORS_LIST[0];
  }, [activeId]);

  const handleSelect = (id: CalculatorId) => {
    setActiveId(id);
    if (onSelectCalculator) onSelectCalculator(id);
  };

  return (
    <div className="w-full text-gray-900">
      {/* Top Banner / Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e676]" />
              Health &amp; Fitness Calculators
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Explore 22 clinical, athletic, and nutritional calculation tools calibrated for your body.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculators..."
              className="w-full text-xs font-semibold px-3 py-2 pl-8 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-emerald-500 shadow-sm"
            />
            <svg
              className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === "all"
                ? "bg-[#042017] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Tools ({CALCULATORS_LIST.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("fitness")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === "fitness"
                ? "bg-[#042017] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Fitness (12)
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("other")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === "other"
                ? "bg-[#042017] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Nutrition &amp; Other (10)
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator Selection Pills / Carousel + Active Calculator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Scrollable Calculator List */}
        <div className="lg:col-span-5 space-y-2 max-h-[680px] overflow-y-auto pr-1">
          {filteredList.map((c) => {
            const isSelected = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-[#042017] text-white border-[#042017] shadow-md scale-[1.01]"
                    : "bg-white text-gray-800 border-gray-200/80 hover:border-emerald-500/50 hover:bg-emerald-50/30"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm truncate">{c.name}</span>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-emerald-500/30 text-[#00e676]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isSelected ? "text-emerald-100/80" : "text-gray-500"
                    }`}
                  >
                    {c.description}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected ? "bg-[#00e676] text-gray-950" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  →
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column (7 cols): Active Calculator Interactive Panel */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-card">
          <div className="border-b border-gray-100 pb-4 mb-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#e8f7ee] text-emerald-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
                {activeMeta.badge}
              </span>
              <span className="text-[11px] font-semibold text-gray-400">BMYFIT Medical Standards</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-2">{activeMeta.name}</h2>
            <p className="text-xs text-gray-600 mt-1">{activeMeta.description}</p>
            <div className="mt-2 text-[10.5px] font-mono text-emerald-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
              <span className="font-bold">Formula: </span>
              {activeMeta.formulaNote}
            </div>
          </div>

          {/* DYNAMIC CALCULATOR COMPONENT VIEW */}
          <div className="space-y-4">
            {/* 1. BMI */}
            {activeId === "bmi" && (
              <BmiCalculatorView
                heightCm={heightCm}
                weightKg={weightKg}
                setHeightCm={setHeightCm}
                setWeightKg={setWeightKg}
              />
            )}

            {/* 2. CALORIES / TDEE */}
            {(activeId === "calories" || activeId === "tdee") && (
              <TdeeCalculatorView
                gender={gender}
                age={age}
                heightCm={heightCm}
                weightKg={weightKg}
                activityLevel={activityLevel}
                setGender={setGender}
                setAge={setAge}
                setHeightCm={setHeightCm}
                setWeightKg={setWeightKg}
                setActivityLevel={setActivityLevel}
              />
            )}

            {/* 3. BODY FAT (Navy) */}
            {activeId === "body_fat" && (
              <NavyBodyFatView
                gender={gender}
                heightCm={heightCm}
                waistCm={waistCm}
                neckCm={neckCm}
                hipCm={hipCm}
                setGender={setGender}
                setHeightCm={setHeightCm}
                setWaistCm={setWaistCm}
                setNeckCm={setNeckCm}
                setHipCm={setHipCm}
              />
            )}

            {/* 4. BMR */}
            {activeId === "bmr" && (
              <BmrCalculatorView
                gender={gender}
                age={age}
                heightCm={heightCm}
                weightKg={weightKg}
                setGender={setGender}
                setAge={setAge}
                setHeightCm={setHeightCm}
                setWeightKg={setWeightKg}
              />
            )}

            {/* 5. IDEAL WEIGHT */}
            {activeId === "ideal_weight" && (
              <IdealWeightView
                gender={gender}
                heightCm={heightCm}
                setGender={setGender}
                setHeightCm={setHeightCm}
              />
            )}

            {/* 6. PACE */}
            {activeId === "pace" && (
              <PaceCalculatorView
                distanceKm={paceDistanceKm}
                hours={paceHours}
                minutes={paceMinutes}
                seconds={paceSeconds}
                setDistanceKm={setPaceDistanceKm}
                setHours={setPaceHours}
                setMinutes={setPaceMinutes}
                setSeconds={setPaceSeconds}
              />
            )}

            {/* 7. ARMY BODY FAT */}
            {activeId === "army_body_fat" && (
              <ArmyBodyFatView
                gender={gender}
                age={age}
                heightCm={heightCm}
                neckCm={neckCm}
                waistCm={waistCm}
                hipCm={hipCm}
                setGender={setGender}
                setAge={setAge}
                setHeightCm={setHeightCm}
                setNeckCm={setNeckCm}
                setWaistCm={setWaistCm}
                setHipCm={setHipCm}
              />
            )}

            {/* 8. LEAN BODY MASS */}
            {activeId === "lean_body_mass" && (
              <LeanBodyMassView
                gender={gender}
                heightCm={heightCm}
                weightKg={weightKg}
                setGender={setGender}
                setHeightCm={setHeightCm}
                setWeightKg={setWeightKg}
              />
            )}

            {/* 9. HEALTHY WEIGHT */}
            {activeId === "healthy_weight" && (
              <HealthyWeightView
                heightCm={heightCm}
                weightKg={weightKg}
                setHeightCm={setHeightCm}
                setWeightKg={setWeightKg}
              />
            )}

            {/* 10. CALORIES BURNED */}
            {activeId === "calories_burned" && (
              <CaloriesBurnedView
                activityKey={burnedActivityKey}
                weightKg={weightKg}
                durationMinutes={burnedDurationMins}
                setActivityKey={setBurnedActivityKey}
                setWeightKg={setWeightKg}
                setDurationMinutes={setBurnedDurationMins}
              />
            )}

            {/* 11. ONE REP MAX */}
            {activeId === "one_rep_max" && (
              <OneRepMaxView
                weightLiftedKg={oneRepWeight}
                reps={oneRepReps}
                setWeightLiftedKg={setOneRepWeight}
                setReps={setOneRepReps}
              />
            )}

            {/* 12. TARGET HEART RATE */}
            {activeId === "target_heart_rate" && (
              <TargetHeartRateView
                age={age}
                restingHr={restingHr}
                setAge={setAge}
                setRestingHr={setRestingHr}
              />
            )}

            {/* 13. PERIOD */}
            {activeId === "period" && (
              <PeriodView
                lastPeriodDate={lastPeriodDate}
                cycleDays={cycleDays}
                setLastPeriodDate={setLastPeriodDate}
                setCycleDays={setCycleDays}
              />
            )}

            {/* 14. MACROS */}
            {activeId === "macros" && (
              <MacroCalculatorView
                calories={dietCalories}
                dietType={dietType}
                setCalories={setDietCalories}
                setDietType={setDietType}
              />
            )}

            {/* 15. CARBOHYDRATE */}
            {activeId === "carbohydrate" && (
              <CarbohydrateView
                weightKg={weightKg}
                intensity={trainingIntensity}
                setWeightKg={setWeightKg}
                setIntensity={setTrainingIntensity}
              />
            )}

            {/* 16. PROTEIN */}
            {activeId === "protein" && (
              <ProteinView
                weightKg={weightKg}
                goal={goal}
                setWeightKg={setWeightKg}
                setGoal={setGoal}
              />
            )}

            {/* 17. FAT INTAKE */}
            {activeId === "fat_intake" && (
              <FatIntakeView
                calories={dietCalories}
                setCalories={setDietCalories}
              />
            )}

            {/* 18. GFR */}
            {activeId === "gfr" && (
              <GfrCalculatorView
                gender={gender}
                age={age}
                serumCreatinine={serumCreatinine}
                setGender={setGender}
                setAge={setAge}
                setSerumCreatinine={setSerumCreatinine}
              />
            )}

            {/* 19. BODY TYPE */}
            {activeId === "body_type" && (
              <BodyTypeView
                gender={gender}
                heightCm={heightCm}
                wristCm={wristCm}
                setGender={setGender}
                setHeightCm={setHeightCm}
                setWristCm={setWristCm}
              />
            )}

            {/* 20. BSA */}
            {activeId === "bsa" && (
              <BsaView
                heightCm={heightCm}
                weightKg={weightKg}
                setHeightCm={setHeightCm}
                setWeightKg={setWeightKg}
              />
            )}

            {/* 21. BAC */}
            {activeId === "bac" && (
              <BacView
                drinksCount={drinksCount}
                drinkVolumeMl={drinkVolumeMl}
                drinkAbv={drinkAbv}
                hoursElapsed={hoursElapsed}
                weightKg={weightKg}
                gender={gender}
                setDrinksCount={setDrinksCount}
                setDrinkVolumeMl={setDrinkVolumeMl}
                setDrinkAbv={setDrinkAbv}
                setHoursElapsed={setHoursElapsed}
                setWeightKg={setWeightKg}
                setGender={setGender}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-VIEWS
// ---------------------------------------------------------------------------

function BmiCalculatorView({
  heightCm,
  weightKg,
  setHeightCm,
  setWeightKg,
}: {
  heightCm: number;
  weightKg: number;
  setHeightCm: (v: number) => void;
  setWeightKg: (v: number) => void;
}) {
  const result = useMemo(() => {
    try {
      return calculateExtendedBmi(weightKg, heightCm);
    } catch {
      return null;
    }
  }, [weightKg, heightCm]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Calculated BMI</span>
            <span className="text-2xl font-black text-gray-950">{result.bmi}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border">
              <span className="text-gray-500 font-semibold block text-[10px]">Global WHO Category</span>
              <span className="font-extrabold text-emerald-700">{result.category}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border">
              <span className="text-gray-500 font-semibold block text-[10px]">South Asian Cutoff</span>
              <span className="font-extrabold text-emerald-700">{result.southAsianCategory}</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Healthy weight range for your height:{" "}
            <span className="font-bold text-gray-900">
              {result.healthyWeightMinKg} kg – {result.healthyWeightMaxKg} kg
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function IdealWeightView({
  gender,
  heightCm,
  setGender,
  setHeightCm,
}: {
  gender: Gender;
  heightCm: number;
  setGender: (g: Gender) => void;
  setHeightCm: (h: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateIdealWeight(gender, heightCm);
    } catch {
      return null;
    }
  }, [gender, heightCm]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                gender === "male" ? "bg-[#042017] text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                gender === "female" ? "bg-[#042017] text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Female
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Average Clinical Ideal Weight
              </span>
              <span className="text-2xl font-black text-gray-950">{res.averageIdealKg} kg</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              4 Formula Consensus
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Devine (1974)</span>
              <span className="font-extrabold text-gray-900">{res.devineKg} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Robinson (1983)</span>
              <span className="font-extrabold text-gray-900">{res.robinsonKg} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Miller (1983)</span>
              <span className="font-extrabold text-gray-900">{res.millerKg} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Hamwi (1964)</span>
              <span className="font-extrabold text-gray-900">{res.hamwiKg} kg</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border">
            Healthy BMI weight range: <span className="font-bold">{res.healthyBmiRangeMinKg} kg – {res.healthyBmiRangeMaxKg} kg</span> (South Asian upper bound: {res.southAsianHealthyMaxKg} kg)
          </div>
        </div>
      )}
    </div>
  );
}

function PaceCalculatorView({
  distanceKm,
  hours,
  minutes,
  seconds,
  setDistanceKm,
  setHours,
  setMinutes,
  setSeconds,
}: {
  distanceKm: number;
  hours: number;
  minutes: number;
  seconds: number;
  setDistanceKm: (d: number) => void;
  setHours: (h: number) => void;
  setMinutes: (m: number) => void;
  setSeconds: (s: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculatePace(distanceKm, hours, minutes, seconds);
    } catch {
      return null;
    }
  }, [distanceKm, hours, minutes, seconds]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Hours</label>
          <input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Minutes</label>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Seconds</label>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pace per Kilometer</span>
              <span className="text-2xl font-black text-gray-950">{res.pacePerKm}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Average Speed</span>
              <span className="text-2xl font-black text-emerald-600">{res.speedKmh} km/h</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border space-y-1.5 text-xs">
            <span className="text-[11px] font-extrabold text-gray-900 block">Projected Race Splits:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>5K: <span className="font-bold">{res.splits.distance5k}</span></div>
              <div>10K: <span className="font-bold">{res.splits.distance10k}</span></div>
              <div>Half Marathon: <span className="font-bold">{res.splits.halfMarathon}</span></div>
              <div>Marathon: <span className="font-bold">{res.splits.marathon}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TdeeCalculatorView({
  gender,
  age,
  heightCm,
  weightKg,
  activityLevel,
  setGender,
  setAge,
  setHeightCm,
  setWeightKg,
  setActivityLevel,
}: {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  setGender: (g: Gender) => void;
  setAge: (a: number) => void;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
  setActivityLevel: (l: ActivityLevel) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateTdee(gender, age, heightCm, weightKg, activityLevel);
    } catch {
      return null;
    }
  }, [gender, age, heightCm, weightKg, activityLevel]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-700">Activity Level</label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
        >
          <option value="sedentary">Sedentary (Little or no exercise)</option>
          <option value="lightly-active">Lightly Active (1-3 days/week exercise)</option>
          <option value="moderately-active">Moderately Active (3-5 days/week moderate gym)</option>
          <option value="very-active">Very Active (6-7 days/week hard exercise)</option>
        </select>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Daily Maintenance (TDEE)</span>
              <span className="text-3xl font-black text-gray-950">{res.tdee} kcal</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 block">Basal Metabolic Rate</span>
              <span className="text-sm font-extrabold text-gray-700">{res.bmr} kcal/day</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Weight Loss (-500 kcal)</span>
              <span className="font-black text-rose-600">{res.weightLossCalories} kcal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Maintenance</span>
              <span className="font-black text-emerald-600">{res.maintenanceCalories} kcal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border">
              <span className="text-gray-400 text-[10px] block font-semibold">Muscle Gain (+500 kcal)</span>
              <span className="font-black text-blue-600">{res.muscleGainCalories} kcal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BmrCalculatorView({
  gender,
  age,
  heightCm,
  weightKg,
  setGender,
  setAge,
  setHeightCm,
  setWeightKg,
}: {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  setGender: (g: Gender) => void;
  setAge: (a: number) => void;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateBmr(gender, age, heightCm, weightKg);
    } catch {
      return null;
    }
  }, [gender, age, heightCm, weightKg]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Mifflin-St Jeor BMR</span>
              <span className="text-3xl font-black text-gray-950">{res.mifflinBmr} kcal/day</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 block">Resting Burn Rate</span>
              <span className="text-sm font-extrabold text-emerald-600">{res.hourlyCalories} kcal/hour</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border text-xs text-gray-600">
            Revised Harris-Benedict Formula: <span className="font-bold text-gray-900">{res.harrisBenedictBmr} kcal/day</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavyBodyFatView({
  gender,
  heightCm,
  waistCm,
  neckCm,
  hipCm,
  setGender,
  setHeightCm,
  setWaistCm,
  setNeckCm,
  setHipCm,
}: {
  gender: Gender;
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipCm: number;
  setGender: (g: Gender) => void;
  setHeightCm: (h: number) => void;
  setWaistCm: (w: number) => void;
  setNeckCm: (n: number) => void;
  setHipCm: (hip: number) => void;
}) {
  const result = useMemo(() => {
    try {
      if (gender === "male") {
        const raw = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
        return Number(raw.toFixed(1));
      } else {
        const raw = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
        return Number(raw.toFixed(1));
      }
    } catch {
      return null;
    }
  }, [gender, heightCm, waistCm, neckCm, hipCm]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Neck (cm)</label>
          <input
            type="number"
            value={neckCm}
            onChange={(e) => setNeckCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Waist (cm)</label>
          <input
            type="number"
            value={waistCm}
            onChange={(e) => setWaistCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {gender === "female" && (
        <div>
          <label className="text-xs font-bold text-gray-700">Hip (cm) - Required for females</label>
          <input
            type="number"
            value={hipCm}
            onChange={(e) => setHipCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      )}

      {result !== null && Number.isFinite(result) && result > 0 && result < 70 && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">US Navy Body Fat</span>
            <span className="text-3xl font-black text-gray-950">{result}%</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
            Clinical Circumference Method
          </span>
        </div>
      )}
    </div>
  );
}

function ArmyBodyFatView({
  gender,
  age,
  heightCm,
  neckCm,
  waistCm,
  hipCm,
  setGender,
  setAge,
  setHeightCm,
  setNeckCm,
  setWaistCm,
  setHipCm,
}: {
  gender: Gender;
  age: number;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm: number;
  setGender: (g: Gender) => void;
  setAge: (a: number) => void;
  setHeightCm: (h: number) => void;
  setNeckCm: (n: number) => void;
  setWaistCm: (w: number) => void;
  setHipCm: (hip: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateArmyBodyFat(gender, age, heightCm, neckCm, waistCm, gender === "female" ? hipCm : undefined);
    } catch {
      return null;
    }
  }, [gender, age, heightCm, neckCm, waistCm, hipCm]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Neck (cm)</label>
          <input
            type="number"
            value={neckCm}
            onChange={(e) => setNeckCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Waist (cm)</label>
          <input
            type="number"
            value={waistCm}
            onChange={(e) => setWaistCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        {gender === "female" && (
          <div>
            <label className="text-xs font-bold text-gray-700">Hip (cm)</label>
            <input
              type="number"
              value={hipCm}
              onChange={(e) => setHipCm(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
            />
          </div>
        )}
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Army Body Fat %</span>
              <span className="text-3xl font-black text-gray-950">{res.bodyFatPercent}%</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${
                res.category === "Passes Standard"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {res.category} (Limit: {res.maxAllowablePercent}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function LeanBodyMassView({
  gender,
  heightCm,
  weightKg,
  setGender,
  setHeightCm,
  setWeightKg,
}: {
  gender: Gender;
  heightCm: number;
  weightKg: number;
  setGender: (g: Gender) => void;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateLeanBodyMass(gender, heightCm, weightKg);
    } catch {
      return null;
    }
  }, [gender, heightCm, weightKg]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-2xl border text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Boer Lean Mass</span>
              <span className="text-2xl font-black text-emerald-600">{res.boerLbmKg} kg</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Fat Mass</span>
              <span className="text-2xl font-black text-rose-500">{res.fatMassKg} kg</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            James Formula: {res.jamesLbmKg} kg | Hume Formula: {res.humeLbmKg} kg
          </div>
        </div>
      )}
    </div>
  );
}

function HealthyWeightView({
  heightCm,
  weightKg,
  setHeightCm,
  setWeightKg,
}: {
  heightCm: number;
  weightKg: number;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateHealthyWeight(heightCm, weightKg);
    } catch {
      return null;
    }
  }, [heightCm, weightKg]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Current Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Weight Status</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              {res.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border">
              <span className="text-gray-400 text-[10px] block font-semibold">Global WHO Healthy Range</span>
              <span className="font-black text-gray-950">{res.healthyWeightMinKg} – {res.healthyWeightMaxKg} kg</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border">
              <span className="text-gray-400 text-[10px] block font-semibold">South Asian Optimal Target</span>
              <span className="font-black text-emerald-700">{res.southAsianHealthyMinKg} – {res.southAsianHealthyMaxKg} kg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CaloriesBurnedView({
  activityKey,
  weightKg,
  durationMinutes,
  setActivityKey,
  setWeightKg,
  setDurationMinutes,
}: {
  activityKey: string;
  weightKg: number;
  durationMinutes: number;
  setActivityKey: (k: string) => void;
  setWeightKg: (w: number) => void;
  setDurationMinutes: (d: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateCaloriesBurned(activityKey, weightKg, durationMinutes);
    } catch {
      return null;
    }
  }, [activityKey, weightKg, durationMinutes]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-700">Select Activity</label>
        <select
          value={activityKey}
          onChange={(e) => setActivityKey(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
        >
          {Object.entries(MET_ACTIVITIES).map(([key, act]) => (
            <option key={key} value={key}>
              {act.name} (MET: {act.met})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Body Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Duration (Minutes)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estimated Burned Energy</span>
            <span className="text-3xl font-black text-emerald-600">{res.caloriesBurned} kcal</span>
          </div>
          <span className="text-xs text-gray-500 font-bold">
            {durationMinutes} mins of {res.activityName}
          </span>
        </div>
      )}
    </div>
  );
}

function OneRepMaxView({
  weightLiftedKg,
  reps,
  setWeightLiftedKg,
  setReps,
}: {
  weightLiftedKg: number;
  reps: number;
  setWeightLiftedKg: (w: number) => void;
  setReps: (r: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateOneRepMax(weightLiftedKg, reps);
    } catch {
      return null;
    }
  }, [weightLiftedKg, reps]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Weight Lifted (kg)</label>
          <input
            type="number"
            value={weightLiftedKg}
            onChange={(e) => setWeightLiftedKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Reps Completed</label>
          <input
            type="number"
            min="1"
            max="30"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estimated 1RM (Max Lift)</span>
              <span className="text-3xl font-black text-gray-950">{res.averageOneRepMaxKg} kg</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-gray-400 block font-semibold">Brzycki Formula</span>
              <span className="font-extrabold text-emerald-700">{res.oneRepMaxBrzyckiKg} kg</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t">
            <span className="text-xs font-bold text-gray-700 block">Training Percentages:</span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10.5px]">
              {res.percentages.slice(0, 4).map((p) => (
                <div key={p.percent} className="p-1.5 bg-white rounded-lg border">
                  <span className="text-gray-400 block">{p.percent}%</span>
                  <span className="font-black text-gray-900">{p.weightKg} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetHeartRateView({
  age,
  restingHr,
  setAge,
  setRestingHr,
}: {
  age: number;
  restingHr: number;
  setAge: (a: number) => void;
  setRestingHr: (r: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateTargetHeartRate(age, restingHr);
    } catch {
      return null;
    }
  }, [age, restingHr]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Resting Heart Rate (bpm)</label>
          <input
            type="number"
            value={restingHr}
            onChange={(e) => setRestingHr(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Heart Rate (Tanaka)</span>
            <span className="text-2xl font-black text-gray-950">{res.maxHeartRateTanaka} BPM</span>
          </div>

          <div className="space-y-1.5">
            {res.zones.map((z) => (
              <div key={z.zone} className="p-2 bg-white rounded-xl border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900">{z.name}</span>
                  <span className="text-[10px] text-gray-400 block">{z.intensityPercentRange}</span>
                </div>
                <span className="font-extrabold text-emerald-700">{z.minBpm} – {z.maxBpm} BPM</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PeriodView({
  lastPeriodDate,
  cycleDays,
  setLastPeriodDate,
  setCycleDays,
}: {
  lastPeriodDate: string;
  cycleDays: number;
  setLastPeriodDate: (d: string) => void;
  setCycleDays: (c: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculatePeriod(lastPeriodDate, cycleDays);
    } catch {
      return null;
    }
  }, [lastPeriodDate, cycleDays]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">First Day of Last Period</label>
          <input
            type="date"
            value={lastPeriodDate}
            onChange={(e) => setLastPeriodDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Average Cycle Length (Days)</label>
          <input
            type="number"
            min="20"
            max="45"
            value={cycleDays}
            onChange={(e) => setCycleDays(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-center">
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Next Expected Period</span>
              <span className="text-base font-black text-rose-500">{res.nextPeriodStartDate}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Estimated Ovulation</span>
              <span className="text-base font-black text-purple-600">{res.estimatedOvulationDate}</span>
            </div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border text-xs text-gray-600">
            Fertile Window: <span className="font-bold text-gray-900">{res.fertileWindowStart} to {res.fertileWindowEnd}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MacroCalculatorView({
  calories,
  dietType,
  setCalories,
  setDietType,
}: {
  calories: number;
  dietType: "balanced" | "high-protein" | "low-carb" | "keto";
  setCalories: (c: number) => void;
  setDietType: (d: "balanced" | "high-protein" | "low-carb" | "keto") => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateMacros(calories, dietType);
    } catch {
      return null;
    }
  }, [calories, dietType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Daily Calorie Target</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Dietary Preference</label>
          <select
            value={dietType}
            onChange={(e) => setDietType(e.target.value as "balanced" | "high-protein" | "low-carb" | "keto")}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="balanced">Balanced (45C / 30P / 25F)</option>
            <option value="high-protein">High-Protein (40C / 35P / 25F)</option>
            <option value="low-carb">Low-Carb (20C / 35P / 45F)</option>
            <option value="keto">Ketogenic (5C / 20P / 75F)</option>
          </select>
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-blue-500 uppercase block">Protein ({res.proteinPercent}%)</span>
              <span className="text-xl font-black text-gray-950">{res.proteinGrams}g</span>
              <span className="text-[10px] text-gray-400 block">{res.proteinCalories} kcal</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-emerald-500 uppercase block">Carbs ({res.carbsPercent}%)</span>
              <span className="text-xl font-black text-gray-950">{res.carbsGrams}g</span>
              <span className="text-[10px] text-gray-400 block">{res.carbsCalories} kcal</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border">
              <span className="text-[10px] font-bold text-amber-500 uppercase block">Fat ({res.fatPercent}%)</span>
              <span className="text-xl font-black text-gray-950">{res.fatGrams}g</span>
              <span className="text-[10px] text-gray-400 block">{res.fatCalories} kcal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CarbohydrateView({
  weightKg,
  intensity,
  setWeightKg,
  setIntensity,
}: {
  weightKg: number;
  intensity: "light" | "moderate" | "heavy" | "endurance";
  setWeightKg: (w: number) => void;
  setIntensity: (i: "light" | "moderate" | "heavy" | "endurance") => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateCarbohydrates(weightKg, intensity);
    } catch {
      return null;
    }
  }, [weightKg, intensity]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Body Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Training Intensity</label>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as "light" | "moderate" | "heavy" | "endurance")}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="light">Light (3g/kg)</option>
            <option value="moderate">Moderate 1hr Gym (4.5g/kg)</option>
            <option value="heavy">Heavy 1-2hr Intense (6g/kg)</option>
            <option value="endurance">Endurance Athlete (8g/kg)</option>
          </select>
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Recommended Carbs</span>
              <span className="text-3xl font-black text-gray-950">{res.recommendedCarbsGrams}g/day</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-700">{res.caloriesFromCarbs} kcal</span>
          </div>
          <div className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border">
            Per-meal distribution: ~{res.mealsBreakdownGrams.threeMeals}g across 3 meals or ~{res.mealsBreakdownGrams.fourMeals}g across 4 meals.
          </div>
        </div>
      )}
    </div>
  );
}

function ProteinView({
  weightKg,
  goal,
  setWeightKg,
  setGoal,
}: {
  weightKg: number;
  goal: FitnessGoal;
  setWeightKg: (w: number) => void;
  setGoal: (g: FitnessGoal) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateProteinTarget(weightKg, goal);
    } catch {
      return null;
    }
  }, [weightKg, goal]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Body Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as FitnessGoal)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="muscle-gain">Muscle Gain (Hypertrophy 2.2g/kg)</option>
            <option value="fat-loss">Fat Loss Preserving Muscle (2.0g/kg)</option>
            <option value="weight-loss">Weight Loss (1.8g/kg)</option>
            <option value="weight-gain">Weight Gain (1.8g/kg)</option>
          </select>
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Daily Protein Target</span>
              <span className="text-3xl font-black text-gray-950">{res.dailyProteinGrams}g/day</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
              {res.recommendedGramsPerKg}g per kg
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-white rounded-xl border">
              <span className="text-gray-400 text-[10px] block">3 Meals</span>
              <span className="font-black text-gray-900">{res.mealDistribution.threeMeals}g / meal</span>
            </div>
            <div className="p-2 bg-white rounded-xl border">
              <span className="text-gray-400 text-[10px] block">4 Meals</span>
              <span className="font-black text-gray-900">{res.mealDistribution.fourMeals}g / meal</span>
            </div>
            <div className="p-2 bg-white rounded-xl border">
              <span className="text-gray-400 text-[10px] block">5 Meals</span>
              <span className="font-black text-gray-900">{res.mealDistribution.fiveMeals}g / meal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FatIntakeView({
  calories,
  setCalories,
}: {
  calories: number;
  setCalories: (c: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateFatIntake(calories, "moderate");
    } catch {
      return null;
    }
  }, [calories]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-700">Daily Calories</label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(Number(e.target.value))}
          className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
        />
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Recommended Fat</span>
              <span className="text-3xl font-black text-gray-950">{res.recommendedFatGrams}g/day</span>
            </div>
            <span className="text-xs font-extrabold text-amber-700">{res.caloriesFromFat} kcal (25%)</span>
          </div>
          <div className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border">
            Saturated fat limit: <span className="font-bold">&lt; {res.saturatedFatLimitGrams}g</span> | Focus on healthy unsaturated fats: <span className="font-bold">~{res.heartHealthyFatGrams}g</span>
          </div>
        </div>
      )}
    </div>
  );
}

function GfrCalculatorView({
  gender,
  age,
  serumCreatinine,
  setGender,
  setAge,
  setSerumCreatinine,
}: {
  gender: Gender;
  age: number;
  serumCreatinine: number;
  setGender: (g: Gender) => void;
  setAge: (a: number) => void;
  setSerumCreatinine: (c: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateGfr(gender, age, serumCreatinine);
    } catch {
      return null;
    }
  }, [gender, age, serumCreatinine]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Creatinine (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            value={serumCreatinine}
            onChange={(e) => setSerumCreatinine(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estimated GFR</span>
              <span className="text-3xl font-black text-gray-950">{res.gfr} mL/min/1.73m²</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              {res.stage}
            </span>
          </div>
          <p className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border">
            {res.stageDescription}. {res.clinicalNote}
          </p>
        </div>
      )}
    </div>
  );
}

function BodyTypeView({
  gender,
  heightCm,
  wristCm,
  setGender,
  setHeightCm,
  setWristCm,
}: {
  gender: Gender;
  heightCm: number;
  wristCm: number;
  setGender: (g: Gender) => void;
  setHeightCm: (h: number) => void;
  setWristCm: (w: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateBodyType(gender, heightCm, wristCm);
    } catch {
      return null;
    }
  }, [gender, heightCm, wristCm]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Wrist (cm)</label>
          <input
            type="number"
            step="0.5"
            value={wristCm}
            onChange={(e) => setWristCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Your Somatotype</span>
              <span className="text-2xl font-black text-gray-950">{res.somatotype} ({res.frameSize} Frame)</span>
            </div>
            <span className="text-xs font-bold text-gray-500">Ratio: {res.heightToWristRatio}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border space-y-1 text-xs">
            <div><span className="font-bold text-emerald-800">Diet Strategy: </span>{res.dietAdvice}</div>
            <div><span className="font-bold text-blue-800">Training Strategy: </span>{res.trainingAdvice}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function BsaView({
  heightCm,
  weightKg,
  setHeightCm,
  setWeightKg,
}: {
  heightCm: number;
  weightKg: number;
  setHeightCm: (h: number) => void;
  setWeightKg: (w: number) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateBSA(heightCm, weightKg);
    } catch {
      return null;
    }
  }, [heightCm, weightKg]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-sm"
          />
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Mosteller Body Surface Area</span>
              <span className="text-3xl font-black text-gray-950">{res.mostellerM2} m²</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              Clinical Gold Standard
            </span>
          </div>
          <div className="text-xs text-gray-500 bg-white p-2.5 rounded-xl border">
            DuBois Formula: {res.duboisM2} m² | Haycock Formula: {res.haycockM2} m²
          </div>
        </div>
      )}
    </div>
  );
}

function BacView({
  drinksCount,
  drinkVolumeMl,
  drinkAbv,
  hoursElapsed,
  weightKg,
  gender,
  setDrinksCount,
  setDrinkVolumeMl,
  setDrinkAbv,
  setHoursElapsed,
  setWeightKg,
  setGender,
}: {
  drinksCount: number;
  drinkVolumeMl: number;
  drinkAbv: number;
  hoursElapsed: number;
  weightKg: number;
  gender: Gender;
  setDrinksCount: (d: number) => void;
  setDrinkVolumeMl: (v: number) => void;
  setDrinkAbv: (a: number) => void;
  setHoursElapsed: (h: number) => void;
  setWeightKg: (w: number) => void;
  setGender: (g: Gender) => void;
}) {
  const res = useMemo(() => {
    try {
      return calculateBAC(drinksCount, weightKg, gender, hoursElapsed, drinkAbv, drinkVolumeMl);
    } catch {
      return null;
    }
  }, [drinksCount, weightKg, gender, hoursElapsed, drinkAbv, drinkVolumeMl]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Drinks Consumed</label>
          <input
            type="number"
            min="1"
            value={drinksCount}
            onChange={(e) => setDrinksCount(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Volume per Drink (ml)</label>
          <input
            type="number"
            value={drinkVolumeMl}
            onChange={(e) => setDrinkVolumeMl(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Alcohol % (ABV)</label>
          <input
            type="number"
            step="0.5"
            value={drinkAbv}
            onChange={(e) => setDrinkAbv(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-700">Hours Since 1st Drink</label>
          <input
            type="number"
            step="0.5"
            value={hoursElapsed}
            onChange={(e) => setHoursElapsed(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-xs"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {res && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estimated Blood Alcohol</span>
              <span className="text-3xl font-black text-gray-950">{res.bacPercent}%</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${
                res.legalToDriveIndia ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {res.legalToDriveIndia ? "Under Legal Driving Limit (0.03%)" : "ILLEGAL TO DRIVE"}
            </span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border text-xs text-gray-600">
            Time until sober: <span className="font-bold text-gray-900">{res.hoursUntilSober} hours</span>. {res.effects}
          </div>
        </div>
      )}
    </div>
  );
}
