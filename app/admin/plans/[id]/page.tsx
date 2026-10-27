"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket } from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import type { PlanDashboardData } from "@/types/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { WeekPlanEditor } from "@/components/admin/week-plan-editor";
import { PushModal } from "@/components/admin/push-modal";
import { AdminLoginGuard } from "@/components/admin/admin-login-guard";

export default function AdminPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUserRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pushModalOpen, setPushModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Try to fetch full admin user
        const resUser = await fetch(`/api/admin/users/${id}`);
        if (resUser.ok) {
          const userData = await resUser.json();
          if (userData.user) {
            setUser(userData.user);
            return;
          }
        }

        // Fallback to plans endpoint
        const resPlan = await fetch(`/api/admin/plans/${id}`);
        const data = await resPlan.json();
        const plan: PlanDashboardData =
          data.plan ||
          generateDashboardPlan(id, { customerName: "Client " + id.slice(0, 6), status: "pending_review" });

        setUser({
          id,
          name: plan.customerName || "Fit Member",
          email: `${id}@bmyfit.com`,
          phone: "+91 98000 00000",
          city: "India",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          joinedAt: new Date().toISOString(),
          lastActive: "Just now",
          membershipCategory: "purchased",
          membershipTitle: `${plan.weeksCount}-Week Plan`,
          goal: plan.goal || "fat-loss",
          goalDisplay: plan.goalDisplay || "Fat Loss",
          biometrics: {
            gender: "male",
            age: 28,
            heightCm: 175,
            weightKg: 78,
            targetWeightKg: 70,
            waistIn: 34,
            neckIn: 15.5,
            bmi: plan.bmi || 24.2,
            bmiCategory: "normal",
            bodyFatPercent: plan.bodyFatPercent || 18.4,
            bodyFatCategory: "fitness",
            bmr: 1700,
            tdee: 2350,
            caloricTarget: plan.calorieTarget || 1800,
            proteinTargetGrams: plan.proteinTargetGrams || 120,
            activityLevel: "moderately-active",
            dietPreference: "non-vegetarian",
            waterLitres: 3.5,
            dailyStepGoal: 10000,
          },
          plan,
        });
      } catch (err) {
        console.error("Load plan error:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  const handleSavePlan = async (updatedPlan: PlanDashboardData) => {
    const res = await fetch(`/api/admin/plans/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan),
    });

    if (!res.ok) {
      throw new Error("Failed to save plan");
    }

    if (user) {
      setUser({ ...user, plan: updatedPlan });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-600">Loading Week Plan Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLoginGuard>
      <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20">
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
                  Plan Studio: {user.name}
                </span>
                <span className="block text-[11px] text-gray-400 font-mono">Plan ID: {user.plan.id}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPushModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-xs shadow-sm flex items-center gap-2 transition"
            >
              <Rocket className="w-4 h-4" />
              <span>Push to User Dashboard</span>
            </button>
          </div>
        </header>

        {/* Main Studio */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-7">
          <WeekPlanEditor
            user={user}
            onSavePlan={handleSavePlan}
            onPushToUser={() => setPushModalOpen(true)}
          />
        </main>

        {pushModalOpen && (
          <PushModal
            user={user}
            onClose={() => setPushModalOpen(false)}
            onSuccess={(updated) => setUser(updated)}
          />
        )}
      </div>
    </AdminLoginGuard>
  );
}
