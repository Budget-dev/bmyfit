import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BodyDetailsClient } from "@/components/funnel/body-details-client";

export const metadata: Metadata = {
  title: "Body Measurements · Step 2 · BMYFIT",
  description: "Enter waist and neck circumference for precise US Navy body fat estimation.",
};

export default function DetailsStep2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BodyDetailsClient initialStep={2} />
    </Suspense>
  );
}
