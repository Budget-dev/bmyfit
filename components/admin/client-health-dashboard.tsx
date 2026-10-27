"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  BellRing,
  MessageCircle,
  Edit3,
  Sparkles,
  ShieldCheck,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import { calculateDetailedAdherence } from "@/features/plan/dashboard-data";

interface ClientHealthDashboardProps {
  users: AdminUserRecord[];
  onOpenChat: (user: AdminUserRecord) => void;
  onOpenStudio: (user: AdminUserRecord) => void;
  onOpenBiometrics: (user: AdminUserRecord) => void;
  onSendAlert: (user: AdminUserRecord) => void;
}

export function ClientHealthDashboard({
  users,
  onOpenChat,
  onOpenStudio,
  onOpenBiometrics,
  onSendAlert,
}: ClientHealthDashboardProps) {
  // Analyze all clients and calculate adherence
  const analyzedUsers = users.map((u) => {
    const adherence = calculateDetailedAdherence(u.plan, u.taskLogs);
    return {
      user: u,
      adherence,
      isDoingGood: adherence.percent >= 65,
      isModerate: adherence.percent >= 40 && adherence.percent < 65,
      isFallingBehind: adherence.percent < 40,
      hasMedical: Boolean(u.medicalAssessment?.hasDisease),
    };
  });

  const totalClients = users.length;
  const doingGoodClients = analyzedUsers.filter((a) => a.isDoingGood);
  const fallingBehindClients = analyzedUsers.filter((a) => a.isFallingBehind);
  const medicalClients = analyzedUsers.filter((a) => a.hasMedical);

  const doingGoodPercentage = totalClients > 0 ? Math.round((doingGoodClients.length / totalClients) * 100) : 0;
  const fallingBehindPercentage = totalClients > 0 ? Math.round((fallingBehindClients.length / totalClients) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ================= EXECUTIVE SUMMARY HERO KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users Under Coaching */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
              Enrolled Users
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-950">{totalClients}</span>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                Active Pool
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Clients in transformation funnel
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2: Doing Good (High Adherence >= 65%) */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent bg-white rounded-3xl p-5 border border-emerald-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
              <span>Doing Good (On Track)</span>
              <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-950">{doingGoodClients.length}</span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {doingGoodPercentage}% of Total
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
              Scoring high meal &amp; workout compliance
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#00c853] text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Needs Attention / Falling Behind (< 40%) */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent bg-white rounded-3xl p-5 border border-rose-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 block flex items-center gap-1">
              <span>Needs Coach Nudge</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-rose-950">{fallingBehindClients.length}</span>
              <span className="text-xs font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                {fallingBehindPercentage}% At Risk
              </span>
            </div>
            <span className="text-[11px] text-rose-700 font-medium mt-1 block">
              Missed logs or low compliance
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 4: Clinical / Medical Watchlist */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
              Medical Watchlist
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-950">{medicalClients.length}</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                🩺 Monitored
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Joint, spine, or blood test reports
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: URGENT COACH ACTION (FALLING BEHIND CLIENTS) ================= */}
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              🚨
            </div>
            <div>
              <h2 className="text-base font-black text-gray-950 tracking-tight flex items-center gap-2">
                <span>At Risk / Low Adherence Clients</span>
                <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                  Alert Recommended
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                These clients have missed multiple daily logs or have low compliance. Send them a WhatsApp nudge to get back on track.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-700 font-mono">
            {fallingBehindClients.length} Client(s) Need Follow-up
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fallingBehindClients.map(({ user, adherence }) => (
            <div
              key={user.id}
              className="bg-rose-50/40 rounded-2xl p-4 border border-rose-200/80 flex flex-col justify-between space-y-3 hover:bg-rose-50/70 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-rose-300">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rose-700 text-white font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-xs">{user.name}</h3>
                    <p className="text-[11px] text-gray-500">{user.goalDisplay}</p>
                    <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
                      Target: {user.biometrics.targetWeightKg}kg (Current: {user.biometrics.weightKg}kg)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-rose-700 block font-mono">{adherence.percent}%</span>
                  <span className="text-[9px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                    Low Adh.
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-rose-200/70 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.max(8, adherence.percent)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{adherence.completedMeals} meals logged</span>
                  <span>{adherence.completedWorkouts} workouts done</span>
                </div>
              </div>

              {/* Quick Alert Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSendAlert(user)}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Send Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChat(user)}
                  className="py-2 px-3 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1"
                  title="Open WhatsApp Chat"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))}

          {fallingBehindClients.length === 0 && (
            <div className="col-span-full py-8 text-center text-emerald-800 text-xs font-bold bg-emerald-50 rounded-2xl">
              🎉 Excellent! No clients are falling behind right now. All clients are keeping up with their logs.
            </div>
          )}
        </div>
      </div>

      {/* ================= SECTION 2: TOP PERFORMERS (DOING GREAT >= 65%) ================= */}
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              🔥
            </div>
            <div>
              <h2 className="text-base font-black text-gray-950 tracking-tight flex items-center gap-2">
                <span>Top Performers &bull; Doing Great</span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                  High Compliance
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Clients strictly adhering to their macro calories, progressive overload workouts, and daily habits.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 font-mono">
            {doingGoodClients.length} Champions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doingGoodClients.map(({ user, adherence }) => (
            <div
              key={user.id}
              className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/70 flex flex-col justify-between space-y-3 hover:bg-emerald-50/70 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-[#00c853]">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-700 text-white font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-xs">{user.name}</h3>
                    <p className="text-[11px] text-gray-500">{user.goalDisplay}</p>
                    <span className="text-[10px] text-emerald-700 font-black block mt-0.5">
                      {user.order?.packageTitle || "₹99 Custom Plan"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 block font-mono">{adherence.percent}%</span>
                  <span className="text-[9px] uppercase font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    ON TRACK
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-emerald-200/70 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00c853] h-full rounded-full" style={{ width: `${adherence.percent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                  <span>{adherence.completedMeals} meals completed</span>
                  <span>{adherence.completedWorkouts} workouts done</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSendAlert(user)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  title="Send Praise & Celebration Alert"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Praise</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStudio(user)}
                  className="py-2 px-3 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Progression</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SECTION 3: CLINICAL HEALTH & MEDICAL WATCHLIST ================= */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              🩺
            </div>
            <div>
              <h2 className="text-base font-black text-gray-950 tracking-tight flex items-center gap-2">
                <span>Clinical Health &amp; Joint Constraints Watchlist</span>
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                  Safety First
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Clients who submitted medical questionnaires or MRI/blood reports requiring customized exercise swaps.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500 font-mono">
            {medicalClients.length} Profile(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicalClients.map(({ user }) => (
            <div
              key={user.id}
              className="bg-amber-50/30 rounded-2xl p-4 border border-amber-200/80 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-amber-300">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-700 text-white font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-xs">{user.name}</h3>
                    <p className="text-[11px] text-gray-500">{user.email} &bull; {user.phone}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenBiometrics(user)}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition"
                >
                  Dossier ↗
                </button>
              </div>

              {/* Reported Diseases */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Reported Conditions:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.medicalAssessment?.diseases.map((d, i) => (
                    <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 shadow-2xs">
                      🩺 {d}
                    </span>
                  ))}
                  {Boolean(user.medicalAssessment?.documents.length) && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      📎 {user.medicalAssessment?.documents.length} Lab Report(s)
                    </span>
                  )}
                </div>
                {user.medicalAssessment?.customDiseaseDescription && (
                  <p className="text-[11px] text-gray-600 bg-white/70 p-2 rounded-xl border border-amber-200/60 mt-1 italic">
                    &ldquo;{user.medicalAssessment.customDiseaseDescription}&rdquo;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSendAlert(user)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Send Safety Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChat(user)}
                  className="py-1.5 px-3 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

