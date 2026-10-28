import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Coach Naveen & BMYFIT | Evidence-Based Indian Fitness",
  description:
    "Learn about Coach Naveen, Certified Fitness Coach & Sports Nutritionist, Blaze Gym founder, and BMYFIT's mission to make elite fitness guidance accessible to every Indian for ₹99.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Coach Naveen & BMYFIT | Evidence-Based Indian Fitness",
    description:
      "7+ years experience helping 1,000+ Indian adults transform their bodies sustainably through evidence-based nutrition and practical training.",
    url: "https://bmyfit.in/about",
    images: [
      {
        url: "/images/coach-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "Coach Naveen - BMYFIT Head Coach",
      },
    ],
  },
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
          {/* Leadership & Head Coach: Coach Naveen */}
          <Card className="overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-white via-surface-50 to-emerald-950/5 dark:from-surface-900 dark:via-surface-950 dark:to-emerald-950/20 p-8 sm:p-10 shadow-lg space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-4 ring-emerald-500/30 shadow-xl bg-surface-900">
                  <img
                    src="/images/coach-naveen.jpg"
                    alt="Coach Naveen - Blaze Gym Owner & Head Coach"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                  <span className="block w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              </div>
              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>●</span> Blaze Gym Owner &amp; Head Coach
                </div>
                <h2 className="text-2xl font-black text-ink dark:text-white">
                  Meet Coach Naveen
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Certified Fitness Coach &amp; Sports Nutritionist · Multi-Gym Founder
                </p>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-surface-300 leading-relaxed">
                  &ldquo;Sustainable fitness isn&apos;t about starving or spending hours in the gym. It&apos;s about scientifically aligning your authentic Indian diet, structured progressive overload, and consistent daily habits.&rdquo;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
              <div className="rounded-xl bg-surface-100/70 dark:bg-surface-900/60 p-3 text-center">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">10+ Yrs</p>
                <p className="text-[11px] text-ink-muted dark:text-surface-400">Coaching Experience</p>
              </div>
              <div className="rounded-xl bg-surface-100/70 dark:bg-surface-900/60 p-3 text-center">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">Blaze Gym</p>
                <p className="text-[11px] text-ink-muted dark:text-surface-400">Multi-Gym Owner</p>
              </div>
              <div className="rounded-xl bg-surface-100/70 dark:bg-surface-900/60 p-3 text-center">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">15,000+</p>
                <p className="text-[11px] text-ink-muted dark:text-surface-400">Transformed Lives</p>
              </div>
              <div className="rounded-xl bg-surface-100/70 dark:bg-surface-900/60 p-3 text-center">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">ISSA / ACSM</p>
                <p className="text-[11px] text-ink-muted dark:text-surface-400">Certified Nutrition</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
