"use client";

import React, { useState } from "react";
import type { DetailedPlan } from "@/types/fitness";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { triggerPrintPlan, formatPlanDate } from "@/features/plan/pdf";
import { APP_CONFIG } from "@/lib/config";
import { BmyFitLogo } from "@/components/layout/logo";

export interface PlanViewProps {
  plan: DetailedPlan;
}

export function PlanView({ plan }: PlanViewProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const handlePrint = () => {
    triggerPrintPlan();
  };

  const { snapshot, nutrition, workouts, habits, tracking, dos, donts, safetyNote } = plan;

  return (
    <div className="space-y-8 animate-fade-in print-plan">
      {/* Header action bar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-card">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Paid &amp; Verified · Assessment #{plan.assessmentId.slice(0, 8)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white">
            Your Personalized Transformation Plan
          </h1>
          <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
            Generated {formatPlanDate(plan.createdAt)} · Version: {plan.planVersion}
          </p>
        </div>

        <Button
          type="button"
          onClick={handlePrint}
          variant="outline"
          size="md"
          className="shrink-0 gap-2 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Download / Print PDF</span>
        </Button>
      </div>

      {/* Print-only branded top banner */}
      <div className="hidden print:block pb-6 border-b border-black/20">
        <div className="flex items-center justify-between">
          <BmyFitLogo />
          <div className="text-right text-xs">
            <div className="font-bold">Official Fitness &amp; Nutrition Plan</div>
            <div>Generated: {formatPlanDate(plan.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Section 1: Your Snapshot */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-200 dark:border-surface-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Section 1
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink dark:text-white mt-1">
              Your Body &amp; Calorie Snapshot
            </h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            {snapshot.goal.replace("-", " ")}
          </span>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <div className="text-xs text-ink-muted dark:text-surface-400">Daily Calories</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {snapshot.calories}
            </div>
            <div className="text-[10px] text-ink-muted dark:text-surface-500 mt-0.5">kcal / day</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <div className="text-xs text-ink-muted dark:text-surface-400">Protein Target</div>
            <div className="text-2xl sm:text-3xl font-black text-ink dark:text-white mt-1">
              {snapshot.macros.proteinGrams}g
            </div>
            <div className="text-[10px] text-ink-muted dark:text-surface-500 mt-0.5">
              {Math.round((snapshot.macros.proteinGrams * 400) / snapshot.calories)}% of calories
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <div className="text-xs text-ink-muted dark:text-surface-400">Carbs &amp; Fats</div>
            <div className="text-lg sm:text-xl font-bold text-ink dark:text-white mt-2">
              {snapshot.macros.carbsGrams}g <span className="text-xs font-normal text-ink-muted">C</span> / {snapshot.macros.fatGrams}g <span className="text-xs font-normal text-ink-muted">F</span>
            </div>
            <div className="text-[10px] text-ink-muted dark:text-surface-500 mt-0.5">Balanced macros</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <div className="text-xs text-ink-muted dark:text-surface-400">Daily Water Target</div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">
              {snapshot.waterLitres}L
            </div>
            <div className="text-[10px] text-ink-muted dark:text-surface-500 mt-0.5">Hydration baseline</div>
          </div>
        </div>

        {/* Timeline block */}
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
          <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider block">
              Realistic Timeline Expectations
            </span>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-surface-300 mt-1 leading-relaxed">
              {snapshot.timeline}
            </p>
          </div>
        </div>
      </Card>

      {/* Section 2: Nutrition Plan (7-Day Indian Meal Plan) */}
      <Card className="p-6 sm:p-8 page-break">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-200 dark:border-surface-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Section 2
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink dark:text-white mt-1">
              7-Day Indian Nutrition Plan
            </h2>
            <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
              Scaled to your {snapshot.calories} kcal target with portion sizes in grams and katoris.
            </p>
          </div>

          {/* Day selection tabs (Screen view) */}
          <div className="no-print flex flex-wrap gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            {nutrition.days.map((d, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveDayIndex(index)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeDayIndex === index
                    ? "bg-white dark:bg-surface-900 text-ink dark:text-white shadow-sm"
                    : "text-ink-muted dark:text-surface-400 hover:text-ink dark:hover:text-white"
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Meals List (Screen View) */}
        <div className="no-print space-y-3">
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            Viewing Menu: {nutrition.days[activeDayIndex]?.day}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {nutrition.days[activeDayIndex]?.meals.map((meal, mIdx) => (
              <div
                key={mIdx}
                className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {meal.slot}
                  </span>
                  <h4 className="text-sm font-bold text-ink dark:text-white mt-1">
                    {meal.name}
                  </h4>
                  <p className="text-xs text-ink-muted dark:text-surface-400 mt-0.5">
                    Portion: <strong className="text-ink dark:text-surface-200">{meal.portion}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold self-end sm:self-center">
                  <span className="text-ink dark:text-white">{meal.calories} kcal</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{meal.proteinGrams}g protein</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Print-only: Render all 7 days sequentially */}
        <div className="hidden print:block space-y-6">
          {nutrition.days.map((d, dIdx) => (
            <div key={dIdx} className="border-t border-black/10 pt-4">
              <h3 className="font-bold text-sm mb-2 text-emerald-700">{d.day}</h3>
              <div className="space-y-1 text-xs">
                {d.meals.map((m, mIdx) => (
                  <div key={mIdx} className="flex justify-between py-1 border-b border-black/5">
                    <span>
                      <strong>{m.slot}:</strong> {m.name} ({m.portion})
                    </span>
                    <span className="shrink-0 font-medium">
                      {m.calories} kcal | {m.proteinGrams}g P
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Grocery List Sub-section */}
        <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-white mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Weekly Indian Grocery List</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-muted dark:text-surface-300">
            {nutrition.groceryList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-surface-100 dark:bg-surface-800/40">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 3: Workout Plan */}
      <Card className="p-6 sm:p-8 page-break">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-200 dark:border-surface-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Section 3
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink dark:text-white mt-1">
              Personalized Workout Routine
            </h2>
            <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
              Tailored for {snapshot.goal.replace("-", " ")} with home and gym friendly equipment alternatives.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {workouts.map((workout, wIdx) => (
            <div
              key={wIdx}
              className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                    {workout.day}
                  </span>
                  <h4 className="text-base font-bold text-ink dark:text-white">
                    {workout.title}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-ink-muted dark:text-surface-400">
                  ~{workout.durationMinutes} mins
                </span>
              </div>

              <ul className="space-y-1.5 text-xs sm:text-sm text-ink-muted dark:text-surface-300 ml-2">
                {workout.exercises.map((ex, exIdx) => (
                  <li key={exIdx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>

              {workout.homeAlternative && (
                <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700/60 text-[11px] text-ink-muted dark:text-surface-400">
                  <strong className="text-ink dark:text-surface-200">Home alternative: </strong>
                  {workout.homeAlternative}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Section 4: Daily Habits & Section 5: Progress Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Section 4
          </span>
          <h3 className="text-lg font-bold text-ink dark:text-white mt-1 mb-4">
            Daily Habits &amp; Bio-Hacks
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-ink-muted dark:text-surface-300">
            {habits.map((habit, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold mt-0.5">
                  ✓
                </span>
                <span>{habit}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Section 5
          </span>
          <h3 className="text-lg font-bold text-ink dark:text-white mt-1 mb-4">
            Progress Tracking Guide
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-ink-muted dark:text-surface-300">
            {tracking.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Section 6: Do's and Don'ts */}
      <Card className="p-6 sm:p-8 page-break">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Section 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-ink dark:text-white mt-1 mb-6">
          Do&apos;s &amp; Don&apos;ts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2.5">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
              Recommended Practices (Do&apos;s)
            </h4>
            {dos.map((item, idx) => (
              <div key={idx} className="text-xs sm:text-sm text-ink-muted dark:text-surface-300 flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-500/20 space-y-2.5">
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-2">
              Common Mistakes to Avoid (Don&apos;ts)
            </h4>
            {donts.map((item, idx) => (
              <div key={idx} className="text-xs sm:text-sm text-ink-muted dark:text-surface-300 flex items-start gap-2">
                <span className="text-rose-600 dark:text-rose-400 font-bold">✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 7: Safety Note and Medical Disclaimer */}
      <div className="p-6 rounded-3xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs text-ink-muted dark:text-surface-400 text-center space-y-2">
        <span className="font-bold text-ink dark:text-white uppercase tracking-wider block">
          Section 7 · Medical Disclaimer &amp; Safety Note
        </span>
        <p className="max-w-2xl mx-auto leading-relaxed">
          {safetyNote || APP_CONFIG.medicalDisclaimer}
        </p>
      </div>

      {/* Bottom Download Button Bar */}
      <div className="no-print pt-4 text-center">
        <Button onClick={handlePrint} size="lg" className="shadow-float">
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Download PDF / Print Plan
        </Button>
      </div>
    </div>
  );
}
