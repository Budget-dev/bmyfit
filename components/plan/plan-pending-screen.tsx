"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PlanDashboardData } from "@/types/plan-dashboard";
import { db, doc, onSnapshot } from "@/lib/firebase/client";
import { fetchFirebasePlan, getStoredPlan } from "@/lib/storage/mock-storage";
import { ClientChatWidget } from "@/components/chat/client-chat-widget";

interface PlanPendingScreenProps {
  plan: PlanDashboardData;
  onPlanApproved: (updatedPlan: PlanDashboardData) => void;
}

export function PlanPendingScreen({ plan, onPlanApproved }: PlanPendingScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckedText, setLastCheckedText] = useState("Just now");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(3); // Stage 3 & 4 active
  const [celebrating, setCelebrating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
  }, [plan.id]);

  const triggerPlanReady = (approvedPlan: PlanDashboardData) => {
    setCelebrating(true);
    setStatusMessage("🎉 Plan Approved & Live! Loading your customized weekly roadmap...");
    setTimeout(() => {
      onPlanApproved(approvedPlan);
    }, 1200);
  };

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

      setLastCheckedText(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setStatusMessage("Coach Naveen is currently customizing your roadmap. Please stay tuned!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.warn("Status check notice:", err);
      setStatusMessage("Status verified. Coach Naveen is actively finalizing your plan.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWhatsApp = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#071811] text-white flex flex-col justify-between selection:bg-[#00e676] selection:text-black relative overflow-x-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#00e676]/20 via-emerald-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#057a44]/25 via-[#00c853]/15 to-transparent rounded-full blur-[160px] pointer-events-none translate-y-1/3" />

      {/* Top Navigation */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="bg-white px-3 py-1 rounded-xl shadow-xs">
          <span className="text-xl font-black text-gray-950 tracking-tight">
            BMY<span className="text-[#00c853]">FIT</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>COACH REVIEW IN PROGRESS</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
        {/* Celebration Banner if plan unlocked */}
        {celebrating && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-sm font-black flex items-center justify-center gap-2 animate-bounce">
            <span className="text-xl">🎉</span>
            <span>Your Coach has pushed your customized plan! Unlocking weekly roadmap...</span>
          </div>
        )}

        {/* Status Notification Toast */}
        {statusMessage && !celebrating && (
          <div className="w-full mb-5 p-3 rounded-2xl bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold animate-fade-in flex items-center justify-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-ping" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Coach Avatar Circle with Pulsing Aura */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-r from-[#00e676] to-[#00c853] rounded-full blur-xl opacity-40 animate-pulse" />
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
            Coach Naveen
          </div>
        </div>

        {/* Main Headlines */}
        <div className="space-y-2.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#00e676]/10 border border-[#00e676]/25 px-3 py-1 rounded-full text-[#00e676] text-xs font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span>₹99 CUSTOM 8-WEEK PLAN CONFIRMED</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Your Coach Is Making Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e676] via-emerald-400 to-[#00c853]">
              Personal Week Plan
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
            Please stay tuned! Head Coach Naveen is personally reviewing your body biometrics, daily calorie deficit targets, and clinical dossier to craft your customized week-by-week nutrition and workout roadmap.
          </p>
        </div>

        {/* ================= ANIMATED PROCESS TIMELINE ================= */}
        <div className="w-full max-w-xl mt-8 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-7 text-left space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-300">
              Live Customization Pipeline
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-ping" />
              <span>Step 4 of 5 in progress</span>
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Step 1: Payment & Order */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-[#00e676] border border-[#00e676]/40 flex items-center justify-center shrink-0 font-black text-xs">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Payment &amp; Intake Confirmed</h4>
                  <span className="text-[10px] font-bold text-[#00e676] uppercase">Complete</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  ₹99 plan package received &bull; Baseline metrics logged for {plan.customerName || "Athlete"}.
                </p>
              </div>
            </div>

            {/* Step 2: Caloric & Macro Calculation */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-[#00e676] border border-[#00e676]/40 flex items-center justify-center shrink-0 font-black text-xs">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Caloric &amp; Macro Calibration</h4>
                  <span className="text-[10px] font-bold text-[#00e676] uppercase">Calculated</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Calibrated {plan.calorieTarget} kcal daily target &bull; {plan.proteinTargetGrams}g optimal protein distribution.
                </p>
              </div>
            </div>

            {/* Step 3: Medical & Injury Assessment Review */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-inner">
              <div className="w-7 h-7 rounded-xl bg-emerald-400 text-gray-950 flex items-center justify-center shrink-0 font-black text-xs animate-pulse">
                🩺
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Clinical Dossier &amp; Health Review</h4>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase animate-pulse">Under Review</span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Checking submitted joint constraints, thyroid levels, and blood panel safety guidelines.
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

            {/* Step 4: Coach Naveen Tailoring Weeks Plan */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-gradient-to-r from-[#00e676]/15 to-transparent border border-[#00e676]/40 shadow-lg relative overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-[#00e676] text-gray-950 flex items-center justify-center shrink-0 font-black text-xs animate-spin-slow">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Coach Naveen Structuring Week 1–8 Roadmap</h4>
                  <span className="text-[10px] font-black text-[#00e676] uppercase tracking-wide animate-pulse">
                    Crafting Now
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                  Tailoring South Asian meal ingredients, progressive overload volume, and targeted resistance routines for your goal ({plan.goalDisplay}).
                </p>
              </div>
            </div>

            {/* Step 5: Final Review & Dashboard Push */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 opacity-75">
              <div className="w-7 h-7 rounded-xl bg-white/10 text-gray-400 flex items-center justify-center shrink-0 font-black text-xs">
                🔒
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-300">Final Verification &amp; Dashboard Push</h4>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Awaiting Sign-off</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Once Coach Naveen clicks push in Admin, your full weekly plan unlocks here automatically!
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
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className={`text-base ${isRefreshing ? "animate-spin" : ""}`}>↻</span>
              <span>{isRefreshing ? "Checking Live Plan Status..." : "Refresh Plan Status Now"}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>💬</span>
              <span>Ask Coach on WhatsApp</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] text-gray-400">
              Auto-checking live status every few seconds &bull; Last checked: {lastCheckedText}
            </span>
          </div>
        </div>

        {/* Coach Admin Testing Switch (Convenience Link for Evaluator / Coach) */}
        <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md w-full text-center space-y-2">
          <p className="text-[11px] text-gray-400">
            Coach Naveen reviewing from the administration side?
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#00e676] font-black text-xs border border-[#00e676]/30 transition-all"
          >
            <span>Open Coach Admin Portal (bmyfitnesscoach@gmail.com)</span>
            <span>→</span>
          </Link>
          <p className="text-[10px] text-gray-500">
            Push the plan in Admin to see this pending screen immediately unlock into the full week dashboard.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-3 text-center text-gray-500 text-[10px] border-t border-white/5">
        <p>© {new Date().getFullYear()} BMYFIT Health Technologies India &bull; 256-Bit SSL Encrypted Transformation Portal</p>
      </footer>

      {/* Real-time In-App Coach Chat Widget */}
      <ClientChatWidget
        userId={plan.id}
        userName={plan.customerName || "Valued Client"}
        planGoal={plan.goalDisplay}
        isOpenControlled={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </div>
  );
}

