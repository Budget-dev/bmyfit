import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ResultClient } from "@/components/funnel/result-client";

export const metadata: Metadata = {
  title: "Your Body Snapshot · BMYFIT",
  description: "View your BMI, Estimated Body Fat %, and personalized plan.",
  robots: { index: false, follow: false },
};

export default function ResultIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResultClient id="local" />
    </Suspense>
  );
}
