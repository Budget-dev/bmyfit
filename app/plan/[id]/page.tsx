import React from "react";
import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { PlanClient } from "@/components/funnel/plan-client";

export const metadata: Metadata = {
  title: "Your Detailed Fitness & Nutrition Plan · BMYFIT",
  description: "Personalized 7-day Indian meal plan and targeted workout schedule.",
  robots: { index: false, follow: false },
};

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FunnelShell>
      <PlanClient id={id} />
    </FunnelShell>
  );
}
