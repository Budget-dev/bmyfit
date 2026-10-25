import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PlanClient } from "@/components/funnel/plan-client";

export const metadata: Metadata = {
  title: "Your Personalized Plan · BMYFIT",
  description: "Personalized Indian meal plan and targeted workout schedule.",
  robots: { index: false, follow: false },
};

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <PlanClient id={id} />
    </Suspense>
  );
}
