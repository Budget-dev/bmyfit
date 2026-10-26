"use client";

import React, { useState } from "react";
import {
  Utensils,
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Rocket,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import type {
  PlanDashboardData,
  WeekPlanData,
  MealSlotItem,
  WorkoutDayItem,
  PlanStatus,
} from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";

interface WeekPlanEditorProps {
  user: AdminUserRecord;
  onSavePlan: (updatedPlan: PlanDashboardData) => Promise<void>;
  onPushToUser: (user: AdminUserRecord) => void;
  onBackToDirectory?: () => void;
}

const PRESET_MEALS: Array<Omit<MealSlotItem, "id">> = [
  {
    slot: "Breakfast",
    name: "Masala Oats + Whey Protein + Almonds",
    itemsDescription: "Masala Oats & Whey",
    portion: "60g rolled oats with veggies, 1 scoop Whey Isolate, 10 soaked almonds",
    calories: 420,
    proteinGrams: 35,
    carbsGrams: 48,
    fatsGrams: 10,
    image: "/images/meal-poha-eggs.jpg",
    recipeNotes: [
      "Cook rolled oats with chopped onions, tomatoes, green chillies, and turmeric.",
      "Mix whey isolate in 200ml cold water and consume alongside.",
      "Pair with soaked almonds for essential fatty acids.",
    ],
  },
  {
    slot: "Breakfast",
    name: "Poha + 2 Whole Boiled Eggs (or Paneer)",
    itemsDescription: "Poha + Boiled Eggs",
    portion: "1.5 bowls cooked Poha + 2 Whole Eggs or 100g scrambled paneer",
    calories: 440,
    proteinGrams: 24,
    carbsGrams: 52,
    fatsGrams: 14,
    image: "/images/meal-poha-eggs.jpg",
    recipeNotes: [
      "Light oil tadka with mustard seeds, curry leaves, and roasted peanuts.",
      "Lightly sprinkle fresh lemon juice on poha for vitamin C absorption.",
    ],
  },
  {
    slot: "Lunch",
    name: "Brown Rice + Chicken Breast Curry + Cucumber Salad",
    itemsDescription: "Chicken Curry + Rice",
    portion: "1 cup cooked Brown Rice + 160g Chicken Breast in tomato-onion curry + 1 bowl sliced cucumber",
    calories: 550,
    proteinGrams: 46,
    carbsGrams: 62,
    fatsGrams: 12,
    image: "/images/meal-chicken-rice.jpg",
    recipeNotes: [
      "160g skinless chicken breast simmered with homemade ginger-garlic masala.",
      "Pair with 1 bowl of fiber-rich cucumber and carrot salad dressed with lemon juice.",
    ],
  },
  {
    slot: "Lunch",
    name: "Grilled Paneer Bhurji + 2 Multigrain Rotis + Dal",
    itemsDescription: "Paneer Bhurji + Rotis",
    portion: "150g spiced Paneer Bhurji + 2 medium Multigrain Rotis + 1 bowl Moong Dal",
    calories: 560,
    proteinGrams: 34,
    carbsGrams: 58,
    fatsGrams: 20,
    image: "/images/meal-chicken-rice.jpg",
    recipeNotes: [
      "Crumble low-fat paneer with diced tomatoes, capsicum, and fresh coriander.",
      "Rotis made with 80% wheat and 20% gram (chana) flour for higher protein.",
    ],
  },
  {
    slot: "Snack",
    name: "Roasted Chana + Sprouted Moong Chaat",
    itemsDescription: "Sprouted Moong Chaat",
    portion: "50g Roasted Bengal Gram (Chana) + 1 cup boiled Sprouted Moong with chaat masala",
    calories: 260,
    proteinGrams: 16,
    carbsGrams: 38,
    fatsGrams: 4,
    image: "/images/meal-sprouts.jpg",
    recipeNotes: [
      "Toss with finely chopped onion, tomato, lemon juice, and pink Himalayan salt.",
      "High fiber snack that stabilizes afternoon insulin spikes.",
    ],
  },
  {
    slot: "Dinner",
    name: "Soya Chunk Pulao + Greek Yogurt Mint Raita",
    itemsDescription: "Soya Chunk Pulao",
    portion: "50g boiled Soya chunks tossed with basmati rice & veggies + 100g Greek yogurt raita",
    calories: 480,
    proteinGrams: 38,
    carbsGrams: 56,
    fatsGrams: 8,
    image: "/images/meal-soya-rice.jpg",
    recipeNotes: [
      "Boil and squeeze soya chunks twice to remove residual bitterness.",
      "Greek yogurt provides slow-digesting casein protein for overnight recovery.",
    ],
  },
  {
    slot: "Dinner",
    name: "Grilled Fish Tikka + Sauteed Beans & Broccoli",
    itemsDescription: "Fish Tikka + Greens",
    portion: "180g Basa/Rohu fillet marinated in hung curd & spices + 1 cup sauteed greens",
    calories: 420,
    proteinGrams: 44,
    carbsGrams: 14,
    fatsGrams: 10,
    image: "/images/meal-fish.jpg",
    recipeNotes: [
      "Air fry or grill fish on non-stick pan with 1 tsp olive oil.",
      "High omega-3 profile aids joint mobility and fat oxidation.",
    ],
  },
];

export function WeekPlanEditor({
  user,
  onSavePlan,
  onPushToUser,
  onBackToDirectory,
}: WeekPlanEditorProps) {
  const [plan, setPlan] = useState<PlanDashboardData>(user.plan);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [showPresetDropdown, setShowPresetDropdown] = useState<number | null>(null);

  const selectedWeek =
    plan.weeks.find((w) => w.weekNumber === selectedWeekNum) || plan.weeks[0];

  // Modify total weeks count
  const handleWeeksCountChange = (newCount: number) => {
    let currentWeeks = [...plan.weeks];
    if (newCount > currentWeeks.length) {
      // Append additional weeks
      for (let w = currentWeeks.length + 1; w <= newCount; w++) {
        // Clone from week 1 with shifted title
        const cloned: WeekPlanData = JSON.parse(JSON.stringify(currentWeeks[0]));
        cloned.weekNumber = w;
        cloned.phaseTitle = `Week ${w}: Progressive Phase`;
        cloned.phaseSubtitle = "Progressive overload & nutrient calibration";
        currentWeeks.push(cloned);
      }
    } else {
      currentWeeks = currentWeeks.slice(0, newCount);
    }

    setPlan({
      ...plan,
      weeksCount: newCount,
      weeks: currentWeeks,
    });

    if (selectedWeekNum > newCount) {
      setSelectedWeekNum(1);
    }
  };

  // Duplicate current week to next week
  const handleDuplicateWeek = () => {
    if (!selectedWeek) return;
    const targetWeekNum = selectedWeek.weekNumber + 1;
    if (targetWeekNum > plan.weeksCount) {
      alert(`Cannot copy: Week ${selectedWeek.weekNumber} is the final week of this plan.`);
      return;
    }

    const updatedWeeks = plan.weeks.map((w) => {
      if (w.weekNumber === targetWeekNum) {
        return {
          ...JSON.parse(JSON.stringify(selectedWeek)),
          weekNumber: targetWeekNum,
          phaseTitle: `Week ${targetWeekNum}: Advanced Progression`,
          phaseSubtitle: "Progressive load adjustment & macro consistency",
        };
      }
      return w;
    });

    setPlan({ ...plan, weeks: updatedWeeks });
    setSelectedWeekNum(targetWeekNum);
    setSaveBanner(`Copied Week ${selectedWeek.weekNumber} contents to Week ${targetWeekNum}!`);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Save changes locally and to backend
  const handleSave = async (statusOverride?: PlanStatus) => {
    try {
      setSaving(true);
      const updated: PlanDashboardData = {
        ...plan,
        status: statusOverride || plan.status,
        approvedAt:
          statusOverride === "approved" || plan.status === "approved"
            ? new Date().toISOString()
            : plan.approvedAt,
      };

      await onSavePlan(updated);
      setPlan(updated);
      setSaveBanner(
        statusOverride === "approved"
          ? "Plan Approved & Pushed Live to User Dashboard!"
          : "Plan changes saved successfully."
      );
      setTimeout(() => setSaveBanner(null), 3500);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save plan changes.");
    } finally {
      setSaving(false);
    }
  };

  // Meal slot update
  const handleMealChange = (
    mealIndex: number,
    field: keyof MealSlotItem,
    value: string | number
  ) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (targetW.nutrition.meals[mealIndex] as any)[field] = value;
    setPlan({ ...plan, weeks: updatedWeeks });
  };

  // Add new meal slot
  const handleAddMeal = () => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    const newId = `m_${selectedWeek.weekNumber}_${Date.now().toString().slice(-4)}`;
    targetW.nutrition.meals.push({
      id: newId,
      slot: "Snack",
      name: "Custom Nutrition Slot",
      itemsDescription: "New Meal",
      portion: "1 serving portion details",
      calories: 300,
      proteinGrams: 20,
      carbsGrams: 30,
      fatsGrams: 8,
      image: "/images/meal-sprouts.jpg",
      recipeNotes: ["Preparation instructions entered by coach."],
    });

    setPlan({ ...plan, weeks: updatedWeeks });
  };

  // Remove meal slot
  const handleRemoveMeal = (mealIndex: number) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    targetW.nutrition.meals.splice(mealIndex, 1);
    setPlan({ ...plan, weeks: updatedWeeks });
  };

  // Apply preset to meal
  const handleApplyPreset = (mealIndex: number, preset: Omit<MealSlotItem, "id">) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    const existingId = targetW.nutrition.meals[mealIndex].id;
    targetW.nutrition.meals[mealIndex] = {
      ...preset,
      id: existingId,
    };

    setPlan({ ...plan, weeks: updatedWeeks });
    setShowPresetDropdown(null);
  };

  // Workout Day update
  const handleWorkoutChange = (
    dayIndex: number,
    field: keyof WorkoutDayItem,
    value: string | number
  ) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (targetW.workouts.days[dayIndex] as any)[field] = value;
    setPlan({ ...plan, weeks: updatedWeeks });
  };

  // Exercise update
  const handleExerciseChange = (
    dayIndex: number,
    exIndex: number,
    field: "name" | "sets" | "reps" | "rest" | "tips",
    value: string
  ) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    targetW.workouts.days[dayIndex].exercises[exIndex][field] = value;
    setPlan({ ...plan, weeks: updatedWeeks });
  };

  // Add Exercise
  const handleAddExercise = (dayIndex: number) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    targetW.workouts.days[dayIndex].exercises.push({
      name: "New Exercise",
      sets: "3 sets",
      reps: "10-12 reps",
      rest: "60 sec",
      tips: "Maintain neutral spine and full range of motion.",
    });

    setPlan({ ...plan, weeks: updatedWeeks });
  };

  // Remove Exercise
  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;

    targetW.workouts.days[dayIndex].exercises.splice(exIndex, 1);
    setPlan({ ...plan, weeks: updatedWeeks });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveBanner && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between animate-fade-in text-sm font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{saveBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveBanner(null)}
            className="text-xs text-emerald-100 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Client Header & Global Controls Card */}
      <section className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-950">{user.name}</h2>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    plan.status === "pending_review"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {plan.status === "pending_review"
                    ? "⏳ Needs Coach Push"
                    : "🟢 Live on Dashboard"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium mt-1">
                <span>Goal: <strong>{user.goalDisplay}</strong></span>
                <span>•</span>
                <span>BMI: <strong>{user.biometrics.bmi}</strong></span>
                <span>•</span>
                <span>Body Fat: <strong>{user.biometrics.bodyFatPercent}%</strong></span>
                <span>•</span>
                <span className="font-mono text-[11px] text-gray-400">ID: {plan.id}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onBackToDirectory && (
              <button
                type="button"
                onClick={onBackToDirectory}
                className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition"
              >
                ← Back to Users
              </button>
            )}

            <a
              href={`/plan/${plan.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition"
            >
              <span>User Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            <button
              type="button"
              onClick={() => onPushToUser(user)}
              className="px-5 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-md flex items-center gap-2 transition"
            >
              <Rocket className="w-4 h-4" />
              <span>Push Plan Live</span>
            </button>
          </div>
        </div>

        {/* Global Targets & Parameters Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Duration in Weeks */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Plan Duration
            </label>
            <select
              value={plan.weeksCount}
              onChange={(e) => handleWeeksCountChange(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={4}>4 Weeks</option>
              <option value={6}>6 Weeks</option>
              <option value={8}>8 Weeks (Standard)</option>
              <option value={10}>10 Weeks</option>
              <option value={12}>12 Weeks (Transformation)</option>
              <option value={16}>16 Weeks (Advanced)</option>
            </select>
          </div>

          {/* Daily Calories */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Daily Calories (kcal)
            </label>
            <input
              type="number"
              value={plan.calorieTarget}
              onChange={(e) => setPlan({ ...plan, calorieTarget: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Daily Protein Target */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Daily Protein (g)
            </label>
            <input
              type="number"
              value={plan.proteinTargetGrams}
              onChange={(e) => setPlan({ ...plan, proteinTargetGrams: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Workout Days */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Workout Days/Week
            </label>
            <select
              value={plan.workoutDaysPerWeek}
              onChange={(e) => setPlan({ ...plan, workoutDaysPerWeek: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={3}>3 Days / Week</option>
              <option value={4}>4 Days / Week</option>
              <option value={5}>5 Days / Week</option>
              <option value={6}>6 Days / Week</option>
            </select>
          </div>

          {/* Status Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Dashboard Visibility
            </label>
            <select
              value={plan.status}
              onChange={(e) => setPlan({ ...plan, status: e.target.value as PlanStatus })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pending_review">Hidden (Under Review)</option>
              <option value="approved">Approved & Live</option>
            </select>
          </div>
        </div>

        {/* Coach Guidance Notes */}
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
            Head Coach Custom Guidance Notes (Visible on Client Dashboard)
          </label>
          <textarea
            rows={2}
            value={plan.coachNotes || ""}
            onChange={(e) => setPlan({ ...plan, coachNotes: e.target.value })}
            placeholder="e.g. Keep water intake strictly at 3.5L. If waking up fatigued, shift 20g carbs to evening snack."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </section>

      {/* Week-by-Week Navigation Bar */}
      <section className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2">
            Weeks:
          </span>
          {plan.weeks.map((w) => (
            <button
              key={w.weekNumber}
              type="button"
              onClick={() => setSelectedWeekNum(w.weekNumber)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                selectedWeekNum === w.weekNumber
                  ? "bg-[#032e1c] text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Week {w.weekNumber}</span>
              <span className="text-[10px] opacity-75 font-normal">
                ({w.nutrition.meals.length} meals · {w.workouts.days.length} workouts)
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDuplicateWeek}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition"
          title="Duplicate this week to the next week"
        >
          <Copy className="w-3.5 h-3.5 text-gray-500" />
          <span>Copy to Week {selectedWeek.weekNumber + 1}</span>
        </button>
      </section>

      {/* Week Focus & Details Card */}
      {selectedWeek && (
        <section className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Editing Schedule for Week {selectedWeek.weekNumber} of {plan.weeksCount}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={selectedWeek.phaseTitle}
                  onChange={(e) => {
                    const updated = [...plan.weeks];
                    const cur = updated.find((w) => w.weekNumber === selectedWeek.weekNumber);
                    if (cur) {
                      cur.phaseTitle = e.target.value;
                      setPlan({ ...plan, weeks: updated });
                    }
                  }}
                  className="text-xl font-black text-gray-950 border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              <span>Weekly Target: </span>
              <strong className="text-gray-900">{selectedWeek.nutrition.calories} kcal</strong> ·{" "}
              <strong className="text-gray-900">{selectedWeek.workouts.daysPerWeek} Training Days</strong>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              Phase Subtitle & Focus Summary
            </label>
            <input
              type="text"
              value={selectedWeek.phaseSubtitle}
              onChange={(e) => {
                const updated = [...plan.weeks];
                const cur = updated.find((w) => w.weekNumber === selectedWeek.weekNumber);
                if (cur) {
                  cur.phaseSubtitle = e.target.value;
                  setPlan({ ...plan, weeks: updated });
                }
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* ================= NUTRITION / MEALS SECTION ================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-950">
                    Daily Meal Plan for Week {selectedWeek.weekNumber}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Fully editable meal slots, macro proportions, and preparation instructions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMeal}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Meal Slot</span>
              </button>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedWeek.nutrition.meals.map((meal, mIdx) => (
                <div
                  key={meal.id}
                  className="relative p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3.5 transition hover:border-gray-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <select
                        value={meal.slot}
                        onChange={(e) =>
                          handleMealChange(mIdx, "slot", e.target.value as MealSlotItem["slot"])
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 focus:outline-none"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Snack">Evening Snack</option>
                        <option value="Dinner">Dinner</option>
                      </select>

                      {/* Presets dropdown toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowPresetDropdown(showPresetDropdown === mIdx ? null : mIdx)
                          }
                          className="px-2 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-600 bg-white hover:bg-gray-100 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Apply Preset</span>
                        </button>

                        {showPresetDropdown === mIdx && (
                          <div className="absolute left-0 mt-1 w-64 p-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-20 space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-2 py-1">
                              Healthy Fitness Presets
                            </span>
                            {PRESET_MEALS.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleApplyPreset(mIdx, preset)}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-900 text-gray-700 transition"
                              >
                                <span className="block truncate">{preset.name}</span>
                                <span className="text-[10px] text-gray-400">
                                  {preset.calories} kcal · {preset.proteinGrams}g P
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(mIdx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove Meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meal Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Meal Title
                    </label>
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) => handleMealChange(mIdx, "name", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Portion & Food Detail */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Portion & Food Items
                    </label>
                    <textarea
                      rows={2}
                      value={meal.portion}
                      onChange={(e) => handleMealChange(mIdx, "portion", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Macro Row */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">
                        Calories
                      </span>
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) =>
                          handleMealChange(mIdx, "calories", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 rounded-md border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                        Protein (g)
                      </span>
                      <input
                        type="number"
                        value={meal.proteinGrams}
                        onChange={(e) =>
                          handleMealChange(mIdx, "proteinGrams", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 rounded-md border border-gray-200 text-xs font-bold text-emerald-700 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">
                        Carbs (g)
                      </span>
                      <input
                        type="number"
                        value={meal.carbsGrams || 0}
                        onChange={(e) =>
                          handleMealChange(mIdx, "carbsGrams", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-700 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">
                        Fats (g)
                      </span>
                      <input
                        type="number"
                        value={meal.fatsGrams || 0}
                        onChange={(e) =>
                          handleMealChange(mIdx, "fatsGrams", Number(e.target.value))
                        }
                        className="w-full px-2 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-700 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= WORKOUTS / SPLIT SECTION ================= */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-950">
                    Weekly Workout Split for Week {selectedWeek.weekNumber}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Configure daily muscle groups, exercises, sets, reps, and form safety cues.
                  </p>
                </div>
              </div>
            </div>

            {/* Days Grid */}
            <div className="space-y-4">
              {selectedWeek.workouts.days.map((day, dIdx) => (
                <div
                  key={day.id}
                  className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={day.day}
                        onChange={(e) => handleWorkoutChange(dIdx, "day", e.target.value)}
                        className="w-24 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleWorkoutChange(dIdx, "title", e.target.value)}
                        className="font-black text-sm text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none px-1"
                        placeholder="Workout Title"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span>Duration:</span>
                        <input
                          type="number"
                          value={day.durationMinutes}
                          onChange={(e) =>
                            handleWorkoutChange(dIdx, "durationMinutes", Number(e.target.value))
                          }
                          className="w-14 px-2 py-0.5 rounded-md border border-gray-200 text-xs font-bold text-gray-900 bg-white text-center"
                        />
                        <span>mins</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddExercise(dIdx)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Exercise</span>
                      </button>
                    </div>
                  </div>

                  {/* Muscle focus */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Target Muscle Focus
                    </label>
                    <input
                      type="text"
                      value={day.focus}
                      onChange={(e) => handleWorkoutChange(dIdx, "focus", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Exercises Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100/70 rounded-lg">
                        <tr>
                          <th className="py-2 px-3">Exercise Name</th>
                          <th className="py-2 px-3 w-28">Sets</th>
                          <th className="py-2 px-3 w-28">Reps</th>
                          <th className="py-2 px-3 w-24">Rest</th>
                          <th className="py-2 px-3">Form Tips & Cues</th>
                          <th className="py-2 px-3 w-10 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {day.exercises.map((ex, exIdx) => (
                          <tr key={exIdx} className="hover:bg-white/60">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) =>
                                  handleExerciseChange(dIdx, exIdx, "name", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-md border border-gray-200 font-bold text-gray-900 bg-white"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={ex.sets}
                                onChange={(e) =>
                                  handleExerciseChange(dIdx, exIdx, "sets", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-md border border-gray-200 text-gray-800 bg-white font-medium"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={(e) =>
                                  handleExerciseChange(dIdx, exIdx, "reps", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-md border border-gray-200 text-gray-800 bg-white font-medium"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={ex.rest}
                                onChange={(e) =>
                                  handleExerciseChange(dIdx, exIdx, "rest", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-md border border-gray-200 text-gray-800 bg-white font-medium"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={ex.tips || ""}
                                onChange={(e) =>
                                  handleExerciseChange(dIdx, exIdx, "tips", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-md border border-gray-200 text-gray-600 bg-white"
                                placeholder="Coach form cue..."
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveExercise(dIdx, exIdx)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md transition"
                                title="Remove exercise"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Dock */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Draft Changes"}</span>
            </button>

            <button
              type="button"
              onClick={() => onPushToUser(user)}
              className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-sm shadow-md flex items-center gap-2 transition"
            >
              <Rocket className="w-4 h-4" />
              <span>Push Plan to User Dashboard</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
