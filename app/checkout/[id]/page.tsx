import React from "react";
import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { CheckoutClient } from "@/components/funnel/checkout-client";

export const metadata: Metadata = {
  title: "Unlock Detailed Plan · BMYFIT",
  description: "Secure payment checkout via Razorpay to unlock your personalized meal & workout plan.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FunnelShell
      title="Unlock Your Detailed Plan"
      subtitle="Complete your one-time payment of Rs. 99 to instantly unlock your 7-day Indian meal plan and workout schedule."
    >
      <CheckoutClient assessmentId={id} />
    </FunnelShell>
  );
}
