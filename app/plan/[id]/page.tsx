import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
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
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-900 pb-28 sm:pb-32">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
          <PlanClient id={id} />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
