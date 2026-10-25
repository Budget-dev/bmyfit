import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us · BMYFIT",
  description: "Learn more about BMYFIT, our mission to bring science-backed, accessible fitness and body composition tools to Indian adults.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl space-y-8">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Our Story &amp; Mission
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                About {APP_CONFIG.brandName}
              </h1>
              <p className="text-sm text-ink-muted dark:text-surface-400 mt-1">
                {APP_CONFIG.tagline}
              </p>
            </div>

            <div className="space-y-4 text-sm text-ink-muted dark:text-surface-300 leading-relaxed border-t border-surface-200 dark:border-surface-800 pt-6">
              <h3 className="text-base font-bold text-ink dark:text-white">Our Mission</h3>
              <p>
                {APP_CONFIG.description} Most fitness programs in India are either expensive personal training packages or generic generic charts that ignore South Asian body compositions. We built {APP_CONFIG.brandName} to democratize science-backed fitness insights at an affordable, one-time price of just {APP_CONFIG.pricing.formatted}.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">Why Body Fat % &amp; BMI Matter</h3>
              <p>
                Standard BMI scales often fail to differentiate between lean muscle mass and visceral fat. By combining standard Clinical BMI with the established US Navy Body Circumference method, {APP_CONFIG.brandName} provides a clearer picture of your body fat percentage and true metabolic health.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">Personalized For Indian Diets</h3>
              <p>
                Whether you follow a traditional Indian Vegetarian diet, Eggetarian, Vegan, or Non-Vegetarian lifestyle, our tailored nutrition recommendations match authentic Indian meal choices while hitting ideal macronutrient ratios.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">Privacy-First Architecture</h3>
              <p>
                We believe your health metrics belong to you. We do not sell your personal data, spam your inbox, or lock your metrics behind recurring monthly subscriptions.
              </p>
            </div>

            <div className="pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">Ready to know your body?</p>
                <p className="text-xs text-ink-muted dark:text-surface-400">Take the 2-minute quick assessment.</p>
              </div>
              <Button href="/details" className="w-full sm:w-auto">
                Start Your Assessment
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
