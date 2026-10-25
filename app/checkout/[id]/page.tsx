import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutClient } from "@/components/funnel/checkout-client";

export const metadata: Metadata = {
  title: "Unlock Your Plan · BMYFIT",
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
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <CheckoutClient assessmentId={id} />
    </Suspense>
  );
}
