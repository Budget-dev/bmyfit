import React from "react";
import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { GoalPicker } from "@/components/funnel/goal-picker";

export const metadata: Metadata = {
  title: "Step 2: Choose Your Fitness Goal · BMYFIT",
  description: "Select your primary transformation goal: Fat Loss, Weight Loss, Muscle Gain, or Weight Gain.",
};

export default function GoalPage() {
  return (
    <FunnelShell
      currentStep={2}
      title="Choose Your Fitness Goal"
      subtitle="Step 2 of 3 · Your meal calorie targets and workout split adapt to your chosen focus."
    >
      <GoalPicker />
    </FunnelShell>
  );
}
