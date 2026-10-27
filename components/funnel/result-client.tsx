"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import type { Assessment } from "@/types/fitness";

export interface ResultClientProps {
  id?: string;
  assessment?: Assessment;
}

export function ResultClient({ id, assessment: initialAssessment }: ResultClientProps) {
  const router = useRouter();
  const { getIdToken, loading: authLoading } = useAuth();

  const [assessment, setAssessment] = useState<Assessment | null>(initialAssessment ?? null);
  const [loading, setLoading] = useState<boolean>(!initialAssessment);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Load assessment from server API or local session fallback
  useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);
      setLoading(false);
      return;
    }

    // Check local session storage first if id === "local" or as immediate fallback
    if (id === "local" || !id) {
      try {
        const raw = sessionStorage.getItem("bmyfit_local_assessment");
        if (raw) {
          setAssessment(JSON.parse(raw));
          setLoading(false);
          return;
        }
      } catch {}
    }

    if (!id || authLoading) return;

    let isMounted = true;
    async function loadAssessment() {
      try {
        setLoading(true);
        const token = await getIdToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/assessments/${id}`, { headers });
        if (!res.ok) {
          // If server fails, fallback to session storage if available
          const raw = sessionStorage.getItem("bmyfit_local_assessment");
          if (raw) {
            if (isMounted) {
              setAssessment(JSON.parse(raw));
              setLoading(false);
            }
            return;
          }
          throw new Error("Unable to load your assessment result.");
        }
        const data = await res.json();
        if (isMounted) {
          setAssessment(data.assessment);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          // Fallback to local session
          try {
            const raw = sessionStorage.getItem("bmyfit_local_assessment");
            if (raw) {
              setAssessment(JSON.parse(raw));
              setLoading(false);
              return;
            }
          } catch {}
          setLoading(false);
        }
      }
    }

    void loadAssessment();

    return () => {
      isMounted = false;
    };
  }, [id, initialAssessment, authLoading, getIdToken]);

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
  const bmiValue = data.bmi || 24.2;
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

  // Body fat metrics
  const isMale = data.gender === "male";
  const bodyFatVal = data.bodyFatPercent ?? (isMale ? 18.4 : 24.5);
  const bfCategoryLabel =
    bodyFatVal < (isMale ? 14 : 21)
      ? "Athletic"
      : bodyFatVal <= (isMale ? 20 : 28)
      ? "Moderate"
      : "Above Average";

  // Calculate gauge position percent for Body Fat (range 8% to 36%)
  const bfPercent = Math.min(Math.max(((bodyFatVal - 8) / (36 - 8)) * 100, 5), 95);

  // Goal config
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
  }[data.goal] || {
    name: "Fat Loss",
    icon: "🔥",
    tagline: "Reduce body fat while maintaining lean muscle.",
  };

  const handleUnlockPlan = () => {
    router.push(`/checkout/${data.id || "latest"}`);
  };

  if (loading) {
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
          <div className="grid grid-cols-3 gap-1.5 text-left">
            
            {/* Card 1: BMI */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-1.5 min-[390px]:p-2 flex flex-col justify-between min-h-[96px] min-[390px]:min-h-[102px]">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                      <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                      <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                    </svg>
                  </div>
                  <span className="text-[8.5px] min-[390px]:text-[9px] font-black text-gray-950">BMI</span>
                </div>

                {/* Big Number */}
                <div className="text-[16px] min-[390px]:text-[17px] font-black text-gray-950 tracking-tight leading-tight my-0.5">
                  {bmiValue.toFixed(1)}
                </div>

                {/* Pill Badge */}
                <span className="inline-block px-1.5 py-0.2 rounded-full bg-[#dcfce7] text-[#15803d] text-[7.5px] min-[390px]:text-[8px] font-extrabold leading-tight">
                  {bmiCategoryLabel}
                </span>
              </div>

              {/* Scale / Gauge Bar */}
              <div className="mt-auto pt-1">
                <div className="relative h-1 w-full rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500">
                  {/* Indicator Arrow */}
                  <div
                    className="absolute -top-1 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-950 -translate-x-1/2"
                    style={{ left: `${bmiPercent}%` }}
                  />
                </div>
                <div className="text-[7px] font-bold text-gray-900 mt-0.5 leading-tight">18.5 – 24.9</div>
                <div className="text-[6px] text-gray-500 leading-none">Healthy range</div>
              </div>
            </div>

            {/* Card 2: Estimated Body Fat */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-1.5 min-[390px]:p-2 flex flex-col justify-between min-h-[96px] min-[390px]:min-h-[102px]">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-[#057a44] leading-none">%</span>
                  </div>
                  <span className="text-[8px] min-[390px]:text-[8.5px] font-black text-gray-950 leading-tight">
                    Estimated<br />Body Fat
                  </span>
                </div>

                {/* Big Number */}
                <div className="text-[16px] min-[390px]:text-[17px] font-black text-gray-950 tracking-tight leading-tight my-0.5">
                  {bodyFatVal.toFixed(1)}%
                </div>

                {/* Pill Badge */}
                <span className="inline-block px-1.5 py-0.2 rounded-full bg-[#fef3c7] text-[#b45309] text-[7.5px] min-[390px]:text-[8px] font-extrabold leading-tight">
                  {bfCategoryLabel}
                </span>
              </div>

              {/* Scale / Gauge Bar */}
              <div className="mt-auto pt-1">
                <div className="relative h-1 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500">
                  {/* Indicator Arrow */}
                  <div
                    className="absolute -top-1 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-950 -translate-x-1/2"
                    style={{ left: `${bfPercent}%` }}
                  />
                </div>
                <div className="text-[7px] font-bold text-gray-900 mt-0.5 leading-tight">
                  {isMale ? "14% - 20%" : "21% - 28%"}
                </div>
                <div className="text-[6px] text-gray-500 leading-none">
                  {isMale ? "Healthy range (Men)" : "Healthy range (Women)"}
                </div>
              </div>
            </div>

            {/* Card 3: Your Goal */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-1.5 min-[390px]:p-2 flex flex-col justify-between min-h-[96px] min-[390px]:min-h-[102px]">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[8px] min-[390px]:text-[8.5px] font-black text-gray-950">Your Goal</span>
                </div>

                {/* Goal Tag */}
                <div className="flex items-center gap-1 mt-1.5 mb-0.5">
                  <span className="text-[11px]">{goalConfig.icon}</span>
                  <span className="text-[10px] min-[390px]:text-[11px] font-black text-gray-950 leading-tight">
                    {goalConfig.name}
                  </span>
                </div>
              </div>

              {/* Peach callout box at bottom */}
              <div className="mt-auto rounded-lg bg-[#fff7ed] border border-[#ffedd5] p-1">
                <p className="text-[6.5px] min-[390px]:text-[7px] text-gray-700 leading-tight">
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
                  ~{Math.round(10 * data.weightKg + 6.25 * data.heightCm - 5 * data.age + (data.gender === "male" ? 5 : -161))} kcal BMR
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
          <div className="mt-1.5 min-[390px]:mt-2 rounded-2xl bg-[#031c14] border border-emerald-950 p-2 min-[390px]:p-2.5 text-white text-left relative overflow-hidden shadow-lg">
            {/* Ambient emerald backlight glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Heading */}
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[#00e676] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <h3 className="text-[12px] min-[390px]:text-[13px] font-black tracking-tight leading-tight">
                  Your personalized plan <span className="text-[#00e676]">is ready</span>
                </h3>
              </div>
              <p className="text-[7.5px] min-[390px]:text-[8px] text-gray-300 mt-0.5">
                Get a complete 8-week plan based on your body data and goal.
              </p>
            </div>

            {/* Middle Section: 6 Feature Bullets & Phone Mockup */}
            <div className="relative z-10 flex items-center justify-between gap-1.5 mt-1.5 min-[390px]:mt-2">
              
              {/* Left Column: 6 Feature Points (2 cols of 3) */}
              <div className="flex-1 grid grid-cols-2 gap-x-1.5 gap-y-1">
                
                {/* 1. Daily calorie target */}
                <div className="flex items-start gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] min-[390px]:text-[8.5px] font-bold text-white leading-tight">
                      Daily calorie target
                    </div>
                    <div className="text-[6.5px] min-[390px]:text-[7px] text-gray-400 leading-none mt-0.5 truncate">
                      Based on your body &amp; goal
                    </div>
                  </div>
                </div>

                {/* 2. Protein target */}
                <div className="flex items-start gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] min-[390px]:text-[8.5px] font-bold text-white leading-tight">
                      Protein target
                    </div>
                    <div className="text-[6.5px] min-[390px]:text-[7px] text-gray-400 leading-none mt-0.5 truncate">
                      Optimize for your goal
                    </div>
                  </div>
                </div>

                {/* 3. Personalized workout */}
                <div className="flex items-start gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="2" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                      <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                      <rect x="19.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] min-[390px]:text-[8.5px] font-bold text-white leading-tight">
                      Personalized workout
                    </div>
                    <div className="text-[6.5px] min-[390px]:text-[7px] text-gray-400 leading-none mt-0.5 truncate">
                      Sets, reps &amp; progression
                    </div>
                  </div>
                </div>

                {/* 4. Indian diet plan */}
                <div className="flex items-start gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] min-[390px]:text-[8.5px] font-bold text-white leading-tight">
                      Indian diet plan
                    </div>
                    <div className="text-[6.5px] min-[390px]:text-[7px] text-gray-400 leading-none mt-0.5 truncate">
                      Simple &amp; practical meals
                    </div>
                  </div>
                </div>

                {/* 5. Progress tracking */}
                <div className="flex items-start gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                      <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                      <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] min-[390px]:text-[8.5px] font-bold text-white leading-tight">
                      Progress tracking
                    </div>
                    <div className="text-[6.5px] min-[390px]:text-[7px] text-gray-400 leading-none mt-0.5 truncate">
                      Track your changes weekly
                    </div>
                  </div>
                </div>

                {/* 6. 8-week structure */}
                <div className="flex items-start gap-1">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] min-[390px]:text-[8.5px] font-bold text-white leading-tight">
                      8-week structure
                    </div>
                    <div className="text-[6.5px] min-[390px]:text-[7px] text-gray-400 leading-none mt-0.5 truncate">
                      Step-by-step guidance
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Isometric 3D Smartphone Plan Mockup Graphic */}
              <div className="w-[82px] min-[390px]:w-[92px] aspect-[3/4] relative shrink-0">
                <Image
                  src="/images/plan-phone-mockup.png"
                  alt="BMYFIT Plan Phone Mockup"
                  fill
                  sizes="120px"
                  className="object-contain drop-shadow-xl"
                />
              </div>

            </div>

            {/* Primary Action Button: Unlock My Plan - ₹99 */}
            <button
              type="button"
              onClick={handleUnlockPlan}
              className="w-full py-2 min-[390px]:py-2.5 px-3 rounded-full bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-[12px] min-[390px]:text-[13px] flex items-center justify-center gap-1.5 shadow-[0_3px_15px_rgba(0,230,118,0.4)] active:scale-95 transition-all cursor-pointer mt-1.5 min-[390px]:mt-2"
            >
              <span>Unlock My Plan — ₹99</span>
              <span className="text-sm font-black">→</span>
            </button>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-2.5 text-[7.5px] min-[390px]:text-[8px] text-gray-300 font-medium mt-1 select-none">
              <span className="flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-[#00e676]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                One-time payment
              </span>
              <span>•</span>
              <span>No subscription</span>
              <span>•</span>
              <span>Secure payment</span>
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
            <div className="grid grid-cols-4 gap-1 min-[390px]:gap-1.5">
              
              {/* Card 1: Nutrition */}
              <div className="rounded-xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-1 min-[390px]:p-1.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px]">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#057a44] flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                  </svg>
                </div>
                <div className="mt-1">
                  <div className="text-[8px] min-[390px]:text-[8.5px] font-black text-gray-950 leading-tight">Nutrition</div>
                  <div className="text-[6px] min-[390px]:text-[6.5px] text-gray-500 leading-tight mt-0.5">
                    Personalized calories + Indian meal options
                  </div>
                </div>
              </div>

              {/* Card 2: Training */}
              <div className="rounded-xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-1 min-[390px]:p-1.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px]">
                <div className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                    <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                    <rect x="19.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                  </svg>
                </div>
                <div className="mt-1">
                  <div className="text-[8px] min-[390px]:text-[8.5px] font-black text-gray-950 leading-tight">Training</div>
                  <div className="text-[6px] min-[390px]:text-[6.5px] text-gray-500 leading-tight mt-0.5">
                    Goal-specific workout + progression
                  </div>
                </div>
              </div>

              {/* Card 3: Progress */}
              <div className="rounded-xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-1 min-[390px]:p-1.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px]">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                    <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                    <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                  </svg>
                </div>
                <div className="mt-1">
                  <div className="text-[8px] min-[390px]:text-[8.5px] font-black text-gray-950 leading-tight">Progress</div>
                  <div className="text-[6px] min-[390px]:text-[6.5px] text-gray-500 leading-tight mt-0.5">
                    Clear weekly structure to track changes
                  </div>
                </div>
              </div>

              {/* Card 4: Strategy */}
              <div className="rounded-xl bg-white border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-1 min-[390px]:p-1.5 flex flex-col justify-between min-h-[58px] min-[390px]:min-h-[64px]">
                <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="mt-1">
                  <div className="text-[8px] min-[390px]:text-[8.5px] font-black text-gray-950 leading-tight">Strategy</div>
                  <div className="text-[6px] min-[390px]:text-[6.5px] text-gray-500 leading-tight mt-0.5">
                    Built around YOUR body data and goal
                  </div>
                </div>
              </div>

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
                <span className="font-bold text-emerald-700 capitalize">{data.goal.replace("-", " ")}</span>
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
