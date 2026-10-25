"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { calculateBmi } from "@/features/calculator/bmi";
import { saveDraftDetails } from "@/features/assessment/session-store";
import type { Gender } from "@/types/fitness";

interface CalculationState {
  bmi: number;
  category: string;
  range: string;
  categoryColor: string;
  bodyFatPercent: number;
  leanMassKg: number;
  dailyCalories: number;
}

export function BodyCalculator({ className }: { className?: string } = {}) {
  const router = useRouter();
  const [age, setAge] = useState<number | "">(24);
  const [height, setHeight] = useState<number | "">(175);
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weight, setWeight] = useState<number | "">(70);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [gender, setGender] = useState<Gender>("male");

  const [isCalculating, setIsCalculating] = useState(false);
  const [displayBmi, setDisplayBmi] = useState<number>(22.9);
  const [result, setResult] = useState<CalculationState>({
    bmi: 22.9,
    category: "Normal Weight",
    range: "18.5 – 24.9",
    categoryColor: "text-emerald-500",
    bodyFatPercent: 15.2,
    leanMassKg: 58.8,
    dailyCalories: 1980,
  });

  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch("/goal");
    router.prefetch("/details");
  }, [router]);

  const getMetricValues = () => {
    let heightCm = typeof height === "number" ? height : 0;
    if (heightUnit === "ft") {
      heightCm = heightCm * 30.48;
    }
    let weightKg = typeof weight === "number" ? weight : 0;
    if (weightUnit === "lbs") {
      weightKg = weightKg * 0.453592;
    }
    return {
      ageNum: typeof age === "number" ? age : 0,
      heightCm: Math.round(heightCm * 10) / 10,
      weightKg: Math.round(weightKg * 10) / 10,
    };
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const { ageNum, heightCm, weightKg } = getMetricValues();

    if (!ageNum || ageNum < 10 || ageNum > 110) {
      setError("Valid age: 10 - 110.");
      return;
    }
    if (!heightCm || heightCm < 60 || heightCm > 250) {
      setError("Valid height: 60 - 250cm.");
      return;
    }
    if (!weightKg || weightKg < 25 || weightKg > 300) {
      setError("Valid weight: 25 - 300kg.");
      return;
    }

    setIsCalculating(true);

    saveDraftDetails({
      age: ageNum,
      heightCm,
      weightKg,
      gender,
      waistIn: Math.round(weightKg * 0.45 * 10) / 10,
      neckIn: Math.round(heightCm * 0.22 * 10) / 10,
    });

    setTimeout(() => {
      try {
        const bmiRes = calculateBmi(weightKg, heightCm);
        const bmiVal = bmiRes.value;

        const genderFactor = gender === "male" ? 1 : 0;
        let bf = 1.2 * bmiVal + 0.23 * ageNum - 10.8 * genderFactor - 5.4;
        bf = gender === "male" ? Math.max(5, Math.min(50, bf)) : Math.max(12, Math.min(55, bf));
        const bodyFatPercent = Number(bf.toFixed(1));

        const leanMassKg = Number((weightKg * (1 - bodyFatPercent / 100)).toFixed(1));

        const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + (gender === "male" ? 5 : -161);
        const tdee = Math.round(bmr * 1.375);

        let catLabel = "Normal Weight";
        let catRange = "18.5 – 24.9";
        let catColor = "text-emerald-500";

        if (bmiVal < 18.5) {
          catLabel = "Underweight";
          catRange = "< 18.5";
          catColor = "text-amber-500";
        } else if (bmiVal >= 25 && bmiVal < 30) {
          catLabel = "Overweight";
          catRange = "25.0 – 29.9";
          catColor = "text-orange-500";
        } else if (bmiVal >= 30) {
          catLabel = "Obese";
          catRange = "≥ 30.0";
          catColor = "text-rose-500";
        }

        const newResult: CalculationState = {
          bmi: bmiVal,
          category: catLabel,
          range: catRange,
          categoryColor: catColor,
          bodyFatPercent,
          leanMassKg,
          dailyCalories: tdee,
        };

        setResult(newResult);
        saveDraftDetails({
          gender,
          age: ageNum,
          heightCm,
          weightKg,
        });
        animateCounter(displayBmi, bmiVal);
        router.push("/goal");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Calculation failed.");
      } finally {
        setIsCalculating(false);
      }
    }, 150);
  };

  const animateCounter = (start: number, end: number) => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayBmi(end);
      return;
    }

    const duration = 350;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Number((start + (end - start) * ease).toFixed(1));
      setDisplayBmi(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleSeeSample = () => {
    setAge(24);
    setHeight(175);
    setHeightUnit("cm");
    setWeight(70);
    setWeightUnit("kg");
    setGender("male");
    setError(null);

    setResult({
      bmi: 22.9,
      category: "Normal Weight",
      range: "18.5 – 24.9",
      categoryColor: "text-emerald-500",
      bodyFatPercent: 15.2,
      leanMassKg: 58.8,
      dailyCalories: 1980,
    });
    animateCounter(displayBmi, 22.9);
  };

  const minBmi = 15;
  const maxBmi = 35;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.72;
  const normalizedValue = Math.min(Math.max((displayBmi - minBmi) / (maxBmi - minBmi), 0), 1);
  const strokeDashoffset = arcLength * (1 - normalizedValue);

  const startAngleDeg = 135;
  const sweepAngleDeg = 270 * normalizedValue;
  const currentAngleRad = ((startAngleDeg + sweepAngleDeg) * Math.PI) / 180;
  const dotX = 68 + radius * Math.cos(currentAngleRad);
  const dotY = 68 + radius * Math.sin(currentAngleRad);

  return (
    <section id="calculator-card" className={`relative w-full px-0 sm:px-3 -mt-3.5 sm:-mt-4 md:mt-3 z-20 max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto flex flex-col ${className || ""}`}>
      <div className="w-full flex-1 bg-white rounded-t-[24px] sm:rounded-t-[28px] md:rounded-2xl rounded-b-2xl p-3 min-[390px]:p-3.5 md:p-6 lg:p-8 border-t md:border border-gray-100 shadow-[0_-3px_12px_rgba(0,0,0,0.05)] md:shadow-card flex flex-col justify-between">
        
        {error && (
          <div className="mb-2 p-1.5 md:p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[9.5px] md:text-xs">
            {error}
          </div>
        )}

        {/* Header spanning both columns: Title on left, See Sample on right */}
        <div className="flex items-start justify-between mb-1.5 min-[390px]:mb-2 md:mb-4 shrink-0">
          <div>
            <h2 className="text-[11.5px] min-[390px]:text-[12.5px] md:text-lg font-black uppercase tracking-tight text-gray-950">
              YOUR BODY CALCULATION
            </h2>
            <p className="text-[8.5px] min-[390px]:text-[9.5px] md:text-xs text-gray-500 leading-tight mt-0.5">
              Enter your details to get your accurate South Asian BMI &amp; Body Fat estimates
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeeSample}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-full bg-[#e8f7ee] hover:bg-[#d8f2e2] text-gray-900 text-[9px] min-[390px]:text-[10px] md:text-xs font-bold transition-all active:scale-95 shrink-0"
          >
            <span>See Sample</span>
            <span className="text-gray-900">→</span>
          </button>
        </div>

        {/* 2-Column Side-by-Side Grid - Expands to occupy full card height */}
        <div className="flex flex-row items-stretch divide-x divide-gray-100 flex-1 my-1 md:my-3">
          
          {/* Left Column: Form Inputs */}
          <form onSubmit={handleCalculate} className="w-[52%] md:w-[50%] pr-2 md:pr-6 flex flex-col justify-between flex-1 space-y-1.5 md:space-y-3">

            {/* Age Input with user icon and vertical divider */}
            <div className="flex items-center rounded-xl border border-gray-200/80 bg-white px-2 py-0.5 min-[390px]:py-1 md:py-2 md:px-3 focus-within:border-emerald-500 transition-all">
              <div className="flex items-center gap-1.5 shrink-0 text-gray-700">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-[10px] font-semibold text-gray-700 w-10">Age</span>
              </div>
              <div className="h-3 border-r border-gray-200 mx-1.5" />
              <input
                id="input-age"
                type="number"
                min="10"
                max="110"
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="24"
                className="w-full bg-transparent text-[11px] min-[390px]:text-[12px] font-bold text-gray-950 focus:outline-none"
              />
            </div>

            {/* Height Input with diagonal tape measure icon and vertical divider */}
            <div className="flex items-center rounded-xl border border-gray-200/80 bg-white px-2 py-0.5 min-[390px]:py-1 focus-within:border-emerald-500 transition-all">
              <div className="flex items-center gap-1.5 shrink-0 text-gray-700">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" />
                  <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" />
                  <line x1="11" y1="6" x2="11" y2="12" stroke="currentColor" />
                  <line x1="15" y1="6" x2="15" y2="10" stroke="currentColor" />
                  <line x1="19" y1="6" x2="19" y2="12" stroke="currentColor" />
                </svg>
                <span className="text-[10px] font-semibold text-gray-700 w-10">Height</span>
              </div>
              <div className="h-3 border-r border-gray-200 mx-1.5" />
              <input
                id="input-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="175"
                className="w-full bg-transparent text-[11px] min-[390px]:text-[12px] font-bold text-gray-950 focus:outline-none"
              />
              <div className="relative shrink-0 ml-1">
                <select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value as "cm" | "ft")}
                  className="appearance-none bg-transparent text-[9.5px] font-bold text-gray-700 pr-3 focus:outline-none cursor-pointer"
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-[8px]">
                  ▼
                </span>
              </div>
            </div>

            {/* Weight Input with scale dial icon and vertical divider */}
            <div className="flex items-center rounded-xl border border-gray-200/80 bg-white px-2 py-0.5 min-[390px]:py-1 focus-within:border-emerald-500 transition-all">
              <div className="flex items-center gap-1.5 shrink-0 text-gray-700">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" />
                  <path d="M12 9a4 4 0 00-4 4h8a4 4 0 00-4-4z" stroke="currentColor" />
                  <line x1="12" y1="13" x2="13.5" y2="10.5" stroke="currentColor" />
                </svg>
                <span className="text-[10px] font-semibold text-gray-700 w-10">Weight</span>
              </div>
              <div className="h-3 border-r border-gray-200 mx-1.5" />
              <input
                id="input-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="70"
                className="w-full bg-transparent text-[11px] min-[390px]:text-[12px] font-bold text-gray-950 focus:outline-none"
              />
              <div className="relative shrink-0 ml-1">
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as "kg" | "lbs")}
                  className="appearance-none bg-transparent text-[9.5px] font-bold text-gray-700 pr-3 focus:outline-none cursor-pointer"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-[8px]">
                  ▼
                </span>
              </div>
            </div>

            {/* Gender Toggle: Male / Female */}
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-1 min-[390px]:py-1.5 px-1.5 rounded-full text-[10px] min-[390px]:text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  gender === "male"
                    ? "bg-[#042017] text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200/80 text-gray-700"
                }`}
              >
                <span>♂</span>
                <span>Male</span>
              </button>

              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-1 min-[390px]:py-1.5 px-1.5 rounded-full text-[10px] min-[390px]:text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  gender === "female"
                    ? "bg-[#042017] text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200/80 text-gray-700"
                }`}
              >
                <span>♀</span>
                <span>Female</span>
              </button>
            </div>

            {/* Calculate Now Button */}
            <div className="pt-0.5">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-1.5 min-[390px]:py-2 px-3 rounded-full bg-[#042017] hover:bg-[#073024] text-white font-extrabold text-[11px] min-[390px]:text-[11.5px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>Calculate Now</span>
                <span className="text-[#00e676]">→</span>
              </button>
            </div>

          </form>

          {/* Right Column: Circular Gauge & Body Metrics */}
          <div className="w-[48%] md:w-[50%] pl-2 md:pl-6 flex flex-col items-center justify-between flex-1 py-1 md:py-2">
            {/* Circular Gauge Ring */}
            <div className="relative w-24 h-24 min-[390px]:w-28 min-[390px]:h-28 md:w-36 md:h-36 flex items-center justify-center my-0.5 md:my-1">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 136 136">
                <circle
                  cx="68"
                  cy="68"
                  r={radius}
                  fill="transparent"
                  stroke="#eef2f6"
                  strokeWidth="8"
                  strokeDasharray={arcLength}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                <circle
                  cx="68"
                  cy="68"
                  r={radius}
                  fill="transparent"
                  stroke="#00e676"
                  strokeWidth="8"
                  strokeDasharray={arcLength}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-400 ease-out"
                />
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="3.8"
                  fill="#00e676"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-400 ease-out"
                />
              </svg>

              {/* Center Value & BMI Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl min-[390px]:text-3xl md:text-4xl font-black text-gray-950 font-sans tracking-tight leading-none">
                  {displayBmi.toFixed(1)}
                </span>
                <span className="text-[8.5px] md:text-xs font-bold text-gray-500 tracking-wider uppercase mt-0.5">
                  BMI
                </span>
              </div>
            </div>

            {/* Category Indicator Badge & Range in Soft Mint Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-full bg-[#e8f7ee] text-center my-0.5 md:my-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] shrink-0" />
              <span className="text-[9.5px] md:text-xs font-extrabold text-gray-900 whitespace-nowrap">
                {result.category}
              </span>
              <span className="text-[8.5px] md:text-[11px] font-semibold text-gray-600 whitespace-nowrap">
                {result.range}
              </span>
            </div>

            {/* Three Metrics Bar: Body Fat, Lean Mass, Daily Calories */}
            <div className="w-full grid grid-cols-3 gap-0.5 md:gap-2 pt-1 md:pt-3 mt-0.5 md:mt-2 border-t border-gray-100 text-center">
              
              <div>
                <div className="flex items-center justify-center gap-0.5 text-gray-900">
                  <svg className="w-2.5 h-2.5 text-[#059669] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span className="text-[9px] min-[390px]:text-[10px] font-black">{result.bodyFatPercent}%</span>
                </div>
                <div className="text-[6.5px] min-[390px]:text-[7px] font-semibold text-gray-500 mt-0.5 whitespace-nowrap">Body Fat</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-0.5 text-gray-900">
                  <svg className="w-2.5 h-2.5 text-[#059669] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <span className="text-[9px] min-[390px]:text-[10px] font-black">{result.leanMassKg} kg</span>
                </div>
                <div className="text-[6.5px] min-[390px]:text-[7px] font-semibold text-gray-500 mt-0.5 whitespace-nowrap">Lean Mass</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-0.5 text-gray-900">
                  <svg className="w-2.5 h-2.5 text-[#f97316] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.533 1.035-.688 1.587a6.994 6.994 0 00-.73 2.59c-.014.28-.02.56-.02.84 0 .107.008.214.016.32a4.484 4.484 0 01-1.076-.843A6.97 6.97 0 007 6a1 1 0 00-1 1c0 3.866 3.134 7 7 7a6.978 6.978 0 005.15-2.274 1 1 0 00-.285-1.503 6.992 6.992 0 01-2.91-2.67 6.98 6.98 0 00-.56-4zm-4.7 10.4A5.002 5.002 0 018 7.37c.36.4.78.74 1.25 1.01.2.11.41.2.63.28-.15.4-.23.82-.23 1.25 0 1.93 1.34 3.55 3.15 3.96A5.002 5.002 0 017.695 12.953z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[9px] min-[390px]:text-[10px] font-black">{result.dailyCalories.toLocaleString()}</span>
                </div>
                <div className="text-[6.5px] min-[390px]:text-[7px] font-semibold text-gray-500 mt-0.5 whitespace-nowrap">Daily Calories</div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
