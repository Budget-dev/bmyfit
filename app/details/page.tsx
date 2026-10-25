import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BodyDetailsClient } from "@/components/funnel/body-details-client";

export const metadata: Metadata = {
  title: "Body Details · BMYFIT",
  description: "Enter your physical measurements for accurate BMI and US Navy Body Fat % estimates.",
};

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BodyDetailsClient />
    </Suspense>
  );
}
