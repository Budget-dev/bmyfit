"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveDraftGoal } from "@/features/assessment/session-store";
import type { FitnessGoal } from "@/types/fitness";

export function TransformationGuide() {
  const router = useRouter();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const scrollToCalculator = () => {
    const el = document.getElementById("calculator-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = document.getElementById("input-age");
        if (input) input.focus();
      }, 400);
    }
  };

  const scrollToGoals = () => {
    const el = document.getElementById("goals-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleGoalSelect = (goal: FitnessGoal) => {
    saveDraftGoal({ goal });
    router.push("/details");
  };

  return (
    <section className="relative px-2.5 sm:px-4 pt-3 pb-8 md:pt-6 md:pb-12 max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto w-full">
      {/* 1. Top Feature Badges Row (Clickable pills on mobile, clean 4-card grid on desktop) */}
      <div className="flex md:grid md:grid-cols-4 items-center gap-1.5 sm:gap-2 md:gap-4 overflow-x-auto md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 -mx-0.5">
        {/* Goal Based */}
        <button
          type="button"
          onClick={scrollToGoals}
          className="flex items-center gap-2 md:gap-3 bg-[#f4fbf7] hover:bg-[#e6f7ee] border border-[#d1fae5] rounded-full md:rounded-2xl py-1.5 md:py-3 px-3 md:px-4 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white border border-[#a7f3d0] flex items-center justify-center text-[#057a44] shrink-0">
            <svg className="w-3.5 h-3.5 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-[10px] sm:text-[11px] md:text-sm font-black text-gray-950 leading-tight">Goal Based</div>
            <div className="text-[7.5px] sm:text-[8.5px] md:text-xs text-gray-500 leading-tight">Fat Loss • Muscle Gain • Recomp</div>
          </div>
        </button>

        {/* Data Driven */}
        <button
          type="button"
          onClick={scrollToCalculator}
          className="flex items-center gap-2 md:gap-3 bg-[#f4fbf7] hover:bg-[#e6f7ee] border border-[#d1fae5] rounded-full md:rounded-2xl py-1.5 md:py-3 px-3 md:px-4 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white border border-[#a7f3d0] flex items-center justify-center text-[#057a44] shrink-0">
            <svg className="w-3.5 h-3.5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="12" width="4" height="9" rx="1" />
              <rect x="10" y="7" width="4" height="14" rx="1" />
              <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-[10px] sm:text-[11px] md:text-sm font-black text-gray-950 leading-tight">Data Driven</div>
            <div className="text-[7.5px] sm:text-[8.5px] md:text-xs text-gray-500 leading-tight">Indian BMI + Navy Body Fat</div>
          </div>
        </button>

        {/* Personalized */}
        <button
          type="button"
          onClick={scrollToGoals}
          className="flex items-center gap-2 md:gap-3 bg-[#f4fbf7] hover:bg-[#e6f7ee] border border-[#d1fae5] rounded-full md:rounded-2xl py-1.5 md:py-3 px-3 md:px-4 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white border border-[#a7f3d0] flex items-center justify-center text-[#057a44] shrink-0">
            <svg className="w-3.5 h-3.5 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m-4.5 1.5l2.25 2.25M16.5 7.5L14.25 9.75M4 11h16a8 8 0 01-16 0z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-[10px] sm:text-[11px] md:text-sm font-black text-gray-950 leading-tight">Personalized</div>
            <div className="text-[7.5px] sm:text-[8.5px] md:text-xs text-gray-500 leading-tight">Workout + Indian Meals</div>
          </div>
        </button>

        {/* Support */}
        <button
          type="button"
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-2 md:gap-3 bg-[#f4fbf7] hover:bg-[#e6f7ee] border border-[#d1fae5] rounded-full md:rounded-2xl py-1.5 md:py-3 px-3 md:px-4 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white border border-[#a7f3d0] flex items-center justify-center text-[#057a44] shrink-0">
            <svg className="w-3.5 h-3.5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.15.83.84-3.07-.2-.32a8.2 8.2 0 01-1.26-4.36c0-4.55 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.25 8.23z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-[10px] sm:text-[11px] md:text-sm font-black text-gray-950 leading-tight">Support</div>
            <div className="text-[7.5px] sm:text-[8.5px] md:text-xs text-gray-500 leading-tight">WhatsApp Guidance</div>
          </div>
        </button>
      </div>

      {/* 2. HOW IT WORKS */}
      <div className="mt-5 md:mt-10 text-left">
        <div className="text-[9.5px] sm:text-[10.5px] md:text-xs font-black uppercase tracking-wider text-[#057a44]">
          HOW IT WORKS
        </div>
        <h2 className="text-[18px] sm:text-[22px] md:text-2xl lg:text-3xl font-black text-gray-950 mt-0.5 tracking-tight leading-snug">
          Your transformation starts in 4 simple steps
        </h2>
        <p className="text-[9.5px] sm:text-[11px] md:text-sm text-gray-500 mt-0.5 leading-snug">
          Know your body, get your clinical analysis and unlock a personalized Indian plan in just a few minutes.
        </p>

        {/* 4 Step Cards - Interactive & Clickable */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mt-3 md:mt-5">
          {/* Card 01 */}
          <div
            onClick={scrollToCalculator}
            className="group bg-[#fcfdfd] hover:bg-[#f2faf5] border border-gray-100 hover:border-emerald-300 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer active:scale-95 transition-all"
          >
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#dcfce7] group-hover:bg-[#00e676] group-hover:text-black text-[#057a44] font-black text-[10px] md:text-xs flex items-center justify-center mb-2 transition-colors">
              01
            </span>
            <div className="w-6 h-6 md:w-8 md:h-8 text-gray-900 group-hover:text-[#057a44] mb-2 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                <circle cx="12" cy="7" r="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a6.5 6.5 0 0113 0" />
              </svg>
            </div>
            <h3 className="text-[11px] md:text-sm font-black text-gray-950 leading-tight">Tell us about you</h3>
            <p className="text-[8px] sm:text-[8.5px] md:text-xs text-gray-500 mt-1 leading-snug">
              Height, weight &amp; measurements.
            </p>
          </div>

          {/* Card 02 */}
          <div
            onClick={scrollToGoals}
            className="group bg-[#fcfdfd] hover:bg-[#f2faf5] border border-gray-100 hover:border-emerald-300 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer active:scale-95 transition-all"
          >
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#dcfce7] group-hover:bg-[#00e676] group-hover:text-black text-[#057a44] font-black text-[10px] md:text-xs flex items-center justify-center mb-2 transition-colors">
              02
            </span>
            <div className="w-6 h-6 md:w-8 md:h-8 text-[#057a44] mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
                <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" />
                <line x1="2" y1="12" x2="4" y2="12" strokeLinecap="round" />
                <line x1="20" y1="12" x2="22" y2="12" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[11px] md:text-sm font-black text-gray-950 leading-tight">Choose your goal</h3>
            <p className="text-[8px] sm:text-[8.5px] md:text-xs text-gray-500 mt-1 leading-snug">
              Fat Loss, Muscle Gain, Recomp.
            </p>
          </div>

          {/* Card 03 */}
          <div
            onClick={scrollToCalculator}
            className="group bg-[#fcfdfd] hover:bg-[#f2faf5] border border-gray-100 hover:border-emerald-300 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer active:scale-95 transition-all"
          >
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#dcfce7] group-hover:bg-[#00e676] group-hover:text-black text-[#057a44] font-black text-[10px] md:text-xs flex items-center justify-center mb-2 transition-colors">
              03
            </span>
            <div className="w-6 h-6 md:w-8 md:h-8 text-[#057a44] mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                <rect x="3" y="13" width="4" height="8" rx="1" />
                <rect x="10" y="8" width="4" height="13" rx="1" />
                <rect x="17" y="4" width="4" height="17" rx="1" />
              </svg>
            </div>
            <h3 className="text-[11px] md:text-sm font-black text-gray-950 leading-tight">See body analysis</h3>
            <p className="text-[8px] sm:text-[8.5px] md:text-xs text-gray-500 mt-1 leading-snug">
              BMI + US Navy body fat %.
            </p>
          </div>

          {/* Card 04 */}
          <Link
            href="/details"
            className="group bg-[#fcfdfd] hover:bg-[#f2faf5] border border-gray-100 hover:border-emerald-300 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer active:scale-95 transition-all"
          >
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#dcfce7] group-hover:bg-[#00e676] group-hover:text-black text-[#057a44] font-black text-[10px] md:text-xs flex items-center justify-center mb-2 transition-colors">
              04
            </span>
            <div className="w-6 h-6 md:w-8 md:h-8 text-[#057a44] mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[11px] md:text-sm font-black text-gray-950 leading-tight">Unlock your plan</h3>
            <p className="text-[8px] sm:text-[8.5px] md:text-xs text-gray-500 mt-1 leading-snug">
              Personalized Indian plan for ₹99.
            </p>
          </Link>
        </div>

        {/* Start My Free Analysis Button */}
        <div className="mt-4 md:mt-6 flex justify-center">
          <button
            type="button"
            onClick={scrollToCalculator}
            className="w-full max-w-sm py-2.5 md:py-3 px-4 rounded-full bg-[#01231a] hover:bg-[#023325] text-white text-[11px] sm:text-xs md:text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(1,35,26,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <span>Start My Free Analysis</span>
            <span className="text-[12px] md:text-sm font-bold">→</span>
          </button>
        </div>
      </div>

      {/* 3. CHOOSE YOUR GOAL */}
      <div id="goals-section" className="mt-6 md:mt-12 text-left">
        <div className="text-[9.5px] sm:text-[10.5px] md:text-xs font-black uppercase tracking-wider text-[#057a44]">
          CHOOSE YOUR GOAL
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <h2 className="text-[18px] sm:text-[22px] md:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight">
            What’s Your Goal?
          </h2>
          <Link
            href="/details"
            className="inline-flex items-center gap-1 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-[#e8f7ee] hover:bg-[#d8f2e2] text-gray-900 text-[10px] md:text-xs font-extrabold transition-all active:scale-95"
          >
            <span>View All</span>
            <span className="text-gray-900">→</span>
          </Link>
        </div>

        <p className="text-[9.5px] sm:text-[11px] md:text-sm text-gray-500 mt-0.5 leading-snug">
          Select one goal to get started. Your plan will be fully personalized based on your body metrics and goal.
        </p>

        {/* 4 Goal Cards in 2x2 Grid on Mobile, 4 Across on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mt-3 md:mt-5">
          {/* 1. Fat Loss */}
          <Link
            href="/details"
            onClick={() => handleGoalSelect("fat-loss")}
            className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg overflow-hidden cursor-pointer hover:border-emerald-300 transition-all flex flex-col"
          >
            <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-900">
              <Image
                src="/images/goal-fat-loss-nano.jpg"
                alt="Fat Loss"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Flame Badge */}
              <div className="absolute left-2.5 -bottom-2.5 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md flex items-center justify-center text-orange-500 z-10 border border-gray-50">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
                </svg>
              </div>
            </div>
            <div className="p-2.5 md:p-4 pt-3.5 md:pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-[13px] md:text-sm font-black text-gray-950 leading-tight">Fat Loss</h3>
                <p className="text-[8.5px] sm:text-[9.5px] md:text-xs text-gray-500 leading-tight mt-0.5">Lose fat. Keep muscle.</p>
              </div>
              <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 group-hover:bg-[#e8f7ee] text-gray-700 group-hover:text-[#057a44] flex items-center justify-center text-xs font-bold transition-colors shrink-0">
                →
              </span>
            </div>
          </Link>

          {/* 2. Muscle Gain */}
          <Link
            href="/details"
            onClick={() => handleGoalSelect("muscle-gain")}
            className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg overflow-hidden cursor-pointer hover:border-emerald-300 transition-all flex flex-col"
          >
            <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-900">
              <Image
                src="/images/goal-muscle-gain-nano.jpg"
                alt="Muscle Gain"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Dumbbell Badge */}
              <div className="absolute left-2.5 -bottom-2.5 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#057a44] z-10 border border-gray-50">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                  <rect x="2.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                  <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                  <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.4" />
                  <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
                  <rect x="19" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="p-2.5 md:p-4 pt-3.5 md:pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-[13px] md:text-sm font-black text-gray-950 leading-tight">Muscle Gain</h3>
                <p className="text-[8.5px] sm:text-[9.5px] md:text-xs text-gray-500 leading-tight mt-0.5">Build lean muscle &amp; strength.</p>
              </div>
              <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 group-hover:bg-[#e8f7ee] text-gray-700 group-hover:text-[#057a44] flex items-center justify-center text-xs font-bold transition-colors shrink-0">
                →
              </span>
            </div>
          </Link>

          {/* 3. Body Recomposition */}
          <Link
            href="/details"
            onClick={() => handleGoalSelect("weight-loss")}
            className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg overflow-hidden cursor-pointer hover:border-emerald-300 transition-all flex flex-col"
          >
            <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-900">
              <Image
                src="/images/goal-body-recomp-nano.jpg"
                alt="Body Recomposition"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Arrows Badge */}
              <div className="absolute left-2.5 -bottom-2.5 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#057a44] z-10 border border-gray-50">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <div className="p-2.5 md:p-4 pt-3.5 md:pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-[13px] md:text-sm font-black text-gray-950 leading-tight">Body Recomp</h3>
                <p className="text-[8.5px] sm:text-[9.5px] md:text-xs text-gray-500 leading-tight mt-0.5">Build muscle &amp; reduce fat.</p>
              </div>
              <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 group-hover:bg-[#e8f7ee] text-gray-700 group-hover:text-[#057a44] flex items-center justify-center text-xs font-bold transition-colors shrink-0">
                →
              </span>
            </div>
          </Link>

          {/* 4. General Fitness */}
          <Link
            href="/details"
            onClick={() => handleGoalSelect("weight-gain")}
            className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg overflow-hidden cursor-pointer hover:border-emerald-300 transition-all flex flex-col"
          >
            <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-900">
              <Image
                src="/images/goal-general-fitness-nano.jpg"
                alt="General Fitness"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Bar Chart Badge */}
              <div className="absolute left-2.5 -bottom-2.5 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#057a44] z-10 border border-gray-50">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#057a44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <rect x="4" y="14" width="3.2" height="6" rx="0.8" fill="currentColor" />
                  <rect x="10.4" y="9.5" width="3.2" height="10.5" rx="0.8" fill="currentColor" />
                  <rect x="16.8" y="5" width="3.2" height="15" rx="0.8" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="p-2.5 md:p-4 pt-3.5 md:pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-[13px] md:text-sm font-black text-gray-950 leading-tight">General Fitness</h3>
                <p className="text-[8.5px] sm:text-[9.5px] md:text-xs text-gray-500 leading-tight mt-0.5">Stamina, strength &amp; energy.</p>
              </div>
              <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 group-hover:bg-[#e8f7ee] text-gray-700 group-hover:text-[#057a44] flex items-center justify-center text-xs font-bold transition-colors shrink-0">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Educational Rationale Section: Why South Asian / Indian bodies are different */}
      <div className="mt-8 md:mt-16 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/40 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-emerald-100 shadow-sm text-left">
        <div className="max-w-3xl">
          <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
            Scientific Foundation
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-950 mt-2">
            Why Standard Western BMI Fails Indian Bodies
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-2 leading-relaxed">
            Medical research from the <strong>World Health Organization (WHO)</strong> and the <strong>Indian Council of Medical Research (ICMR)</strong> confirms that South Asians have a higher percentage of visceral adipose tissue (internal body fat) at lower BMI thresholds compared to Caucasians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mt-4 md:mt-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2">
              23.0
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-900">South Asian Overweight Cutoff</h4>
            <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-snug">
              While Western scales classify overweight at 25+, for Indians metabolic risk spikes starting at BMI 23.0.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2">
              USN
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-900">US Navy Circumference Method</h4>
            <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-snug">
              Incorporates neck and abdominal waist circumference to differentiate between lean muscle mass and abdominal visceral fat.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2">
              ₹99
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-900">Affordable Indian Nutrition</h4>
            <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-snug">
              Every plan uses familiar staples: roti, rice, dal, curd, paneer, eggs, chicken, and local vegetables. No expensive exotic imports.
            </p>
          </div>
        </div>
      </div>

      {/* 5. What You Get Comparison Table */}
      <div className="mt-8 md:mt-16 text-left">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-950 text-center">
          Compare: Free Assessment vs. ₹99 Full Transformation Blueprint
        </h2>
        <p className="text-xs md:text-sm text-gray-500 text-center mt-1">
          Everything you need for sustainable body transformation without expensive monthly subscriptions.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-3 bg-gray-50/80 p-3.5 sm:p-4 text-xs md:text-sm font-bold text-gray-900 border-b border-gray-200">
            <div>Feature</div>
            <div className="text-center">Free Assessment</div>
            <div className="text-center text-emerald-700">₹99 Full Blueprint</div>
          </div>

          <div className="divide-y divide-gray-100 text-xs md:text-sm text-gray-600">
            <div className="grid grid-cols-3 p-3.5 sm:p-4 items-center">
              <span className="font-medium text-gray-800">South Asian BMI Classification</span>
              <span className="text-center text-emerald-600 font-bold">✓ Included</span>
              <span className="text-center text-emerald-600 font-bold">✓ Included</span>
            </div>
            <div className="grid grid-cols-3 p-3.5 sm:p-4 items-center bg-gray-50/30">
              <span className="font-medium text-gray-800">US Navy Estimated Body Fat %</span>
              <span className="text-center text-emerald-600 font-bold">✓ Included</span>
              <span className="text-center text-emerald-600 font-bold">✓ Included</span>
            </div>
            <div className="grid grid-cols-3 p-3.5 sm:p-4 items-center">
              <span className="font-medium text-gray-800">7-Day Indian Meal Plan (Veg / Non-Veg / Jain)</span>
              <span className="text-center text-gray-400">—</span>
              <span className="text-center text-emerald-600 font-bold">✓ Complete 7-Day Plan</span>
            </div>
            <div className="grid grid-cols-3 p-3.5 sm:p-4 items-center bg-gray-50/30">
              <span className="font-medium text-gray-800">Personalized Workout Split (Gym or Home)</span>
              <span className="text-center text-gray-400">—</span>
              <span className="text-center text-emerald-600 font-bold">✓ Full Exercise Split</span>
            </div>
            <div className="grid grid-cols-3 p-3.5 sm:p-4 items-center">
              <span className="font-medium text-gray-800">Daily Calorie &amp; Macro Targets</span>
              <span className="text-center text-gray-400">Basic Range</span>
              <span className="text-center text-emerald-600 font-bold">✓ Exact Grams</span>
            </div>
            <div className="grid grid-cols-3 p-3.5 sm:p-4 items-center bg-gray-50/30">
              <span className="font-medium text-gray-800">Downloadable &amp; Printable PDF Copy</span>
              <span className="text-center text-gray-400">—</span>
              <span className="text-center text-emerald-600 font-bold">✓ Instant PDF</span>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/#calculator-card"
            className="inline-flex items-center gap-2 bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-xs md:text-sm py-3 px-6 rounded-full shadow-md transition-all active:scale-95"
          >
            <span>Start Free Assessment Now</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Support WhatsApp Modal */}
      {showSupportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-100 relative text-gray-900 text-left">
            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f7ee] text-[#057a44] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.15.83.84-3.07-.2-.32a8.2 8.2 0 01-1.26-4.36c0-4.55 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.25 8.23z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-950">WhatsApp Assistance</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">Online · Instant Support</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-snug mb-3">
              Have questions regarding your body measurements, Indian diet options, or fitness goals? Our certified coach team is here to assist.
            </p>

            <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-900 space-y-1 mb-4">
              <div className="font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Coach Vikram Sharma &amp; Team</span>
              </div>
              <div className="text-[10px] text-emerald-700">Response time: Usually within 15 minutes</div>
            </div>

            <a
              href="https://wa.me/919876543210?text=Hi%20BMYFIT%20Coach,%20I%20need%20help%20with%20my%20fitness%20transformation"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 px-3 rounded-full bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>Chat on WhatsApp</span>
              <span>→</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
