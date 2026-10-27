"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  BarChart2,
  Percent,
  FileDown,
  BookOpen,
  Share2,
  Home,
  Utensils,
  Dumbbell,
  TrendingUp,
  Target,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  X,
  Plus,
  Scale,
  ShieldCheck,
  Bell,
  Menu,
} from "@/components/ui/icons";
import type {
  PlanDashboardData,
  MealSlotItem,
  WorkoutDayItem,
  WeekPlanData,
  TaskLogState,
} from "@/types/plan-dashboard";
import {
  getStoredTaskLogs,
  saveStoredTaskLog,
  fetchFirebaseTaskLogs,
  calculateWeekProgress,
  calculateOverallProgress,
} from "@/features/plan/dashboard-data";
import { ShoppingBag, Sparkles } from "@/components/ui/supplement-icons";
import { getRecommendedProductsForGoal } from "@/features/supplements/supplements-data";

interface PlanDashboardProps {
  initialPlan: PlanDashboardData;
  isDevPreview?: boolean;
}

export function PlanDashboard({ initialPlan, isDevPreview = false }: PlanDashboardProps) {
  const [plan] = useState<PlanDashboardData>(initialPlan);
  const recommendedSupplements = getRecommendedProductsForGoal(plan.goal);
  const [activeTab, setActiveTab] = useState<"overview" | "nutrition" | "workouts" | "progress">("overview");
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [taskLogs, setTaskLogs] = useState<TaskLogState>({});
  const [selectedMeal, setSelectedMeal] = useState<MealSlotItem | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDayItem | null>(null);
  const [showFullWeekModal, setShowFullWeekModal] = useState<boolean>(false);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [logWeightInput, setLogWeightInput] = useState<string>("");
  const [logNotesInput, setLogNotesInput] = useState<string>("");
  const [weightHistory, setWeightHistory] = useState<Array<{ date: string; weight: string; note?: string }>>([
    { date: "Day 1 (Baseline)", weight: "74.0 kg", note: "Starting transformation" },
  ]);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [activeReviewMode, setActiveReviewMode] = useState<boolean>(
    initialPlan.status === "pending_review" && !isDevPreview
  );

  // Load task completion state from Firebase Firestore
  useEffect(() => {
    let active = true;
    const stored = getStoredTaskLogs(plan.id);
    if (Object.keys(stored).length > 0) {
      setTaskLogs(stored);
    }
    void fetchFirebaseTaskLogs(plan.id).then((firebaseLogs) => {
      if (active && Object.keys(firebaseLogs).length > 0) {
        setTaskLogs(firebaseLogs);
      }
    });
    return () => {
      active = false;
    };
  }, [plan.id]);

  const selectedWeek: WeekPlanData =
    plan.weeks.find((w) => w.weekNumber === selectedWeekNum) || plan.weeks[0] || {
      weekNumber: 1,
      phaseTitle: "Build your foundation",
      phaseSubtitle: "Establish consistency",
      nutrition: { calories: 1800, proteinGrams: 120, description: "Personalized Indian meal plan", meals: [] },
      workouts: { daysPerWeek: 4, description: "4 workout days with video guidance", days: [] },
    };

  const weekProgress = calculateWeekProgress(selectedWeek.weekNumber, selectedWeek, taskLogs);
  const overallProgress = calculateOverallProgress(plan, taskLogs);

  const toggleTask = (taskKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = !!taskLogs[taskKey];
    const updated = saveStoredTaskLog(plan.id, taskKey, !current);
    setTaskLogs({ ...updated });
  };

  const handleShare = async () => {
    const shareData = {
      title: `${plan.customerName}'s ${plan.weeksCount}-Week BMYFIT Plan`,
      text: `Check out my personalized ${plan.weeksCount}-Week ${plan.goalDisplay} plan on BMYFIT!`,
      url: typeof window !== "undefined" ? window.location.href : "https://bmyfit.com",
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    }
  };

  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleOpenWhatsApp = () => {
    const coachNum = plan.coach?.whatsAppNumber?.replace(/[^0-9]/g, "") || "919876543210";
    const text = encodeURIComponent(
      `Hello Coach! I'm reviewing my ${plan.weeksCount}-week ${plan.goalDisplay} plan (Plan ID: ${plan.id}). I'd like some guidance on Week ${selectedWeekNum}.`
    );
    window.open(`https://wa.me/${coachNum}?text=${text}`, "_blank");
  };

  const handleLogMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeightInput.trim()) return;
    setWeightHistory((prev) => [
      ...prev,
      {
        date: `Week ${selectedWeekNum} Check-in`,
        weight: `${logWeightInput.trim()} kg`,
        note: logNotesInput.trim() || undefined,
      },
    ]);
    setLogWeightInput("");
    setLogNotesInput("");
    setShowProgressModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-28 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 leading-none">
              BMY<span className="text-[#00e676]">FIT</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mt-0.5">
              PERSONALIZED FITNESS & NUTRITION
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("No new notifications. You are on track!")}
              className="relative p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#00e676] rounded-full ring-2 ring-white" />
            </button>

            <Link
              href="/admin"
              className="p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              title="Admin Panel"
              aria-label="Admin Navigation"
            >
              <Menu className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Coach Pending Review Banner (if plan is pending approval) */}
      {activeReviewMode && (
        <div className="bg-gradient-to-r from-amber-600 via-emerald-800 to-teal-900 text-white px-4 py-3.5 shadow-md border-b border-white/10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black">
                <Clock className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-300" />
                <span>Clinical &amp; Coaching Review in Progress</span>
                <span className="text-[10px] bg-amber-400/30 text-amber-100 px-2 py-0.5 rounded-full border border-amber-300/40">
                  ₹99 Package Confirmed
                </span>
              </div>
              <p className="text-xs text-white/90">
                Coach Naveen &amp; clinical team are reviewing your submitted health conditions and medical reports
                to calibrate nutrition &amp; progressive volume.
              </p>
              {plan.medicalSummary?.diseases && plan.medicalSummary.diseases.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                  <span className="text-white/70">Submitted Dossier:</span>
                  {plan.medicalSummary.diseases.map((d, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-black/30 text-white font-bold">
                      🩺 {d}
                    </span>
                  ))}
                  {Boolean(
                    plan.medicalSummary.documentsCount && plan.medicalSummary.documentsCount > 0
                  ) && (
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-white font-bold">
                      📎 {plan.medicalSummary.documentsCount} Report(s) attached
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setActiveReviewMode(false)}
                className="bg-white text-gray-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-sm hover:bg-emerald-50 transition"
              >
                View Draft Schedule
              </button>
              <Link
                href="/admin"
                className="bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-black px-3.5 py-2 rounded-xl text-xs transition"
              >
                Admin Review &amp; Push
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-6">
        {/* ================= HERO SECTION ================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Content (md:col-span-7) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.1] text-gray-950">
                  Your{" "}
                  {plan.monthsCount
                    ? `${plan.monthsCount}-Month (${plan.weeksCount}-W)`
                    : `${plan.weeksCount}-Week`}
                  <br />
                  <span className="text-[#00c853]">Personalized Plan</span>
                </h1>
                <p className="text-gray-500 text-sm mt-2.5 font-medium leading-relaxed max-w-md">
                  Built around your body data and clinical health profile to help you achieve sustainable results.
                </p>
              </div>

              {/* Stat Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Goal Pill */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#fafafa] border border-gray-100 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-orange-100/70 flex items-center justify-center text-orange-600">
                    <Flame className="w-4 h-4 fill-orange-500" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] text-gray-400 font-semibold leading-tight">Your Goal</span>
                    <span className="block text-xs font-black text-gray-900 leading-tight">{plan.goalDisplay}</span>
                  </div>
                </div>

                {/* BMI Pill */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#fafafa] border border-gray-100 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-600">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] text-gray-400 font-semibold leading-tight">BMI</span>
                    <span className="block text-xs font-black text-gray-900 leading-tight">{plan.bmi}</span>
                  </div>
                </div>

                {/* Body Fat Pill */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#fafafa] border border-gray-100 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-teal-100/70 flex items-center justify-center text-teal-600">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] text-gray-400 font-semibold leading-tight">Body Fat</span>
                    <span className="block text-xs font-black text-gray-900 leading-tight">{plan.bodyFatPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic: Athletic Model Cutout (md:col-span-5) */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-inner bg-gradient-to-tr from-emerald-50 via-white to-emerald-100/40">
                <Image
                  src="/images/plan-hero-model-exact.png"
                  alt="Personalized Plan Hero Model"
                  fill
                  priority
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 280px, 320px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACTION BUTTONS ROW ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Button 1: Download Full Plan (PDF) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#022a18] text-white hover:bg-[#033b22] transition shadow-sm text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-xs sm:text-sm text-white">Download Full Plan (PDF)</span>
              <span className="block text-[11px] text-emerald-300 font-medium">Complete {plan.weeksCount}-week plan</span>
            </div>
          </button>

          {/* Button 2: View in App */}
          <button
            type="button"
            onClick={() => setShowFullWeekModal(true)}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#eaf7ee] border border-emerald-100/80 text-gray-900 hover:bg-[#e1f4e6] transition shadow-sm text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-xs sm:text-sm text-gray-900">View in App</span>
              <span className="block text-[11px] text-gray-500 font-medium">Interactive version</span>
            </div>
          </button>

          {/* Button 3: Share Plan */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#eaf7ee] border border-emerald-100/80 text-gray-900 hover:bg-[#e1f4e6] transition shadow-sm text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-xs sm:text-sm text-gray-900">
                {copiedShare ? "Link Copied!" : "Share Plan"}
              </span>
              <span className="block text-[11px] text-gray-500 font-medium">With your coach</span>
            </div>
          </button>

          {/* Button 4: Buy Suggested Products */}
          <Link
            href={`/supplements?goal=${encodeURIComponent(plan.goal)}`}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#00c853] to-[#00e676] text-black hover:opacity-95 transition shadow-sm text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center text-black flex-shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <span className="block font-black text-xs sm:text-sm text-black">Buy Suggested Products</span>
              <span className="block text-[11px] text-black/80 font-bold">Coach recommendations &rarr;</span>
            </div>
          </Link>
        </section>

        {/* ================= 5 NAVIGATION TABS ================= */}
        <nav className="bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm transition min-w-[85px] ${
              activeTab === "overview"
                ? "bg-[#e6f9ed] text-[#034423] shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nutrition")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm transition min-w-[85px] ${
              activeTab === "nutrition"
                ? "bg-[#e6f9ed] text-[#034423] shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Nutrition</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workouts")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm transition min-w-[85px] ${
              activeTab === "workouts"
                ? "bg-[#e6f9ed] text-[#034423] shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Workouts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("progress")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm transition min-w-[85px] ${
              activeTab === "progress"
                ? "bg-[#e6f9ed] text-[#034423] shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Progress</span>
          </button>

          <Link
            href={`/supplements?goal=${encodeURIComponent(plan.goal)}`}
            className="flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm text-[#00a854] bg-[#eaf8ee] hover:bg-[#dcf4e3] transition min-w-[110px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop</span>
          </Link>
        </nav>

        {/* ================= PLAN OVERVIEW SECTION ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Plan Overview</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                A structured plan to help you reduce body fat while maintaining lean muscle.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e6f9ed] text-[#00a854] text-xs font-black tracking-wide uppercase">
              {plan.weeksCount} WEEKS
            </span>
          </div>

          {/* 4 Metric Cards Grid (2x2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Calorie Target */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#eaf7ee] border border-emerald-100/60 shadow-xs flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-white/80 text-emerald-600 flex items-center justify-center mb-3">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600">Calorie Target</span>
                <span className="block text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  {plan.calorieTarget.toLocaleString()}
                </span>
                <span className="block text-[11px] text-gray-500 font-medium">kcal/day</span>
              </div>
            </div>

            {/* Card 2: Protein Target */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf2f4] border border-rose-100/60 shadow-xs flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-white/80 text-rose-500 flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600">Protein Target</span>
                <span className="block text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  {plan.proteinTargetGrams}g
                </span>
                <span className="block text-[11px] text-gray-500 font-medium">per day</span>
              </div>
            </div>

            {/* Card 3: Workout Plan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#f0f7ff] border border-blue-100/60 shadow-xs flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-white/80 text-blue-500 flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600">Workout Plan</span>
                <span className="block text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  {plan.workoutDaysPerWeek} days
                </span>
                <span className="block text-[11px] text-gray-500 font-medium">per week</span>
              </div>
            </div>

            {/* Card 4: Progress Plan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fef9ee] border border-amber-100/60 shadow-xs flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-white/80 text-amber-500 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600">Progress Plan</span>
                <span className="block text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  {plan.progressTrackingFrequency}
                </span>
                <span className="block text-[11px] text-gray-500 font-medium">tracking</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WEEK NAVIGATION PILLS ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Week Navigation</h3>
            <span className="text-xs text-gray-500 font-medium">
              Overall Progress: {overallProgress.completed}/{overallProgress.total} tasks ({overallProgress.percent}%)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {plan.weeks.map((w) => {
              const isSelected = w.weekNumber === selectedWeekNum;
              const wp = calculateWeekProgress(w.weekNumber, w, taskLogs);
              return (
                <button
                  key={w.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeekNum(w.weekNumber)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#032e1c] text-white shadow-sm"
                      : "bg-[#f4f5f7] hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>Week {w.weekNumber}</span>
                  {wp.percent === 100 && (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-emerald-600"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= SELECTED WEEK HEADER ================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-black text-gray-950 tracking-tight">Week {selectedWeek.weekNumber}</h4>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  {weekProgress.completed}/{weekProgress.total} Logged ({weekProgress.percent}%)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                {selectedWeek.phaseTitle} — {selectedWeek.phaseSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFullWeekModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e6f9ed] text-[#008a44] font-bold text-xs hover:bg-emerald-100 transition shadow-2xs"
            >
              <span>View Full Week</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Week Progress Bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00c853] h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${weekProgress.percent}%` }}
            />
          </div>

          {/* ================= NUTRITION & WORKOUT CARDS GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LEFT CARD: Nutrition Plan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-gray-200 transition space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">Nutrition Plan</h5>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight mt-0.5">
                      {selectedWeek.nutrition.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMeal(selectedWeek.nutrition.meals[0])}
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
                  title="View nutrition details"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Meals Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {selectedWeek.nutrition.meals.map((meal) => {
                  const taskKey = `w${selectedWeek.weekNumber}_meal_${meal.id}`;
                  const isLogged = !!taskLogs[taskKey];

                  return (
                    <div
                      key={meal.id}
                      onClick={() => setSelectedMeal(meal)}
                      className="group cursor-pointer rounded-xl p-2 bg-[#fafafa] border border-gray-100 hover:border-emerald-200 hover:shadow-xs transition flex flex-col justify-between text-left"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 mb-2">
                        <Image
                          src={meal.image}
                          alt={meal.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                          sizes="120px"
                        />
                        <button
                          type="button"
                          onClick={(e) => toggleTask(taskKey, e)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/90 shadow-sm hover:scale-110 transition"
                          title={isLogged ? "Mark as not eaten" : "Mark as eaten"}
                        >
                          {isLogged ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-gray-900 leading-tight">{meal.slot}</span>
                        <span className="block text-[11px] text-gray-500 font-medium leading-tight truncate">
                          {meal.itemsDescription}
                        </span>
                        <span className="block text-[10px] text-emerald-700 font-bold mt-1">
                          {meal.calories} kcal · {meal.proteinGrams}g P
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Tip: Click food photo to see recipe & portion details</span>
                <span className="text-[11px] font-bold text-emerald-700">Daily Target: {selectedWeek.nutrition.calories} kcal</span>
              </div>
            </div>

            {/* RIGHT CARD: Workout Plan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-gray-200 transition space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">Workout Plan</h5>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight mt-0.5">
                      {selectedWeek.workouts.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedWorkout(selectedWeek.workouts.days[0])}
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
                  title="View workout details"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Workout Days Vertical List */}
              <div className="space-y-2 pt-1">
                {selectedWeek.workouts.days.map((day) => {
                  const taskKey = `w${selectedWeek.weekNumber}_workout_${day.id}`;
                  const isLogged = !!taskLogs[taskKey];

                  return (
                    <div
                      key={day.id}
                      onClick={() => setSelectedWorkout(day)}
                      className="group cursor-pointer rounded-xl p-2.5 bg-[#fafafa] border border-gray-100 hover:border-emerald-200 hover:shadow-xs transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={day.image}
                            alt={day.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            sizes="50px"
                          />
                        </div>

                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-gray-900 leading-tight truncate">
                            {day.title}
                          </span>
                          <span className="block text-[11px] text-gray-500 font-medium leading-tight truncate mt-0.5">
                            {day.focus}
                          </span>
                          <span className="block text-[10px] text-gray-400 font-medium mt-0.5">
                            {day.exercises.length} Exercises · {day.durationMinutes} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleTask(taskKey, e)}
                          className="p-1 rounded-full hover:scale-110 transition"
                          title={isLogged ? "Mark as not completed" : "Mark as completed"}
                        >
                          {isLogged ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Tip: Click workout to see exercises, sets & reps</span>
                <span className="text-[11px] font-bold text-emerald-700">{selectedWeek.workouts.daysPerWeek} Days / Week</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COACH-RECOMMENDED SUPPLEMENTS SECTION ================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-500/20 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf8ee] text-[#00c853] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-gray-950">
                    Coach-Recommended Supplements
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eaf8ee] text-[#035b2c]">
                    Based on {plan.goalDisplay}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Hand-picked by Coach Naveen to accelerate muscle recovery &amp; meet your daily targets.
                </p>
              </div>
            </div>

            <Link
              href={`/supplements?goal=${encodeURIComponent(plan.goal)}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0e271a] hover:bg-[#00c853] text-white hover:text-black font-bold text-xs transition self-start sm:self-auto shadow-sm"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Recommended Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {recommendedSupplements.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-[#fafbfa] border border-gray-100 hover:border-emerald-200 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-2 min-h-[18px]">
                    {prod.tagBadge ? (
                      <span className="font-bold text-[#035b2c] bg-[#eaf8ee] px-2 py-0.5 rounded-full">
                        {prod.tagBadge}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-gray-500 font-bold">★ {prod.rating}</span>
                  </div>

                  <Link href={`/supplements/${prod.id}`} className="block relative aspect-square w-full rounded-xl bg-white p-2 mb-2 overflow-hidden">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform"
                      sizes="140px"
                    />
                  </Link>

                  <Link href={`/supplements/${prod.id}`}>
                    <h4 className="font-black text-xs sm:text-sm text-gray-900 group-hover:text-[#00c853] transition-colors truncate">
                      {prod.name}
                    </h4>
                  </Link>

                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                    {prod.subtitle}
                  </p>

                  <div className="flex items-baseline gap-1.5 mt-2.5 pt-1.5 border-t border-gray-100">
                    <span className="text-sm font-black text-gray-950">
                      ₹{prod.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 line-through">
                      ₹{prod.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-[#00c853] bg-[#eaf8ee] px-1 rounded">
                      {prod.discountPercent}% OFF
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-1">
                  <a
                    href={prod.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-2.5 rounded-xl bg-[#0e271a] text-white hover:bg-[#00c853] hover:text-black transition font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="font-black text-xs">a</span>
                    <span>Buy on Amazon</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= BOTTOM UTILITY CARDS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Progress Tracking */}
          <div
            onClick={() => setShowProgressModal(true)}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-gray-900">Progress Tracking</h5>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Track your weight, measurements and see your progress.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-700 transition">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Need Help? (WhatsApp) */}
          <div
            onClick={handleOpenWhatsApp}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.834.814 2.791.814 3.179 0 5.766-2.587 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.523-4.477 10-10 10-1.741 0-3.376-.445-4.809-1.226l-7.191 1.882 1.918-7.009c-.838-1.488-1.321-3.21-1.321-5.047 0-5.523 4.477-10 10-10 5.522 0 10 4.477 10 10z" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-sm text-gray-900">Need Help?</h5>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Get guidance from our fitness coach on WhatsApp.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-700 transition">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </section>

        {/* Coach Bio Card */}
        <section className="bg-gradient-to-r from-emerald-950 via-[#032e1c] to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0 relative">
              <Image
                src={plan.coach?.avatar || "/images/coach-naveen.jpg"}
                alt={plan.coach?.name || "Coach Naveen"}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h5 className="font-black text-base text-white">{plan.coach?.name}</h5>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">{plan.coach?.role}</p>
              <p className="text-[11px] text-emerald-300/80 mt-1 max-w-md italic">
                &ldquo;{plan.coachNotes || "Follow the portions, log daily, and ask questions whenever in doubt!"}&rdquo;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#00e676] text-emerald-950 font-black text-xs hover:bg-[#00c853] transition shadow-md"
          >
            Chat with Coach
          </button>
        </section>
      </main>

      {/* ================= MODAL: MEAL DETAILS ================= */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedMeal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100">
              <Image src={selectedMeal.image} alt={selectedMeal.name} fill className="object-cover" sizes="500px" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedMeal.slot}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-950">{selectedMeal.name}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Recommended Portion: {selectedMeal.portion}</p>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-2xl text-center">
              <div>
                <span className="block text-[10px] text-gray-400 font-bold">Calories</span>
                <span className="block text-sm font-black text-emerald-700">{selectedMeal.calories}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold">Protein</span>
                <span className="block text-sm font-black text-gray-900">{selectedMeal.proteinGrams}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold">Carbs</span>
                <span className="block text-sm font-black text-gray-900">{selectedMeal.carbsGrams}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold">Fats</span>
                <span className="block text-sm font-black text-gray-900">{selectedMeal.fatsGrams}g</span>
              </div>
            </div>

            {selectedMeal.recipeNotes && selectedMeal.recipeNotes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Coach Preparation Tips</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {selectedMeal.recipeNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {(() => {
                const taskKey = `w${selectedWeek.weekNumber}_meal_${selectedMeal.id}`;
                const isLogged = !!taskLogs[taskKey];
                return (
                  <button
                    type="button"
                    onClick={() => toggleTask(taskKey)}
                    className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition ${
                      isLogged
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-[#032e1c] text-white hover:bg-[#021f13]"
                    }`}
                  >
                    {isLogged ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isLogged ? "Meal Logged as Eaten (Undo)" : "Mark Meal as Eaten"}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: WORKOUT DETAILS ================= */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedWorkout(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100">
              <Image src={selectedWorkout.image} alt={selectedWorkout.title} fill className="object-cover" sizes="500px" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedWorkout.day} · {selectedWorkout.durationMinutes} mins
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-950">{selectedWorkout.title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Focus: {selectedWorkout.focus}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Exercise Routine</h4>
              <div className="space-y-2.5">
                {selectedWorkout.exercises.map((ex, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        {idx + 1}. {ex.name}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {ex.sets} × {ex.reps}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Rest: {ex.rest}</span>
                      {ex.tips && <span className="italic text-gray-400 truncate max-w-[200px]">{ex.tips}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {(() => {
                const taskKey = `w${selectedWeek.weekNumber}_workout_${selectedWorkout.id}`;
                const isLogged = !!taskLogs[taskKey];
                return (
                  <button
                    type="button"
                    onClick={() => toggleTask(taskKey)}
                    className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition ${
                      isLogged
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-[#032e1c] text-white hover:bg-[#021f13]"
                    }`}
                  >
                    {isLogged ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isLogged ? "Workout Completed (Undo)" : "Mark Workout as Completed"}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL WEEK BREAKDOWN ================= */}
      {showFullWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setShowFullWeekModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Full Schedule</span>
              <h3 className="text-2xl font-black text-gray-950">Week {selectedWeek.weekNumber} Master Routine</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {selectedWeek.phaseTitle} · Calorie Target: {selectedWeek.nutrition.calories} kcal · Workout Days: {selectedWeek.workouts.daysPerWeek}
              </p>
            </div>

            {/* Daily Meals Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Daily Meal Schedule</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedWeek.nutrition.meals.map((meal) => (
                  <div key={meal.id} className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 space-y-1">
                    <span className="block text-xs font-black text-emerald-800">{meal.slot}: {meal.name}</span>
                    <p className="text-xs text-gray-600">{meal.portion}</p>
                    <span className="block text-[11px] font-bold text-gray-400 mt-1">
                      {meal.calories} kcal · {meal.proteinGrams}g Protein
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workout Days Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Weekly Training Split</span>
              </h4>
              <div className="space-y-2">
                {selectedWeek.workouts.days.map((day) => (
                  <div key={day.id} className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-xs sm:text-sm text-gray-900">{day.title}</span>
                      <span className="block text-xs text-gray-500">{day.focus}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      {day.durationMinutes} mins
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowFullWeekModal(false);
                  handleDownloadPdf();
                }}
                className="w-full py-3 rounded-xl bg-[#022a18] text-white font-bold text-sm hover:bg-[#033b22] transition flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Printable Week PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROGRESS TRACKING ================= */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowProgressModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-gray-950">Log Body Measurement</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Record your weekly morning weight and notes to track your body recomposition.
              </p>
            </div>

            <form onSubmit={handleLogMeasurement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Morning Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 73.2"
                  value={logWeightInput}
                  onChange={(e) => setLogWeightInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Energy Levels (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Feeling strong, 100% meal compliance this week"
                  value={logNotesInput}
                  onChange={(e) => setLogNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#00c853] text-white font-black text-sm hover:bg-[#00b047] transition shadow-md"
              >
                Save Measurement
              </button>
            </form>

            {/* History Table */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Log History</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {weightHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50">
                    <span className="font-semibold text-gray-700">{item.date}</span>
                    <span className="font-black text-emerald-700">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM STICKY NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between relative">
          {/* 1. Home */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          {/* 2. Plans (Active) */}
          <div className="flex flex-col items-center gap-1 text-emerald-700 font-bold">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px]">Plans</span>
          </div>

          {/* 3. Floating Center Action Button: Shop */}
          <Link
            href="/supplements"
            className="flex flex-col items-center -mt-6 group focus:outline-none"
          >
            <div className="w-13 h-13 rounded-full bg-[#00e676] hover:bg-[#00c853] text-emerald-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform group-hover:scale-105 active:scale-95 transition">
              <ShoppingBag className="w-6 h-6 stroke-[2.3]" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#00c853] mt-1">
              Shop
            </span>
          </Link>

          {/* 4. Results */}
          <button
            type="button"
            onClick={() => setShowProgressModal(true)}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold">Results</span>
          </button>

          {/* 5. Profile / Admin */}
          <Link
            href="/admin"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition"
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-black text-gray-700">
              P
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
