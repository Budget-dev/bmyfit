import React from "react";
import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { DetailsForm } from "@/components/funnel/details-form";

export const metadata: Metadata = {
  title: "Step 1: Your Body Details · BMYFIT",
  description: "Enter your physical measurements for accurate BMI and US Navy Body Fat % estimates.",
};

export default function DetailsPage() {
  return (
    <FunnelShell
      currentStep={1}
      title="Enter Your Measurements"
      subtitle="Step 1 of 3 · Accurate measurements ensure precision in your body fat % estimate."
    >
      <DetailsForm />
    </FunnelShell>
  );
}
