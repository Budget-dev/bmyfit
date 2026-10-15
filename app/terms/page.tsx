import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms and Conditions · BMYFIT",
  description: "Terms of service, digital license, and medical disclaimer for BMYFIT.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Agreement
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                Terms &amp; Conditions
              </h1>
              <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
                Last updated: October 2026
              </p>
            </div>

            <div className="space-y-4 text-sm text-ink-muted dark:text-surface-300 leading-relaxed border-t border-surface-200 dark:border-surface-800 pt-6">
              <h3 className="text-base font-bold text-ink dark:text-white">1. Service Description</h3>
              <p>
                BMYFIT provides algorithmic body composition estimates (BMI and US Navy Body Fat %) and generates personalized digital fitness and nutrition recommendations based on user-submitted measurements.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">2. Medical &amp; Health Disclaimer</h3>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 font-medium">
                <strong className="block text-sm font-bold mb-1">Non-Medical Advisory:</strong>
                {APP_CONFIG.medicalDisclaimer}
              </div>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">3. Digital Purchase License</h3>
              <p>
                Upon payment of the one-time fee of {APP_CONFIG.pricing.formatted}, you are granted a personal, non-exclusive, non-transferable license to view, use, and download your personalized fitness and nutrition plan.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">4. User Age Requirement</h3>
              <p>
                BMYFIT is intended exclusively for adults aged 18 years and above. If you are under 18, please consult with your parent, guardian, or healthcare provider before following any nutritional or exercise adjustments.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">5. Governing Law</h3>
              <p>
                These terms are governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
