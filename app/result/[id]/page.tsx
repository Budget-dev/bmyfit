import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ResultClient } from "@/components/funnel/result-client";

export const metadata: Metadata = {
  title: "Your Body Snapshot · BMYFIT",
  description: "View your BMI, Estimated Body Fat %, and personalized plan.",
  robots: { index: false, follow: false },
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResultClient id={id} />
    </Suspense>
  );
}
