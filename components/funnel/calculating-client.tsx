"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useFunnelState } from "@/hooks/use-funnel-state";
import { calculateAssessment } from "@/lib/assessment/plan";
import { db, doc, setDoc } from "@/lib/firebase/client";

const STEPS = [
  {
    id: 1,
    title: "Calculating BMI",
    desc: "Using your height and weight",
    threshold: 25,
  },
  {
    id: 2,
    title: "Estimating body fat",
    desc: "Using waist & neck measurements",
    threshold: 50,
  },
  {
    id: 3,
    title: "Analysing your goal",
    desc: "Based on your selected goal",
    threshold: 75,
  },
  {
    id: 4,
    title: "Preparing your recommendations",
    desc: "Customizing nutrition & workout plan",
    threshold: 95,
  },
];

export function CalculatingClient() {
  const router = useRouter();
  const { getIdToken, loading: authLoading } = useAuth();
  const { getFullInput, hydrated } = useFunnelState();

  const [progress, setProgress] = useState(12);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store final assessment ID or target URL
  const targetResultUrlRef = useRef<string | null>(null);
  const calculationFinishedRef = useRef(false);
  const requestSentRef = useRef(false);

  // 1. Smooth Progress & Point-by-point Animation
  useEffect(() => {
    const totalDurationMs = 3800;
    const intervalMs = 40;
    const increment = 100 / (totalDurationMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        // If calculation is done, allow ticking all the way to 100
        if (calculationFinishedRef.current) {
          const nextVal = Math.min(prev + increment * 1.5, 100);
          if (nextVal >= 100) {
            clearInterval(timer);
            // Navigate to results
            setTimeout(() => {
              if (targetResultUrlRef.current) {
                router.push(targetResultUrlRef.current);
              }
            }, 300);
          }
          return Math.round(nextVal);
        }

        // If still waiting on calculation, slow down near 92%
        if (prev >= 92) {
          return 92;
        }

        return Math.round(prev + increment);
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [router]);

  // 2. Fire Calculation in Background
  useEffect(() => {
    if (!hydrated || authLoading || requestSentRef.current) return;

    const fullInput = getFullInput() ?? {
      gender: "male" as const,
      age: 26,
      heightCm: 175,
      weightKg: 72,
      waistIn: 32,
      neckIn: 15,
      goal: "fat-loss" as const,
      activityLevel: "moderately-active" as const,
      dietPreference: "vegetarian" as const,
    };
    const currentInput = fullInput;

    requestSentRef.current = true;

    async function executeCalculation() {
      try {
        const calculated = calculateAssessment(currentInput);
        const generatedId = `asm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
        let finalAssessmentId = generatedId;

        // Persist to session storage immediately so result is always instant
        if (typeof window !== "undefined") {
          const localAssessment = {
            id: generatedId,
            uid: "anonymous-user",
            ...currentInput,
            ...calculated,
            createdAt: new Date().toISOString(),
          };
          sessionStorage.setItem("bmyfit_local_assessment", JSON.stringify(localAssessment));
          sessionStorage.setItem("bmyfit_local_calculated", JSON.stringify(calculated));
        }

        // Persist to Firestore client SDK directly
        try {
          if (typeof window !== "undefined") {
            const firestorePayload = {
              id: generatedId,
              uid: "anonymous-user",
              ...currentInput,
              ...calculated,
              createdAt: new Date().toISOString(),
            };
            void setDoc(doc(db, "assessments", generatedId), firestorePayload).catch((e) => {
              console.warn("Client assessment firestore notice:", e);
            });
          }
        } catch (e) {
          console.warn("Direct Firestore assessment error:", e);
        }

        const token = await getIdToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/assessments", {
          method: "POST",
          headers,
          body: JSON.stringify(currentInput),
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.assessmentId) {
            finalAssessmentId = data.assessmentId;
            if (typeof window !== "undefined") {
              const updated = {
                id: finalAssessmentId,
                uid: "anonymous-user",
                ...currentInput,
                ...calculated,
                createdAt: new Date().toISOString(),
              };
              sessionStorage.setItem("bmyfit_local_assessment", JSON.stringify(updated));
            }
          }
        }

        targetResultUrlRef.current = `/result/${finalAssessmentId}`;
        calculationFinishedRef.current = true;
      } catch (err) {
        console.warn("Calculation fallback:", err);
        targetResultUrlRef.current = "/result/local";
        calculationFinishedRef.current = true;
      }
    }

    void executeCalculation();
  }, [hydrated, authLoading, getIdToken, getFullInput, router]);

  // Circle SVG metrics
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden relative">
      {/* 1. Brand Site Header */}
      <SiteHeader />

      {/* 2. Main Container with relative positioning for artwork */}
      <main className="flex-1 max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-1 md:pt-8 pb-28 sm:pb-32 md:pb-16 flex flex-col justify-start relative overflow-x-hidden">
        
        {/* Top Right Model with Dynamic Green Brush Splash Background Artwork (Mobile Only) */}
        <div className="md:hidden absolute top-2 -right-6 sm:-right-4 w-[205px] min-[390px]:w-[225px] sm:w-[245px] aspect-[3/4] pointer-events-none select-none z-0">
          <Image
            src="/images/analyzing-model-splash.jpg"
            alt="Analyzing body metrics fitness model"
            fill
            priority
            sizes="(max-width: 768px) 50vw, 250px"
            className="object-contain object-top"
          />
          {/* Soft Left and Bottom Fade Gradients to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent w-16" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Foreground Content (z-10) */}
        <div className="relative z-10 w-full">
          {/* Subheader Navigation Row */}
          <div className="flex items-center justify-between mt-0.5 mb-2 md:mb-4">
            <div className="flex items-center gap-2">
              <Link
                href="/details?step=2"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                aria-label="Back to Measurements"
              >
                <svg className="w-3.5 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-[#057a44]">
                METABOLIC ENGINE · ANALYSIS
              </span>
            </div>

            <span className="text-[10.5px] md:text-xs font-semibold text-gray-400 select-none">
              Processing data with clinical precision...
            </span>
          </div>

          {/* 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column (md:col-span-7) */}
            <div className="md:col-span-7 space-y-4">
              {/* Headline matching screenshot */}
              <h1 className="text-[25px] min-[390px]:text-[27px] sm:text-3xl md:text-4xl font-black tracking-tight leading-[1.08] text-gray-950 text-left">
                Analysing<br />
                <span className="text-[#00c853]">your body metrics...</span>
              </h1>

              {/* Subtitle */}
              <p className="text-[9.5px] min-[390px]:text-[10px] md:text-sm text-gray-500 leading-snug text-left max-w-full md:max-w-xl">
                This will just take a few seconds. We&apos;re calculating your clinical BMI, estimating body fat %, and preparing personalized recommendations based on your goal.
              </p>

          {/* =================================================== */}
          {/* Circular Progress Indicator with Heartbeat Line     */}
          {/* =================================================== */}
          <div className="flex items-center justify-start my-2">
            <div className="relative w-32 h-32 min-[390px]:w-36 min-[390px]:h-36 flex items-center justify-center">
              {/* SVG Animated Circular Ring */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <defs>
                  <linearGradient id="analyzingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#044e2f" />
                    <stop offset="45%" stopColor="#00c853" />
                    <stop offset="100%" stopColor="#00e676" />
                  </linearGradient>
                </defs>

                {/* Track Circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#e8f5e9"
                  strokeWidth="9"
                  fill="transparent"
                />

                {/* Animated Progress Circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="url(#analyzingGradient)"
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-out"
                />
              </svg>

              {/* Inside Progress Text & Pulse Line */}
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="text-[9.5px] min-[390px]:text-[10px] font-semibold text-gray-400 leading-none">
                  Analysing...
                </span>
                <span className="text-[25px] min-[390px]:text-[28px] font-black text-gray-950 tracking-tight leading-none my-0.5">
                  {progress}%
                </span>
                {/* Heartbeat Pulse Line matching screenshot */}
                <svg
                  className="w-8 h-4 text-[#00c853] animate-pulse"
                  viewBox="0 0 40 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 10h8l3-6 5 12 4-8 3 4h15" />
                </svg>
              </div>
            </div>
          </div>

          {/* =================================================== */}
          {/* Point-by-Point Timeline Checklist                   */}
          {/* =================================================== */}
          <div className="relative pl-1 my-2 text-left space-y-3.5 max-w-[75%] sm:max-w-[78%]">
            {STEPS.map((s, idx) => {
              const isCompleted = progress >= s.threshold;
              const isActive = progress < s.threshold && (idx === 0 || progress >= STEPS[idx - 1].threshold);
              const isLast = idx === STEPS.length - 1;

              return (
                <div key={s.id} className="relative flex items-start gap-2.5">
                  {/* Connecting Line to next step */}
                  {!isLast && (
                    <div
                      className={`absolute left-2.5 top-5 w-0.5 h-8 -ml-[1px] transition-colors duration-300 ${
                        isCompleted ? "bg-[#00c853]" : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Icon Indicator */}
                  <div className="relative z-10 shrink-0">
                    {isCompleted ? (
                      /* Completed Checkmark */
                      <div className="w-5 h-5 rounded-full bg-[#00c853] flex items-center justify-center text-white shadow-xs animate-in zoom-in-75 duration-200">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      /* Active Spinner Ring matching screenshot */
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#00c853] animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray="3 3"
                        >
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      </div>
                    ) : (
                      /* Pending Inactive Circle */
                      <div className="w-5 h-5 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-xs sm:text-[12.5px] font-black leading-tight ${
                      isCompleted ? "text-gray-950" : isActive ? "text-gray-950" : "text-gray-400"
                    }`}>
                      {s.title}
                    </h3>
                    <p className="text-[8.5px] sm:text-[9px] text-gray-500 leading-none mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =================================================== */}
          {/* Bottom Card 1: Using science-backed methods        */}
          {/* =================================================== */}
          <div className="mt-4 rounded-2xl bg-[#eaf7ee] border border-emerald-200/70 p-2.5 sm:p-3 flex items-start gap-2.5 text-left">
            <div className="w-7 h-7 rounded-full bg-emerald-200/80 text-[#057a44] flex items-center justify-center shrink-0 mt-0.5">
              {/* Brain / Science Icon matching screenshot */}
              <svg className="w-4 h-4 text-[#057a44]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a5 5 0 00-4.9 4A4.5 4.5 0 003.5 10c0 1.9 1.1 3.5 2.7 4.2A4.5 4.5 0 0011 22h2a4.5 4.5 0 004.8-7.8A4.5 4.5 0 0020.5 10a4.5 4.5 0 00-3.6-4A5 5 0 0012 2zm-1 4a3 3 0 013 3v8a2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5V9a3 3 0 012-2.8V6z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-black text-gray-950 leading-tight">
                Using science-backed methods
              </h4>
              <p className="text-[8.5px] sm:text-[9px] text-gray-600 leading-snug mt-0.5">
                We use proven formulas and your selected goal to give you accurate insights and personalized recommendations.
              </p>
            </div>
          </div>

          {/* =================================================== */}
          {/* Bottom Card 2: Almost there!                       */}
          {/* =================================================== */}
          <div className="mt-2.5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-2.5 sm:p-3 flex items-center gap-3 text-left">
            {/* Flexed Arm / Muscle Badge */}
            <div className="w-9 h-9 rounded-full bg-emerald-100/90 text-[#00c853] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#057a44]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
              </svg>
            </div>

            {/* Subtle Divider Line */}
            <div className="h-8 w-px bg-gray-200 shrink-0" />

            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-black text-gray-950 leading-tight">
                Almost there!
              </h4>
              <p className="text-[8.5px] sm:text-[9px] text-gray-600 leading-snug mt-0.5">
                We&apos;re putting everything together to give you your complete body analysis and plan.
              </p>
            </div>
          </div>

          {/* Error Message banner if required */}
          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left">
              <p className="font-bold">Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
              <Link href="/details?step=2" className="mt-2 inline-block font-bold text-rose-900 underline">
                Review measurements →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: High-tech artwork & scientific callout */}
        <div className="hidden md:flex flex-col gap-5 md:col-span-5 sticky top-24">
          <div className="relative w-full aspect-[4/4.8] rounded-3xl overflow-hidden shadow-2xl border border-emerald-950/60 bg-gradient-to-tr from-black via-gray-950 to-emerald-950/40 p-6 flex flex-col justify-end text-white">
            <Image
              src="/images/analyzing-model-splash.jpg"
              alt="Analyzing model"
              fill
              className="object-contain object-right-top opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#00e676]/20 border border-[#00e676]/40 px-3 py-1 rounded-full text-xs font-black text-[#00e676] uppercase">
                <span>Clinical Anthropometry</span>
              </div>
              <h3 className="text-xl font-black text-white">Calibrating Indian Metabolic Thresholds</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Evaluating circumference-to-height ratios to determine true visceral fat distribution, preventing metabolic adaptation and muscle loss during deficit cycles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

      </main>

      {/* 3. Sleek Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
