"use client";

import React from "react";
import Link from "next/link";
import type { Assessment } from "@/types/fitness";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Gauge,
  BMI_GAUGE_ZONES,
  MALE_BODY_FAT_GAUGE_ZONES,
  FEMALE_BODY_FAT_GAUGE_ZONES,
} from "@/components/ui/gauge";
import { getBmiLabel, getBodyFatLabel } from "@/features/calculator/categories";
import { APP_CONFIG } from "@/lib/config";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export interface ResultClientProps {
  id?: string;
  assessment?: Assessment;
}

export function ResultClient({ id, assessment: initialAssessment }: ResultClientProps) {
  const { getIdToken, loading: authLoading } = useAuth();
  const [assessment, setAssessment] = React.useState<Assessment | null>(initialAssessment ?? null);
  const [loading, setLoading] = React.useState<boolean>(!initialAssessment);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);
      setLoading(false);
      return;
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
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Unable to load your assessment result.");
        }
        const data = await res.json();
        if (isMounted) {
          setAssessment(data.assessment);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load result");
          setLoading(false);
        }
      }
    }

    void loadAssessment();

    return () => {
      isMounted = false;
    };
  }, [id, initialAssessment, authLoading, getIdToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-ink dark:text-white">Assessment Not Found</h3>
        <p className="text-sm text-ink-muted dark:text-surface-300">
          {error ?? "We could not find this assessment record."}
        </p>
        <Button href="/details" size="sm" variant="primary">
          Start New Assessment
        </Button>
      </Card>
    );
  }

  const isMale = assessment.gender === "male";
  const bodyFatZones = isMale ? MALE_BODY_FAT_GAUGE_ZONES : FEMALE_BODY_FAT_GAUGE_ZONES;

  // Generate 3-5 personalized rule-based insight bullets
  const insights: string[] = [];

  // Insight 1: BMI Assessment & South Asian Risk
  if (assessment.bmi < 18.5) {
    insights.push(
      "Your BMI is in the Underweight range. Calorie surplus with strength-focused training will support healthy bone density and lean mass.",
    );
  } else if (assessment.bmi < 23) {
    insights.push(
      "Your BMI is within the healthy range. Maintaining your current body composition while building lean muscle will optimize long-term health.",
    );
  } else if (assessment.bmi < 25) {
    insights.push(
      "Your BMI is in the upper normal range. For South Asian adults, metabolic risks begin emerging around BMI 23+, making waist management essential.",
    );
  } else if (assessment.bmi < 30) {
    insights.push(
      "Your BMI is in the Overweight range. A moderate caloric deficit coupled with resistance training is the most sustainable strategy to drop body fat.",
    );
  } else {
    insights.push(
      "Your BMI is in the Obese range. A structured, low-impact nutrition and activity routine will yield significant cardiovascular benefits.",
    );
  }

  // Insight 2: Body Fat Context
  if (assessment.bodyFatPercent !== null) {
    if (assessment.bodyFatCategory === "athletes" || assessment.bodyFatCategory === "fitness") {
      insights.push(
        `Estimated body fat of ${assessment.bodyFatPercent}% reflects athletic/fitness conditioning. Focus on performance and muscle preservation.`,
      );
    } else if (assessment.bodyFatCategory === "average") {
      insights.push(
        `Estimated body fat of ${assessment.bodyFatPercent}% is in the typical range. Targeted strength sessions can shift your body composition toward leaner ratios.`,
      );
    } else if (assessment.bodyFatCategory === "obese") {
      insights.push(
        `Your circumference ratio indicates elevated visceral adiposity (${assessment.bodyFatPercent}%). Progressive fat loss will substantially lower inflammatory markers.`,
      );
    }
  }

  // Insight 3: Goal-specific advice
  if (assessment.goal === "fat-loss") {
    insights.push(
      "Selected Goal (Fat Loss): Preserving your metabolic rate with high-protein Indian foods (paneer/eggs/dal) is key to preventing weight rebound.",
    );
  } else if (assessment.goal === "muscle-gain") {
    insights.push(
      "Selected Goal (Muscle Gain): Compound movements (squat/press/row) backed by 1.8–2.0g protein per kg will maximize lean hypertrophy.",
    );
  } else if (assessment.goal === "weight-loss") {
    insights.push(
      "Selected Goal (Weight Loss): Prioritizing 8,000+ daily steps and controlled meal portions will drive steady, safe progress.",
    );
  } else {
    insights.push(
      "Selected Goal (Weight Gain): Quality nutrient density without empty junk will build healthy tissue rather than purely abdominal fat.",
    );
  }

  // Insight 4: Hydration & steps recommendation
  const recommendedWater = (assessment.weightKg * 0.035).toFixed(1);
  insights.push(
    `Daily Baseline: Target approximately ${recommendedWater} litres of water and an 8–10 hour overnight digestion window.`,
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-surface-50 to-emerald-50/50 dark:from-surface-900 dark:via-surface-900 dark:to-emerald-950/30 p-6 sm:p-8 border border-emerald-500/20 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-200 dark:border-surface-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Basic Assessment (Free)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink dark:text-white mt-1">
              Your Body Analysis
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white dark:bg-surface-800 px-4 py-1.5 border border-surface-200 dark:border-surface-700 shadow-sm text-xs font-bold text-ink dark:text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="capitalize">{assessment.goal.replace("-", " ")}</span>
          </div>
        </div>

        {/* Dual Gauges: BMI & Body Fat % */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Gauge 1: BMI */}
          <div className="p-5 rounded-2xl bg-white dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800">
            <div className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-surface-400 mb-3 flex items-center justify-between">
              <span>Body Mass Index (BMI)</span>
              <span className="text-[10px] text-ink-muted dark:text-surface-500 font-normal">WHO Standards</span>
            </div>
            <Gauge
              value={assessment.bmi}
              min={14}
              max={40}
              unit="kg/m²"
              zones={BMI_GAUGE_ZONES}
              currentCategoryLabel={getBmiLabel(assessment.bmiCategory)}
            />
            <p className="mt-3 text-[11px] text-ink-muted dark:text-surface-400 italic">
              Note: For South Asian adults, health risk can begin at lower BMI (about 23+).
            </p>
          </div>

          {/* Gauge 2: Estimated Body Fat % */}
          <div className="p-5 rounded-2xl bg-white dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800">
            <div className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-surface-400 mb-3 flex items-center justify-between">
              <span>Estimated Body Fat %</span>
              <span className="text-[10px] text-ink-muted dark:text-surface-500 font-normal">US Navy Method</span>
            </div>

            {assessment.bodyFatPercent !== null ? (
              <>
                <Gauge
                  value={assessment.bodyFatPercent}
                  min={isMale ? 2 : 10}
                  max={isMale ? 40 : 45}
                  unit="%"
                  zones={bodyFatZones}
                  currentCategoryLabel={
                    assessment.bodyFatCategory
                      ? getBodyFatLabel(assessment.bodyFatCategory)
                      : undefined
                  }
                />
                <p className="mt-3 text-[11px] text-ink-muted dark:text-surface-400 italic">
                  This is an estimate based on circumference ratios, not a medical measurement.
                </p>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {assessment.bodyFatWarning || "Please re-check your measurements"}
                </p>
                <p className="mt-1 text-xs text-ink-muted dark:text-surface-400">
                  Circumference ratio was outside typical anatomical ranges.
                </p>
                <Link
                  href="/details"
                  className="mt-3 inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
                >
                  Adjust measurements in Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body Insights Card */}
      <Card className="p-6 sm:p-8">
        <h3 className="text-lg font-bold text-ink dark:text-white mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Key Clinical Insights</span>
        </h3>
        <ul className="space-y-3">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-ink-muted dark:text-surface-300 leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-0.5">
                ✓
              </span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Paid Plan Locked Preview (Teaser built from static placeholder content - NEVER real plan data) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 bg-white dark:bg-surface-900 shadow-xl">
        {/* Floating Unlock Badge */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">
              Personalized Action Plan
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              Unlock Your Complete Detailed Plan
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-xl">
              Includes 7-day Indian meal plan with exact portions, gym/home workout routines, grocery checklist &amp; PDF download.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs uppercase tracking-wider text-emerald-200">One-Time Fee</div>
            <div className="text-3xl font-black text-white">{APP_CONFIG.pricing.formatted}</div>
          </div>
        </div>

        {/* Blurred static mock contents */}
        <div className="p-6 sm:p-8 space-y-6 relative select-none">
          <div className="filter blur-[6px] opacity-40 pointer-events-none space-y-4">
            <div className="h-6 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-6 w-1/4 bg-slate-300 dark:bg-slate-700 rounded-lg mt-6" />
            <div className="space-y-2">
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>

          {/* Centered Lock Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/70 dark:bg-surface-900/70 backdrop-blur-[2px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl mb-4 shadow-emerald-500/30">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-xl font-black text-ink dark:text-white">
              Plan Protected Behind Payment
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-ink-muted dark:text-surface-300 max-w-md leading-relaxed">
              Your numbers have been securely stored. Complete your one-time payment of {APP_CONFIG.pricing.formatted} to unlock your personalized meal plan, workout schedule, and PDF.
            </p>
            <div className="mt-6 w-full max-w-sm">
              <Button
                href={`/checkout/${assessment.id}`}
                size="lg"
                fullWidth
                className="shadow-glow"
              >
                <span>Unlock Detailed Plan - {APP_CONFIG.pricing.formatted}</span>
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="pt-4 text-center">
        <p className="text-xs text-ink-muted dark:text-surface-400 max-w-xl mx-auto leading-relaxed">
          <strong className="text-ink dark:text-surface-200">Medical Disclaimer: </strong>
          {APP_CONFIG.medicalDisclaimer}
        </p>
      </div>
    </div>
  );
}
