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
  saveStoredPlan,
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
          isPaidLocal =
            sessionStorage.getItem("bmyfit_local_paid") === "true" ||
            localStorage.getItem("bmyfit_local_paid") === "true" ||
            localStorage.getItem(`bmyfit_paid_${id}`) === "true" ||
            sessionStorage.getItem(`bmyfit_paid_${id}`) === "true" ||
            Boolean(userProfile?.uid && localStorage.getItem(`bmyfit_paid_${userProfile.uid}`) === "true") ||
            Boolean(userProfile?.uid && sessionStorage.getItem(`bmyfit_paid_${userProfile.uid}`) === "true");
          const rawLocal =
            sessionStorage.getItem("bmyfit_local_assessment") ||
            localStorage.getItem("bmyfit_local_assessment");
          if (rawLocal) {
            localAssessment = JSON.parse(rawLocal);
          }
          const rawCalc =
            sessionStorage.getItem("bmyfit_local_calculated") ||
            localStorage.getItem("bmyfit_local_calculated");
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
          (userProfile?.email && u.email && u.email.toLowerCase() === userProfile.email.toLowerCase()) ||
          (id !== "local" && id !== "demo" && (u.id === id || u.assessmentId === id))
      );

      // Only mark paid from admin if this specific user profile is genuinely purchased
      const isPaidFromAdmin = Boolean(
        matchedUser &&
          (matchedUser.membershipCategory === "purchased" ||
            matchedUser.membershipCategory === "membership" ||
            matchedUser.isPaid === true ||
            matchedUser.order?.status === "paid")
      );

      // 2. Lock access immediately unless user is Coach Naveen or genuinely paid ₹99
      const userEntitled = isCoach || hasPurchasedProfile || isPaidLocal || isPaidFromAdmin;

      // 3. Try to fetch direct plan if entitled or looking up a specific id
      let targetPlanId = id;
      if (id === "local" || id === "demo") {
        if (userProfile?.uid) {
          targetPlanId = userProfile.uid;
        } else if (typeof window !== "undefined") {
          const storedActivePlanId =
            localStorage.getItem("bmyfit_active_plan_id") ||
            sessionStorage.getItem("bmyfit_active_plan_id");
          const storedAssessmentId =
            localStorage.getItem("bmyfit_active_assessment_id") ||
            sessionStorage.getItem("bmyfit_active_assessment_id");
          const rawLocal = sessionStorage.getItem("bmyfit_local_assessment");
          let localAsmId: string | undefined;
          if (rawLocal) {
            try {
              const parsed = JSON.parse(rawLocal);
              localAsmId = parsed.id || parsed.uid;
            } catch {}
          }
          targetPlanId = storedActivePlanId || storedAssessmentId || localAsmId || "local";
        }
      }

      // First check local / Firestore stored plan
      const storedDirectPlan =
        getStoredPlan(targetPlanId) ||
        (await fetchFirebasePlan(targetPlanId)) ||
        (targetPlanId !== id ? getStoredPlan(id) || (await fetchFirebasePlan(id)) : null) ||
        (userProfile?.uid && targetPlanId !== userProfile.uid
          ? getStoredPlan(userProfile.uid) || (await fetchFirebasePlan(userProfile.uid))
          : null);

      if (storedDirectPlan) {
        const isPlanApproved =
          storedDirectPlan.status === "approved" ||
          storedDirectPlan.status === "active" ||
          isCoach;

        if (isPlanApproved || userEntitled || storedDirectPlan.status === "pending_review") {
          if (isMounted) {
            const effectivePlan: PlanDashboardData = isPlanApproved
              ? storedDirectPlan
              : { ...storedDirectPlan, status: "pending_review" };
            setDashboardPlan(effectivePlan);
            setIsSubscribed(true);
            setFetching(false);
            if (typeof window !== "undefined") {
              localStorage.setItem("bmyfit_active_plan_id", effectivePlan.id);
              localStorage.setItem("bmyfit_local_paid", "true");
            }
            return;
          }
        }
      }

      if (matchedUser?.plan) {
        const isPlanApproved =
          matchedUser.plan.status === "approved" ||
          matchedUser.plan.status === "active" ||
          isCoach;

        if (isPlanApproved || userEntitled || matchedUser.plan.status === "pending_review") {
          if (isMounted) {
            const effectivePlan: PlanDashboardData = isPlanApproved
              ? matchedUser.plan
              : { ...matchedUser.plan, status: "pending_review" };
            setDashboardPlan(effectivePlan);
            setIsSubscribed(true);
            setFetching(false);
            if (typeof window !== "undefined") {
              localStorage.setItem("bmyfit_active_plan_id", effectivePlan.id);
              localStorage.setItem("bmyfit_local_paid", "true");
            }
            return;
          }
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
              const effectivePlan: PlanDashboardData =
                !isCoach && data.dashboardPlan.status !== "approved"
                  ? { ...data.dashboardPlan, status: "pending_review" }
                  : data.dashboardPlan;
              setDashboardPlan(effectivePlan);
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
          status: isCoach ? "active" : "pending_review",
          goal: effectiveGoal,
          bmi: calculatedBmi,
          bodyFatPercent: calculatedBodyFat,
          weeksCount: 8,
          monthsCount: 2,
          customerName: userProfile?.name || matchedUser?.name || "Fit Member",
          medicalAssessment: medicalData || undefined,
        });

        // Persist so admin can see and edit this plan immediately in Coach Admin!
        saveStoredPlan(generated);

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
  }, [id, getIdToken, userProfile?.uid, userProfile?.email, userProfile?.name, userProfile?.isPaid, userProfile?.membershipCategory]);

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
