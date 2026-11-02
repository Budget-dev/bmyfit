"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import {
  FontAwesomeIcon,
  faDumbbell,
  faFire,
  faHeartPulse,
  faBullseye,
  faLock,
  faUtensils,
  faAppleWhole,
  faChartLine,
  faCalendarDays,
  faCheckCircle,
  faArrowRight,
  faWhatsapp,
} from "@/components/ui/font-awesome-icons";
import type { Assessment } from "@/types/fitness";
import { calculateBodyFat } from "@/features/calculator";
import { recordFootprint } from "@/lib/telemetry/footprints";

export interface ResultClientProps {
  id?: string;
  assessment?: Assessment;
}

export function ResultClient({ id, assessment: initialAssessment }: ResultClientProps) {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [assessment, setAssessment] = useState<Assessment | null>(initialAssessment ?? null);
  const [loading, setLoading] = useState<boolean>(!initialAssessment);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Load assessment from local session immediately, then sync with server
  useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);
      setLoading(false);
      return;
    }

    // 1. Immediately hydrate from session storage so the user NEVER sees a flash or error
    try {
      const raw = sessionStorage.getItem("bmyfit_local_assessment");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setAssessment(parsed);
          setLoading(false);
        }
      }
    } catch { }

    if (!id || id === "local") {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadAssessment() {
      try {
        const token = await getIdToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/assessments/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.assessment) {
            setAssessment(data.assessment);
            try {
              sessionStorage.setItem("bmyfit_local_assessment", JSON.stringify(data.assessment));
            } catch { }
          }
        }
      } catch (e) {
        console.warn("Background assessment fetch notice:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadAssessment();

    return () => {
      isMounted = false;
    };
  }, [id, initialAssessment, getIdToken]);

  useEffect(() => {
    if (assessment) {
      recordFootprint("result_viewed", {
        bmi: assessment.bmi,
        bodyFatPercent: assessment.bodyFatPercent,
        goal: assessment.goal,
      });
    }
  }, [assessment]);

  // Default fallback data for visual rendering if state is empty
  const data: Assessment = assessment ?? {
    id: id || "demo",
    uid: "guest",
    gender: "male",
    age: 24,
    heightCm: 175,
    weightKg: 70,
    waistIn: 31.5,
    neckIn: 14.2,
    bmi: 24.2,
    bmiCategory: "normal",
    bodyFatPercent: 18.4,
    bodyFatCategory: "average",
    goal: "fat-loss",
    activityLevel: "moderately-active",
    dietPreference: "non-vegetarian",
  };

  // Category labels and colors
  const bmiValue = typeof data.bmi === "number" && !isNaN(data.bmi) ? data.bmi : 24.2;
  const bmiCategoryLabel =
    bmiValue < 18.5
      ? "Underweight"
      : bmiValue < 23
        ? "Normal"
        : bmiValue < 25
          ? "Normal"
          : bmiValue < 30
            ? "Overweight"
            : "Obese";

  // Calculate gauge position percent for BMI (range 15 to 35)
  const bmiPercent = Math.min(Math.max(((bmiValue - 15) / (35 - 15)) * 100, 5), 95);

  // Accurate US Navy Body Fat metrics
  // Male: Body Fat % = 495 / (1.0324 - 0.19077 × log10(Waist - Neck) + 0.15456 × log10(Height)) - 450
  // Female: Body Fat % = 495 / (1.29579 - 0.35004 × log10(Waist + Hip - Neck) + 0.22100 × log10(Height)) - 450
  const isMale = (data.gender || "male") === "male";
  let bodyFatVal = typeof data.bodyFatPercent === "number" && !isNaN(data.bodyFatPercent) ? data.bodyFatPercent : null;
  if (bodyFatVal === null) {
    try {
      const calculated = calculateBodyFat({
        gender: data.gender || "male",
        heightCm: data.heightCm || 175,
        waistIn: data.waistIn,
        neckIn: data.neckIn,
        hipIn: data.hipIn,
        waistCm: (data as { waistCm?: number }).waistCm,
        neckCm: (data as { neckCm?: number }).neckCm,
        hipCm: (data as { hipCm?: number }).hipCm,
      });
      bodyFatVal = calculated.value ?? (isMale ? 14.5 : 27.4);
    } catch {
      bodyFatVal = isMale ? 14.5 : 27.4;
    }
  }
  if (!bodyFatVal || isNaN(bodyFatVal)) {
    bodyFatVal = isMale ? 14.5 : 27.4;
  }

  const bfCategoryLabel =
    bodyFatVal < (isMale ? 14 : 21)
      ? "Athletic"
      : bodyFatVal <= (isMale ? 20 : 28)
        ? "Moderate"
        : "Above Average";

  // Calculate gauge position percent for Body Fat (range 8% to 36%)
  const bfPercent = Math.min(Math.max(((bodyFatVal - 8) / (36 - 8)) * 100, 5), 95);

  // Goal config
  const rawGoal = data.goal || "fat-loss";
  const goalConfig = {
    "fat-loss": {
      name: "Fat Loss",
      icon: "🔥",
      tagline: "Reduce body fat while maintaining lean muscle.",
    },
    "muscle-gain": {
      name: "Muscle Gain",
      icon: "🏋️",
      tagline: "Build lean muscle mass and increase strength.",
    },
    "weight-loss": {
      name: "Weight Loss",
      icon: "⚡",
      tagline: "Sustainable calorie deficit with high satiety meals.",
    },
    "weight-gain": {
      name: "Weight Gain",
      icon: "💪",
      tagline: "Healthy calorie surplus with optimal protein.",
    },
  }[rawGoal] || {
    name: "Fat Loss",
    icon: "🔥",
    tagline: "Reduce body fat while maintaining lean muscle.",
  };

  const handleUnlockPlan = () => {
    router.push(`/checkout/${data.id || "latest"}`);
  };

  if (loading && !assessment && id && id !== "local") {
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden">
        <SiteHeader />
        <main className="flex-1 max-w-md mx-auto w-full px-4 pt-8 pb-16 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs font-bold text-gray-600">Loading your results snapshot...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden relative">
      {/* 1. Brand Site Header */}
      <SiteHeader />

      {/* 2. Main Container with relative positioning for artwork */}
      <main className="flex-1 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto w-full px-2.5 min-[390px]:px-3 sm:px-6 lg:px-8 pt-0.5 md:pt-6 pb-14 sm:pb-16 md:pb-16 flex flex-col justify-start relative overflow-x-hidden">

        {/* Top Right Shirtless Muscular Model with Emerald Brush Splash (Mobile Only) */}
        <div className="md:hidden absolute top-3 -right-6 sm:-right-4 w-[160px] min-[390px]:w-[185px] aspect-[3/4] pointer-events-none select-none z-0">
          <Image
            src="/images/snapshot-model-splash.jpg"
            alt="BMYFIT fitness transformation model"
            fill
            priority
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-contain object-top"
          />
          {/* Subtle gradient blend on left and bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent w-12" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Foreground Content Layer (z-10) */}
        <div className="relative z-10 w-full">

          {/* Subheader Navigation Row */}
          <div className="flex items-center justify-between mt-0.5 mb-2 md:mb-4">
            <div className="flex items-center gap-1.5">
              <Link
                href="/details?step=2"
                className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                aria-label="Back to Measurements"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#057a44]">
                ASSESSMENT COMPLETE · YOUR RESULTS
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDetailsModalOpen(true)}
              className="text-[10px] md:text-xs font-bold text-gray-900 hover:text-emerald-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Full Breakdown</span>
              <span className="text-xs">→</span>
            </button>
          </div>

          {/* Desktop 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Left Column: Metrics & Anthropometry (md:col-span-6) */}
            <div className="md:col-span-6 space-y-4">
              {/* Headline matching screenshot */}
              <h1 className="text-[20px] min-[390px]:text-[22px] sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.08] text-gray-950 text-left">
                Your Body{" "}
                <span className="text-[#00c853]">Snapshot</span>
              </h1>

              {/* Subtitle */}
              <p className="text-[8px] min-[390px]:text-[8.5px] md:text-xs text-gray-500 leading-snug text-left max-w-full">
                Here are your key metrics and insights computed with the US Navy Body Fat equation and Mifflin-St Jeor formula.
              </p>

          {/* =================================================== */}
          {/* 3 Metrics Cards Row matching screenshot             */}
          {/* =================================================== */}
          <div className="grid grid-cols-3 gap-1.5 md:gap-4 text-left">
            
            {/* Card 1: BMI */}
            <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] md:shadow-sm p-1.5 min-[390px]:p-2 md:p-4 flex flex-col justify-between min-h-[96px] min-[390px]:min-h-[102px] md:min-h-[144px]">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-4.5 h-4.5 md:w-7 md:h-7 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faHeartPulse} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-[#057a44]" />
                  </div>
                  <span className="text-[8.5px] min-[390px]:text-[9px] md:text-xs font-black text-gray-950">BMI</span>
                </div>

                {/* Big Number */}
                <div className="text-[16px] min-[390px]:text-[17px] md:text-3xl font-black text-gray-950 tracking-tight leading-tight my-0.5 md:my-1">
                  {bmiValue.toFixed(1)}
                </div>

                {/* Pill Badge */}
                <span className="inline-block px-1.5 md:px-2.5 py-0.2 md:py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[7.5px] min-[390px]:text-[8px] md:text-xs font-extrabold leading-tight">
                  {bmiCategoryLabel}
                </span>
              </div>

              {/* Scale / Gauge Bar */}
              <div className="mt-auto pt-1 md:pt-2">
                <div className="relative h-1 md:h-1.5 w-full rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500">
                  {/* Indicator Arrow */}
                  <div
                    className="absolute -top-1 md:-top-1.5 w-0 h-0 border-l-[3px] md:border-l-[4px] border-l-transparent border-r-[3px] md:border-r-[4px] border-r-transparent border-t-[4px] md:border-t-[6px] border-t-gray-950 -translate-x-1/2"
                    style={{ left: `${bmiPercent}%` }}
                  />
                </div>
                <div className="text-[7px] md:text-xs font-bold text-gray-900 mt-0.5 md:mt-1 leading-tight">18.5 – 24.9</div>
                <div className="text-[6px] md:text-[10px] text-gray-500 leading-none">Healthy range</div>
              </div>
            </div>

            {/* Card 2: Estimated Body Fat */}
            <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] md:shadow-sm p-1.5 min-[390px]:p-2 md:p-4 flex flex-col justify-between min-h-[96px] min-[390px]:min-h-[102px] md:min-h-[144px]">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-4.5 h-4.5 md:w-7 md:h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faFire} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-amber-600" />
                  </div>
                  <span className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-black text-gray-950 leading-tight">
                    Estimated<br />Body Fat
                  </span>
                </div>

                {/* Big Number */}
                <div className="text-[16px] min-[390px]:text-[17px] md:text-3xl font-black text-gray-950 tracking-tight leading-tight my-0.5 md:my-1">
                  {bodyFatVal.toFixed(1)}%
                </div>

                {/* Pill Badge */}
                <span className="inline-block px-1.5 md:px-2.5 py-0.2 md:py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] text-[7.5px] min-[390px]:text-[8px] md:text-xs font-extrabold leading-tight">
                  {bfCategoryLabel}
                </span>
              </div>

              {/* Scale / Gauge Bar */}
              <div className="mt-auto pt-1 md:pt-2">
                <div className="relative h-1 md:h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500">
                  {/* Indicator Arrow */}
                  <div
                    className="absolute -top-1 md:-top-1.5 w-0 h-0 border-l-[3px] md:border-l-[4px] border-l-transparent border-r-[3px] md:border-r-[4px] border-r-transparent border-t-[4px] md:border-t-[6px] border-t-gray-950 -translate-x-1/2"
                    style={{ left: `${bfPercent}%` }}
                  />
                </div>
                <div className="text-[7px] md:text-xs font-bold text-gray-900 mt-0.5 md:mt-1 leading-tight">
                  {isMale ? "14% - 20%" : "21% - 28%"}
                </div>
                <div className="text-[6px] md:text-[10px] text-gray-500 leading-none">
                  {isMale ? "Healthy range (Men)" : "Healthy range (Women)"}
                </div>
              </div>
            </div>

            {/* Card 3: Your Goal */}
            <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] md:shadow-sm p-1.5 min-[390px]:p-2 md:p-4 flex flex-col justify-between min-h-[96px] min-[390px]:min-h-[102px] md:min-h-[144px]">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-4.5 h-4.5 md:w-7 md:h-7 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faBullseye} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-[#057a44]" />
                  </div>
                  <span className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-black text-gray-950">Your Goal</span>
                </div>

                {/* Goal Tag */}
                <div className="flex items-center gap-1 md:gap-1.5 mt-1.5 md:mt-2 mb-0.5 md:mb-1">
                  <span className="text-[11px] md:text-lg">{goalConfig.icon}</span>
                  <span className="text-[10px] min-[390px]:text-[11px] md:text-base font-black text-gray-950 leading-tight">
                    {goalConfig.name}
                  </span>
                </div>
              </div>

              {/* Peach callout box at bottom */}
              <div className="mt-auto rounded-lg md:rounded-xl bg-[#fff7ed] border border-[#ffedd5] p-1 md:p-2">
                <p className="text-[6.5px] min-[390px]:text-[7px] md:text-xs text-gray-700 leading-tight">
                  {goalConfig.tagline}
                </p>
              </div>
            </div>

          </div>

          {/* =================================================== */}
          {/* "What this means?" Callout Card                     */}
          {/* =================================================== */}
          <div className="mt-1.5 rounded-xl bg-[#eaf7ee] border border-emerald-200/70 p-1.5 min-[390px]:p-2 flex items-start gap-1.5 text-left">
            <div className="w-5 h-5 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-[#00c853]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C7.58 2 4 5.58 4 10c0 2.76 1.4 5.2 3.5 6.64v2.36c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-2.36c2.1-1.44 3.5-3.88 3.5-6.64 0-4.42-3.58-8-8-8zm-2 20h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-[9.5px] min-[390px]:text-[10px] md:text-sm font-black text-gray-950 leading-tight">
                What this means?
              </h3>
              <p className="text-[7.5px] min-[390px]:text-[8px] md:text-xs text-gray-600 leading-snug mt-0.5">
                Your current numbers give you a good starting point. Based on your goal, the next focus should be reducing body fat while maintaining lean muscle. With the right nutrition and workout plan, you can achieve this safely and effectively.
              </p>
            </div>
          </div>

          {/* Desktop-only Detailed Summary Card */}
          <div className="hidden md:block bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3 text-left">
            <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">
              Verified Intake Parameters
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Height / Weight</span>
                <span className="font-bold text-gray-900">{data.heightCm} cm · {data.weightKg} kg</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Waist / Neck</span>
                <span className="font-bold text-gray-900">{Math.round((data.waistIn || 31.5) * 2.54)}cm · {Math.round((data.neckIn || 14.2) * 2.54)}cm</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Metabolic Baseline</span>
                <span className="font-bold text-emerald-600">
                  ~{Math.round(10 * (data.weightKg || 70) + 6.25 * (data.heightCm || 175) - 5 * (data.age || 26) + ((data.gender || "male") === "male" ? 5 : -161))} kcal BMR
                </span>
              </div>
            </div>
          </div>

          {/* Desktop-only Coach Naveen Note */}
          <div className="hidden md:flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-200 text-left shadow-sm">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-emerald-500 shrink-0">
              <Image src="/images/coach-naveen.jpg" alt="Coach Naveen" fill className="object-cover object-top" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-950">Coach Naveen’s Review</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                &ldquo;Your metabolic profile shows solid responsive potential. By setting your daily deficit at exactly 400 kcal and keeping protein at ~1.6g/kg with Indian meals, we can target stubborn abdominal fat while preserving muscle.&rdquo;
              </p>
            </div>
          </div>
        </div>

                    {/* Right Column: Hero Offer Card & What You Get (md:col-span-6) */}
            <div className="md:col-span-6 space-y-4 md:sticky md:top-20">
              {/* =================================================== */}
              {/* "Your personalized plan is ready" Hero Offer Card   */}
              {/* =================================================== */}
              <div className="mt-1.5 min-[390px]:mt-2 md:mt-0 rounded-2xl md:rounded-3xl bg-[#031c14] border border-emerald-950 p-2 min-[390px]:p-2.5 md:p-6 text-white text-left relative overflow-hidden shadow-lg md:shadow-xl">
                {/* Ambient emerald backlight glow */}
                <div className="absolute top-0 right-0 w-40 md:w-60 h-40 md:h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Heading */}
                <div className="relative z-10">
                  <div className="flex items-center gap-1 md:gap-2">
                    <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#00e676] shrink-0" />
                    <h3 className="text-[12px] min-[390px]:text-[13px] md:text-2xl font-black tracking-tight leading-tight">
                      Your personalized plan <span className="text-[#00e676]">is ready</span>
                    </h3>
                  </div>
                  <p className="text-[7.5px] min-[390px]:text-[8px] md:text-sm text-gray-300 mt-0.5 md:mt-1">
                    Get a complete personalized plan based on your body data and goal.
                  </p>
                </div>

                {/* Middle Section: 6 Feature Bullets & Phone Mockup */}
                <div className="relative z-10 flex items-center justify-between gap-1.5 md:gap-4 mt-1.5 min-[390px]:mt-2 md:mt-4">
                  {/* Left Column: 6 Feature Points (2 cols of 3) */}
                  <div className="flex-1 grid grid-cols-2 gap-x-1.5 md:gap-x-4 gap-y-1 md:gap-y-3">
                    {/* 1. Daily calorie target */}
                    <div className="flex items-start gap-1 md:gap-2">
                      <div className="w-4.5 h-4.5 md:w-8 md:h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faUtensils} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#00e676]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold text-white leading-tight">
                          Daily calorie target
                        </div>
                        <div className="text-[6.5px] min-[390px]:text-[7px] md:text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                          Based on your body &amp; goal
                        </div>
                      </div>
                    </div>

                    {/* 2. Protein target */}
                    <div className="flex items-start gap-1 md:gap-2">
                      <div className="w-4.5 h-4.5 md:w-8 md:h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faAppleWhole} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#00e676]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold text-white leading-tight">
                          Protein target
                        </div>
                        <div className="text-[6.5px] min-[390px]:text-[7px] md:text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                          Optimize for your goal
                        </div>
                      </div>
                    </div>

                    {/* 3. Personalized workout */}
                    <div className="flex items-start gap-1 md:gap-2">
                      <div className="w-4.5 h-4.5 md:w-8 md:h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faDumbbell} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#00e676]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold text-white leading-tight">
                          Personalized workout
                        </div>
                        <div className="text-[6.5px] min-[390px]:text-[7px] md:text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                          Sets, reps &amp; progression
                        </div>
                      </div>
                    </div>

                    {/* 4. Indian diet plan */}
                    <div className="flex items-start gap-1 md:gap-2">
                      <div className="w-4.5 h-4.5 md:w-8 md:h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faUtensils} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#00e676]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold text-white leading-tight">
                          Indian diet plan
                        </div>
                        <div className="text-[6.5px] min-[390px]:text-[7px] md:text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                          Simple &amp; practical meals
                        </div>
                      </div>
                    </div>

                    {/* 5. Progress tracking */}
                    <div className="flex items-start gap-1 md:gap-2">
                      <div className="w-4.5 h-4.5 md:w-8 md:h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faChartLine} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#00e676]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold text-white leading-tight">
                          Progress tracking
                        </div>
                        <div className="text-[6.5px] min-[390px]:text-[7px] md:text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                          Track your changes weekly
                        </div>
                      </div>
                    </div>

                    {/* 6. Structured progression */}
                    <div className="flex items-start gap-1 md:gap-2">
                      <div className="w-4.5 h-4.5 md:w-8 md:h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faCalendarDays} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#00e676]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold text-white leading-tight">
                          Custom Structure
                        </div>
                        <div className="text-[6.5px] min-[390px]:text-[7px] md:text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                          Step-by-step guidance
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Isometric 3D Smartphone Plan Mockup Graphic */}
                  <div className="w-[82px] min-[390px]:w-[92px] md:w-[130px] aspect-[3/4] relative shrink-0">
                    <Image
                      src="/images/plan-phone-mockup.png"
                      alt="BMYFIT Plan Phone Mockup"
                      fill
                      sizes="(max-width: 768px) 120px, 160px"
                      className="object-contain drop-shadow-xl"
                    />
                  </div>
                </div>

                {/* Primary Action Button: Unlock My Plan - ₹99 */}
                <button
                  type="button"
                  onClick={handleUnlockPlan}
                  className="w-full py-2 min-[390px]:py-2.5 md:py-4 px-3 md:px-6 rounded-full md:rounded-2xl bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-[12px] min-[390px]:text-[13px] md:text-base flex items-center justify-center gap-1.5 md:gap-3 shadow-[0_3px_15px_rgba(0,230,118,0.4)] hover:shadow-lg active:scale-98 transition-all cursor-pointer mt-1.5 min-[390px]:mt-2 md:mt-5 group"
                >
                  <span>Unlock My Plan — ₹99</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-950 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust row */}
                <div className="flex items-center justify-center gap-2.5 md:gap-4 text-[7.5px] min-[390px]:text-[8px] md:text-xs text-gray-300 font-medium mt-1 md:mt-3 select-none">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-[#00e676]" />
                    One-time payment
                  </span>
                  <span>•</span>
                  <span>No subscription</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#00e676]" />
                    Secure payment
                  </span>
                </div>
              </div>

              {/* =================================================== */}
              {/* "What you get for ₹99?" Section                     */}
              {/* =================================================== */}
              <div className="mt-1.5 min-[390px]:mt-2 text-left">
                <h3 className="text-[11px] min-[390px]:text-[12px] font-black text-gray-950 tracking-tight leading-tight">
                  What you get for ₹99?
                </h3>
                <p className="text-[7.5px] min-[390px]:text-[8px] text-gray-500 leading-tight mt-0.5 mb-1 min-[390px]:mb-1.5">
                  A complete, personalized fitness and nutrition plan built around your body.
                </p>

                {/* 4 Feature Cards Grid matching screenshot (All 4 in a single row!) */}
                <div className="grid grid-cols-4 gap-1 min-[390px]:gap-1.5 md:gap-3">
                  {/* Card 1: Nutrition */}
                  <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] md:shadow-xs p-1 min-[390px]:p-1.5 md:p-3.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px] md:min-h-[110px]">
                    <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faUtensils} className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#057a44]" />
                    </div>
                    <div className="mt-1 md:mt-2">
                      <div className="text-[8px] min-[390px]:text-[8.5px] md:text-sm font-black text-gray-950 leading-tight">Nutrition</div>
                      <div className="text-[6px] min-[390px]:text-[6.5px] md:text-xs text-gray-500 leading-tight mt-0.5">
                        Personalized calories + Indian meal options
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Training */}
                  <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] md:shadow-xs p-1 min-[390px]:p-1.5 md:p-3.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px] md:min-h-[110px]">
                    <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faDumbbell} className="w-2.5 h-2.5 md:w-4 md:h-4 text-orange-600" />
                    </div>
                    <div className="mt-1 md:mt-2">
                      <div className="text-[8px] min-[390px]:text-[8.5px] md:text-sm font-black text-gray-950 leading-tight">Training</div>
                      <div className="text-[6px] min-[390px]:text-[6.5px] md:text-xs text-gray-500 leading-tight mt-0.5">
                        Goal-specific workout + progression
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Progress */}
                  <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] md:shadow-xs p-1 min-[390px]:p-1.5 md:p-3.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px] md:min-h-[110px]">
                    <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faChartLine} className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-600" />
                    </div>
                    <div className="mt-1 md:mt-2">
                      <div className="text-[8px] min-[390px]:text-[8.5px] md:text-sm font-black text-gray-950 leading-tight">Progress</div>
                      <div className="text-[6px] min-[390px]:text-[6.5px] md:text-xs text-gray-500 leading-tight mt-0.5">
                        Clear weekly structure to track changes
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Strategy */}
                  <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] md:shadow-xs p-1 min-[390px]:p-1.5 md:p-3.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px] md:min-h-[110px]">
                    <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faBullseye} className="w-2.5 h-2.5 md:w-4 md:h-4 text-rose-600" />
                    </div>
                    <div className="mt-1 md:mt-2">
                      <div className="text-[8px] min-[390px]:text-[8.5px] md:text-sm font-black text-gray-950 leading-tight">Strategy</div>
                      <div className="text-[6px] min-[390px]:text-[6.5px] md:text-xs text-gray-500 leading-tight mt-0.5">
                        Built around YOUR body data and goal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Free Lead 1-on-1 Consultation Trigger with Coach Naveen */}
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("bmyfit_open_chat"));
                      }
                    }}
                    className="w-full py-2 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#075E54] border border-emerald-300/80 font-bold text-[11px] min-[390px]:text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#25D366]" />
                    <span>Questions about your score? Chat with Coach Naveen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

{/* View Details Modal */}
      {detailsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-gray-100 relative text-gray-900 text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-950">Detailed Assessment Breakdown</h3>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-gray-100 text-xs py-2 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Biological Sex:</span>
                <span className="font-bold text-gray-900 capitalize">{data.gender}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Age:</span>
                <span className="font-bold text-gray-900">{data.age} years</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Height:</span>
                <span className="font-bold text-gray-900">{data.heightCm} cm</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Weight:</span>
                <span className="font-bold text-gray-900">{data.weightKg} kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Waist Circumference:</span>
                <span className="font-bold text-gray-900">{Math.round((data.waistIn || 31.5) * 2.54)} cm ({data.waistIn || 31.5} in)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Neck Circumference:</span>
                <span className="font-bold text-gray-900">{Math.round((data.neckIn || 14.2) * 2.54)} cm ({data.neckIn || 14.2} in)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Primary Goal:</span>
                <span className="font-bold text-emerald-700 capitalize">{(data.goal || "fat-loss").replace("-", " ")}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href="/details"
                onClick={() => setDetailsModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-center text-xs hover:bg-gray-50"
              >
                Edit Measurements
              </Link>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-bold text-center text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sleek Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
