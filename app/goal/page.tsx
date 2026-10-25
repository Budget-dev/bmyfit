"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { saveDraftGoal } from "@/features/assessment/session-store";
import type { FitnessGoal } from "@/types/fitness";

type FocusOption = "lose-fat" | "build-strength" | "improve-fitness" | "build-consistency";
type ExperienceOption = "beginner" | "intermediate" | "advanced";

export default function GoalPage() {
  const router = useRouter();

  const [selectedFocus, setSelectedFocus] = useState<FocusOption>("lose-fat");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceOption>("beginner");

  React.useEffect(() => {
    router.prefetch("/details");
  }, [router]);

  const handleContinue = () => {
    // Map focus option to closest primary FitnessGoal for plan calculation
    let goal: FitnessGoal = "muscle-gain";
    if (selectedFocus === "lose-fat") goal = "fat-loss";
    else if (selectedFocus === "build-strength") goal = "muscle-gain";
    else if (selectedFocus === "improve-fitness") goal = "weight-loss";
    else if (selectedFocus === "build-consistency") goal = "weight-gain";

    saveDraftGoal({
      goal,
      activityLevel: experienceLevel === "beginner" ? "lightly-active" : experienceLevel === "intermediate" ? "moderately-active" : "very-active",
    });

    router.push("/details");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* 1. Top Header */}
      <SiteHeader />

      {/* 2. Main Content Container - Fits cleanly above the bottom navigation bar */}
      <main className="flex-1 max-w-md mx-auto w-full px-3.5 sm:px-4 pt-0.5 pb-28 sm:pb-32 flex flex-col justify-start overflow-x-hidden">
        
        {/* Back Button & Section Label */}
        <div className="flex items-center gap-2 mt-0.5">
          <Link
            href="/"
            className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors active:scale-95 shrink-0"
            aria-label="Back to home"
          >
            <svg className="w-3.5 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#057a44]">
            YOUR GOAL
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[21px] min-[390px]:text-[23px] sm:text-[25px] font-black tracking-tight leading-[1.08] text-gray-950 mt-0.5">
          Let’s build{" "}
          <span className="text-[#00e676]">your plan</span>.
        </h1>

        {/* Subtitle */}
        <p className="text-[9px] min-[390px]:text-[10px] text-gray-500 leading-tight mt-0.5">
          Help us understand what matters to you so we can personalize your plan better.
        </p>

        {/* Selected Goal Hero Card - Preserves exact aspect ratio so checkmark, text & model are 100% visible */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-emerald-950/40 mt-1.5 select-none aspect-[466/166] max-h-[120px] shrink-0">
          <Image
            src="/images/goal-card-2x.png"
            alt="Selected Goal: Muscle Gain - Build lean muscle & strength"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center"
          />
        </div>

        {/* Section 1: What matters most to you? */}
        <div className="mt-2 text-left">
          <h2 className="text-[12.5px] min-[390px]:text-[13.5px] font-black text-gray-950 tracking-tight leading-tight">
            What matters most to you?
          </h2>
          <p className="text-[8.5px] min-[390px]:text-[9px] text-gray-500 leading-tight mt-0.5">
            Select one primary focus for your plan.
          </p>

          {/* 2x2 Grid of Focus Radio Cards - Equal heights eliminate zigzagging */}
          <div className="grid grid-cols-2 gap-1.5 min-[390px]:gap-2 mt-1">
            
            {/* 1. Lose body fat */}
            <div
              onClick={() => setSelectedFocus("lose-fat")}
              className={`h-[48px] min-[390px]:h-[50px] px-2 rounded-xl border flex items-center justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                selectedFocus === "lose-fat"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <div className="w-6 h-6 min-[390px]:w-6.5 min-[390px]:h-6.5 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Lose body fat</div>
                  <div className="text-[7.5px] min-[390px]:text-[8px] text-gray-500 leading-none mt-0.5 truncate">Reduce fat &amp; keep muscle.</div>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                selectedFocus === "lose-fat" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
              }`}>
                {selectedFocus === "lose-fat" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
              </div>
            </div>

            {/* 2. Build strength */}
            <div
              onClick={() => setSelectedFocus("build-strength")}
              className={`h-[48px] min-[390px]:h-[50px] px-2 rounded-xl border flex items-center justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                selectedFocus === "build-strength"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <div className="w-6 h-6 min-[390px]:w-6.5 min-[390px]:h-6.5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-800">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                    <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                    <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.2" />
                    <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                    <rect x="19" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Build strength</div>
                  <div className="text-[7.5px] min-[390px]:text-[8px] text-gray-500 leading-none mt-0.5 truncate">Get stronger &amp; lift better.</div>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                selectedFocus === "build-strength" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
              }`}>
                {selectedFocus === "build-strength" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
              </div>
            </div>

            {/* 3. Improve fitness */}
            <div
              onClick={() => setSelectedFocus("improve-fitness")}
              className={`h-[48px] min-[390px]:h-[50px] px-2 rounded-xl border flex items-center justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                selectedFocus === "improve-fitness"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <div className="w-6 h-6 min-[390px]:w-6.5 min-[390px]:h-6.5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-[#057a44]">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="12" width="3.5" height="9" rx="0.8" />
                    <rect x="10" y="7" width="3.5" height="14" rx="0.8" />
                    <rect x="17" y="3" width="3.5" height="18" rx="0.8" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Improve fitness</div>
                  <div className="text-[7.5px] min-[390px]:text-[8px] text-gray-500 leading-none mt-0.5 truncate">Increase stamina &amp; energy.</div>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                selectedFocus === "improve-fitness" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
              }`}>
                {selectedFocus === "improve-fitness" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
              </div>
            </div>

            {/* 4. Build consistency */}
            <div
              onClick={() => setSelectedFocus("build-consistency")}
              className={`h-[48px] min-[390px]:h-[50px] px-2 rounded-xl border flex items-center justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                selectedFocus === "build-consistency"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <div className="w-6 h-6 min-[390px]:w-6.5 min-[390px]:h-6.5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-[#057a44]">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Build consistency</div>
                  <div className="text-[7.5px] min-[390px]:text-[8px] text-gray-500 leading-none mt-0.5 truncate">Sustainable routine plan.</div>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                selectedFocus === "build-consistency" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
              }`}>
                {selectedFocus === "build-consistency" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Your experience level */}
        <div className="mt-2 text-left">
          <h2 className="text-[12.5px] min-[390px]:text-[13.5px] font-black text-gray-950 tracking-tight leading-tight">
            Your experience level
          </h2>
          <p className="text-[8.5px] min-[390px]:text-[9px] text-gray-500 leading-tight mt-0.5">
            This helps us create the right plan for your current fitness level.
          </p>

          {/* 3-Column Experience Grid - Uniform heights and aligned radio indicators */}
          <div className="grid grid-cols-3 gap-1.5 min-[390px]:gap-2 mt-1">
            
            {/* Beginner */}
            <div
              onClick={() => setExperienceLevel("beginner")}
              className={`h-[68px] min-[390px]:h-[72px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                experienceLevel === "beginner"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5.5 h-5.5 min-[390px]:w-6 min-[390px]:h-6 rounded-full bg-emerald-100/70 text-[#057a44] flex items-center justify-center">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="7" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a6.5 6.5 0 0113 0" />
                  </svg>
                </div>
                <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  experienceLevel === "beginner" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                }`}>
                  {experienceLevel === "beginner" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Beginner</div>
                <div className="text-[7px] min-[390px]:text-[7.5px] text-gray-500 leading-none mt-0.5 truncate">New or starting out.</div>
              </div>
            </div>

            {/* Intermediate */}
            <div
              onClick={() => setExperienceLevel("intermediate")}
              className={`h-[68px] min-[390px]:h-[72px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                experienceLevel === "intermediate"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5.5 h-5.5 min-[390px]:w-6 min-[390px]:h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="14" width="4" height="7" rx="0.8" />
                    <rect x="10" y="9" width="4" height="12" rx="0.8" />
                    <rect x="17" y="4" width="4" height="17" rx="0.8" />
                  </svg>
                </div>
                <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  experienceLevel === "intermediate" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                }`}>
                  {experienceLevel === "intermediate" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Intermediate</div>
                <div className="text-[7px] min-[390px]:text-[7.5px] text-gray-500 leading-none mt-0.5 truncate">Some regular workout.</div>
              </div>
            </div>

            {/* Advanced */}
            <div
              onClick={() => setExperienceLevel("advanced")}
              className={`h-[68px] min-[390px]:h-[72px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-w-0 ${
                experienceLevel === "advanced"
                  ? "bg-[#eaf7ee] border-emerald-400 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-5.5 h-5.5 min-[390px]:w-6 min-[390px]:h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                  <svg className="w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                </div>
                <div className={`w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  experienceLevel === "advanced" ? "border-2 border-[#00c853] bg-transparent" : "border border-gray-300 bg-white"
                }`}>
                  {experienceLevel === "advanced" && <div className="w-[6px] h-[6px] rounded-full bg-[#00c853]" />}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] min-[390px]:text-[11px] font-bold text-gray-950 leading-tight truncate">Advanced</div>
                <div className="text-[7px] min-[390px]:text-[7.5px] text-gray-500 leading-none mt-0.5 truncate">Consistent training.</div>
              </div>
            </div>

          </div>
        </div>

        {/* Soft Mint Personalized Plan Banner */}
        <div className="mt-2 p-1.5 min-[390px]:p-2 rounded-xl bg-[#eaf7ee] border border-emerald-200/60 flex items-center gap-2 text-left">
          <div className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0">
            <svg className="w-3 min-[390px]:w-3.5 h-3 min-[390px]:h-3 text-[#057a44]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] min-[390px]:text-[9.5px] font-extrabold text-gray-950 leading-tight truncate">
              Your plan is personalized around your body, goal and routine.
            </div>
            <div className="text-[7px] min-[390px]:text-[7.5px] text-gray-600 leading-snug mt-0.5 truncate">
              Combines your inputs with proven fitness and nutrition principles to fit you.
            </div>
          </div>
        </div>

        {/* Action Button: Continue to Body Details - Prominently positioned upon the navigation buttons */}
        <div className="fixed bottom-[52px] sm:bottom-[56px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100/90 py-2.5 px-3.5 sm:px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
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
