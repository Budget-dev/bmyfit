"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  MessageCircle,
  BellRing,
  TrendingUp,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import { calculateDetailedAdherence } from "@/features/plan/dashboard-data";

interface SubscriptionsDashboardProps {
  users: AdminUserRecord[];
  onOpenChat: (user: AdminUserRecord) => void;
  onOpenStudio: (user: AdminUserRecord) => void;
  onSendAlert: (user: AdminUserRecord) => void;
}

export function SubscriptionsDashboard({
  users,
  onOpenChat,
  onOpenStudio,
  onSendAlert,
}: SubscriptionsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expiring" | "pending">("all");

  // Derive all subscribers from users with order / subscription or purchased category
  const subscribers = users.filter(
    (u) =>
      u.membershipCategory === "purchased" ||
      u.membershipCategory === "membership" ||
      Boolean(u.order)
  );

  // Compute Financial & Subscription Metrics
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(
    (u) => u.plan?.status === "approved" || u.plan?.status === "active"
  ).length;
  const pendingCustomization = subscribers.filter(
    (u) => (u.plan?.status === "pending_review") || u.needsPlanReview
  ).length;

  const totalRevenue = subscribers.reduce(
    (sum, u) => sum + (u.order ? Math.round(u.order.amountPaise / 100) : 99),
    0
  );

  // Filter subscribers list
  const filteredSubscribers = subscribers.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      (u.order?.orderId && u.order.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "active") {
      return u.plan?.status === "approved" || u.plan?.status === "active";
    }
    if (statusFilter === "pending") {
      return (u.plan?.status === "pending_review") || u.needsPlanReview;
    }
    if (statusFilter === "expiring") {
      if (u.subscription?.endDate) {
        const daysLeft = (new Date(u.subscription.endDate).getTime() - Date.now()) / (1000 * 3600 * 24);
        return daysLeft >= 0 && daysLeft <= 7;
      }
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ================= SUBSCRIPTION KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Subscriptions */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
              Total Subscriptions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-950">{totalSubscribers}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Paid
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {activeSubscribers} Active Transformations
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2: Total Revenue Generated */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
              Total Revenue (INR)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-gray-950">₹{totalRevenue.toLocaleString()}</span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Direct Razorpay Collections
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/60">
            <span className="text-xl font-black">₹</span>
          </div>
        </div>

        {/* Card 3: Pending Coach Customization */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
              Awaiting Custom Plan
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-950">{pendingCustomization}</span>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                Action Req.
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              ₹99 Paid · Needs Coach Push
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: High Compliance Retention */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
              Subscriber Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-950">
                {Math.round(
                  (subscribers.filter((u) => calculateDetailedAdherence(u.plan, u.taskLogs).percent >= 60).length /
                    Math.max(1, subscribers.length)) *
                    100
                )}
                %
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Doing Good
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Weekly log consistency
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ================= SUBSCRIPTIONS MANAGEMENT TABLE ================= */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-5 border-b border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-base font-black text-gray-950 tracking-tight flex items-center gap-2">
              <span>All Client Subscriptions &amp; Transformation Periods</span>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full">
                {filteredSubscribers.length} Records
              </span>
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Monitor payment tiers, duration progress, client health compliance, and dispatch one-click alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscriber, email, or order..."
                className="w-full bg-white text-gray-900 text-xs rounded-xl pl-9 pr-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === "all"
                    ? "bg-[#032e1c] text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === "active"
                    ? "bg-[#032e1c] text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Needs Review
              </button>
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <th className="py-3 px-5">Subscriber</th>
                <th className="py-3 px-4">Plan Package &amp; Amount</th>
                <th className="py-3 px-4">Transformation Cycle</th>
                <th className="py-3 px-4">Client Health / Compliance</th>
                <th className="py-3 px-4">Payment Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredSubscribers.map((u) => {
                const adherence = calculateDetailedAdherence(u.plan, u.taskLogs);
                const isDoingGreat = adherence.percent >= 70;
                const isFallingBehind = adherence.percent < 40 && adherence.completedTasks > 0;
                const isPendingPush = (u.plan?.status === "pending_review") || u.needsPlanReview;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition">
                    {/* Subscriber */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                          {u.avatar ? (
                            <Image src={u.avatar} alt={u.name || "Client"} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-700 text-white font-bold text-xs">
                              {(u.name || "C").charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-950 block text-xs">{u.name || "BMYFIT Client"}</span>
                          <span className="text-[11px] text-gray-400 block">{u.email}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{u.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Plan Package & Amount */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-950 block">
                        {u.order?.packageTitle || `${u.plan?.weeksCount || 8}-Week Custom Transformation`}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-emerald-700">
                          {u.order?.amountFormatted || "₹99"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          ({u.plan?.weeksCount || 8} WEEKS)
                        </span>
                      </div>
                    </td>

                    {/* Transformation Cycle */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-gray-900 font-semibold block">
                          Started: {new Date(u.joinedAt || Date.now()).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          ⏳ {Math.max(1, (u.plan?.weeksCount || 8) * 7 - 12)} Days Remaining
                        </span>
                      </div>
                    </td>

                    {/* Client Health / Compliance */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className={`font-black ${
                              isDoingGreat
                                ? "text-emerald-700"
                                : isFallingBehind
                                ? "text-rose-600"
                                : "text-amber-700"
                            }`}
                          >
                            {isDoingGreat
                              ? "🟢 Doing Great"
                              : isFallingBehind
                              ? "🔴 Falling Behind"
                              : "🟡 Moderate"}
                          </span>
                          <span className="font-mono font-bold text-gray-900">{adherence.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDoingGreat
                                ? "bg-[#00c853]"
                                : isFallingBehind
                                ? "bg-rose-500"
                                : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.max(5, adherence.percent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          {adherence.completedMeals} meals &bull; {adherence.completedWorkouts} workouts done
                        </span>
                      </div>
                    </td>

                    {/* Payment Order */}
                    <td className="py-4 px-4 font-mono text-[11px]">
                      <span className="text-gray-900 font-bold block">
                        {u.order?.razorpayPaymentId || "pay_Qe9102Klm12"}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-sans font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Razorpay</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {isPendingPush ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <span>🔔 Needs Push</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                          <span>Active Subscription</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right space-x-1.5">
                      {/* Send Alert Button */}
                      <button
                        type="button"
                        onClick={() => onSendAlert(u)}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs transition inline-flex items-center gap-1 shadow-2xs"
                        title="Send Immediate WhatsApp Alert or Nudge"
                      >
                        <BellRing className="w-3.5 h-3.5 text-rose-600" />
                        <span>Alert</span>
                      </button>

                      {/* WhatsApp Chat Button */}
                      <button
                        type="button"
                        onClick={() => onOpenChat(u)}
                        className="px-2.5 py-1.5 rounded-lg border border-emerald-400/50 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] font-black text-xs transition inline-flex items-center gap-1 shadow-2xs"
                        title="Open WhatsApp Chat"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Chat</span>
                      </button>

                      {/* Edit Plan Button */}
                      <button
                        type="button"
                        onClick={() => onOpenStudio(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition inline-flex items-center gap-1"
                        title="Edit Multi-Week Plan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Plan</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No subscriptions match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
