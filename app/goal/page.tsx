"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { saveDraftGoal, loadDraftGoal } from "@/features/assessment/session-store";
import type { FitnessGoal } from "@/types/fitness";

type FocusOption = "lose-fat" | "build-strength" | "improve-fitness" | "build-consistency";
type ExperienceOption = "beginner" | "intermediate" | "advanced";

const GOAL_HERO_CARDS: Record<
  FocusOption,
  {
    image: string;
    alt: string;
    title: string;
    subtitle: string;
    description: string;
    benefits: string[];
  }
> = {
  "lose-fat": {
    image: "/images/goal-card-lose-fat.png",
    alt: "Selected Goal: Lose Body Fat - Reduce fat & keep muscle",
    title: "Lose Body Fat",
    subtitle: "Reduce fat & keep muscle.",
    description:
      "Calculated for a safe 300–500 kcal deficit with Indian home-cooked meals, retaining muscle while targeting stubborn abdominal fat.",
    benefits: [
      "Targeted abdominal fat burn",
      "Preserves lean metabolic muscle mass",
      "High-protein South Asian meal options",
    ],
  },
  "build-strength": {
    image: "/images/goal-card-build-strength.png",
    alt: "Selected Goal: Build Strength - Get stronger & lift better",
    title: "Build Strength",
    subtitle: "Get stronger & lift better.",
    description:
      "Hypertrophy and functional power. Progressive compound movements with optimal protein distribution for sustained muscle repair.",
    benefits: [
      "Progressive overload lifting split",
      "Caloric surplus optimized for Indian digestion",
      "Tendon & joint recovery protocols",
    ],
  },
  "improve-fitness": {
    image: "/images/goal-card-improve-fitness.png",
    alt: "Selected Goal: Improve Fitness - Increase stamina & energy",
    title: "Improve Fitness",
    subtitle: "Increase stamina & energy.",
    description:
      "Boost cardiovascular endurance, energy levels, and mobility. Balances steady-state cardio with functional strength.",
    benefits: [
      "High energy throughout workdays",
      "Improved VO2 max & stamina",
      "Flexible workout durations (30–45 mins)",
    ],
  },
  "build-consistency": {
    image: "/images/goal-card-build-consistency.png",
    alt: "Selected Goal: Build Consistency - Sustainable routine plan",
    title: "Build Consistency",
    subtitle: "Sustainable routine plan.",
    description:
      "Designed for busy Indian working professionals and parents. Low-friction habits that make daily fitness effortless and lifelong.",
    benefits: [
      "Zero-burnout daily habit pacing",
      "Simple meal planning around family dinners",
      "Home or gym friendly routines",
    ],
  },
};

