"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";

interface PlanLockScreenProps {
  assessmentId?: string;
  bmi?: number;
  bodyFatPercent?: number;
  goal?: string;
}

export function PlanLockScreen({
  assessmentId = "latest",
  bmi = 24.2,
  bodyFatPercent = 18.4,
  goal = "fat-loss",
}: PlanLockScreenProps) {
  const router = useRouter();

  const handleUnlockClick = () => {
    const targetId = assessmentId && assessmentId !== "local" && assessmentId !== "demo" ? assessmentId : "latest";
    router.push(`/checkout/${targetId}`);
  };

  const formattedGoal = goal.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden relative">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-20 flex flex-col items-center justify-center text-center">
        {/* Lock Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-4 shadow-2xs">
          <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          <span>PLAN LOCKED · EXCLUSIVE TO ₹99 SUBSCRIBED MEMBERS</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight max-w-xl">
          Your 8-Week Personalized Plan is{" "}
          <span className="text-[#00c853]">Ready to Unlock</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mt-2 leading-relaxed">
          Access to our calibrated Indian nutrition roadmap, daily calorie targets, customized resistance training splits, and weekly coach check-ins is reserved exclusively for ₹99 members.
        </p>

        {/* Card with Biometrics Snapshot & Benefits */}
        <div className="w-full max-w-xl mt-6 rounded-3xl bg-[#031c14] border border-emerald-950 p-6 sm:p-8 text-white text-left relative overflow-hidden shadow-2xl">
          {/* Ambient emerald glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Biometrics bar */}
          <div className="relative z-10 pb-4 border-b border-emerald-900/60 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Intake Goal</span>
              <span className="text-xs sm:text-sm font-black text-[#00e676]">{formattedGoal}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-800 text-gray-200">
                BMI: <strong className="text-white">{bmi.toFixed(1)}</strong>
              </span>
              <span className="bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-800 text-gray-200">
                Body Fat: <strong className="text-emerald-400">{bodyFatPercent.toFixed(1)}%</strong>
              </span>
            </div>
          </div>

          {/* 4 Feature Points */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-900/80 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0 text-xs font-bold">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">Indian Nutrition Plan</p>
                <p className="text-[10px] text-gray-400 leading-snug mt-0.5">Simple meals, calibrated calories &amp; protein</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-900/80 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0 text-xs font-bold">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">Goal-Specific Training</p>
                <p className="text-[10px] text-gray-400 leading-snug mt-0.5">8-week progression splits for gym &amp; home</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-900/80 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0 text-xs font-bold">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">Coach Naveen Verification</p>
                <p className="text-[10px] text-gray-400 leading-snug mt-0.5">Every plan is clinically checked before dispatch</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-900/80 border border-emerald-500/30 text-[#00e676] flex items-center justify-center shrink-0 text-xs font-bold">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">WhatsApp Habit Tracker</p>
                <p className="text-[10px] text-gray-400 leading-snug mt-0.5">Weekly compliance check-ins &amp; adherence logs</p>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handleUnlockClick}
            className="w-full py-3 px-4 rounded-full bg-[#00e676] hover:bg-[#00c864] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,230,118,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>Unlock My 8-Week Plan — ₹99</span>
            <span className="text-base font-black">→</span>
          </button>

          {/* Direct Coach Naveen Chat Trigger for Free / Curious Athletes */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("bmyfit_open_chat"));
              }
            }}
            className="w-full mt-2.5 py-2.5 px-4 rounded-full bg-[#075E54] hover:bg-[#064e46] text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>💬 Have questions before joining? Chat with Coach Naveen</span>
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-300 font-medium mt-3 select-none">
            <span className="flex items-center gap-1">
              <span className="text-[#00e676]">✓</span> One-time payment
            </span>
            <span>•</span>
            <span>No subscription</span>
            <span>•</span>
            <span>Instant activation</span>
          </div>
        </div>

        {/* Secondary Buttons Row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="px-5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition shadow-2xs"
          >
            Return to Home
          </Link>
          <Link
            href="/details"
            className="px-5 py-2 rounded-xl text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition"
          >
            Calculate Body Metrics First →
          </Link>
        </div>

        {/* Existing Member Signin Link */}
        <p className="text-xs text-gray-500 mt-4">
          Already purchased a plan?{" "}
          <Link href="/login?redirect=/plan" className="text-emerald-700 font-bold underline hover:text-emerald-900">
            Sign In to Access Your Dashboard
          </Link>
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

