import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Hero } from "@/components/home/hero";
import { BodyCalculator } from "@/components/home/body-calculator";
import { CoachSection } from "@/components/home/coach-section";
import { TransformationGuide } from "@/components/home/transformation-guide";
import { DesktopHomeView } from "@/components/home/desktop-home-view";
import { SiteFooter } from "@/components/layout/site-footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMYFIT — Train Smart. Get Results. Feel Unstoppable.",
  description:
    "India's #1 personalized fitness and nutrition platform for Indian bodies. Calibrated workout and diet plans by Coach Naveen for just ₹99.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BMYFIT — Train Smart. Get Results. Feel Unstoppable.",
    description:
      "India's #1 personalized fitness and nutrition platform for Indian bodies. Calibrated workout and diet plans by Coach Naveen for just ₹99.",
    url: "https://bmyfit.in",
    siteName: "BMYFIT",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/plan-triple-screens.jpg",
        width: 1200,
        height: 630,
        alt: "BMYFIT - Train Smart. Get Results. Feel Unstoppable.",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff] text-gray-900 transition-colors selection:bg-[#00e676] selection:text-black">
      {/* Site Header: Brand Logo, Desktop Nav & Notifications */}
      <SiteHeader />

      {/* Desktop Version: Follows exact desktop reference image (Dark athletic gym theme, multi-column sections, ₹99 single plan) */}
      <div className="hidden md:block w-full">
        <DesktopHomeView />
      </div>

      {/* Mobile Version: Strictly preserved without alteration */}
      <main className="md:hidden flex-1 pb-16 max-w-xl mx-auto w-full px-0 sm:px-3">
        <div className="flex flex-col min-h-[calc(100svh-2.75rem-3.5rem)] min-h-[calc(100dvh-2.75rem-3.5rem)]">
          {/* 1. Hero Section with Athletic Model */}
          <Hero />

          {/* 2. Interactive Body Calculator with Circular BMI Gauge */}
          <BodyCalculator className="flex-1" />

          {/* 3. Meet Your Coach Section */}
          <div className="w-full shrink-0 pb-0.5 sm:pb-1">
            <CoachSection />
          </div>
        </div>

        {/* 4. Transformation Guide & Educational Modules */}
        <div className="w-full pt-3 sm:pt-4">
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
