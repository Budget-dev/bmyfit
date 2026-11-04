"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Search,
  MessageCircle,
  Edit3,
  Activity,
  Eye,
  Layers,
  ArrowRight,
  BellRing,
  Sparkles,
  Zap,
  Trash2,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import { calculateDetailedAdherence } from "@/features/plan/dashboard-data";

interface ClientHealthDashboardProps {
  users: AdminUserRecord[];
  onOpenChat: (user: AdminUserRecord) => void;
  onOpenStudio: (user: AdminUserRecord) => void;
  onOpenBiometrics: (user: AdminUserRecord) => void;
  onSendAlert: (user: AdminUserRecord) => void;
  onPromoteToPaid?: (user: AdminUserRecord) => void;
  onDeleteUser?: (user: AdminUserRecord) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

type FilterTab = "all" | "attention" | "on_track" | "medical" | "free_leads";
type ViewMode = "table" | "cards";

function SafeClientAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const [imageError, setImageError] = useState(false);
  const initial = (name || "U").charAt(0).toUpperCase();

  if (!avatar || imageError) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 border border-emerald-600 shadow-2xs">
        {initial}
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-2xs">
      <img
        src={avatar}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export function ClientHealthDashboard({
  users,
  onOpenChat,
  onOpenStudio,
  onOpenBiometrics,
  onSendAlert,
  onPromoteToPaid,
  onDeleteUser,
  onRefresh,
  isSyncing = false,
}: ClientHealthDashboardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Analyze all clients and calculate adherence
  const analyzedUsers = useMemo(() => {
    return users.map((u) => {
      const adherence = calculateDetailedAdherence(u.plan, u.taskLogs);
      const isDoingGood = adherence.percent >= 60;
      const isModerate = adherence.percent >= 30 && adherence.percent < 60;
      const isFallingBehind = adherence.percent < 30;
      const hasMedical = Boolean(
        u.medicalAssessment?.hasDisease ||
        (u.biometrics?.medicalConditions && u.biometrics.medicalConditions.trim().length > 0)
      );
      const isFreeLead = u.membershipCategory === "free";

      return {
        user: u,
        adherence,
        isDoingGood,
        isModerate,
        isFallingBehind,
        hasMedical,
        isFreeLead,
      };
    });
  }, [users]);

  const totalClients = users.length;
  const onTrackClients = useMemo(() => analyzedUsers.filter((a) => a.isDoingGood), [analyzedUsers]);
  const needsAttentionClients = useMemo(() => analyzedUsers.filter((a) => a.isFallingBehind), [analyzedUsers]);
  const medicalClients = useMemo(() => analyzedUsers.filter((a) => a.hasMedical), [analyzedUsers]);
  const freeLeadClients = useMemo(() => analyzedUsers.filter((a) => a.isFreeLead), [analyzedUsers]);

  const onTrackPercent = totalClients > 0 ? Math.round((onTrackClients.length / totalClients) * 100) : 0;
  const attentionPercent = totalClients > 0 ? Math.round((needsAttentionClients.length / totalClients) * 100) : 0;

  // Filter clients based on tab and search query
  const filteredClients = useMemo(() => {
    return analyzedUsers.filter((item) => {
      // 1. Tab filter
      if (activeFilter === "on_track" && !item.isDoingGood) return false;
      if (activeFilter === "attention" && !item.isFallingBehind) return false;
      if (activeFilter === "medical" && !item.hasMedical) return false;
      if (activeFilter === "free_leads" && !item.isFreeLead) return false;

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const u = item.user;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.city || "").toLowerCase().includes(q) ||
        (u.goalDisplay || "").toLowerCase().includes(q) ||
        (u.biometrics?.medicalConditions || "").toLowerCase().includes(q)
      );
    });
  }, [analyzedUsers, activeFilter, searchQuery]);

  const handleOpenWhatsApp = (u: AdminUserRecord) => {
    const rawNum = u.phone?.replace(/[^0-9]/g, "") || "919800000000";
    const phone = rawNum.startsWith("91") ? rawNum : `91${rawNum}`;
    const clientName = u.name || "Client";
    const goal = u.goalDisplay || "Fitness Transformation";
    const msg = encodeURIComponent(
      `Hello ${clientName}! Coach Naveen here from BMYFIT. I am reviewing your ${goal} dashboard. Let's make sure today's meals and workout are locked in!`
    );
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TOP HEADER BAR WITH ACTION BUTTONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-pulse" />
            <h2 className="text-lg font-black text-gray-950 tracking-tight">Status &amp; Client Adherence Intelligence</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time compliance monitoring across ₹99 purchased members and intake assessment leads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Auto-Sync Active</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isSyncing}
              title="Manual refresh fallback"
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 border border-gray-200 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-emerald-600" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Refresh"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= KPI METRIC CARDS (SHADCN STYLE) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled Clients */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:border-gray-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total Client Pool
            </span>
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-gray-950">{totalClients}</span>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              Live DB
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5">
            <span className="font-bold text-emerald-700">{users.filter((u) => u.membershipCategory === "purchased").length} Paid ₹99</span>
            <span>•</span>
            <span className="font-bold text-gray-600">{freeLeadClients.length} Free Leads</span>
          </p>
        </div>

        {/* Card 2: High Adherence (On Track >= 60%) */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              On Track (Good)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-950">{onTrackClients.length}</span>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {onTrackPercent}% Total
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1.5">
            Regularly logging meals and completing workout days
          </p>
        </div>

        {/* Card 3: Needs Attention (< 30%) */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Needs Follow-Up
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-950">{needsAttentionClients.length}</span>
            <span className="text-xs font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              {attentionPercent}% Review
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1.5">
            Free intake leads or clients needing adherence nudges
          </p>
        </div>

        {/* Card 4: Clinical Watchlist */}
        <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              Medical Watchlist
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-950">{medicalClients.length}</span>
            <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full">
              Monitored
            </span>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1.5">
            Joint pain, hypertension, diabetes, or consultation notes
          </p>
        </div>
      </div>

      {/* ================= CONTROLS & FILTER BAR ================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>All Clients</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {totalClients}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("attention")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === "attention"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <span>Needs Attention</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === "attention" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-800"
            }`}>
              {needsAttentionClients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("on_track")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === "on_track"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <span>On Track</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === "on_track" ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"
            }`}>
              {onTrackClients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("medical")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === "medical"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-800 hover:bg-blue-50"
            }`}
          >
            <span>Medical Watchlist</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === "medical" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"
            }`}>
              {medicalClients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("free_leads")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === "free_leads"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-800 hover:bg-purple-50"
            }`}
          >
            <span>Free Leads</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === "free_leads" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-800"
            }`}>
              {freeLeadClients.length}
            </span>
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "table" ? "bg-white text-gray-950 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Card Grid View"
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "cards" ? "bg-white text-gray-950 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filteredClients.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center text-xl">
            🔍
          </div>
          <h3 className="text-sm font-bold text-gray-900">No clients match your filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or switch tabs to view other client segments.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFilter("all");
              setSearchQuery("");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ================= VIEW MODE 1: HIGH-DENSITY CRM TABLE ================= */}
      {filteredClients.length > 0 && viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Client Profile</th>
                  <th className="py-3 px-4">Membership</th>
                  <th className="py-3 px-4">Weight Trajectory</th>
                  <th className="py-3 px-4">Adherence &amp; Tasks</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">Coach Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredClients.map(({ user, adherence, isDoingGood, isFallingBehind, hasMedical }) => {
                  const currentKg = user.biometrics?.weightKg || 75;
                  const targetKg = user.biometrics?.targetWeightKg || 70;
                  const deltaKg = Math.round((currentKg - targetKg) * 10) / 10;
                  const isPurchased = user.membershipCategory === "purchased";

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition">
                      {/* 1. Client Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <SafeClientAvatar name={user.name} avatar={user.avatar} />
                          <div>
                            <div className="font-bold text-gray-950 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.needsPlanReview && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" title="Awaiting Plan Review" />
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">{user.email}</div>
                            {user.city ? <div className="text-[10px] text-gray-400">{user.city}</div> : null}
                          </div>
                        </div>
                      </td>

                      {/* 2. Membership */}
                      <td className="py-3 px-4">
                        {isPurchased ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>₹99 Plan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                            <span>Free Lead</span>
                          </span>
                        )}
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {user.goalDisplay || "Fat Loss"}
                        </div>
                      </td>

                      {/* 3. Weight Trajectory */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-gray-900 flex items-center gap-1">
                          <span>{currentKg}kg</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="text-emerald-700">{targetKg}kg</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {deltaKg > 0 ? `-${deltaKg}kg to goal` : "At target"} • BMI {user.biometrics?.bmi || 24.2}
                        </div>
                      </td>

                      {/* 4. Adherence & Tasks */}
                      <td className="py-3 px-4">
                        <div className="w-40 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-700">{adherence.percent}%</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isDoingGood
                                ? "bg-emerald-100 text-emerald-800"
                                : isFallingBehind
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {isDoingGood ? "On Track" : isFallingBehind ? "Low Adherence" : "Moderate"}
                            </span>
                          </div>

                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDoingGood
                                  ? "bg-emerald-500"
                                  : isFallingBehind
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.max(6, adherence.percent)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span>{adherence.nutrition.completed}/{adherence.nutrition.total} meals</span>
                            <span>{adherence.workouts.completed}/{adherence.workouts.total} workouts</span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Health Status */}
                      <td className="py-3 px-4">
                        {hasMedical ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{user.biometrics?.medicalConditions || user.medicalAssessment?.diseases?.join(", ") || "Monitored"}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400">Normal Profile</span>
                        )}
                      </td>

                      {/* 6. Coach Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(user)}
                            title="Chat on WhatsApp"
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* In-App Chat */}
                          <button
                            type="button"
                            onClick={() => onOpenChat(user)}
                            title="Open In-App Thread"
                            className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Biometrics */}
                          <button
                            type="button"
                            onClick={() => onOpenBiometrics(user)}
                            title="View Health Profile & Biometrics"
                            className="p-1.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Plan Studio */}
                          <button
                            type="button"
                            onClick={() => onOpenStudio(user)}
                            title="Edit / Customize Week Plan"
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200/80 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                            <span>Plan</span>
                          </button>

                          {/* ⚡ Promote to Paid (for Free Leads) */}
                          {user.membershipCategory === "free" && !user.isPaid && onPromoteToPaid && (
                            <button
                              type="button"
                              onClick={() => onPromoteToPaid(user)}
                              title="Promote this free user to Paid Customer (₹99)"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-black text-amber-950 bg-amber-400 hover:bg-amber-500 border border-amber-500/50 shadow-xs transition inline-flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                            >
                              <Zap className="w-3 h-3 text-amber-900 fill-amber-900" />
                              <span>Promote</span>
                            </button>
                          )}

                          {/* Push Alert */}
                          <button
                            type="button"
                            onClick={() => onSendAlert(user)}
                            title="Send Push Alert"
                            className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          {onDeleteUser && (
                            <button
                              type="button"
                              onClick={() => onDeleteUser(user)}
                              title={`Delete ${user.name}'s account`}
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW MODE 2: CARD GRID ================= */}
      {filteredClients.length > 0 && viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(({ user, adherence, isDoingGood, isFallingBehind, hasMedical }) => {
            const currentKg = user.biometrics?.weightKg || 75;
            const targetKg = user.biometrics?.targetWeightKg || 70;
            const deltaKg = Math.round((currentKg - targetKg) * 10) / 10;
            const isPurchased = user.membershipCategory === "purchased";

            return (
              <div
                key={user.id}
                className={`bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4 ${
                  isDoingGood
                    ? "border-emerald-200/80 hover:border-emerald-300"
                    : isFallingBehind
                    ? "border-amber-200/80 hover:border-amber-300"
                    : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <SafeClientAvatar name={user.name} avatar={user.avatar} />
                    <div>
                      <h3 className="font-bold text-gray-950 text-xs flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isPurchased && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                            ₹99 Plan
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-gray-500">{user.goalDisplay || "Transformation"}</p>
                      {user.city ? <p className="text-[10px] text-gray-400">{user.city}</p> : null}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-gray-900 block font-mono">
                      {adherence.percent}%
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      isDoingGood
                        ? "bg-emerald-100 text-emerald-800"
                        : isFallingBehind
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {isDoingGood ? "On Track" : isFallingBehind ? "Needs Nudge" : "Moderate"}
                    </span>
                  </div>
                </div>

                {/* Weight Trajectory & Medical Info */}
                <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Trajectory:</span>
                    <span className="font-mono font-bold text-gray-900 flex items-center gap-1">
                      <span>{currentKg}kg</span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span className="text-emerald-700">{targetKg}kg</span>
                      <span className="text-[10px] text-gray-500">({deltaKg > 0 ? `-${deltaKg}kg` : "goal"})</span>
                    </span>
                  </div>

                  {hasMedical && (
                    <div className="text-[10px] font-medium text-blue-700 flex items-center gap-1 pt-0.5 border-t border-gray-200/50">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {user.biometrics?.medicalConditions || user.medicalAssessment?.diseases?.join(", ") || "Monitored Condition"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Adherence Progress */}
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isDoingGood ? "bg-emerald-500" : isFallingBehind ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.max(6, adherence.percent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{adherence.nutrition.completed}/{adherence.nutrition.total} meals</span>
                    <span>{adherence.workouts.completed}/{adherence.workouts.total} workouts</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(user)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenStudio(user)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>

                  {user.membershipCategory === "free" && !user.isPaid && onPromoteToPaid && (
                    <button
                      type="button"
                      onClick={() => onPromoteToPaid(user)}
                      title="Promote to Paid Customer (₹99)"
                      className="py-1.5 px-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500/50 shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
                      <span>Promote</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenChat(user)}
                    title="Direct In-App Chat"
                    className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-gray-700" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenBiometrics(user)}
                    title="View Full Biometrics"
                    className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {onDeleteUser && (
                    <button
                      type="button"
                      onClick={() => onDeleteUser(user)}
                      title={`Delete ${user.name}'s account`}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
