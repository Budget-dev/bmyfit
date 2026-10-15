"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFunnelState } from "@/hooks/use-funnel-state";
import { Button } from "@/components/ui/button";

const PROGRESS_STAGES = [
  "Validating physical measurements...",
  "Applying US Navy Body Fat % algorithms...",
  "Classifying WHO Body Mass Index (BMI)...",
  "Calibrating South Asian metabolic factors...",
  "Finalizing your body analysis...",
];

export function CalculatingClient() {
  const router = useRouter();
  const { getIdToken, loading: authLoading } = useAuth();
  const { getFullInput, hydrated } = useFunnelState();

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestSentRef = useRef(false);

  useEffect(() => {
    // Stage rotation animation
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < PROGRESS_STAGES.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(stageTimer);
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading || requestSentRef.current) return;

    const fullInput = getFullInput();
    if (!fullInput) {
      setErrorMessage("Missing measurements or goal. Please check your details.");
      return;
    }

    requestSentRef.current = true;

    async function executeCalculation() {
      try {
        const token = await getIdToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const minWaitPromise = new Promise((res) => setTimeout(res, 1800));

        const responsePromise = fetch("/api/assessments", {
          method: "POST",
          headers,
          body: JSON.stringify(fullInput),
        });

        const [, response] = await Promise.all([minWaitPromise, responsePromise]);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to process body assessment");
        }

        const data = await response.json();
        if (!data.assessmentId) {
          throw new Error("No assessment identifier returned from server");
        }

        router.push(`/result/${data.assessmentId}`);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Calculation failed. Please try again.");
      }
    }

    void executeCalculation();
  }, [hydrated, authLoading, getIdToken, getFullInput, router]);

  if (errorMessage) {
    return (
      <div className="text-center p-8 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 mb-4">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-ink dark:text-white">Assessment Error</h3>
        <p className="mt-2 text-sm text-ink-muted dark:text-surface-300 max-w-sm mx-auto">
          {errorMessage}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button href="/details" variant="outline" size="sm">
            Review Details
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              requestSentRef.current = false;
              setErrorMessage(null);
            }}
          >
            Retry Calculation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-6">
      {/* Animated pulsing pulse ring */}
      <div className="relative mx-auto h-24 w-24 mb-8">
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/25">
          <svg className="h-10 w-10 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-ink dark:text-white tracking-tight">
        Analysing your body metrics...
      </h2>
      <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 h-6 transition-all duration-200">
        {PROGRESS_STAGES[currentStageIndex]}
      </p>

      {/* Progress track */}
      <div className="mt-8 max-w-xs mx-auto h-1.5 w-full bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
          style={{ width: `${((currentStageIndex + 1) / PROGRESS_STAGES.length) * 100}%` }}
        />
      </div>
      <p className="mt-4 text-xs text-ink-muted dark:text-surface-500">
        Crunching circumferences with server validation
      </p>
    </div>
  );
}
