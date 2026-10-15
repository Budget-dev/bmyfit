import React from "react";
import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { ResultClient } from "@/components/funnel/result-client";

export const metadata: Metadata = {
  title: "Your Body Analysis & Results · BMYFIT",
  description: "View your BMI classification and US Navy Body Fat % estimate.",
  robots: { index: false, follow: false },
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FunnelShell
      currentStep={3}
      title="Your Body Composition Results"
      subtitle="Step 3 of 3 · Clinical BMI & Estimated Body Fat % based on your physical measurements."
    >
      <ResultClient id={id} />
    </FunnelShell>
  );
}
