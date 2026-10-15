"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityLevel, DietPreference, FitnessGoal } from "@/types/fitness";
import { SelectableCard } from "@/components/ui/selectable-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFunnelState } from "@/hooks/use-funnel-state";
import { DEFAULT_ACTIVITY_LEVEL, DEFAULT_DIET_PREFERENCE } from "@/lib/config";

const GOAL_OPTIONS: Array<{
  value: FitnessGoal;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}> = [
  {
    value: "fat-loss",
    title: "Fat Loss",
    description: "Drop body fat % while preserving lean muscle mass through a moderate caloric deficit and strength training.",
    badge: "Popular",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
  },
  {
    value: "weight-loss",
    title: "Weight Loss",
    description: "Steady, sustainable overall body weight reduction focused on gentle movement, daily step counts, and a manageable deficit.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
  },
  {
    value: "muscle-gain",
    title: "Muscle Gain",
    description: "Build lean muscle size and physical strength with a dedicated hypertrophy workout split and high-protein nutrition.",
    badge: "High Protein",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
  },
  {
    value: "weight-gain",
    title: "Weight Gain",
    description: "Healthy mass building with calorie-dense Indian foods and compound lifts for individuals wanting to move past being underweight.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export function GoalPicker() {
  const router = useRouter();
  const { goal, updateGoal, isDetailsComplete, hydrated } = useFunnelState();

  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | undefined>(goal.goal);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    goal.activityLevel ?? DEFAULT_ACTIVITY_LEVEL,
  );
  const [dietPreference, setDietPreference] = useState<DietPreference>(
    goal.dietPreference ?? DEFAULT_DIET_PREFERENCE,
  );
  const [showOptionalExtras, setShowOptionalExtras] = useState(false);

  useEffect(() => {
    if (hydrated && goal.goal) {
      setSelectedGoal(goal.goal);
      if (goal.activityLevel) setActivityLevel(goal.activityLevel);
      if (goal.dietPreference) setDietPreference(goal.dietPreference);
    }
  }, [hydrated, goal]);

  const handleSelectGoal = (val: FitnessGoal) => {
    setSelectedGoal(val);
    updateGoal({ goal: val, activityLevel, dietPreference });
  };

  const handleCalculate = () => {
    if (!selectedGoal) return;
    updateGoal({ goal: selectedGoal, activityLevel, dietPreference });
    router.push("/calculating");
  };

  return (
    <div className="space-y-6">
      {/* Missing details banner warning */}
      {hydrated && !isDetailsComplete && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>Some body measurements are missing.</span>
          <Button href="/details" size="sm" variant="secondary">
            Go back to Details
          </Button>
        </div>
      )}

      {/* 4 Large Goal Cards */}
      <div className="grid grid-cols-1 gap-4">
        {GOAL_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.value}
            id={`goal-${opt.value}`}
            selected={selectedGoal === opt.value}
            onSelect={() => handleSelectGoal(opt.value)}
            title={opt.title}
            description={opt.description}
            badge={opt.badge}
            icon={opt.icon}
          />
        ))}
      </div>

      {/* Optional extras collapsible card */}
      <Card className="p-5 border-dashed">
        <button
          type="button"
          onClick={() => setShowOptionalExtras(!showOptionalExtras)}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                Customize Diet &amp; Activity (Optional)
              </span>
              <span className="rounded-full bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-[10px] font-semibold text-ink-muted dark:text-surface-400">
                Defaults set
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-muted dark:text-surface-400">
              Refines your grocery list and calorie calculations
            </p>
          </div>
          <svg
            className={`h-4 w-4 text-ink-muted dark:text-surface-400 transition-transform ${
              showOptionalExtras ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showOptionalExtras && (
          <div className="mt-5 pt-4 border-t border-surface-200 dark:border-surface-800 space-y-4 animate-fade-in">
            {/* Diet preference selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-surface-300 mb-2">
                Indian Diet Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "vegetarian" as const, label: "Vegetarian" },
                  { value: "eggetarian" as const, label: "Eggetarian" },
                  { value: "non-vegetarian" as const, label: "Non-Veg" },
                ].map((diet) => (
                  <button
                    key={diet.value}
                    type="button"
                    onClick={() => {
                      setDietPreference(diet.value);
                      updateGoal({ dietPreference: diet.value });
                    }}
                    className={`rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                      dietPreference === diet.value
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-surface-100 dark:bg-surface-800 text-ink-muted dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:text-ink dark:hover:text-white"
                    }`}
                  >
                    {diet.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity level selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-surface-300 mb-2">
                Typical Activity Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "sedentary" as const, label: "Sedentary", desc: "Desk job" },
                  { value: "lightly-active" as const, label: "Light", desc: "1-3 days" },
                  { value: "moderately-active" as const, label: "Moderate", desc: "3-5 days" },
                  { value: "very-active" as const, label: "Active", desc: "6-7 days" },
                ].map((act) => (
                  <button
                    key={act.value}
                    type="button"
                    onClick={() => {
                      setActivityLevel(act.value);
                      updateGoal({ activityLevel: act.value });
                    }}
                    className={`rounded-xl p-2 text-left border transition-all ${
                      activityLevel === act.value
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-surface-100 dark:bg-surface-800 text-ink-muted dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:text-ink dark:hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold">{act.label}</div>
                    <div className="text-[10px] opacity-75">{act.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Bottom Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          href="/details"
          variant="outline"
          size="lg"
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <svg className="h-4 w-4 mr-1 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Back
        </Button>

        <Button
          type="button"
          onClick={handleCalculate}
          disabled={!selectedGoal}
          size="lg"
          className="w-full sm:flex-1 order-1 sm:order-2 shadow-float"
        >
          <span>Calculate My Results</span>
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
