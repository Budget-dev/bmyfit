"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  ExternalLink,
  Edit3,
  Clock,
  CheckCircle2,
  Rocket,
  CreditCard,
  Eye,
  Monitor,
  Activity,
  BarChart2,
  MessageCircle,
  BellRing,
} from "@/components/ui/icons";
import type { AdminUserRecord, AdminStats, MembershipCategory } from "@/types/admin";
import type { PlanDashboardData } from "@/types/plan-dashboard";
import { getStoredAdminUsers } from "@/lib/storage/mock-storage";
import { formatPlanDuration, calculateDetailedAdherence } from "@/features/plan/dashboard-data";
import { BiometricsModal } from "./biometrics-modal";
import { PushModal } from "./push-modal";
import { WeekPlanEditor } from "./week-plan-editor";
import { AdminChatView } from "./admin-chat-view";
import { ClientHealthDashboard } from "./client-health-dashboard";
import { SubscriptionsDashboard } from "./subscriptions-dashboard";
import { AlertDispatchModal } from "./alert-dispatch-modal";

export function AdminDesktopConsole() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "directory" | "subscriptions" | "studio" | "dispatch" | "chats"
  >("overview");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | MembershipCategory | "pending" | "medical"
  >("all");
  const [goalFilter] = useState<string>("all");
  const [adherenceFilter, setAdherenceFilter] = useState<"all" | "high" | "low">("all");
  const [studioInitialMode, setStudioInitialMode] = useState<"customize" | "progress">("customize");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  // Modals state
  const [inspectUser, setInspectUser] = useState<AdminUserRecord | null>(null);
  const [pushUser, setPushUser] = useState<AdminUserRecord | null>(null);
  const [alertUser, setAlertUser] = useState<AdminUserRecord | null>(null);
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let serverUsers: AdminUserRecord[] = [];
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          if (data.users) serverUsers = data.users;
        }
      } catch (e) {
        console.warn("Could not fetch server admin users, using local cache", e);
      }

      // Merge with Firebase-synced users so newly paid clients appear instantly
      const localUsers = getStoredAdminUsers();
      const userMap = new Map<string, AdminUserRecord>();

      serverUsers.forEach((u) => userMap.set(u.id, u));
      localUsers.forEach((lu) => {
        const existing = userMap.get(lu.id);
        if (existing) {
          userMap.set(lu.id, {
            ...existing,
            ...lu,
            plan: lu.plan || existing.plan,
            medicalAssessment: lu.medicalAssessment || existing.medicalAssessment,
            needsPlanReview: lu.needsPlanReview ?? existing.needsPlanReview,
          });
        } else {
          userMap.set(lu.id, lu);
        }
      });

      const mergedUsers = Array.from(userMap.values());
      setUsers(mergedUsers);

      // Recompute stats
      const totalUsers = mergedUsers.length;
      const purchasedPlansCount = mergedUsers.filter((u) => u.membershipCategory === "purchased").length;
      const activeMembershipsCount = mergedUsers.filter((u) => u.membershipCategory === "membership").length;
      const freeMembersCount = mergedUsers.filter((u) => u.membershipCategory === "free").length;
      const pendingReviewCount = mergedUsers.filter(
        (u) => u.plan.status === "pending_review" || u.needsPlanReview
      ).length;
      const liveApprovedCount = mergedUsers.filter((u) => u.plan.status === "approved").length;
      const totalRevenueINR = mergedUsers.reduce(
        (sum, u) => sum + (u.order ? Math.round(u.order.amountPaise / 100) : 0),
        0
      );

      setStats({
        totalUsers,
        purchasedPlansCount,
        activeMembershipsCount,
        freeMembersCount,
        pendingReviewCount,
        approvedCount: liveApprovedCount,
        liveApprovedCount,
        totalRevenueINR,
      });

      setSelectedUser((prev) => {
        if (!prev && mergedUsers.length > 0) return mergedUsers[0];
        if (prev) {
          const updated = mergedUsers.find((u) => u.id === prev.id);
          if (updated) return updated;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to load admin users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.goalDisplay.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.medicalAssessment?.diseases || []).some((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter === "pending"
        ? u.plan.status === "pending_review" || u.needsPlanReview
        : categoryFilter === "medical"
        ? Boolean(u.medicalAssessment?.hasDisease || (u.medicalAssessment?.documents?.length || 0) > 0)
        : u.membershipCategory === categoryFilter;

    const matchesGoal = goalFilter === "all" ? true : u.goal === goalFilter;

    const userAdherence = calculateDetailedAdherence(u.plan, u.taskLogs);
    const matchesAdherence =
      adherenceFilter === "all"
        ? true
        : adherenceFilter === "high"
        ? userAdherence.percent >= 70
        : userAdherence.percent < 70;

    return matchesSearch && matchesCategory && matchesGoal && matchesAdherence;
  });

  const handleSavePlan = async (updatedPlan: PlanDashboardData) => {
    try {
      const res = await fetch(`/api/admin/plans/${updatedPlan.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === updatedPlan.id ? { ...u, plan: updatedPlan } : u
          )
        );
        if (selectedUser && selectedUser.id === updatedPlan.id) {
          setSelectedUser({ ...selectedUser, plan: updatedPlan });
        }
        setGlobalAlert(`Plan changes saved for ${updatedPlan.customerName}!`);
        setTimeout(() => setGlobalAlert(null), 3500);
      }
    } catch (err) {
      console.error("Save plan error:", err);
      throw err;
    }
  };

  const handlePushSuccess = (updatedUser: AdminUserRecord) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (selectedUser && selectedUser.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
    setGlobalAlert(`Plan for ${updatedUser.name} pushed live to client dashboard!`);
    setTimeout(() => setGlobalAlert(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Viewport Indicator Banner */}
      <div className="bg-gray-950 text-gray-300 px-4 py-2 text-xs flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-gray-200">
            BMYFIT Coach Desktop Console (v2.6)
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">
            Desktop-First Optimization: High-density biometrics review & week plan editor
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server Live</span>
          </span>
          <Link
            href="/plan/user_purchased_01"
            target="_blank"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>Client Dashboard Preview</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Global Alert Notification */}
      {globalAlert && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{globalAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalAlert(null)}
            className="text-emerald-100 hover:text-white underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Desktop Container with Left Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= DESKTOP LEFT SIDEBAR ================= */}
        <aside className="w-64 bg-white border-r border-gray-200/80 flex flex-col justify-between p-5 space-y-6 flex-shrink-0 shadow-xs">
          <div className="space-y-6">
            {/* Brand Logo */}
            <Link href="/" className="flex flex-col group">
              <span className="text-2xl font-black tracking-tight text-gray-950">
                BMY<span className="text-[#00e676]">FIT</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                COACH ADMIN PANEL
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5">
              {/* Tab 1: Status & Health Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "overview"
                    ? "bg-[#032e1c] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#00e676]" />
                  <span>Status &amp; Health</span>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    activeTab === "overview"
                      ? "bg-emerald-500/30 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  LIVE
                </span>
              </button>

              {/* Tab 2: Subscriptions Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab("subscriptions")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "subscriptions"
                    ? "bg-[#032e1c] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Subscriptions</span>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    activeTab === "subscriptions"
                      ? "bg-emerald-500/30 text-white"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  ₹99 Active
                </span>
              </button>

              {/* Tab 3: Users Directory */}
              <button
                type="button"
                onClick={() => setActiveTab("directory")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "directory"
                    ? "bg-[#032e1c] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Users Directory</span>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === "directory"
                      ? "bg-emerald-500/30 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {users.length}
                </span>
              </button>

              {/* Tab 4: Week Plan Studio */}
              <button
                type="button"
                onClick={() => {
                  if (selectedUser) setActiveTab("studio");
                  else setActiveTab("directory");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "studio"
                    ? "bg-[#032e1c] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Week Plan Studio</span>
                </div>
                {selectedUser && (
                  <span className="text-[10px] font-bold text-gray-400 truncate max-w-[70px]">
                    {selectedUser.name.split(" ")[0]}
                  </span>
                )}
              </button>

              {/* Tab 5: Push & Dispatch */}
              <button
                type="button"
                onClick={() => setActiveTab("dispatch")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "dispatch"
                    ? "bg-[#032e1c] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Rocket className="w-4 h-4" />
                  <span>Push &amp; Dispatch</span>
                </div>
                {stats && stats.pendingReviewCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                    {stats.pendingReviewCount}
                  </span>
                )}
              </button>

              {/* Tab 6: WhatsApp Chats */}
              <button
                type="button"
                onClick={() => setActiveTab("chats")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "chats"
                    ? "bg-[#075E54] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Chats</span>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    activeTab === "chats"
                      ? "bg-emerald-400 text-gray-950"
                      : "bg-[#25D366]/20 text-[#075E54]"
                  }`}
                >
                  LIVE
                </span>
              </button>
            </nav>

            {/* Quick Segment Filter Shortcuts */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block px-1">
                Segmented Lists
              </span>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("directory");
                    setCategoryFilter("purchased");
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium ${
                    categoryFilter === "purchased"
                      ? "bg-emerald-100 font-bold text-emerald-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>Purchased Clients</span>
                  <span className="text-[11px] font-bold">
                    {stats?.purchasedPlansCount || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("directory");
                    setCategoryFilter("membership");
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium ${
                    categoryFilter === "membership"
                      ? "bg-purple-100 font-bold text-purple-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>Active Memberships</span>
                  <span className="text-[11px] font-bold">
                    {stats?.activeMembershipsCount || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("directory");
                    setCategoryFilter("free");
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium ${
                    categoryFilter === "free"
                      ? "bg-gray-200 font-bold text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>Free Members (Leads)</span>
                  <span className="text-[11px] font-bold">{stats?.freeMembersCount || 0}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("directory");
                    setCategoryFilter("pending");
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium ${
                    categoryFilter === "pending"
                      ? "bg-amber-100 font-bold text-amber-900"
                      : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  <span>Needs Coach Push</span>
                  <span className="text-[11px] font-black text-amber-700">
                    {stats?.pendingReviewCount || 0}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Coach Profile Card Bottom */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 shadow-sm bg-surface-900">
                <img
                  src="/images/coach-naveen.jpg"
                  alt="Coach Naveen"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="block font-black text-xs text-gray-900 truncate">
                  Coach Naveen
                </span>
                <span className="block text-[10px] text-emerald-700 font-semibold truncate">bmyfitnesscoach@gmail.com</span>
              </div>
            </div>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-between pt-1 border-t border-gray-200/60">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Coach Active</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("bmyfit_admin_authorized");
                    window.location.reload();
                  }
                }}
                className="text-gray-400 hover:text-rose-600 font-bold underline transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* ================= DESKTOP MAIN WORKSPACE ================= */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar with KPI Metrics Cards */}
          <header className="bg-white border-b border-gray-200/80 px-6 py-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                  {activeTab === "overview" && "Client Performance & Health Status Dashboard"}
                  {activeTab === "subscriptions" && "Client Subscriptions & Entitlements Dashboard"}
                  {activeTab === "directory" && "Client Management & Biometrics Dossier"}
                  {activeTab === "studio" &&
                    `Week Plan Studio: ${selectedUser ? selectedUser.name : "Select Client"}`}
                  {activeTab === "dispatch" && "Plan Deployment & Push to User Console"}
                  {activeTab === "chats" && "Client WhatsApp Messages · Coach Naveen"}
                </h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {activeTab === "overview" &&
                    "Track real-time adherence, see who is doing good vs who needs coach attention, and dispatch instant alerts."}
                  {activeTab === "subscriptions" &&
                    "Monitor all ₹99 custom plans, subscription periods, payment verifications, and renewal alerts."}
                  {activeTab === "directory" &&
                    "Search and filter client profiles, inspect body fat & medical reports, and launch plan adjustments."}
                  {activeTab === "studio" &&
                    "Customize multi-week caloric targets, macro distributions, meal ingredients, and exercise progression."}
                  {activeTab === "dispatch" &&
                    "Review completed draft plans and dispatch directly to client dashboards."}
                  {activeTab === "chats" &&
                    "Direct 1-on-1 real-time messaging with all ₹99 purchased transformation clients."}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchUsers}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* 6 Key Stat Cards Grid (Shown on Directory) */}
            {activeTab === "directory" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {/* Total Users */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Total Users
                  </span>
                  <span className="text-xl font-black text-gray-950 mt-0.5 block">
                    {stats?.totalUsers || 0}
                  </span>
                </div>

                {/* Purchased Clients */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Purchased Plans
                  </span>
                  <span className="text-xl font-black text-emerald-950 mt-0.5 block">
                    {stats?.purchasedPlansCount || 0}
                  </span>
                </div>

                {/* Active Memberships */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                    Active Members
                  </span>
                  <span className="text-xl font-black text-purple-950 mt-0.5 block">
                    {stats?.activeMembershipsCount || 0}
                  </span>
                </div>

                {/* Free Members */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Free Members
                  </span>
                  <span className="text-xl font-black text-gray-800 mt-0.5 block">
                    {stats?.freeMembersCount || 0}
                  </span>
                </div>

                {/* Needs Coach Push */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Awaiting Push
                  </span>
                  <span className="text-xl font-black text-amber-950 mt-0.5 block">
                    {stats?.pendingReviewCount || 0}
                  </span>
                </div>

                {/* Total Revenue */}
                <div className="p-3.5 rounded-2xl bg-emerald-900 text-white">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Revenue
                  </span>
                  <span className="text-xl font-black text-white mt-0.5 block">
                    ₹{(stats?.totalRevenueINR || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </header>

          {/* ================= TAB 0: CLIENT HEALTH & PERFORMANCE DASHBOARD ================= */}
          {activeTab === "overview" && (
            <div className="p-6">
              <ClientHealthDashboard
                users={users}
                onOpenChat={(u) => {
                  setSelectedUser(u);
                  setActiveTab("chats");
                }}
                onOpenStudio={(u) => {
                  setSelectedUser(u);
                  setActiveTab("studio");
                }}
                onOpenBiometrics={(u) => {
                  setInspectUser(u);
                }}
                onSendAlert={(u) => {
                  setAlertUser(u);
                }}
              />
            </div>
          )}

          {/* ================= TAB 0.5: SUBSCRIPTIONS DASHBOARD ================= */}
          {activeTab === "subscriptions" && (
            <div className="p-6">
              <SubscriptionsDashboard
                users={users}
                onOpenChat={(u) => {
                  setSelectedUser(u);
                  setActiveTab("chats");
                }}
                onOpenStudio={(u) => {
                  setSelectedUser(u);
                  setActiveTab("studio");
                }}
                onSendAlert={(u) => {
                  setAlertUser(u);
                }}
              />
            </div>
          )}

          {/* ================= TAB 1: USERS DIRECTORY ================= */}
          {activeTab === "directory" && (
            <div className="p-6 space-y-5">
              {/* Filter Tabs & Search Bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full lg:w-96">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by client name, email, phone, ID, or goal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === "all"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All Users ({users.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter("purchased")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === "purchased"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    Purchased ({stats?.purchasedPlansCount || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter("membership")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === "membership"
                        ? "bg-purple-600 text-white"
                        : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                    }`}
                  >
                    Membership ({stats?.activeMembershipsCount || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter("free")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === "free"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Free ({stats?.freeMembersCount || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === "pending"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    Needs Plan ({stats?.pendingReviewCount || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter("medical")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === "medical"
                        ? "bg-teal-700 text-white"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    🩺 Medical Reports (
                    {
                      users.filter(
                        (u) =>
                          u.medicalAssessment?.hasDisease ||
                          (u.medicalAssessment?.documents?.length || 0) > 0
                      ).length
                    }
                    )
                  </button>

                  <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

                  <button
                    type="button"
                    onClick={() => setAdherenceFilter(adherenceFilter === "high" ? "all" : "high")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      adherenceFilter === "high"
                        ? "bg-[#00c853] text-white shadow-xs"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>High Adherence (≥70%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdherenceFilter(adherenceFilter === "low" ? "all" : "low")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      adherenceFilter === "low"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    <span>Low Adherence (&lt;70%)</span>
                  </button>
                </div>
              </div>

              {/* Comprehensive Desktop Users Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-5">Client Profile</th>
                        <th className="py-3.5 px-4">Membership Tier</th>
                        <th className="py-3.5 px-4">Biometrics Snapshot</th>
                        <th className="py-3.5 px-4">Daily Targets</th>
                        <th className="py-3.5 px-4">Plan Status</th>
                        <th className="py-3.5 px-4">Live Adherence &amp; Tasks</th>
                        <th className="py-3.5 px-5 text-right">Desktop Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-400">
                            No users found matching current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isPending = u.plan.status === "pending_review" || u.needsPlanReview;
                          return (
                            <tr
                              key={u.id}
                              className="hover:bg-emerald-50/40 transition group cursor-pointer"
                              onClick={() => setSelectedUser(u)}
                            >
                              {/* Client Profile */}
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={u.avatar}
                                    alt={u.name}
                                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-200"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-black text-gray-900 group-hover:text-emerald-700 transition">
                                        {u.name}
                                      </span>
                                      {u.needsPlanReview && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-white animate-pulse">
                                          NEW PURCHASE
                                        </span>
                                      )}
                                    </div>
                                    <span className="block text-[11px] text-gray-500">
                                      {u.email} · {u.city}
                                    </span>
                                    {/* Medical Conditions & Attached Reports Badges */}
                                    {u.medicalAssessment && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {u.medicalAssessment.diseases &&
                                          u.medicalAssessment.diseases.slice(0, 2).map((d, i) => (
                                            <span
                                              key={i}
                                              className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold"
                                            >
                                              🩺 {d}
                                            </span>
                                          ))}
                                        {u.medicalAssessment.documents &&
                                          u.medicalAssessment.documents.length > 0 && (
                                            <span
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setInspectUser(u);
                                              }}
                                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black hover:bg-emerald-200 transition cursor-pointer"
                                            >
                                              📎 {u.medicalAssessment.documents.length} Report
                                              {u.medicalAssessment.documents.length > 1 ? "s" : ""}
                                            </span>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Membership Category */}
                              <td className="py-4 px-4">
                                {u.membershipCategory === "purchased" ? (
                                  <div>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                                        u.needsPlanReview
                                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                                          : "bg-emerald-100 text-emerald-800"
                                      }`}
                                    >
                                      <span>
                                        {u.needsPlanReview ? "🔔 Needs Plan (₹99 Paid)" : "Purchased Plan"}
                                      </span>
                                    </span>
                                    <span className="block text-[11px] text-gray-500 font-medium mt-0.5">
                                      {u.order?.amountFormatted || "₹99"} ·{" "}
                                      {formatPlanDuration(u.plan.weeksCount, u.plan.monthsCount)}
                                    </span>
                                  </div>
                                ) : u.membershipCategory === "membership" ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                                      <span>Pro Member</span>
                                    </span>
                                    <span className="block text-[11px] text-gray-500 font-medium mt-0.5">
                                      {u.membershipTitle}
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gray-100 text-gray-700">
                                      <span>Free Lead</span>
                                    </span>
                                    <span className="block text-[11px] text-gray-400 font-medium mt-0.5">
                                      Assessment Done
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Biometrics Snapshot */}
                              <td className="py-4 px-4">
                                <span className="font-bold text-gray-900 block">
                                  {u.biometrics.weightKg} kg · {u.biometrics.heightCm} cm
                                </span>
                                <span className="text-[11px] text-gray-500 block">
                                  BMI: <strong>{u.biometrics.bmi}</strong> · BF:{" "}
                                  <strong>{u.biometrics.bodyFatPercent}%</strong>
                                </span>
                              </td>

                              {/* Daily Targets */}
                              <td className="py-4 px-4">
                                <span className="font-bold text-gray-900 block">
                                  {u.plan.calorieTarget} kcal
                                </span>
                                <span className="text-[11px] text-gray-500 block">
                                  {u.plan.proteinTargetGrams}g Protein · {u.plan.workoutDaysPerWeek} Days
                                </span>
                              </td>

                              {/* Plan Status */}
                              <td className="py-4 px-4">
                                {isPending ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
                                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                                    <span>Needs Push</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Pushed Live</span>
                                  </span>
                                )}
                              </td>

                              {/* Live Adherence & Tasks */}
                              <td className="py-4 px-4">
                                {(() => {
                                  const userAdh = calculateDetailedAdherence(u.plan, u.taskLogs);
                                  return (
                                    <div className="space-y-1.5 min-w-[130px]">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-black text-gray-900">
                                          {userAdh.percent}%
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-semibold">
                                          {userAdh.completedTasks}/{userAdh.totalTasks} done
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            userAdh.percent >= 70
                                              ? "bg-[#00c853]"
                                              : userAdh.percent >= 40
                                              ? "bg-amber-500"
                                              : "bg-gray-300"
                                          }`}
                                          style={{ width: `${userAdh.percent}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] text-gray-400 block font-medium">
                                        {userAdh.completedMeals} meals · {userAdh.completedWorkouts} w/o
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setStudioInitialMode("progress");
                                    setActiveTab("studio");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition inline-flex items-center gap-1 shadow-2xs"
                                  title="Watch Client Live Progress & Checklist"
                                >
                                  <BarChart2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Progress</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setInspectUser(u)}
                                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition inline-flex items-center gap-1"
                                  title="Inspect Client Biometrics Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Body Stats</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setStudioInitialMode("customize");
                                    setActiveTab("studio");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition inline-flex items-center gap-1"
                                  title="Edit Week Plan Studio"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Plan</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAlertUser(u)}
                                  className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs transition inline-flex items-center gap-1 shadow-2xs"
                                  title="Send Immediate WhatsApp Alert or Nudge"
                                >
                                  <BellRing className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Alert</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActiveTab("chats");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-emerald-400/50 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] font-black text-xs transition inline-flex items-center gap-1 shadow-2xs"
                                  title="Open WhatsApp Chat with Client"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                  <span>Chat</span>
                                </button>

                                {isPending ? (
                                  <button
                                    type="button"
                                    onClick={() => setPushUser(u)}
                                    className="px-3 py-1.5 rounded-lg bg-[#00c853] hover:bg-[#00b047] text-white font-black text-xs shadow-xs transition inline-flex items-center gap-1"
                                    title="Push to User Dashboard"
                                  >
                                    <Rocket className="w-3.5 h-3.5" />
                                    <span>Push</span>
                                  </button>
                                ) : (
                                  <a
                                    href={`/plan/${u.plan.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition inline-flex items-center"
                                    title="View User Dashboard Live"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: WEEK PLAN STUDIO ================= */}
          {activeTab === "studio" && (
            <div className="p-6">
              {selectedUser ? (
                <WeekPlanEditor
                  key={`${selectedUser.id}-${studioInitialMode}`}
                  user={selectedUser}
                  initialMode={studioInitialMode}
                  onSavePlan={handleSavePlan}
                  onPushToUser={(u) => setPushUser(u)}
                  onBackToDirectory={() => setActiveTab("directory")}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                  <p className="text-gray-500 font-bold">Please select a user from the directory to edit their week plan.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("directory")}
                    className="mt-3 px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
                  >
                    Go to Directory
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: PUSH & DISPATCH CONSOLE ================= */}
          {activeTab === "dispatch" && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-emerald-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Rocket className="w-7 h-7 text-emerald-400" />
                  <h2 className="text-2xl font-black">Plan Dispatch & Dashboard Push Control</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-medium leading-relaxed">
                  When a client completes an assessment or purchase, their plan enters the queue as &apos;Needs Push&apos;. Once you verify biometrics and configure the multi-week splits in the Plan Studio, click &apos;Push to Dashboard&apos; to instantly unlock and update their personalized user screen.
                </p>
              </div>

              {/* Plans Pending Push Queue */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                    <h3 className="text-base font-black text-gray-950">
                      Pending Coach Push Queue ({users.filter((u) => u.plan.status === "pending_review").length})
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Ready for coach sign-off</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users
                    .filter((u) => u.plan.status === "pending_review")
                    .map((u) => (
                      <div
                        key={u.id}
                        className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-300"
                            />
                            <div>
                              <h4 className="font-black text-gray-950 text-sm">{u.name}</h4>
                              <p className="text-[11px] text-gray-500 font-medium">
                                {u.goalDisplay} · {u.plan.weeksCount} Weeks
                              </p>
                              <p className="text-[10px] text-amber-800 font-bold mt-0.5">
                                BMI {u.biometrics.bmi} · BF {u.biometrics.bodyFatPercent}%
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                            Awaiting Push
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                          <strong>Coach Note:</strong> {u.plan.coachNotes || "Standard progression curve assigned."}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setActiveTab("studio");
                            }}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-white transition"
                          >
                            Edit Week Plan
                          </button>
                          <button
                            type="button"
                            onClick={() => setPushUser(u)}
                            className="px-4 py-1.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            <span>Push Live</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Already Approved & Live Plans */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-black text-gray-950">
                      Live Approved Plans on User Dashboards ({users.filter((u) => u.plan.status === "approved" || u.plan.status === "active").length})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {users
                    .filter((u) => u.plan.status === "approved" || u.plan.status === "active")
                    .map((u) => (
                      <div
                        key={u.id}
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover"
                            />
                            <div>
                              <span className="block font-black text-xs text-gray-900 truncate">
                                {u.name}
                              </span>
                              <span className="block text-[10px] text-gray-500">
                                {u.plan.weeksCount} Weeks · {u.plan.calorieTarget} kcal
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[11px]">
                          <a
                            href={`/plan/${u.plan.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>Live Dashboard</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setActiveTab("studio");
                            }}
                            className="text-gray-600 hover:text-gray-900 font-bold"
                          >
                            Customize →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= CHATS TAB (WhatsApp Style Console) ================= */}
          {activeTab === "chats" && (
            <div className="p-4 lg:p-6 flex-1 flex flex-col">
              <AdminChatView
                users={users}
                onOpenStudio={(u) => {
                  setSelectedUser(u);
                  setActiveTab("studio");
                }}
                onOpenBiometrics={(u) => {
                  setInspectUser(u);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Biometrics Inspection Dossier Modal */}
      {inspectUser && (
        <BiometricsModal
          user={inspectUser}
          onClose={() => setInspectUser(null)}
          onOpenPlanStudio={(u) => {
            setInspectUser(null);
            setSelectedUser(u);
            setActiveTab("studio");
          }}
          onPushToUser={(u) => {
            setInspectUser(null);
            setPushUser(u);
          }}
        />
      )}

      {/* Push Confirmation Modal */}
      {pushUser && (
        <PushModal
          user={pushUser}
          onClose={() => setPushUser(null)}
          onSuccess={handlePushSuccess}
        />
      )}

      {/* Alert Dispatch Modal */}
      {alertUser && (
        <AlertDispatchModal
          user={alertUser}
          onClose={() => setAlertUser(null)}
          onSuccess={(msg) => {
            setGlobalAlert(msg);
            setTimeout(() => setGlobalAlert(null), 5000);
          }}
        />
      )}
    </div>
  );
}
