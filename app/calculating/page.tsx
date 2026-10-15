import React from "react";
import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { CalculatingClient } from "@/components/funnel/calculating-client";

export const metadata: Metadata = {
  title: "Processing Assessment · BMYFIT",
  description: "Calculating your BMI and Estimated Body Fat %...",
  robots: { index: false, follow: false },
};

export default function CalculatingPage() {
  return (
    <FunnelShell currentStep={3}>
      <CalculatingClient />
    </FunnelShell>
  );
}
