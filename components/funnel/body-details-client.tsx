"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  saveDraftDetails,
  loadDraftDetails,
  saveDraftGoal,
  loadDraftGoal,
} from "@/features/assessment/session-store";
import type { Gender, FitnessGoal } from "@/types/fitness";

interface BodyDetailsClientProps {
  initialStep?: 1 | 2;
}

export function BodyDetailsClient({ initialStep }: BodyDetailsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine current step (1 or 2)
  const stepParam = searchParams.get("step");
  const [step, setStep] = useState<1 | 2>(() => {
    if (initialStep) return initialStep;
    if (stepParam === "2") return 2;
    return 1;
  });

  // Keep state in sync with URL if changed
  useEffect(() => {
    if (stepParam === "2") {
      setStep(2);
    } else if (stepParam === "1") {
      setStep(1);
    }
  }, [stepParam]);

  // Form State - Step 1
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number | string>(24);
  const [height, setHeight] = useState<number | string>(175);
  const [weight, setWeight] = useState<number | string>(70);
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  // Form State - Step 2 (Circumferences)
  const [waist, setWaist] = useState<number | string>(80);
  const [waistUnit, setWaistUnit] = useState<"cm" | "in">("cm");
  const [neck, setNeck] = useState<number | string>(36);
  const [neckUnit, setNeckUnit] = useState<"cm" | "in">("cm");
  const [hip, setHip] = useState<number | string>(95);
  const [hipUnit, setHipUnit] = useState<"cm" | "in">("cm");

  // Selected Goal
  const [goal, setGoal] = useState<FitnessGoal>("muscle-gain");

  // Guide Modal
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"waist" | "neck">("waist");

  // Hydrate from session storage
  useEffect(() => {
    const savedDetails = loadDraftDetails();
    if (savedDetails) {
      if (savedDetails.gender) setGender(savedDetails.gender);
      if (savedDetails.age) setAge(savedDetails.age);
      if (savedDetails.heightCm) setHeight(savedDetails.heightCm);
      if (savedDetails.weightKg) setWeight(savedDetails.weightKg);

      if (savedDetails.waistIn) {
        // Default to cm in Step 2 matching screenshot (80 cm)
        const cmVal = Math.round(savedDetails.waistIn * 2.54);
        setWaist(cmVal);
      }
      if (savedDetails.neckIn) {
        const cmVal = Math.round(savedDetails.neckIn * 2.54);
        setNeck(cmVal);
      }
      if (savedDetails.hipIn) {
        const cmVal = Math.round(savedDetails.hipIn * 2.54);
        setHip(cmVal);
      }
    }

    const savedGoal = loadDraftGoal();
    if (savedGoal?.goal) {
      setGoal(savedGoal.goal);
    } else {
      saveDraftGoal({
        goal: "muscle-gain",
        activityLevel: "moderately-active",
        dietPreference: "non-vegetarian",
      });
    }

    router.prefetch("/calculating");
  }, [router]);

  // Unit conversion helpers
  const handleWaistUnitChange = (newUnit: "cm" | "in") => {
    if (newUnit === waistUnit) return;
    const currentVal = Number(waist);
    if (!isNaN(currentVal) && currentVal > 0) {
      if (newUnit === "in") {
        setWaist(Math.round((currentVal / 2.54) * 10) / 10);
      } else {
        setWaist(Math.round(currentVal * 2.54));
      }
    }
    setWaistUnit(newUnit);
  };

  const handleNeckUnitChange = (newUnit: "cm" | "in") => {
    if (newUnit === neckUnit) return;
    const currentVal = Number(neck);
    if (!isNaN(currentVal) && currentVal > 0) {
      if (newUnit === "in") {
        setNeck(Math.round((currentVal / 2.54) * 10) / 10);
      } else {
        setNeck(Math.round(currentVal * 2.54));
      }
    }
    setNeckUnit(newUnit);
  };

  const handleHipUnitChange = (newUnit: "cm" | "in") => {
    if (newUnit === hipUnit) return;
    const currentVal = Number(hip);
    if (!isNaN(currentVal) && currentVal > 0) {
      if (newUnit === "in") {
        setHip(Math.round((currentVal / 2.54) * 10) / 10);
      } else {
        setHip(Math.round(currentVal * 2.54));
      }
    }
    setHipUnit(newUnit);
  };

  // Step 1 -> Step 2 transition
  const handleProceedToStep2 = () => {
    const numAge = Number(age) || 24;
    let numHeight = Number(height) || 175;
    if (heightUnit === "ft") {
      numHeight = Math.round(numHeight * 30.48);
    }
    let numWeight = Number(weight) || 70;
    if (weightUnit === "lbs") {
      numWeight = Math.round(numWeight * 0.453592);
    }

    // Default realistic measurements if not yet touched
    const defaultWaistCm = gender === "male" ? 80 : 72;
    const defaultNeckCm = gender === "male" ? 36 : 32;
    const defaultHipCm = gender === "male" ? 95 : 98;

    const waistCm = waistUnit === "cm" ? (Number(waist) || defaultWaistCm) : Math.round(((Number(waist) || (defaultWaistCm / 2.54)) * 2.54) * 10) / 10;
    const neckCm = neckUnit === "cm" ? (Number(neck) || defaultNeckCm) : Math.round(((Number(neck) || (defaultNeckCm / 2.54)) * 2.54) * 10) / 10;
    const hipCm = hipUnit === "cm" ? (Number(hip) || defaultHipCm) : Math.round(((Number(hip) || (defaultHipCm / 2.54)) * 2.54) * 10) / 10;

    const waistIn =
      waistUnit === "in"
        ? Number(waist)
        : Math.round((waistCm / 2.54) * 10) / 10;
    const neckIn =
      neckUnit === "in"
        ? Number(neck)
        : Math.round((neckCm / 2.54) * 10) / 10;
    const hipIn =
      hipUnit === "in"
        ? Number(hip)
        : Math.round((hipCm / 2.54) * 10) / 10;

    saveDraftDetails({
      gender,
      age: numAge,
      heightCm: numHeight,
      weightKg: numWeight,
      waistIn,
      neckIn,
      waistCm,
      neckCm,
      ...(gender === "female" ? { hipIn, hipCm } : {}),
    });

    setStep(2);
    try {
      window.history.pushState(null, "", "/details?step=2");
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Submission -> Start Body Analysis
  const handleStartAnalysis = () => {
    const numAge = Number(age) || 24;
    let numHeight = Number(height) || 175;
    if (heightUnit === "ft") {
      numHeight = Math.round(numHeight * 30.48);
    }
    let numWeight = Number(weight) || 70;
    if (weightUnit === "lbs") {
      numWeight = Math.round(numWeight * 0.453592);
    }

    const numWaist = Number(waist) || (gender === "male" ? 80 : 72);
    const numNeck = Number(neck) || (gender === "male" ? 36 : 32);
    const numHip = Number(hip) || (gender === "male" ? 95 : 98);

    const waistCm = waistUnit === "cm" ? numWaist : Math.round(numWaist * 2.54 * 10) / 10;
    const neckCm = neckUnit === "cm" ? numNeck : Math.round(numNeck * 2.54 * 10) / 10;
    const hipCm = hipUnit === "cm" ? numHip : Math.round(numHip * 2.54 * 10) / 10;

    const finalWaistIn =
      waistUnit === "in"
        ? numWaist
        : Math.round((numWaist / 2.54) * 10) / 10;
    const finalNeckIn =
      neckUnit === "in"
        ? numNeck
        : Math.round((numNeck / 2.54) * 10) / 10;
    const finalHipIn =
      hipUnit === "in"
        ? numHip
        : Math.round((numHip / 2.54) * 10) / 10;

    saveDraftDetails({
      gender,
      age: numAge,
      heightCm: numHeight,
      weightKg: numWeight,
      waistIn: finalWaistIn,
      neckIn: finalNeckIn,
      waistCm,
      neckCm,
      ...(gender === "female" ? { hipIn: finalHipIn, hipCm } : {}),
    });

    // Ensure a default goal is recorded so assessment calculation is guaranteed to succeed
    const existingGoal = loadDraftGoal();
    if (!existingGoal?.goal) {
      saveDraftGoal({
        goal: "fat-loss",
        activityLevel: "moderately-active",
        dietPreference: "vegetarian",
      });
    }

    router.push("/calculating");
  };

  // Goal Details display config
  const goalConfig = {
    "muscle-gain": {
      title: "Muscle Gain",
      subtitle: "Build lean muscle & strength",
      image: "/images/banner-muscle-gain.jpg",
      icon: "dumbbell",
    },
    "fat-loss": {
      title: "Lose Body Fat",
      subtitle: "Reduce fat & keep muscle.",
      image: "/images/model-lose-fat.jpg",
      icon: "flame",
    },
    "weight-loss": {
      title: "Improve Fitness",
      subtitle: "Increase stamina & energy.",
      image: "/images/model-improve-fitness.jpg",
      icon: "bars",
    },
    "weight-gain": {
      title: "Build Consistency",
      subtitle: "Sustainable routine plan.",
      image: "/images/model-build-consistency.jpg",
      icon: "target",
    },
  }[goal] || {
    title: "Muscle Gain",
    subtitle: "Build lean muscle & strength",
    image: "/images/banner-muscle-gain.jpg",
    icon: "dumbbell",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* 1. Brand Site Header */}
      <SiteHeader />

      {/* 2. Main Funnel Content Container */}
      <main className="flex-1 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-1 md:pt-6 pb-32 sm:pb-36 md:pb-16 flex flex-col justify-start overflow-x-hidden">
        
        {/* ======================================================== */}
        {/* ------------------- STEP 1 OF 2 ------------------------ */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="animate-in fade-in duration-150">
            {/* Navigation & Stepper Row */}
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center gap-2">
                <Link
                  href="/goal"
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                  aria-label="Back to Goal"
                >
                  <svg className="w-3.5 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </Link>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#057a44]">
                  BODY DETAILS
                </span>
              </div>

              {/* Step 1 of 2 Stepper */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-800">Step 1 of 2</span>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <span className="text-[9px] font-black">1</span>
                  </div>
                  <div className="w-9 h-1.5 bg-gray-200 -mx-0.5" />
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                    <span className="text-[9px] font-bold">2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[22px] min-[390px]:text-[24px] sm:text-[26px] font-black tracking-tight leading-[1.08] text-gray-950 mt-1">
              Let’s understand{" "}
              <span className="text-[#00c853]">your body.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[9.5px] min-[390px]:text-[10px] text-gray-500 leading-tight mt-0.5 mb-2">
              Enter a few details to get accurate results and a personalized plan for your goal.
            </p>

            {/* Selected Goal Hero Card with Change Button (Mobile Only) */}
            <div className="md:hidden relative w-full rounded-2xl overflow-hidden shadow-md select-none aspect-[466/140] max-h-[110px] shrink-0 mb-2.5 bg-[#0a1510]">
              <Image
                src={goalConfig.image}
                alt={goalConfig.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

              <div className="absolute inset-0 p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-wider uppercase text-[#00e676]">
                    SELECTED GOAL
                  </span>
                  <Link
                    href="/goal"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/30 text-white text-[9px] font-bold backdrop-blur-xs transition-colors active:scale-95 shadow-sm"
                  >
                    <span>Change</span>
                    <svg className="w-2.5 h-2.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                </div>

                <div className="flex items-center gap-2.5 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-gray-950">
                    {goalConfig.icon === "flame" ? (
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
                      </svg>
                    ) : goalConfig.icon === "bars" ? (
                      <svg className="w-4 h-4 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                        <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                        <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                      </svg>
                    ) : goalConfig.icon === "target" ? (
                      <svg className="w-4 h-4 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="2" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                        <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                        <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                        <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                        <rect x="19.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">{goalConfig.title}</div>
                    <div className="text-[9px] sm:text-[9.5px] text-gray-300 leading-none mt-0.5">{goalConfig.subtitle}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
              {/* Left Column: Form Inputs & Desktop Action (md:col-span-7) */}
              <div className="md:col-span-7 space-y-4">
                {/* Form Container Card - Step 1 Inputs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3 sm:p-5 space-y-2 text-left">
              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold text-gray-950 mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setGender("male")}
                    className={`h-10 px-3 rounded-xl border flex items-center justify-between cursor-pointer active:scale-95 transition-all ${
                      gender === "male"
                        ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-900 font-bold">
                        <svg className="w-4 h-4 text-gray-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <circle cx="10" cy="14" r="5" />
                          <line x1="19" y1="5" x2="13.5" y2="10.5" />
                          <polyline points="15 5 19 5 19 9" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-gray-950">Male</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      gender === "male" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                    }`}>
                      {gender === "male" && <div className="w-[7px] h-[7px] rounded-full bg-[#00c853]" />}
                    </div>
                  </div>

                  <div
                    onClick={() => setGender("female")}
                    className={`h-10 px-3 rounded-xl border flex items-center justify-between cursor-pointer active:scale-95 transition-all ${
                      gender === "female"
                        ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-900 font-bold">
                        <svg className="w-4 h-4 text-gray-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <circle cx="12" cy="9" r="5" />
                          <line x1="12" y1="14" x2="12" y2="21" />
                          <line x1="9" y1="17.5" x2="15" y2="17.5" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-gray-950">Female</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      gender === "female" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                    }`}>
                      {gender === "female" && <div className="w-[7px] h-[7px] rounded-full bg-[#00c853]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-[11px] font-bold text-gray-950 mb-0.5">Age</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden h-10 transition-colors">
                  <div className="w-10 h-full flex items-center justify-center border-r border-gray-100 text-gray-700 shrink-0 bg-gray-50/40">
                    <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    min="16"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="flex-1 px-3 text-sm font-bold text-gray-900 bg-transparent outline-none"
                    placeholder="24"
                  />
                  <div className="px-3 h-full flex items-center gap-1 border-l border-gray-100 text-xs font-semibold text-gray-600 bg-gray-50/50 select-none">
                    <span>years</span>
                  </div>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-[11px] font-bold text-gray-950 mb-0.5">Height</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden h-10 transition-colors">
                  <div className="w-10 h-full flex items-center justify-center border-r border-gray-100 text-gray-700 shrink-0 bg-gray-50/40">
                    <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l16-16m-12 1l2 2m-1 3l2 2m-1 3l2 2m-1 3l2 2" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="flex-1 px-3 text-sm font-bold text-gray-900 bg-transparent outline-none"
                    placeholder="175"
                  />
                  <button
                    type="button"
                    onClick={() => setHeightUnit((u) => (u === "cm" ? "ft" : "cm"))}
                    className="px-3 h-full flex items-center gap-1 border-l border-gray-100 text-xs font-semibold text-gray-600 bg-gray-50/50 select-none hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <span>{heightUnit}</span>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-[11px] font-bold text-gray-950 mb-0.5">Weight</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden h-10 transition-colors">
                  <div className="w-10 h-full flex items-center justify-center border-r border-gray-100 text-gray-700 shrink-0 bg-gray-50/40">
                    <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1 px-3 text-sm font-bold text-gray-900 bg-transparent outline-none"
                    placeholder="70"
                  />
                  <button
                    type="button"
                    onClick={() => setWeightUnit((u) => (u === "kg" ? "lbs" : "kg"))}
                    className="px-3 h-full flex items-center gap-1 border-l border-gray-100 text-xs font-semibold text-gray-600 bg-gray-50/50 select-none hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <span>{weightUnit}</span>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop-only In-Flow Continue Button */}
            <div className="hidden md:block pt-3">
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="w-full py-4 px-6 rounded-2xl bg-[#022319] hover:bg-[#033022] text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/20 active:scale-98 transition-all cursor-pointer group"
                  >
                    <span>Continue to Measurements</span>
                    <span className="text-[#00e676] text-base group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500 font-medium select-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                    <span>Your data is private, encrypted, and secure.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Goal Summary & Coach Insights (md:col-span-5) */}
              <div className="hidden md:flex flex-col gap-5 md:col-span-5 sticky top-24">
                {/* Selected Goal Hero Card */}
                <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-emerald-950/40 select-none aspect-[16/9] bg-[#0a1510] group">
                  <Image
                    src={goalConfig.image}
                    alt={goalConfig.title}
                    fill
                    priority
                    className="object-cover object-right group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-wider uppercase text-[#00e676]">
                        SELECTED GOAL
                      </span>
                      <Link
                        href="/goal"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-black/60 hover:bg-black/80 border border-white/30 text-white text-xs font-bold backdrop-blur-xs transition-colors active:scale-95 shadow-sm"
                      >
                        <span>Change</span>
                        <span>→</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-gray-950">
                        {goalConfig.icon === "flame" ? (
                          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
                          </svg>
                        ) : goalConfig.icon === "bars" ? (
                          <svg className="w-5 h-5 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                            <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                            <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                          </svg>
                        ) : goalConfig.icon === "target" ? (
                          <svg className="w-5 h-5 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="5" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="2" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                            <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                            <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                            <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                            <rect x="19.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white leading-tight">{goalConfig.title}</div>
                        <div className="text-xs text-gray-300 mt-0.5">{goalConfig.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accuracy Note */}
                <div className="p-5 rounded-2xl bg-[#eaf7ee] border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-black uppercase text-[#057a44] tracking-wider">Metabolic Calibration</h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Mifflin-St Jeor equation calibrated specifically for Indian body composition profiles to ensure realistic deficit and surplus targets without fatigue.
                  </p>
                </div>

                {/* Coach Naveen Tip Card */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500 shrink-0">
                      <Image src="/images/coach-naveen.jpg" alt="Coach Naveen" fill className="object-cover object-top" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-950">Coach Naveen’s Tip</h4>
                      <p className="text-[11px] text-gray-500">Certified Sports Nutritionist</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    &ldquo;Be as honest as possible with your metrics. Accurate height and weight give us the exact baseline needed to prevent metabolic adaptation.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button: Proceed to Step 2 (Mobile Fixed Bottom) */}
            <div className="md:hidden fixed bottom-[52px] sm:bottom-[56px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100/90 py-2.5 px-3.5 sm:px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
              <div className="max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full py-3 px-4 rounded-full bg-[#022319] hover:bg-[#033022] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(2,35,25,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue to Measurements</span>
                  <span className="text-[#00e676] text-sm font-bold">→</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] text-gray-500 font-medium select-none">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                  <span>Your data is private and secure.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ------------------- STEP 2 OF 2 ------------------------ */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="animate-in fade-in duration-150">
            {/* Top Navigation & Stepper Header matching screenshot */}
            <div className="flex items-center justify-between mt-0.5">
              {/* Back Button & Section Label */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    try {
                      window.history.pushState(null, "", "/details?step=1");
                    } catch {}
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors active:scale-95 shrink-0 cursor-pointer"
                  aria-label="Back to Step 1"
                >
                  <svg className="w-3.5 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#057a44]">
                  BODY DETAILS
                </span>
              </div>

              {/* Stepper Indicator: Step 2 of 2 with double-checked green capsule */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-800">Step 2 of 2</span>
                <div className="flex items-center">
                  {/* Step 1 Checked Circle */}
                  <div className="w-4 h-4 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  {/* Solid Connected Green Bar */}
                  <div className="w-10 sm:w-12 h-1.5 bg-[#00c853] -mx-0.5" />
                  {/* Step 2 Checked Circle */}
                  <div className="w-4 h-4 rounded-full bg-[#00c853] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[25px] min-[390px]:text-[27px] sm:text-[29px] font-black tracking-tight leading-[1.08] text-gray-950 mt-1">
              Your body{" "}
              <span className="text-[#00c853]">measurements.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[9.5px] min-[390px]:text-[10px] text-gray-500 leading-snug mt-1 mb-2.5">
              These measurements help us estimate your body fat more accurately and create a better plan for you.
            </p>

            {/* Selected Goal Hero Card with Model (Mobile Only) */}
            <div className="md:hidden relative w-full rounded-2xl overflow-hidden shadow-md select-none aspect-[466/150] max-h-[110px] shrink-0 mb-3 bg-[#0a1510]">
              <Image
                src={goalConfig.image}
                alt={goalConfig.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

              <div className="absolute inset-0 p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-wider uppercase text-[#00e676]">
                    SELECTED GOAL
                  </span>
                  <Link
                    href="/goal"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/30 text-white text-[9.5px] font-bold backdrop-blur-xs transition-colors active:scale-95 shadow-sm"
                  >
                    <span>Change</span>
                    <svg className="w-2.5 h-2.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                </div>

                <div className="flex items-center gap-2.5 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-gray-950">
                    {goalConfig.icon === "flame" ? (
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
                      </svg>
                    ) : goalConfig.icon === "bars" ? (
                      <svg className="w-4 h-4 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                        <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                        <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                      </svg>
                    ) : goalConfig.icon === "target" ? (
                      <svg className="w-4 h-4 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="2" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                        <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                        <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                        <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                        <rect x="19.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">{goalConfig.title}</div>
                    <div className="text-[9px] sm:text-[9.5px] text-gray-300 leading-none mt-0.5">{goalConfig.subtitle}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
              {/* Left Column: Measurements & Actions (md:col-span-7) */}
              <div className="md:col-span-7 space-y-4">
                {/* Measurement Input Fields */}
                <div className="space-y-3 text-left">
              {/* 1. Waist Circumference */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v4c0 3-1 5-2 9m14-13v4c0 3 1 5 2 9" />
                      <line x1="6.5" y1="12" x2="17.5" y2="12" strokeWidth="2" strokeDasharray="1.5 1.5" />
                    </svg>
                    <span className="text-xs sm:text-[13px] font-bold text-gray-950">Waist Circumference</span>
                  </div>
                  <div className="relative">
                    <select
                      value={waistUnit}
                      onChange={(e) => handleWaistUnitChange(e.target.value as "cm" | "in")}
                      className="appearance-none bg-transparent pr-4 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                    <svg className="w-3 h-3 text-gray-500 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    placeholder="80"
                  />
                </div>
                <p className="text-[9.5px] text-gray-500 leading-tight">
                  Measure around your navel (belly button) while standing, relaxed.
                </p>
              </div>

              {/* 2. Neck Circumference */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                      <line x1="9" y1="13.5" x2="15" y2="13.5" strokeWidth="2" strokeDasharray="1.5 1.5" />
                    </svg>
                    <span className="text-xs sm:text-[13px] font-bold text-gray-950">Neck Circumference</span>
                  </div>
                  <div className="relative">
                    <select
                      value={neckUnit}
                      onChange={(e) => handleNeckUnitChange(e.target.value as "cm" | "in")}
                      className="appearance-none bg-transparent pr-4 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                    <svg className="w-3 h-3 text-gray-500 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={neck}
                    onChange={(e) => setNeck(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    placeholder="36"
                  />
                </div>
                <p className="text-[9.5px] text-gray-500 leading-tight">
                  Measure around the narrowest part of your neck, just below the Adam&apos;s apple.
                </p>
              </div>

              {/* Optional Hip Circumference for Females (US Navy standard) */}
              {gender === "female" && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4c2 4 1 8-2 16m14-16c-2 4-1 8 2 16" />
                        <line x1="5" y1="14" x2="19" y2="14" strokeWidth="2" strokeDasharray="1.5 1.5" />
                      </svg>
                      <span className="text-xs sm:text-[13px] font-bold text-gray-950">Hip Circumference (Female)</span>
                    </div>
                    <div className="relative">
                      <select
                        value={hipUnit}
                        onChange={(e) => handleHipUnitChange(e.target.value as "cm" | "in")}
                        className="appearance-none bg-transparent pr-4 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none"
                      >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </select>
                      <svg className="w-3 h-3 text-gray-500 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={hip}
                      onChange={(e) => setHip(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                      placeholder="95"
                    />
                  </div>
                  <p className="text-[9.5px] text-gray-500 leading-tight">
                    Measure around the widest part of your hips/buttocks.
                  </p>
                </div>
              )}
            </div>

            {/* "How to measure correctly?" Section matching screenshot */}
            <div className="mt-4 rounded-2xl bg-[#eaf7ee] border border-emerald-200/70 p-3 text-left">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v4c0 3-1 5-2 9m14-13v4c0 3 1 5 2 9" />
                      <line x1="6.5" y1="12" x2="17.5" y2="12" strokeWidth="2" strokeDasharray="1.5 1.5" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-[12.5px] font-black text-gray-950">
                    How to measure correctly?
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveGuideTab("waist");
                    setGuideModalOpen(true);
                  }}
                  className="text-[10.5px] font-bold text-[#057a44] hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Guide</span>
                  <span className="text-xs">→</span>
                </button>
              </div>

              {/* Two Side-by-Side Guide Cards */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                {/* 1. Waist Measurement Card */}
                <div
                  onClick={() => {
                    setActiveGuideTab("waist");
                    setGuideModalOpen(true);
                  }}
                  className="rounded-xl overflow-hidden cursor-pointer group"
                >
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-emerald-50">
                    <Image
                      src="/images/guide-waist-measurement.jpg"
                      alt="Waist Measurement guide photo"
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-[10.5px] font-bold text-gray-950 mt-1.5 leading-tight">
                    Waist Measurement
                  </h4>
                  <p className="text-[8px] sm:text-[8.5px] text-gray-600 leading-snug mt-0.5">
                    Use a measuring tape around your navel (belly button). Keep the tape snug but not tight.
                  </p>
                </div>

                {/* 2. Neck Measurement Card */}
                <div
                  onClick={() => {
                    setActiveGuideTab("neck");
                    setGuideModalOpen(true);
                  }}
                  className="rounded-xl overflow-hidden cursor-pointer group"
                >
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-emerald-50">
                    <Image
                      src="/images/guide-neck-measurement.jpg"
                      alt="Neck Measurement guide photo"
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-[10.5px] font-bold text-gray-950 mt-1.5 leading-tight">
                    Neck Measurement
                  </h4>
                  <p className="text-[8px] sm:text-[8.5px] text-gray-600 leading-snug mt-0.5">
                    Measure around the narrowest part of your neck, just below the Adam&apos;s apple. Keep the tape snug.
                  </p>
                </div>
              </div>
            </div>

            {/* Accurate Measurements = Better Results Card */}
            <div className="mt-2.5 rounded-xl bg-[#eaf7ee] border border-emerald-200/70 p-2.5 flex items-start gap-2.5 text-left">
              <div className="w-6 h-6 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-[#00c853]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 2.76 1.4 5.2 3.5 6.64v2.36c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-2.36c2.1-1.44 3.5-3.88 3.5-6.64 0-4.42-3.58-8-8-8zm-2 20h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-[10.5px] font-bold text-gray-950 leading-tight">
                  Accurate measurements = better results
                </h4>
                <p className="text-[8.5px] text-gray-600 leading-snug mt-0.5">
                  These help us estimate your body fat using a proven method and create a more personalized plan.
                </p>
              </div>
            </div>

                {/* Desktop-only Start Body Analysis Button */}
                <div className="hidden md:block pt-3">
                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    className="w-full py-4 px-6 rounded-2xl bg-[#022319] hover:bg-[#033022] text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/20 active:scale-98 transition-all cursor-pointer group"
                  >
                    <span>Start Body Analysis</span>
                    <span className="text-[#00e676] text-base group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500 font-medium select-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                    <span>Your data is private and secure.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Measurement Guides & Explanations (md:col-span-5) */}
              <div className="hidden md:flex flex-col gap-5 md:col-span-5 sticky top-24">
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200 space-y-4">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                    <span>Visual Measuring Guide</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                        <Image
                          src="/images/guide-waist-measurement.jpg"
                          alt="Waist Measurement"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-900">Waist at Navel</p>
                      <p className="text-[11px] text-gray-500 leading-snug">Relax your stomach, exhale normally, keep tape level.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                        <Image
                          src="/images/guide-neck-measurement.jpg"
                          alt="Neck Measurement"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-900">Neck below Adam&apos;s apple</p>
                      <p className="text-[11px] text-gray-500 leading-snug">Snug around narrowest point, avoid flaring traps.</p>
                    </div>
                  </div>
                </div>

                {/* US Navy Method Info */}
                <div className="p-5 rounded-2xl bg-[#eaf7ee] border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-black uppercase text-[#057a44] tracking-wider">US Navy Formula Accuracy</h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Circumference ratios accurately isolate subcutaneous and visceral adipose tissue from active lean mass, performing within 1-3% of clinical hydrostatic immersion.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Start Body Analysis (Mobile Only) */}
            <div className="md:hidden fixed bottom-[52px] sm:bottom-[56px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100/90 py-2.5 px-3.5 sm:px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
              <div className="max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-3 px-4 rounded-full bg-[#022319] hover:bg-[#033022] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(2,35,25,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  <span>Start Body Analysis</span>
                  <span className="text-[#00e676] text-sm font-bold">→</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] text-gray-500 font-medium select-none">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                  <span>Your data is private and secure.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Measurement Interactive Guide Modal */}
      {guideModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-gray-100 relative text-gray-900 text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-950 flex items-center gap-1.5">
                <span>Body Measurement Guide</span>
              </h3>
              <button
                type="button"
                onClick={() => setGuideModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors text-xs cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 my-3">
              <button
                type="button"
                onClick={() => setActiveGuideTab("waist")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGuideTab === "waist"
                    ? "bg-white text-gray-950 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Waist Tape Guide
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("neck")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGuideTab === "neck"
                    ? "bg-white text-gray-950 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Neck Tape Guide
              </button>
            </div>

            {activeGuideTab === "waist" ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100">
                  <Image
                    src="/images/guide-waist-measurement.jpg"
                    alt="Waist measurement instruction"
                    fill
                    sizes="350px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <p className="font-bold text-gray-900">How to measure your Waist:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 leading-snug">
                    <li>Stand straight with feet hip-width apart and relax. Don&apos;t suck in your stomach.</li>
                    <li>Wrap a flexible measuring tape directly around your navel (belly button).</li>
                    <li>Ensure the tape is horizontal and parallel to the floor all the way around.</li>
                    <li>Exhale normally and take the reading without pulling the tape too tight.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100">
                  <Image
                    src="/images/guide-neck-measurement.jpg"
                    alt="Neck measurement instruction"
                    fill
                    sizes="350px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <p className="font-bold text-gray-900">How to measure your Neck:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 leading-snug">
                    <li>Look straight ahead with your shoulders relaxed.</li>
                    <li>Wrap the tape around the narrowest part of your neck, just below your Adam&apos;s apple.</li>
                    <li>Keep the tape snug against your skin, but not choking or compressing tissue.</li>
                    <li>Record the measurement at eye level.</li>
                  </ol>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setGuideModalOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-bold text-center block transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
