import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BodyDetailsClient } from "@/components/funnel/body-details-client";

export const metadata: Metadata = {
  title: "Clinical Body Composition Assessment | BMI & Body Fat Calculator",
  description:
    "Calculate your clinical BMI, US Navy body fat percentage, BMR, and daily caloric targets tailored specifically for Indian body types.",
  alternates: {
    canonical: "/details",
  },
  openGraph: {
    title: "Clinical Body Composition Assessment | BMI & Body Fat Calculator",
    description:
      "Calculate your clinical BMI, US Navy body fat percentage, BMR, and daily caloric targets tailored specifically for Indian body types.",
    url: "https://bmyfit.in/details",
    images: [
      {
        url: "/images/guide-waist-measurement.jpg",
        width: 1200,
        height: 630,
        alt: "BMYFIT Clinical Assessment",
      },
    ],
  },
};

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BodyDetailsClient />
    </Suspense>
  );
}
