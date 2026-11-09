import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CalculatorsHub } from "@/components/calculator/calculators-hub";

export const metadata: Metadata = {
  title: "Health & Fitness Calculators Suite (22 Clinical & Athletic Tools) | BMYFIT",
  description:
    "Explore 22 clinical anthropometric, fitness, and nutritional calculators calibrated for South Asian genetics: Ideal Weight, Pace, Army Body Fat, Lean Body Mass, One Rep Max, Macros, GFR, and more.",
  alternates: {
    canonical: "/calculators",
  },
  openGraph: {
    title: "Health & Fitness Calculators Suite | BMYFIT",
    description:
      "22 free clinical anthropometric, fitness, and nutritional calculators: Ideal Weight, Pace, Army Body Fat, Lean Body Mass, 1RM, Macros, GFR, and more.",
    url: "https://bmyfit.in/calculators",
    siteName: "BMYFIT",
    locale: "en_IN",
    type: "website",
  },
};

export default function CalculatorsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fcfdfd] text-gray-900 transition-colors selection:bg-[#00e676] selection:text-black">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <CalculatorsHub />
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  );
}
