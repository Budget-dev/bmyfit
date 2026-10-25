"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Users,
  Search,
  ExternalLink,
  Edit3,
  Calendar,
  RefreshCw,
} from "@/components/ui/icons";
import type { PlanDashboardData, PlanStatus } from "@/types/plan-dashboard";

export default function AdminDashboardPage() {
  const [plans, setPlans] = useState<PlanDashboardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | PlanStatus>("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error("Failed to fetch admin plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const handleQuickApprove = async (planId: string) => {
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, status: "approved" as PlanStatus } : p))
        );
        setActionSuccess(`Plan ${planId} approved and live for user!`);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesQuery =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.goalDisplay.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pendingCount = plans.filter((p) => p.status === "pending_review").length;
  const approvedCount = plans.filter((p) => p.status === "approved" || p.status === "active").length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black tracking-tight text-gray-950">
                BMY<span className="text-[#00e676]">FIT</span>
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                ADMIN CONSOLE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/plan"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition"
            >
              <span>User Dashboard Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-7 space-y-6">
        {/* Banner Alert if Action Successful */}
        {actionSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between animate-fade-in text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-100 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Customer Plan Approvals & Customization
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Review customer biometrics, configure multi-week nutrition and workout splits, and approve user dashboards.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPlans}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200/70 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customer Plans</span>
              <span className="block text-2xl font-black text-gray-950">{plans.length}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                Needs Coach Review
              </span>
              <span className="block text-2xl font-black text-amber-950">{pendingCount}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Approved & Active
              </span>
              <span className="block text-2xl font-black text-emerald-950">{approvedCount}</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by client name, ID, or goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Plans ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending_review")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "pending_review"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
        </div>

        {/* Plans Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Client / ID</th>
                  <th className="py-3 px-4">Goal & Biometrics</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Daily Targets</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No customer plans found.
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((p) => {
                    const isPending = p.status === "pending_review";
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition">
                        {/* Client / ID */}
                        <td className="py-4 px-4">
                          <span className="block font-black text-gray-900">{p.customerName}</span>
                          <span className="block text-[11px] text-gray-400 font-mono">ID: {p.id}</span>
                        </td>

                        {/* Goal & Biometrics */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900">{p.goalDisplay}</span>
                          <span className="block text-[11px] text-gray-500">
                            BMI: {p.bmi} · Body Fat: {p.bodyFatPercent}%
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{p.weeksCount} Weeks</span>
                          </span>
                        </td>

                        {/* Daily Targets */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900">{p.calorieTarget.toLocaleString()} kcal</span>
                          <span className="block text-[11px] text-gray-500">{p.proteinTargetGrams}g Protein · {p.workoutDaysPerWeek} Days Workouts</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              <span>Needs Review</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved / Live</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right space-x-2">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(p.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                              title="Quick approve without changing splits"
                            >
                              Approve
                            </button>
                          )}

                          <Link
                            href={`/admin/plans/${p.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Customize</span>
                          </Link>

                          <Link
                            href={`/plan/${p.id}`}
                            target="_blank"
                            className="inline-flex items-center p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="View Customer Dashboard"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
