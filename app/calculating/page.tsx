import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CalculatingClient } from "@/components/funnel/calculating-client";

export const metadata: Metadata = {
  title: "Analysing your body metrics · BMYFIT",
  description: "Calculating your clinical BMI, estimated body fat %, and preparing personalized plan recommendations.",
  robots: { index: false, follow: false },
};

export default function CalculatingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CalculatingClient />
    </Suspense>
  );
}
