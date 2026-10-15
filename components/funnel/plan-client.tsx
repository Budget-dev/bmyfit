"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { DetailedPlan } from "@/types/fitness";
import { PlanView } from "./plan-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_CONFIG } from "@/lib/config";

export function PlanClient({ id }: { id: string }) {
  const { loading, getIdToken } = useAuth();
  const [plan, setPlan] = useState<DetailedPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;

    let isMounted = true;

    async function loadPlan() {
      try {
        setFetching(true);
        const token = await getIdToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/plan/${id}`, {
          headers,
        });

        const data = (await response.json()) as { plan?: DetailedPlan; error?: string };

        if (!response.ok) {
          if (response.status === 402 || response.status === 403) {
            throw new Error(data.error || "Payment required to unlock this personalized plan.");
          }
          throw new Error(data.error || "Unable to retrieve your plan.");
        }

        if (isMounted) {
          setPlan(data.plan ?? null);
          setFetching(false);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load plan");
          setFetching(false);
        }
      }
    }

    void loadPlan();

    return () => {
      isMounted = false;
    };
  }, [id, loading, getIdToken]);

  if (fetching) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-3/4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !plan) {
    return (
      <div className="max-w-md mx-auto py-12 text-center animate-fade-in">
        <Card className="p-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-ink dark:text-white">
            Plan Access Locked
          </h2>
          <p className="text-sm text-ink-muted dark:text-surface-300 leading-relaxed">
            {errorMessage ?? "Complete payment to unlock your detailed meal and workout routine."}
          </p>
          <div className="pt-4">
            <Button href={`/checkout/${id}`} size="lg" fullWidth className="shadow-float">
              Go to Checkout - {APP_CONFIG.pricing.formatted}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <PlanView plan={plan} />
    </div>
  );
}
