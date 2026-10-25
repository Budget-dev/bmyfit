import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Hero } from "@/components/home/hero";
import { BodyCalculator } from "@/components/home/body-calculator";
import { CoachSection } from "@/components/home/coach-section";
import { TransformationGuide } from "@/components/home/transformation-guide";

import { SiteFooter } from "@/components/layout/site-footer";

export const metadata = {
  title: "BMYFIT · Know your Body | Transform your Body",
  description:
    "Free clinical BMI & US Navy Body Fat % calculator for Indian adults. Get an actionable 7-day Indian meal plan and personalized workout split for just Rs. 99.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff] text-gray-900 transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Site Header: Brand Logo, Desktop Nav & Notifications */}
      <SiteHeader />

      {/* Main Content Area: Responsive container across mobile and desktop */}
      <main className="flex-1 pb-16 md:pb-12 max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto w-full px-0 sm:px-3 md:px-6">
        {/* 
          First Appearance / Initial Screen Fold:
          Guarantees that on mobile, the initial viewport shows cleanly from top down to "Meet Your Coach"
          while allowing desktop screens to breathe naturally.
        */}
        <div className="flex flex-col min-h-[calc(100svh-2.75rem-3.5rem)] min-h-[calc(100dvh-2.75rem-3.5rem)] md:min-h-0 md:space-y-4">
          {/* 1. Hero Section with Athletic Model */}
          <Hero />

          {/* 2. Interactive Body Calculator with Circular BMI Gauge */}
          <BodyCalculator className="flex-1" />

          {/* 3. Meet Your Coach Section */}
          <div className="w-full shrink-0 pb-0.5 sm:pb-1 md:pb-2">
            <CoachSection />
          </div>
        </div>

        {/* 4. Transformation Guide & Educational Modules */}
        <div className="w-full pt-3 sm:pt-4 md:pt-6">
          <TransformationGuide />
        </div>
      </main>

      {/* Complete Site Footer (Visible on desktop and mobile) */}
      <SiteFooter />

      {/* Sleek Fixed Bottom Mobile Navigation Bar (hidden on desktop via md:hidden) */}
      <BottomNav />
    </div>
  );
}
