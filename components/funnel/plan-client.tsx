"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { AssessmentInput, FitnessGoal } from "@/types/fitness";
import type { PlanDashboardData } from "@/types/plan-dashboard";
import { PlanDashboard } from "@/components/plan/plan-dashboard";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import {
  getStoredPlan,
  fetchFirebasePlan,
  getStoredAdminUsers,
  getStoredMedicalConsultation,
} from "@/lib/storage/mock-storage";

export function PlanClient({ id }: { id: string }) {
  const { getIdToken, userProfile } = useAuth();
  const [dashboardPlan, setDashboardPlan] = useState<PlanDashboardData | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPlanData() {
      // 0. If user is authenticated, check their UID first if looking at default / local plan
      const targetPlanId = (id === "local" || id === "demo") && userProfile?.uid ? userProfile.uid : id;

      // 1. First priority: Check Firebase Firestore direct plan
      const storedDirectPlan =
        getStoredPlan(targetPlanId) ||
        (await fetchFirebasePlan(targetPlanId)) ||
        (userProfile?.uid && targetPlanId !== userProfile.uid
          ? getStoredPlan(userProfile.uid) || (await fetchFirebasePlan(userProfile.uid))
          : null);

      if (storedDirectPlan) {
        if (isMounted) {
          setDashboardPlan(storedDirectPlan);
          setFetching(false);
          return;
        }
      }

      // Check stored admin users list (covers newly purchased users with customized months)
      const storedAdminUsers = getStoredAdminUsers();
      const matchedUser = storedAdminUsers.find(
        (u) =>
          u.id === targetPlanId ||
          u.assessmentId === targetPlanId ||
          (userProfile?.uid && (u.id === userProfile.uid || u.email === userProfile.email)) ||
          (id === "local" && u.membershipCategory === "purchased")
      );
      if (matchedUser?.plan) {
        if (isMounted) {
          setDashboardPlan(matchedUser.plan);
          setFetching(false);
          return;
        }
      }

      // 2. Try local assessment from sessionStorage
      let localAssessment: AssessmentInput | null = null;
      let isPaidLocal = false;
      let calculatedBmi = 24.2;
      let calculatedBodyFat = 18.4;

      try {
        if (typeof window !== "undefined") {
          isPaidLocal = sessionStorage.getItem("bmyfit_local_paid") === "true";
          const rawLocal = sessionStorage.getItem("bmyfit_local_assessment");
          if (rawLocal) {
            localAssessment = JSON.parse(rawLocal);
          }
          const rawCalc = sessionStorage.getItem("bmyfit_local_calculated");
          if (rawCalc) {
            const parsedCalc = JSON.parse(rawCalc);
            if (parsedCalc.bmi) calculatedBmi = Number(parsedCalc.bmi);
            if (parsedCalc.bodyFatPercent) calculatedBodyFat = Number(parsedCalc.bodyFatPercent);
          }
        }
      } catch (err) {
        console.warn("Local storage parse error:", err);
      }

      const medicalData = getStoredMedicalConsultation(id);

      // If id is "local" or locally marked paid
      if (id === "local" || isPaidLocal) {
        const goal: FitnessGoal = localAssessment?.goal || "fat-loss";
        const generated = generateDashboardPlan(id || "local", {
          status: isPaidLocal ? "pending_review" : "active",
          goal,
          bmi: calculatedBmi,
          bodyFatPercent: calculatedBodyFat,
          weeksCount: 8,
          monthsCount: 2,
          customerName: "Fit Member",
          medicalAssessment: medicalData || undefined,
        });
        if (isMounted) {
          setDashboardPlan(generated);
          setFetching(false);
          return;
        }
      }

      // 2. Try fetching from server API
      try {
        const token = await getIdToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/plan/${id}`, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.dashboardPlan) {
            if (isMounted) {
              setDashboardPlan(data.dashboardPlan);
              setFetching(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("API plan fetch fallback:", err);
      }

      // 3. Fallback: Generate mock plan matching user's exact screenshot
      const fallbackGoal: FitnessGoal = localAssessment?.goal || "fat-loss";
      const fallbackPlan = generateDashboardPlan(id || "demo", {
        status: "active",
        goal: fallbackGoal,
        bmi: calculatedBmi,
        bodyFatPercent: calculatedBodyFat,
        weeksCount: 8,
        customerName: "Fit Pioneer",
      });

      if (isMounted) {
        setDashboardPlan(fallbackPlan);
        setFetching(false);
      }
    }

    void loadPlanData();

    return () => {
      isMounted = false;
    };
  }, [id, getIdToken, userProfile?.uid]);

  if (fetching || !dashboardPlan) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-black text-gray-700">Loading your personalized plan...</p>
      </div>
    );
  }

  return <PlanDashboard initialPlan={dashboardPlan} />;
}
