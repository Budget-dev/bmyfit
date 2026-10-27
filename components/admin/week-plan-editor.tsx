"use client";

import React, { useState, useEffect } from "react";
import {
  Utensils,
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Save,
  Rocket,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Activity,
  Target,
  TrendingUp,
  Flame,
  Check,
  Edit3,
  BarChart2,
} from "@/components/ui/icons";
import type { AdminUserRecord, MedicalDocument } from "@/types/admin";
import type {
  PlanDashboardData,
  WeekPlanData,
  MealSlotItem,
  WorkoutDayItem,
  PlanStatus,
  TaskLogState,
} from "@/types/plan-dashboard";
import {
  formatPlanDuration,
  calculateDetailedAdherence,
  calculateWeekProgress,
  getStoredTaskLogs,
  saveStoredTaskLog,
  fetchFirebaseTaskLogs,
} from "@/features/plan/dashboard-data";
import { saveStoredPlan, upsertStoredAdminUser } from "@/lib/storage/mock-storage";
import { db, doc, onSnapshot } from "@/lib/firebase/client";

interface WeekPlanEditorProps {
  user: AdminUserRecord;
  initialMode?: "customize" | "progress";
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
  initialMode = "customize",
  onSavePlan,
  onPushToUser,
  onBackToDirectory,
}: WeekPlanEditorProps) {
  const [plan, setPlan] = useState<PlanDashboardData>(user.plan);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [editorMode, setEditorMode] = useState<"customize" | "progress">(initialMode);
  const [taskLogs, setTaskLogs] = useState<TaskLogState>(user.taskLogs || {});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [showPresetDropdown, setShowPresetDropdown] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [customMonths, setCustomMonths] = useState<string>(
    String(plan.monthsCount || Math.max(1, Math.round(plan.weeksCount / 4)))
  );

  // Subscribe to real-time Firebase task completion logs
  useEffect(() => {
    let active = true;
    const initial = user.taskLogs || getStoredTaskLogs(plan.id);
    if (initial && Object.keys(initial).length > 0) {
      setTaskLogs(initial);
    }

    void fetchFirebaseTaskLogs(plan.id).then((firebaseLogs) => {
      if (active && firebaseLogs && Object.keys(firebaseLogs).length > 0) {
        setTaskLogs(firebaseLogs);
      }
    });

    try {
      const unsubscribe = onSnapshot(doc(db, "user_logs", plan.id), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as TaskLogState;
          if (active) setTaskLogs(data);
        }
      });
      return () => {
        active = false;
        unsubscribe();
      };
    } catch {
      return () => {
        active = false;
      };
    }
  }, [plan.id, user.taskLogs]);

  const adherence = calculateDetailedAdherence(plan, taskLogs);

  const selectedWeek =
    plan.weeks.find((w) => w.weekNumber === selectedWeekNum) || plan.weeks[0];

  const selectedWeekAdherence = selectedWeek
    ? calculateWeekProgress(selectedWeek.weekNumber, selectedWeek, taskLogs)
    : { total: 0, completed: 0, percent: 0 };

  const coachReviewMessage = selectedWeek
    ? `Hi ${user.name}! 🌟 Coach review for Week ${selectedWeek.weekNumber}: Your adherence is at ${selectedWeekAdherence.percent}% (${selectedWeekAdherence.completed}/${selectedWeekAdherence.total} completed). Nutrition: ${selectedWeek.nutrition.meals.filter((m) => taskLogs[`w${selectedWeek.weekNumber}_meal_${m.id}`]).length}/${selectedWeek.nutrition.meals.length} meals logged. Keep pushing towards your ${user.goalDisplay} goal!`
    : "";

  // Modify total duration by months
  const handleMonthsCountChange = (months: number) => {
    const weeks = Math.max(1, months * 4);
    handleWeeksCountChange(weeks, months);
  };

  // Modify total weeks count
  const handleWeeksCountChange = (newCount: number, months?: number) => {
    let currentWeeks = [...plan.weeks];
    const targetMonths = months ?? Math.max(1, Math.round(newCount / 4));

    if (newCount > currentWeeks.length) {
      // Append additional weeks with progressive cycle phase titles
      for (let w = currentWeeks.length + 1; w <= newCount; w++) {
        const monthNum = Math.ceil(w / 4);
        const weekInMonth = ((w - 1) % 4) + 1;
        const cloned: WeekPlanData = JSON.parse(JSON.stringify(currentWeeks[0]));
        cloned.weekNumber = w;
        
        let phaseSubtitle = "Progressive overload & nutrient calibration";
        if (weekInMonth === 1) {
          cloned.phaseTitle = `Month ${monthNum} · W${w}: Microcycle Activation`;
          phaseSubtitle = "Macro intake reset & biomechanical form tuning";
        } else if (weekInMonth === 2) {
          cloned.phaseTitle = `Month ${monthNum} · W${w}: Progressive Overload Peak`;
          phaseSubtitle = "Volume scaling and metabolic energy enhancement";
        } else if (weekInMonth === 3) {
          cloned.phaseTitle = `Month ${monthNum} · W${w}: Intensity Specialization`;
          phaseSubtitle = "Fat oxidation acceleration and targeted hypertrophy";
        } else {
          cloned.phaseTitle = `Month ${monthNum} · W${w}: Phase Consolidation & Deload`;
          phaseSubtitle = "Active recovery, joint decompression & tape check";
        }

        currentWeeks.push(cloned);
      }
    } else {
      currentWeeks = currentWeeks.slice(0, newCount);
    }

    const updatedPlan: PlanDashboardData = {
      ...plan,
      weeksCount: newCount,
      monthsCount: targetMonths,
      weeks: currentWeeks,
    };

    setPlan(updatedPlan);
    setCustomMonths(String(targetMonths));

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

  // Save changes directly to Firebase Firestore and to backend
  const handleSave = async (statusOverride?: PlanStatus) => {
    try {
      setSaving(true);
      const isApproved = statusOverride === "approved" || plan.status === "approved";
      const updated: PlanDashboardData = {
        ...plan,
        status: statusOverride || plan.status,
        approvedAt: isApproved ? (plan.approvedAt || new Date().toISOString()) : undefined,
      };

      // Persist directly to Firebase Firestore
      saveStoredPlan(updated);
      upsertStoredAdminUser({
        ...user,
        plan: updated,
        needsPlanReview: updated.status === "pending_review",
      });

      await onSavePlan(updated);
      setPlan(updated);
      setSaveBanner(
        isApproved
          ? "✓ Live week plan updated! Changes are now live on the client's dashboard."
          : "✓ Plan draft saved successfully."
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

  // Add Workout Day
  const handleAddWorkoutDay = () => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW) return;
    const nextDayNum = targetW.workouts.days.length + 1;
    targetW.workouts.days.push({
      id: `d${nextDayNum}_${Date.now().toString().slice(-4)}`,
      day: `Day ${nextDayNum}`,
      title: `Day ${nextDayNum} - Custom Training Focus`,
      focus: "Hypertrophy & Core Conditioning",
      image: "/images/workout-push.jpg",
      durationMinutes: 45,
      exercises: [
        {
          name: "Primary Movement",
          sets: "3-4 sets",
          reps: "10-12 reps",
          rest: "60 sec",
          tips: "Controlled cadence and strict posture.",
        },
        {
          name: "Secondary Accessory",
          sets: "3 sets",
          reps: "12-15 reps",
          rest: "45 sec",
          tips: "Peak contraction at top.",
        },
      ],
    });
    targetW.workouts.daysPerWeek = targetW.workouts.days.length;
    setPlan({ ...plan, weeks: updatedWeeks });
    setSaveBanner(`Added Day ${nextDayNum} to Week ${selectedWeek.weekNumber}!`);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Remove Workout Day
  const handleRemoveWorkoutDay = (dayIndex: number) => {
    const updatedWeeks = [...plan.weeks];
    const targetW = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
    if (!targetW || targetW.workouts.days.length <= 1) {
      alert("At least 1 workout day must remain in the schedule.");
      return;
    }
    const removedName = targetW.workouts.days[dayIndex].day;
    targetW.workouts.days.splice(dayIndex, 1);
    targetW.workouts.daysPerWeek = targetW.workouts.days.length;
    setPlan({ ...plan, weeks: updatedWeeks });
    setSaveBanner(`Removed ${removedName} from Week ${selectedWeek.weekNumber}`);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Toggle user task marking (coach override / offline confirmation)
  const handleToggleTask = (taskKey: string, taskTitle: string) => {
    const current = Boolean(taskLogs[taskKey]);
    const updated = saveStoredTaskLog(plan.id, taskKey, !current);
    setTaskLogs({ ...updated });
    setSaveBanner(
      !current
        ? `✓ Marked "${taskTitle}" as completed on behalf of ${user.name}`
        : `Reset "${taskTitle}" status to pending`
    );
    setTimeout(() => setSaveBanner(null), 3500);
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

            {plan.status === "approved" || plan.status === "active" ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live on Client Dashboard</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleSave("approved")}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  title="Save changes and immediately update the live plan on client dashboard"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Updating Live Plan..." : "Update Live Plan"}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Draft"}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await handleSave("approved");
                    onPushToUser({
                      ...user,
                      plan: { ...plan, status: "approved", approvedAt: new Date().toISOString() },
                      needsPlanReview: false,
                    });
                  }}
                  className="px-5 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Push Plan Live</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Clinical Health Dossier & Medical Reports Review Banner */}
        {user.medicalAssessment && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50/60 to-teal-50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🩺</span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Client Medical Assessment &amp; Health Reports
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.medicalAssessment.hasDisease
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {user.medicalAssessment.hasDisease
                    ? "Action Needed: Medical Adjustments"
                    : "No Chronic Conditions"}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800">
                Adjust nutrition &amp; workout intensity accordingly
              </span>
            </div>

            {/* Diseases and medications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Reported Conditions
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.medicalAssessment.diseases && user.medicalAssessment.diseases.length > 0 ? (
                    user.medicalAssessment.diseases.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">None reported</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Symptoms &amp; Doctor Notes
                </span>
                <p className="text-gray-900 line-clamp-2">
                  {user.medicalAssessment.customDiseaseDescription || "No additional notes provided."}
                </p>
                {user.medicalAssessment.medications && (
                  <p className="text-[10px] text-gray-500 font-mono">
                    Rx: {user.medicalAssessment.medications}
                  </p>
                )}
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Uploaded Reports ({user.medicalAssessment.documents?.length || 0})
                </span>
                {user.medicalAssessment.documents && user.medicalAssessment.documents.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {user.medicalAssessment.documents.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2 py-1 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 text-emerald-950 text-[11px] font-bold border border-emerald-300 flex items-center gap-1 transition"
                      >
                        <span>{doc.type === "pdf" ? "📑" : "🖼️"}</span>
                        <span className="truncate max-w-[120px]">{doc.name}</span>
                        <span className="text-[9px] text-emerald-700 underline ml-0.5">View</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-[11px]">No documents attached</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Targets & Parameters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {/* Duration in Months & Weeks */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Plan Duration
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDuration(!isCustomDuration)}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                {isCustomDuration ? "Presets" : "Custom Months"}
              </button>
            </div>

            {!isCustomDuration ? (
              <select
                value={plan.weeksCount}
                onChange={(e) => {
                  const weeks = Number(e.target.value);
                  const months = Math.max(1, Math.round(weeks / 4));
                  handleWeeksCountChange(weeks, months);
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={4}>1 Month (4 Weeks)</option>
                <option value={8}>2 Months (8 Weeks)</option>
                <option value={12}>3 Months (12 Weeks - Transformation)</option>
                <option value={16}>4 Months (16 Weeks)</option>
                <option value={20}>5 Months (20 Weeks)</option>
                <option value={24}>6 Months (24 Weeks - High Impact)</option>
                <option value={36}>9 Months (36 Weeks)</option>
                <option value={48}>12 Months (48 Weeks - 1 Year)</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={customMonths}
                  onChange={(e) => {
                    setCustomMonths(e.target.value);
                    const m = Number(e.target.value);
                    if (m > 0) handleMonthsCountChange(m);
                  }}
                  placeholder="Months"
                  className="w-full px-2.5 py-2 rounded-xl border border-emerald-300 text-xs font-black text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
                  = {plan.weeksCount}W
                </span>
              </div>
            )}
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              Active: {formatPlanDuration(plan.weeksCount, plan.monthsCount)}
            </p>
          </div>

          {/* Daily Calories */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Calories (kcal)
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
              Protein (g)
            </label>
            <input
              type="number"
              value={plan.proteinTargetGrams}
              onChange={(e) => setPlan({ ...plan, proteinTargetGrams: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Water Intake */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Water (Litres)
            </label>
            <input
              type="number"
              step="0.1"
              value={plan.waterLitres ?? user.biometrics.waterLitres ?? 3.5}
              onChange={(e) => setPlan({ ...plan, waterLitres: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Steps Goal */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Daily Steps Goal
            </label>
            <input
              type="number"
              step="500"
              value={plan.dailyStepGoal ?? user.biometrics.dailyStepGoal ?? 10000}
              onChange={(e) => setPlan({ ...plan, dailyStepGoal: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Workout Days */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Training Days
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
              Dashboard Status
            </label>
            <select
              value={plan.status}
              onChange={(e) => setPlan({ ...plan, status: e.target.value as PlanStatus })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pending_review">Hidden (Under Review)</option>
              <option value="approved">Approved &amp; Live</option>
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

      {/* Studio Mode Switcher: Plan Customizer vs Client Live Progress & Marking Monitor */}
      <section className="bg-white rounded-2xl p-2.5 border border-gray-200/90 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setEditorMode("customize")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 ${
              editorMode === "customize"
                ? "bg-[#032e1c] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/70"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Plan Customizer (Meals & Workouts)</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorMode("progress")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 ${
              editorMode === "progress"
                ? "bg-[#00c853] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/70"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Client Live Progress &amp; Checklist Monitor</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                editorMode === "progress"
                  ? "bg-white/20 text-white"
                  : adherence.percent >= 70
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {adherence.percent}% Done
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 px-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-gray-900 font-bold">Firebase Live Sync</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            {adherence.completedTasks} / {adherence.totalTasks} Total Tasks Completed
          </span>
        </div>
      </section>

      {/* ================= MODE 1: PLAN CUSTOMIZER ================= */}
      {editorMode === "customize" && (
        <>
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

              <button
                type="button"
                onClick={handleAddWorkoutDay}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Workout Day</span>
              </button>
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

                      <button
                        type="button"
                        onClick={() => handleRemoveWorkoutDay(dIdx)}
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                        title="Remove Workout Day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
            {plan.status === "approved" || plan.status === "active" ? (
              <>
                <p className="text-xs text-gray-500 font-medium">
                  🔒 <strong className="text-gray-900">Live Client Plan:</strong> Once assigned to a client, this week plan is editable only by coach admins. Clients have view & checklist access only.
                </p>

                <button
                  type="button"
                  onClick={() => handleSave("approved")}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Updating Live Plan..." : "Update Live Plan on Client Dashboard"}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Draft Changes"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPushToUser(user)}
                  className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Push Plan to User Dashboard</span>
                </button>
              </>
            )}
          </div>
        </section>
      )}
        </>
      )}

      {/* ================= MODE 2: CLIENT LIVE PROGRESS & MARKING MONITOR ================= */}
      {editorMode === "progress" && (
        <div className="space-y-6">
          {/* 4 Adherence KPI Cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Overall Adherence */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Overall Compliance
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    adherence.percent >= 70
                      ? "bg-emerald-100 text-emerald-800"
                      : adherence.percent >= 40
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-950">{adherence.percent}%</span>
                <span className="text-xs text-gray-400 font-medium">
                  ({adherence.completedTasks}/{adherence.totalTasks} tasks)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    adherence.percent >= 70
                      ? "bg-[#00c853]"
                      : adherence.percent >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${adherence.percent}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block">
                {adherence.percent >= 75
                  ? "🔥 High commitment - following protocol"
                  : adherence.percent >= 40
                  ? "⚡ Moderate pace - needs check-in"
                  : "⚠️ Low tracking - prompt coach follow-up"}
              </span>
            </div>

            {/* Nutrition Adherence */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Meals Eaten
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-950">{adherence.mealPercent}%</span>
                <span className="text-xs text-gray-400 font-medium">
                  ({adherence.completedMeals}/{adherence.totalMeals} meals)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${adherence.mealPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block">
                {plan.calorieTarget} kcal &bull; {plan.proteinTargetGrams}g Protein target
              </span>
            </div>

            {/* Workout Adherence */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Workouts Finished
                </span>
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-950">{adherence.workoutPercent}%</span>
                <span className="text-xs text-gray-400 font-medium">
                  ({adherence.completedWorkouts}/{adherence.totalWorkouts} sessions)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${adherence.workoutPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block">
                {plan.workoutDaysPerWeek} sessions scheduled per week
              </span>
            </div>

            {/* Daily Habits (Hydration & Steps) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Habits Logged
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-950">{adherence.habitPercent}%</span>
                <span className="text-xs text-gray-400 font-medium">
                  ({adherence.completedHabits}/{adherence.totalHabits} targets)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${adherence.habitPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block">
                {plan.waterLitres || 3.5}L water &bull; {plan.dailyStepGoal || 10000} steps goal
              </span>
            </div>
          </section>

          {/* Week-by-Week Navigation Ribbon with Individual Week Compliance Badges */}
          <section className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2">
                Week Progress:
              </span>
              {plan.weeks.map((w) => {
                const wProg = calculateWeekProgress(w.weekNumber, w, taskLogs);
                const isSelected = selectedWeekNum === w.weekNumber;
                return (
                  <button
                    key={w.weekNumber}
                    type="button"
                    onClick={() => setSelectedWeekNum(w.weekNumber)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#032e1c] text-white shadow-sm"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span>Week {w.weekNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : wProg.percent >= 70
                          ? "bg-emerald-100 text-emerald-800"
                          : wProg.percent > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {wProg.percent}% ({wProg.completed}/{wProg.total})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setEditorMode("customize")}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Switch to Edit Week {selectedWeek.weekNumber}</span>
              </button>
            </div>
          </section>

          {/* Detailed Week Progress & Interactive Marking Console */}
          {selectedWeek && (
            <section className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
              {/* Selected Week Adherence Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      Week {selectedWeek.weekNumber} Live Checklist Audit
                    </span>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {selectedWeekAdherence.percent}% Completed
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-950 mt-1">
                    {selectedWeek.phaseTitle || `Week ${selectedWeek.weekNumber} Schedule`}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedWeekAdherence.completed} of {selectedWeekAdherence.total} protocol items completed by {user.name}.
                    Click any task status to toggle coach verification or offline confirmation.
                  </p>
                </div>

                <div className="w-full sm:w-56 bg-gray-50 p-3 rounded-2xl border border-gray-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>Week {selectedWeek.weekNumber} Compliance</span>
                    <span>{selectedWeekAdherence.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedWeekAdherence.percent >= 70
                          ? "bg-[#00c853]"
                          : selectedWeekAdherence.percent >= 40
                          ? "bg-amber-500"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${selectedWeekAdherence.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block text-right font-medium">
                    {selectedWeekAdherence.completed}/{selectedWeekAdherence.total} checked off
                  </span>
                </div>
              </div>

              {/* 1. Nutrition Meal Adherence Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-sm text-gray-950">
                      Nutrition Logged (Meals Eaten vs Skipped)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {
                      selectedWeek.nutrition.meals.filter(
                        (m) => taskLogs[`w${selectedWeek.weekNumber}_meal_${m.id}`]
                      ).length
                    }{" "}
                    / {selectedWeek.nutrition.meals.length} meals eaten
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedWeek.nutrition.meals.map((meal) => {
                    const taskKey = `w${selectedWeek.weekNumber}_meal_${meal.id}`;
                    const isCompleted = Boolean(taskLogs[taskKey]);
                    return (
                      <div
                        key={meal.id}
                        className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                          isCompleted
                            ? "bg-emerald-50/60 border-emerald-200/80"
                            : "bg-gray-50/70 border-gray-200/80 hover:bg-gray-100/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                isCompleted
                                  ? "bg-emerald-200 text-emerald-900"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {meal.slot}
                            </span>
                            <h5 className="font-bold text-xs text-gray-900">{meal.name}</h5>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{meal.portion}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                            <span>{meal.calories} kcal</span>
                            <span>&bull;</span>
                            <span>P: {meal.proteinGrams}g</span>
                            <span>&bull;</span>
                            <span>C: {meal.carbsGrams}g</span>
                            <span>&bull;</span>
                            <span>F: {meal.fatsGrams}g</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTask(taskKey, `${meal.slot}: ${meal.name}`)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                            isCompleted
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                          title="Click to toggle meal completion status on Firestore"
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Eaten ✓</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5 text-gray-400" />
                              <span>Mark Eaten</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Workout Sessions Checklist */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-sm text-gray-950">
                      Workout Split Sessions Logged
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {
                      selectedWeek.workouts.days.filter(
                        (d) => taskLogs[`w${selectedWeek.weekNumber}_workout_${d.id}`]
                      ).length
                    }{" "}
                    / {selectedWeek.workouts.days.length} workouts finished
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedWeek.workouts.days.map((day) => {
                    const taskKey = `w${selectedWeek.weekNumber}_workout_${day.id}`;
                    const isCompleted = Boolean(taskLogs[taskKey]);
                    return (
                      <div
                        key={day.id}
                        className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                          isCompleted
                            ? "bg-teal-50/60 border-teal-200/80"
                            : "bg-gray-50/70 border-gray-200/80 hover:bg-gray-100/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                isCompleted
                                  ? "bg-teal-200 text-teal-900"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {day.day}
                            </span>
                            <h5 className="font-bold text-xs text-gray-950">{day.title}</h5>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium">Focus: {day.focus}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                            <span>{day.durationMinutes} mins</span>
                            <span>&bull;</span>
                            <span>{day.exercises.length} prescribed exercises</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTask(taskKey, `${day.day} - ${day.title}`)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                            isCompleted
                              ? "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                              : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                          title="Click to toggle workout completion status on Firestore"
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Done ✓</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5 text-gray-400" />
                              <span>Mark Done</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Daily Hydration & Steps Habits */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-sm text-gray-950">
                      Daily Hydration &amp; Movement Targets
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Water habit */}
                  {(() => {
                    const taskKey = `w${selectedWeek.weekNumber}_habit_water`;
                    const isCompleted = Boolean(taskLogs[taskKey]);
                    return (
                      <div
                        className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isCompleted
                            ? "bg-blue-50/60 border-blue-200/80"
                            : "bg-gray-50/70 border-gray-200/80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">💧</span>
                            <h5 className="font-bold text-xs text-gray-950">
                              Daily Hydration Goal: {plan.waterLitres || 3.5} Litres
                            </h5>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Adequate hydration sustains metabolic rate and cellular electrolyte balance.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleTask(taskKey, "Daily Hydration Target")}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                            isCompleted
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hit Goal ✓</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5 text-gray-400" />
                              <span>Mark Met</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Step count habit */}
                  {(() => {
                    const taskKey = `w${selectedWeek.weekNumber}_habit_steps`;
                    const isCompleted = Boolean(taskLogs[taskKey]);
                    return (
                      <div
                        className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isCompleted
                            ? "bg-purple-50/60 border-purple-200/80"
                            : "bg-gray-50/70 border-gray-200/80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👟</span>
                            <h5 className="font-bold text-xs text-gray-950">
                              Daily Step Goal: {(plan.dailyStepGoal || 10000).toLocaleString()} Steps
                            </h5>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            NEAT energy expenditure baseline to maintain caloric deficit.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleTask(taskKey, "Daily Steps Target")}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                            isCompleted
                              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                              : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hit Goal ✓</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5 text-gray-400" />
                              <span>Mark Met</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 4. Head Coach Check-in & WhatsApp Dispatch Card */}
              <div className="pt-5 border-t border-gray-100 p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-gray-900 text-white space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-emerald-300">
                      Head Coach Client Feedback Generator
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Phone: {user.phone || "Not provided"}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-mono bg-black/40 p-3 rounded-xl border border-white/10">
                  &ldquo;{coachReviewMessage}&rdquo;
                </p>

                <div className="flex items-center justify-end gap-2.5 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(coachReviewMessage);
                      setSaveBanner("✓ Copied progress review note to clipboard!");
                      setTimeout(() => setSaveBanner(null), 3000);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Review Note</span>
                  </button>

                  {user.phone && (
                    <a
                      href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        coachReviewMessage
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Send WhatsApp Check-in</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Document Preview Inspector Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">{previewDoc.type === "pdf" ? "📑" : "🖼️"}</span>
                <div>
                  <h5 className="font-bold text-sm truncate max-w-md">{previewDoc.name}</h5>
                  <p className="text-[10px] text-gray-400">
                    {previewDoc.sizeFormatted} &bull; {previewDoc.category || "Clinical Document"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 flex flex-col items-center justify-center">
              {previewDoc.fileUrl?.startsWith("data:image") ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.name}
                  className="max-h-[60vh] max-w-full rounded-lg shadow-md object-contain"
                />
              ) : (
                <div className="w-full bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Medical File Verification
                    </span>
                    <span className="text-xs font-mono text-gray-400">Status: Verified</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Document Title:</strong> {previewDoc.name}
                    </p>
                    <p>
                      <strong>Uploaded At:</strong>{" "}
                      {previewDoc.uploadedAt
                        ? new Date(previewDoc.uploadedAt).toLocaleString()
                        : "Today"}
                    </p>
                    <p>
                      <strong>Category:</strong> {previewDoc.category || "Medical / Lab Report"}
                    </p>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                      <strong>Clinical Assessment Note:</strong>
                      <p className="mt-1">
                        Use this document to adjust carbohydrate tolerance, anti-inflammatory food
                        choices, and avoid high shear stresses on vulnerable joints.
                      </p>
                    </div>
                  </div>
                  {previewDoc.fileUrl && (
                    <a
                      href={previewDoc.fileUrl}
                      download={previewDoc.name}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      <span>Open / Download Full Document</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-3 bg-gray-100 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
