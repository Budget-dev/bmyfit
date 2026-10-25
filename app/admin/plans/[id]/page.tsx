"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Utensils,
  Dumbbell,
  ExternalLink,
} from "@/components/ui/icons";
import type { PlanDashboardData, PlanStatus } from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";

export default function AdminPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [plan, setPlan] = useState<PlanDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlan() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/plans/${id}`);
        const data = await res.json();
        if (data.plan) {
          setPlan(data.plan);
        } else {
          // Local fallback
          setPlan(generateDashboardPlan(id, { customerName: "Fit Member", status: "pending_review" }));
        }
      } catch (err) {
        console.error("Load plan error:", err);
        setPlan(generateDashboardPlan(id, { customerName: "Fit Member", status: "pending_review" }));
      } finally {
        setLoading(false);
      }
    }
    void loadPlan();
  }, [id]);

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-600">Loading Plan Customizer...</p>
        </div>
      </div>
    );
  }

  const selectedWeek =
    plan.weeks.find((w) => w.weekNumber === selectedWeekNum) || plan.weeks[0];

  const handleWeeksCountChange = (newCount: number) => {
    const updated = generateDashboardPlan(plan.id, {
      weeksCount: newCount,
      status: plan.status,
      customerName: plan.customerName,
      goal: plan.goal,
      bmi: plan.bmi,
      bodyFatPercent: plan.bodyFatPercent,
      calorieTarget: plan.calorieTarget,
      proteinTargetGrams: plan.proteinTargetGrams,
      workoutDaysPerWeek: plan.workoutDaysPerWeek,
      coachNotes: plan.coachNotes,
    });
    setPlan(updated);
    if (selectedWeekNum > newCount) {
      setSelectedWeekNum(1);
    }
  };

  const handleSaveAndApprove = async (newStatus: PlanStatus = "approved") => {
    try {
      setSaving(true);
      const updatedPlan: PlanDashboardData = {
        ...plan,
        status: newStatus,
        approvedAt: newStatus === "approved" ? new Date().toISOString() : undefined,
      };

      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan),
      });

      if (res.ok) {
        setPlan(updatedPlan);
        setSaveSuccess(
          newStatus === "approved"
            ? "Plan successfully approved and published! User can now view their live dashboard."
            : "Plan changes saved successfully."
        );
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              title="Back to Admin Console"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="block font-black text-sm sm:text-base text-gray-950">
                Plan Customizer: {plan.customerName}
              </span>
              <span className="block text-[11px] text-gray-400 font-mono">Plan ID: {plan.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/plan/${plan.id}`}
              target="_blank"
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition"
            >
              <span>Preview User Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => handleSaveAndApprove("approved")}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-xs shadow-sm flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "Publishing..." : "Approve & Publish"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-7 space-y-6">
        {saveSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between animate-fade-in text-sm font-semibold">
            <span>{saveSuccess}</span>
            <Link
              href={`/plan/${plan.id}`}
              target="_blank"
              className="underline text-emerald-100 hover:text-white text-xs ml-4"
            >
              Open Live Dashboard →
            </Link>
          </div>
        )}

        {/* Client Biometrics & Global Settings Bar */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Biometrics</span>
              <h2 className="text-xl font-black text-gray-950 mt-0.5">{plan.customerName}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                <span>Goal: <strong>{plan.goalDisplay}</strong></span>
                <span>•</span>
                <span>BMI: <strong>{plan.bmi}</strong></span>
                <span>•</span>
                <span>Body Fat: <strong>{plan.bodyFatPercent}%</strong></span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Current Status:</span>
              <select
                value={plan.status}
                onChange={(e) => setPlan({ ...plan, status: e.target.value as PlanStatus })}
                className={`px-3 py-1.5 rounded-xl font-black text-xs border focus:outline-none ${
                  plan.status === "pending_review"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                <option value="pending_review">⏳ Pending Review (Hidden from User)</option>
                <option value="approved">✅ Approved / Active (Visible to User)</option>
              </select>
            </div>
          </div>

          {/* Configurable Targets: Weeks Count, Calories, Protein, Workout Days */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Dynamic Weeks Count */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Total Plan Weeks
              </label>
              <select
                value={plan.weeksCount}
                onChange={(e) => handleWeeksCountChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={4}>4 Weeks Plan</option>
                <option value={6}>6 Weeks Plan</option>
                <option value={8}>8 Weeks Plan (Default)</option>
                <option value={10}>10 Weeks Plan</option>
                <option value={12}>12 Weeks Plan</option>
                <option value={16}>16 Weeks Plan</option>
                <option value={24}>24 Weeks Transformation</option>
              </select>
            </div>

            {/* Daily Calorie Target */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Calorie Target (kcal/day)
              </label>
              <input
                type="number"
                value={plan.calorieTarget}
                onChange={(e) => setPlan({ ...plan, calorieTarget: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Daily Protein Target */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Protein Target (g/day)
              </label>
              <input
                type="number"
                value={plan.proteinTargetGrams}
                onChange={(e) => setPlan({ ...plan, proteinTargetGrams: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Workout Days */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Workout Days / Week
              </label>
              <select
                value={plan.workoutDaysPerWeek}
                onChange={(e) => setPlan({ ...plan, workoutDaysPerWeek: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={3}>3 Days / Week</option>
                <option value={4}>4 Days / Week (Recommended)</option>
                <option value={5}>5 Days / Week</option>
                <option value={6}>6 Days / Week</option>
              </select>
            </div>
          </div>

          {/* Coach Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Head Coach Custom Guidance Notes (Visible to Client)
            </label>
            <textarea
              rows={2}
              value={plan.coachNotes || ""}
              onChange={(e) => setPlan({ ...plan, coachNotes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Ensure minimum 3.5L water intake and 8,000 steps daily. Adjust dinner portion if sleeping late."
            />
          </div>
        </section>

        {/* Week-by-Week Editor Navigation */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-950">
              Week-by-Week Schedule Customizer ({plan.weeksCount} Total Weeks)
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Click a week tab below to review or modify its exact meals and workouts
            </span>
          </div>

          {/* Week Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {plan.weeks.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setSelectedWeekNum(w.weekNumber)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                  selectedWeekNum === w.weekNumber
                    ? "bg-[#032e1c] text-white shadow-sm"
                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/80"
                }`}
              >
                Week {w.weekNumber}
              </button>
            ))}
          </div>
        </section>

        {/* Selected Week Detailed Editor */}
        {selectedWeek && (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h4 className="text-xl font-black text-gray-950">Editing Week {selectedWeek.weekNumber}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Phase Title: {selectedWeek.phaseTitle} — {selectedWeek.phaseSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                  Target: {selectedWeek.nutrition.calories} kcal · {selectedWeek.workouts.daysPerWeek} Training Days
                </span>
              </div>
            </div>

            {/* Meals Customizer */}
            <div className="space-y-3">
              <h5 className="font-black text-sm text-gray-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Daily Meal Breakdown for Week {selectedWeek.weekNumber}</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWeek.nutrition.meals.map((meal, mIdx) => (
                  <div
                    key={meal.id}
                    className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-emerald-800 uppercase tracking-wider">
                        {meal.slot}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {meal.calories} kcal · {meal.proteinGrams}g P
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Meal Title</label>
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => {
                          const updatedWeeks = [...plan.weeks];
                          const currentWeek = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
                          if (currentWeek) {
                            currentWeek.nutrition.meals[mIdx].name = e.target.value;
                            currentWeek.nutrition.meals[mIdx].itemsDescription = e.target.value;
                            setPlan({ ...plan, weeks: updatedWeeks });
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Portion & Food Details</label>
                      <input
                        type="text"
                        value={meal.portion}
                        onChange={(e) => {
                          const updatedWeeks = [...plan.weeks];
                          const currentWeek = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
                          if (currentWeek) {
                            currentWeek.nutrition.meals[mIdx].portion = e.target.value;
                            setPlan({ ...plan, weeks: updatedWeeks });
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workouts Customizer */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h5 className="font-black text-sm text-gray-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Workout Split for Week {selectedWeek.weekNumber}</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWeek.workouts.days.map((day, dIdx) => (
                  <div
                    key={day.id}
                    className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-emerald-800 uppercase tracking-wider">
                        {day.day}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {day.durationMinutes} mins · {day.exercises.length} exercises
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Workout Focus Title</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => {
                          const updatedWeeks = [...plan.weeks];
                          const currentWeek = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
                          if (currentWeek) {
                            currentWeek.workouts.days[dIdx].title = e.target.value;
                            setPlan({ ...plan, weeks: updatedWeeks });
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Target Muscle Groups</label>
                      <input
                        type="text"
                        value={day.focus}
                        onChange={(e) => {
                          const updatedWeeks = [...plan.weeks];
                          const currentWeek = updatedWeeks.find((w) => w.weekNumber === selectedWeek.weekNumber);
                          if (currentWeek) {
                            currentWeek.workouts.days[dIdx].focus = e.target.value;
                            setPlan({ ...plan, weeks: updatedWeeks });
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSaveAndApprove(plan.status)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes (Keep {plan.status})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAndApprove("approved")}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-sm shadow-md flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Approve Plan for User Dashboard</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