export default function GoalPage() {
  const router = useRouter();

  const [selectedFocus, setSelectedFocus] = useState<FocusOption>("lose-fat");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceOption>("beginner");

  React.useEffect(() => {
    router.prefetch("/details");
    const draft = loadDraftGoal();
    if (draft?.goal) {
      if (draft.goal === "fat-loss") setSelectedFocus("lose-fat");
      else if (draft.goal === "muscle-gain") setSelectedFocus("build-strength");
      else if (draft.goal === "weight-loss") setSelectedFocus("improve-fitness");
      else if (draft.goal === "weight-gain") setSelectedFocus("build-consistency");
    }
  }, [router]);

  const handleContinue = () => {
    let goal: FitnessGoal = "fat-loss";
    if (selectedFocus === "lose-fat") goal = "fat-loss";
    else if (selectedFocus === "build-strength") goal = "muscle-gain";
    else if (selectedFocus === "improve-fitness") goal = "weight-loss";
    else if (selectedFocus === "build-consistency") goal = "weight-gain";

    saveDraftGoal({
      goal,
      activityLevel:
        experienceLevel === "beginner"
          ? "lightly-active"
          : experienceLevel === "intermediate"
          ? "moderately-active"
          : "very-active",
    });

    router.push("/details");
  };

  const activeHero = GOAL_HERO_CARDS[selectedFocus];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#00e676] selection:text-black overflow-x-hidden">
      {/* 1. Top Header */}
      <SiteHeader />

      {/* 2. Main Content Container: max-w-md on mobile, expands to max-w-5xl / lg:max-w-6xl on desktop */}
      <main className="flex-1 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-2 md:pt-6 pb-28 sm:pb-32 md:pb-16 flex flex-col justify-start">
        {/* Back Button & Section Label */}
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Link
            href="/"
            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors active:scale-95 shrink-0"
            aria-label="Back to home"
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-[#057a44]">
            STEP 1 OF 3 · YOUR GOAL
          </span>
        </div>

        {/* Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Selections & Form (md:col-span-7) */}
          <div className="md:col-span-7 space-y-4 md:space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-950">
                Let’s build <span className="text-[#00c853]">your plan</span>.
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Help us understand what matters to you so Coach Naveen can personalize your plan with surgical accuracy.
              </p>
            </div>

            {/* Mobile Hero Card Preview (shown only on mobile) */}
            <div className="md:hidden relative w-full rounded-2xl overflow-hidden shadow-md border border-emerald-950/40 select-none aspect-[466/166] max-h-[120px] shrink-0 bg-[#060b09]">
              {(Object.keys(GOAL_HERO_CARDS) as FocusOption[]).map((key) => {
                const card = GOAL_HERO_CARDS[key];
                const isActive = selectedFocus === key;
                return (
                  <div
                    key={key}
                    className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      priority={key === "lose-fat" || key === selectedFocus}
                      sizes="(max-width: 768px) 100vw, 448px"
                      className="object-cover object-center"
                    />
                  </div>
                );
              })}
            </div>

            {/* Section 1: What matters most to you? */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-base font-black text-gray-950 tracking-tight">
                  What matters most to you?
                </h2>
                <span className="text-[11px] text-gray-500 hidden sm:inline">Select 1 option</span>
              </div>
              <p className="text-[11px] md:text-xs text-gray-500">
                Select the primary transformation focus for your 8-week blueprint.
              </p>

              {/* 2x2 Grid of Focus Radio Cards */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 pt-1">
                {/* 1. Lose body fat */}
                <div
                  onClick={() => setSelectedFocus("lose-fat")}
                  className={`p-3 md:p-4 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    selectedFocus === "lose-fat"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-bold text-gray-950 truncate">Lose body fat</div>
                      <div className="text-[10px] md:text-xs text-gray-500 leading-tight truncate">
                        Reduce fat &amp; keep muscle
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedFocus === "lose-fat" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {selectedFocus === "lose-fat" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                  </div>
                </div>

                {/* 2. Build strength */}
                <div
                  onClick={() => setSelectedFocus("build-strength")}
                  className={`p-3 md:p-4 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    selectedFocus === "build-strength"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-800">
                      <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <rect x="2.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                        <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                        <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                        <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                        <rect x="19" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-bold text-gray-950 truncate">Build strength</div>
                      <div className="text-[10px] md:text-xs text-gray-500 leading-tight truncate">
                        Get stronger &amp; lift better
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedFocus === "build-strength" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {selectedFocus === "build-strength" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                  </div>
                </div>

                {/* 3. Improve fitness */}
                <div
                  onClick={() => setSelectedFocus("improve-fitness")}
                  className={`p-3 md:p-4 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    selectedFocus === "improve-fitness"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-[#057a44]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                        <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                        <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-bold text-gray-950 truncate">Improve fitness</div>
                      <div className="text-[10px] md:text-xs text-gray-500 leading-tight truncate">
                        Increase stamina &amp; energy
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedFocus === "improve-fitness" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {selectedFocus === "improve-fitness" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                  </div>
                </div>

                {/* 4. Build consistency */}
                <div
                  onClick={() => setSelectedFocus("build-consistency")}
                  className={`p-3 md:p-4 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    selectedFocus === "build-consistency"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-[#057a44]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-bold text-gray-950 truncate">Build consistency</div>
                      <div className="text-[10px] md:text-xs text-gray-500 leading-tight truncate">
                        Sustainable routine plan
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedFocus === "build-consistency" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {selectedFocus === "build-consistency" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Your experience level */}
            <div className="space-y-2 pt-2">
              <h2 className="text-sm md:text-base font-black text-gray-950 tracking-tight">
                Your experience level
              </h2>
              <p className="text-[11px] md:text-xs text-gray-500">
                This helps us calibrate training volume and recovery frequency.
              </p>

              {/* 3-Column Experience Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {/* Beginner */}
                <div
                  onClick={() => setExperienceLevel("beginner")}
                  className={`p-3 md:p-4 rounded-2xl border flex flex-col justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    experienceLevel === "beginner"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100/70 text-[#057a44] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="7" r="4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a6.5 6.5 0 0113 0" />
                      </svg>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        experienceLevel === "beginner" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                      }`}
                    >
                      {experienceLevel === "beginner" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-gray-950">Beginner</div>
                    <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">New or restarting</div>
                  </div>
                </div>

                {/* Intermediate */}
                <div
                  onClick={() => setExperienceLevel("intermediate")}
                  className={`p-3 md:p-4 rounded-2xl border flex flex-col justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    experienceLevel === "intermediate"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="14" width="4" height="7" rx="0.8" />
                        <rect x="10" y="9" width="4" height="12" rx="0.8" />
                        <rect x="17" y="4" width="4" height="17" rx="0.8" />
                      </svg>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        experienceLevel === "intermediate" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                      }`}
                    >
                      {experienceLevel === "intermediate" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-gray-950">Intermediate</div>
                    <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">Regular workout</div>
                  </div>
                </div>

                {/* Advanced */}
                <div
                  onClick={() => setExperienceLevel("advanced")}
                  className={`p-3 md:p-4 rounded-2xl border flex flex-col justify-between cursor-pointer active:scale-98 transition-all min-w-0 ${
                    experienceLevel === "advanced"
                      ? "bg-[#eaf7ee] border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                      </svg>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        experienceLevel === "advanced" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                      }`}
                    >
                      {experienceLevel === "advanced" && <div className="w-2 h-2 rounded-full bg-[#00c853]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-gray-950">Advanced</div>
                    <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">Consistent training</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Soft Mint Personalized Plan Banner */}
            <div className="p-3 md:p-4 rounded-2xl bg-[#eaf7ee] border border-emerald-200/80 flex items-start gap-3 text-left">
              <div className="w-7 h-7 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs md:text-sm font-extrabold text-gray-950">
                  Your plan is 100% personalized around your body and lifestyle
                </div>
                <div className="text-[11px] md:text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Combines Indian nutritional guidelines with calibrated macro balance so you can eat home meals with your family without guilt.
                </div>
              </div>
            </div>

            {/* Desktop Continue Button (inside flow on md:block) */}
            <div className="hidden md:block pt-3">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-4 px-6 rounded-2xl bg-[#022319] hover:bg-[#033022] text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/20 active:scale-98 transition-all cursor-pointer group"
              >
                <span>Continue to Body Details</span>
                <span className="text-[#00e676] text-base group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Goal Preview & Coach Naveen Note (md:col-span-5) */}
          <div className="hidden md:flex flex-col gap-5 md:col-span-5 sticky top-24">
            {/* Dynamic Goal Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-950/40 bg-[#060b09] text-white group">
              <div className="relative w-full aspect-[16/10]">
                <Image
                  src={activeHero.image}
                  alt={activeHero.alt}
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060b09] via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-black uppercase text-[#00e676]">
                  Selected Focus
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white">{activeHero.title}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{activeHero.subtitle}</p>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{activeHero.description}</p>

                <div className="space-y-2 pt-2 border-t border-emerald-950/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    What You Get in 8 Weeks:
                  </span>
                  <ul className="space-y-1.5">
                    {activeHero.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-200">
                        <span className="w-4 h-4 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Coach Tip Card */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500 shrink-0">
                  <Image
                    src="/images/coach-naveen.jpg"
                    alt="Coach Naveen"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-950">Coach Naveen’s Advice</h4>
                  <p className="text-[11px] text-gray-500">7+ Years Coaching Indian Adults</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                &ldquo;Do not worry about being perfect on day one. Selecting your true starting point gives us the exact metabolic baseline to design meals you will actually enjoy eating.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-Only Action Button: Continue to Body Details (Fixed to bottom) */}
        <div className="md:hidden fixed bottom-[52px] sm:bottom-[56px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100/90 py-2.5 px-3.5 sm:px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3 px-4 rounded-full bg-[#022319] hover:bg-[#033022] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(2,35,25,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              <span>Continue to Body Details</span>
              <span className="text-[#00e676] text-sm font-bold">→</span>
            </button>
          </div>
        </div>
      </main>

      {/* 3. Sleek Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
