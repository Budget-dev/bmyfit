"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { AssessmentInput, FitnessGoal } from "@/types/fitness";
import type { PlanDashboardData } from "@/types/plan-dashboard";
import { PlanDashboard } from "@/components/plan/plan-dashboard";
import { PlanLockScreen } from "./plan-lock-screen";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import {
  getStoredPlan,
  fetchFirebasePlan,
  getStoredAdminUsers,
  getStoredMedicalConsultation,
} from "@/lib/storage/mock-storage";

export function PlanClient({ id }: { id: string }) {
  const { getIdToken, userProfile, loading: authLoading } = useAuth();
  const [dashboardPlan, setDashboardPlan] = useState<PlanDashboardData | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [biometrics, setBiometrics] = useState<{
    bmi: number;
    bodyFatPercent: number;
    goal: FitnessGoal;
  }>({
    bmi: 24.2,
    bodyFatPercent: 18.4,
    goal: "fat-loss",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPlanData() {
      // 1. Determine subscription entitlement
      const isCoach = userProfile?.email?.toLowerCase() === "bmyfitnesscoach@gmail.com";
      const hasPurchasedProfile =
        userProfile?.isPaid === true ||
        userProfile?.membershipCategory === "purchased" ||
        userProfile?.membershipCategory === "membership";

      let isPaidLocal = false;
      let calculatedBmi = 24.2;
      let calculatedBodyFat = 18.4;
      let localAssessment: AssessmentInput | null = null;

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
        console.warn("Session storage parse notice:", err);
      }

      const effectiveGoal: FitnessGoal = localAssessment?.goal || "fat-loss";
      if (isMounted) {
        setBiometrics({
          bmi: calculatedBmi,
          bodyFatPercent: calculatedBodyFat,
          goal: effectiveGoal,
        });
      }

      // Check stored admin users list for the specific authenticated user
      const storedAdminUsers = getStoredAdminUsers();
      const matchedUser = storedAdminUsers.find(
        (u) =>
          (userProfile?.uid && (u.id === userProfile.uid || (u.email && u.email.toLowerCase() === userProfile.email?.toLowerCase()))) ||
          (id !== "local" && id !== "demo" && (u.id === id || u.assessmentId === id))
      );

      // Only mark paid from admin if this specific user profile is genuinely purchased
      const isPaidFromAdmin = Boolean(
        userProfile?.uid &&
          matchedUser &&
          (matchedUser.id === userProfile.uid || (matchedUser.email && matchedUser.email.toLowerCase() === userProfile.email?.toLowerCase())) &&
          (matchedUser.membershipCategory === "purchased" ||
            matchedUser.membershipCategory === "membership" ||
            matchedUser.order?.status === "paid")
      );

      // 2. Lock access immediately unless user is Coach Naveen or genuinely paid ₹99
      const userEntitled = isCoach || hasPurchasedProfile || isPaidLocal || isPaidFromAdmin;

      // 3. Try to fetch direct plan if entitled or looking up a specific id
      const targetPlanId = (id === "local" || id === "demo") && userProfile?.uid ? userProfile.uid : id;

      // First check local / Firestore stored plan
      const storedDirectPlan =
        getStoredPlan(targetPlanId) ||
        (await fetchFirebasePlan(targetPlanId)) ||
        (userProfile?.uid && targetPlanId !== userProfile.uid
          ? getStoredPlan(userProfile.uid) || (await fetchFirebasePlan(userProfile.uid))
          : null);

      if (userEntitled && storedDirectPlan) {
        if (isMounted) {
          setDashboardPlan(storedDirectPlan);
          setIsSubscribed(true);
          setFetching(false);
          return;
        }
      }

      if (userEntitled && matchedUser?.plan) {
        if (isMounted) {
          setDashboardPlan(matchedUser.plan);
          setIsSubscribed(true);
          setFetching(false);
          return;
        }
      }

      // Try fetching from server API with token
      try {
        const token = await getIdToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/plan/${id}`, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.dashboardPlan && data.isSubscribed) {
            if (isMounted) {
              setDashboardPlan(data.dashboardPlan);
              setIsSubscribed(true);
              setFetching(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("API plan fetch notice:", err);
      }

      // If entitled (e.g. freshly completed ₹99 checkout locally or Coach Naveen)
      if (userEntitled) {
        const medicalData = getStoredMedicalConsultation(id);
        const generated = generateDashboardPlan(id || "local", {
          status: isPaidLocal ? "pending_review" : "active",
          goal: effectiveGoal,
          bmi: calculatedBmi,
          bodyFatPercent: calculatedBodyFat,
          weeksCount: 8,
          monthsCount: 2,
          customerName: userProfile?.name || matchedUser?.name || "Fit Member",
          medicalAssessment: medicalData || undefined,
        });

        if (isMounted) {
          setDashboardPlan(generated);
          setIsSubscribed(true);
          setFetching(false);
          return;
        }
      }

      // 4. Strict paywall: Unsubscribed / unpaid visitors must see the lock screen
      if (isMounted) {
        setIsSubscribed(false);
        setDashboardPlan(null);
        setFetching(false);
      }
    }

    void loadPlanData();

    return () => {
      isMounted = false;
    };
  }, [id, getIdToken, userProfile?.uid, userProfile?.email, userProfile?.isPaid, userProfile?.membershipCategory]);

  if (fetching || authLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-black text-gray-700">Verifying plan entitlement...</p>
      </div>
    );
  }

  // If user is not subscribed to ₹99 plan, render PlanLockScreen
  if (!isSubscribed || !dashboardPlan) {
    return (
      <PlanLockScreen
        assessmentId={id}
        bmi={biometrics.bmi}
        bodyFatPercent={biometrics.bodyFatPercent}
        goal={biometrics.goal}
      />
    );
  }

  return <PlanDashboard initialPlan={dashboardPlan} />;
}
