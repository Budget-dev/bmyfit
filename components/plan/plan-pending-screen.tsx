"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PlanDashboardData } from "@/types/plan-dashboard";
import { db, doc, onSnapshot } from "@/lib/firebase/client";
import { fetchFirebasePlan } from "@/lib/storage/mock-storage";
import { ClientChatWidget } from "@/components/chat/client-chat-widget";
import {
  FontAwesomeIcon,
  faUtensils,
  faDumbbell,
  faCheckCircle,
  faClock,
  faArrowsRotate,
  faWhatsapp,
  faArrowRight,
  faLock,
} from "@/components/ui/font-awesome-icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PlanPendingScreenProps {
  plan: PlanDashboardData;
  onPlanApproved: (updatedPlan: PlanDashboardData) => void;
}

export function PlanPendingScreen({ plan, onPlanApproved }: PlanPendingScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckedText, setLastCheckedText] = useState("Just now");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(3);
  const [celebrating, setCelebrating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const triggerPlanReady = useCallback(
    (approvedPlan: PlanDashboardData) => {
      setCelebrating(true);
      setStatusMessage("🎉 Plan Approved & Live! Loading your customized weekly roadmap...");
      setTimeout(() => {
        onPlanApproved(approvedPlan);
      }, 1200);
    },
    [onPlanApproved]
  );

  // 1. Real-time Firebase Firestore listener for instant push transition
  useEffect(() => {
    if (!plan.id) return;

    // Listen to plans collection for this plan/user
    const unsubPlan = onSnapshot(
      doc(db, "plans", plan.id),
      (snapshot) => {
        if (snapshot.exists()) {
          const remotePlan = snapshot.data() as PlanDashboardData;
          if (remotePlan.status === "approved" || remotePlan.status === "active") {
            triggerPlanReady(remotePlan);
          }
        }
      },
      (err) => {
        console.warn("Firestore live plan listener notice:", err.message);
      }
    );

    // Also listen to users collection
    const unsubUser = onSnapshot(
      doc(db, "users", plan.id),
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          if (userData?.plan && (userData.plan.status === "approved" || userData.plan.status === "active")) {
            triggerPlanReady(userData.plan as PlanDashboardData);
          }
        }
      },
      (err) => {
        console.warn("Firestore live user listener notice:", err.message);
      }
    );

    // Dynamic timer for animated processing feedback
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev === 3 ? 4 : 3));
    }, 4000);

    return () => {
      unsubPlan();
      unsubUser();
      clearInterval(stepInterval);
    };
  }, [plan.id, triggerPlanReady]);

  // 2. Manual Refresh Handler
  const handleCheckStatus = async () => {
    try {
      setIsRefreshing(true);
      setStatusMessage(null);

      // Check Firestore client
      const freshPlan = await fetchFirebasePlan(plan.id);
      if (freshPlan && (freshPlan.status === "approved" || freshPlan.status === "active")) {
        triggerPlanReady(freshPlan);
        return;
      }

      // Check API endpoint
      const res = await fetch(`/api/admin/plans/${plan.id}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.plan && (data.plan.status === "approved" || data.plan.status === "active")) {
          triggerPlanReady(data.plan);
          return;
        }
      }

      setLastCheckedText(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setStatusMessage("Your nutritionist & trainer are actively preparing your custom plan. Please be awaited!");
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err) {
      console.warn("Status check notice:", err);
      setStatusMessage("Status verified. Preparation in progress by our clinical and training team.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWhatsApp = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#06140e] text-white flex flex-col justify-between selection:bg-[#00e676] selection:text-black relative overflow-x-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#00e676]/20 via-emerald-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-[600px] h-[600px] bg-gradient-to-tr from-[#057a44]/25 via-[#00c853]/15 to-transparent rounded-full blur-[160px] pointer-events-none translate-y-1/3" />

      {/* Top Navigation Header */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-emerald-900/40 backdrop-blur-md bg-[#06140e]/80">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white px-3 py-1 rounded-xl shadow-xs">
            <span className="text-xl font-black text-gray-950 tracking-tight">
              BMY<span className="text-[#00c853]">FIT</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Badge
            variant="amber"
            className="gap-2 px-3.5 py-1.5 text-xs font-black tracking-wider uppercase bg-amber-500/15 border-amber-500/30 text-amber-300"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>WAITLIST · PREPARATION IN PROGRESS</span>
          </Badge>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
        {/* Celebration Banner if plan unlocked */}
        {celebrating && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-sm font-black flex items-center justify-center gap-2 animate-bounce">
            <span className="text-xl">🎉</span>
            <span>Your custom plan has been approved and published! Unlocking your weekly dashboard...</span>
          </div>
        )}

        {/* Status Notification Toast */}
        {statusMessage && !celebrating && (
          <div className="w-full mb-5 p-3 rounded-2xl bg-white/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in flex items-center justify-center gap-2 shadow-lg">
            <FontAwesomeIcon icon={faArrowsRotate} className="w-3.5 h-3.5 text-[#00e676] animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Specialists Avatar Showcase */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Nutrition Specialist Avatar */}
          <div className="relative group">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-emerald-400 shadow-2xl bg-[#032315] flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-teal-950 flex flex-col items-center justify-center text-emerald-300 p-2">
                <FontAwesomeIcon icon={faUtensils} className="w-7 h-7 text-[#00e676] mb-1" />
                <span className="text-[9px] font-black uppercase text-center leading-tight">Clinical Dietitian</span>
              </div>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#057a44] text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
              Nutritionist
            </div>
          </div>

          {/* Plus sign */}
          <div className="text-emerald-400 font-black text-xl sm:text-2xl select-none">+</div>

          {/* Head Trainer Coach Naveen Avatar */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#00e676] to-[#00c853] rounded-full blur-lg opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#00e676] shadow-2xl bg-[#032315] mx-auto">
              <Image
                src="/images/coach-naveen.jpg"
                alt="Coach Naveen"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#00e676] text-gray-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
              Head Trainer
            </div>
          </div>
        </div>

        {/* Main Headlines matching user requirements */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <Badge
            variant="emerald"
            className="gap-2 px-3.5 py-1 text-xs font-black tracking-wide bg-[#00e676]/10 border-[#00e676]/30 text-[#00e676]"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 text-[#00e676]" />
            <span>PAYMENT VERIFIED · SUBSCRIBER ON WAITLIST</span>
          </Badge>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Good news! Your Nutritionist &amp; Trainer Are{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e676] via-emerald-400 to-[#00c853]">
              Preparing Your Plan
            </span>
          </h1>

          <p className="text-xs sm:text-base text-gray-300 leading-relaxed max-w-xl mx-auto">
            <strong>Please be awaited!</strong> Our certified clinical nutritionist and head fitness trainer are
            carefully reviewing your intake biometrics, metabolic deficit requirements, and dietary preferences to
            craft your customized nutrition and workout roadmap.
          </p>
        </div>

        {/* Dual Specialty Cards: Nutritionist + Trainer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8 text-left">
          {/* Card 1: Nutritionist Preparation */}
          <Card className="bg-[#041c12]/90 border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-[#00e676] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-[#00e676]" />
              </div>
              <Badge variant="emerald" className="text-[10px] uppercase font-black bg-emerald-950 border-emerald-500/40 text-[#00e676]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse mr-1" />
                CALCULATING DIET
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Clinical Nutrition Desk</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Calibrating your <strong className="text-white">{plan.calorieTarget} kcal</strong> daily target,{" "}
                <strong className="text-white">{plan.proteinTargetGrams}g</strong> protein distribution, and personalized
                Indian meals matched to your lifestyle.
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-900/40 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 text-[#00e676]" />
              <span>Micronutrient &amp; calorie deficit mapped</span>
            </div>
          </Card>

          {/* Card 2: Trainer Preparation */}
          <Card className="bg-[#041c12]/90 border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e676]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-[#00e676] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faDumbbell} className="w-5 h-5 text-[#00e676]" />
              </div>
              <Badge variant="emerald" className="text-[10px] uppercase font-black bg-emerald-950 border-emerald-500/40 text-[#00e676]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse mr-1" />
                BUILDING WORKOUT
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Personal Trainer (Coach Naveen)</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Structuring your <strong className="text-white">{plan.workoutDaysPerWeek || 4}-day</strong> progressive
                overload schedule, sets, reps, and exercise splits tailored for{" "}
                <strong className="text-white">{plan.goalDisplay || "your goal"}</strong>.
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-900/40 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 text-[#00e676]" />
              <span>Form videos &amp; weekly volume structured</span>
            </div>
          </Card>
        </div>

        {/* ================= ANIMATED PROCESS TIMELINE ================= */}
        <div className="w-full max-w-2xl mt-8 bg-white/[0.04] backdrop-blur-md border border-emerald-500/20 rounded-3xl p-5 sm:p-7 text-left space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-gray-200">
                Live Preparation &amp; Review Pipeline
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-ping" />
              <span>Step {activeStepIndex} of 5 in progress</span>
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Step 1: Payment & Order */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-[#00e676] border border-[#00e676]/40 flex items-center justify-center shrink-0 font-black text-xs">
                <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 text-[#00e676]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Payment &amp; Intake Confirmed</h4>
                  <span className="text-[10px] font-bold text-[#00e676] uppercase">Complete</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Subscription verified &bull; Baseline metrics logged for {plan.customerName || "Member"}.
                </p>
              </div>
            </div>

            {/* Step 2: Caloric & Macro Calculation */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-[#00e676] border border-[#00e676]/40 flex items-center justify-center shrink-0 font-black text-xs">
                <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 text-[#00e676]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Caloric &amp; Macro Calibration</h4>
                  <span className="text-[10px] font-bold text-[#00e676] uppercase">Calculated</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Calibrated {plan.calorieTarget} kcal target &bull; {plan.proteinTargetGrams}g optimal protein distribution.
                </p>
              </div>
            </div>

            {/* Step 3: Nutritionist & Health Assessment Review */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-inner">
              <div className="w-7 h-7 rounded-xl bg-emerald-400 text-gray-950 flex items-center justify-center shrink-0 font-black text-xs">
                <FontAwesomeIcon icon={faUtensils} className="w-3.5 h-3.5 text-gray-950" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Nutritionist Tailoring Daily Meal Schedule</h4>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase animate-pulse">Under Review</span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Customizing breakfast, lunch, snacks, and dinner options with accessible Indian ingredients.
                </p>
                {plan.medicalSummary?.diseases && plan.medicalSummary.diseases.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {plan.medicalSummary.diseases.map((cond, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-emerald-200 border border-emerald-500/30">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Trainer Structuring Roadmap */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-gradient-to-r from-[#00e676]/15 to-transparent border border-[#00e676]/40 shadow-lg relative overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-[#00e676] text-gray-950 flex items-center justify-center shrink-0 font-black text-xs">
                <FontAwesomeIcon icon={faDumbbell} className="w-3.5 h-3.5 text-gray-950" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Trainer Structuring Customized Workout Roadmap</h4>
                  <span className="text-[10px] font-black text-[#00e676] uppercase tracking-wide animate-pulse">
                    Crafting Now
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                  Tailoring progressive overload volume, rest timers, and exercise splits for {plan.goalDisplay}.
                </p>
              </div>
            </div>

            {/* Step 5: Final Review & Admin Release */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 opacity-75">
              <div className="w-7 h-7 rounded-xl bg-white/10 text-gray-400 flex items-center justify-center shrink-0 font-black text-xs">
                <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-300">Admin Sign-Off &amp; Dashboard Push</h4>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Awaiting Sign-off</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  The moment your admin clicks &ldquo;Push Live&rdquo;, your full weekly roadmap unlocks here automatically!
                </p>
              </div>
            </div>
          </div>

          {/* Action Row: Refresh Status & WhatsApp */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={isRefreshing}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
            >
              <FontAwesomeIcon
                icon={faArrowsRotate}
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
              <span>{isRefreshing ? "Checking Live Plan Status..." : "Refresh Live Plan Status"}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-white font-bold text-xs border border-emerald-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4 text-[#25D366]" />
              <span>Ask Nutritionist &amp; Trainer</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              <span>Real-time listener active &bull; Last checked: {lastCheckedText}</span>
            </span>
          </div>
        </div>

        {/* Coach Admin Testing Switch (Convenience for Coach / Admin) */}
        <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md w-full text-center space-y-2">
          <p className="text-[11px] text-gray-400">
            Are you the Coach or Admin reviewing this subscriber?
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#00e676] font-black text-xs border border-[#00e676]/30 transition-all cursor-pointer"
          >
            <span>Open Coach Admin Portal</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
          </Link>
          <p className="text-[10px] text-gray-500">
            Click &ldquo;Approve &amp; Push Live&rdquo; in Admin to see this screen automatically transition into the live weekly plan.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-3 text-center text-gray-500 text-[10px] border-t border-emerald-900/40">
        <p>© {new Date().getFullYear()} BMYFIT Health Technologies India &bull; 256-Bit SSL Encrypted Transformation Portal</p>
      </footer>

      {/* Real-time In-App Coach Chat Widget */}
      <ClientChatWidget
        userId={plan.id}
        userName={plan.customerName || "Valued Subscriber"}
        planGoal={plan.goalDisplay}
        isOpenControlled={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </div>
  );
}
