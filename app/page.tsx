import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Benefits } from "@/components/home/benefits";
import { CtaSection } from "@/components/home/cta-section";

export const metadata = {
  title: "BMYFIT · Know your Body | Transform your Body",
  description:
    "Free clinical BMI & US Navy Body Fat % calculator for Indian adults. Get an actionable 7-day Indian meal plan and personalized workout split for just Rs. 99.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950 transition-colors">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Benefits />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
