import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy · BMYFIT",
  description: "How BMYFIT collects, protects, and handles your fitness measurements and assessment data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Legal
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                Privacy Policy
              </h1>
              <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
                Last updated: October 2026
              </p>
            </div>

            <div className="space-y-4 text-sm text-ink-muted dark:text-surface-300 leading-relaxed border-t border-surface-200 dark:border-surface-800 pt-6">
              <h3 className="text-base font-bold text-ink dark:text-white">1. Information We Collect</h3>
              <p>
                BMYFIT is architected to collect only the minimum data required to calculate your body composition:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Physical metrics: Gender, age, height, weight, waist, neck, and hip circumferences.</li>
                <li>Fitness preferences: Selected fitness goal, activity level, and diet preference.</li>
                <li>Device &amp; session tokens: Anonymous Firebase authentication identifiers.</li>
                <li>Payment transaction identifiers: Razorpay Order ID and Payment ID (we never store card numbers or UPI MPINs).</li>
              </ul>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">2. How We Use Your Data</h3>
              <p>
                Your measurements are used solely to calculate your Body Mass Index (BMI), calculate Estimated Body Fat % via the US Navy method, and generate your customized 7-day Indian meal plan and workout schedule. We never sell or share your individual measurements with third-party advertisers.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">3. Payment Information</h3>
              <p>
                All financial transactions are processed securely through Razorpay, a PCI-DSS certified payment aggregator in India. Payment credentials (card numbers, UPI IDs, netbanking passwords) are handled directly by Razorpay on encrypted connections.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">4. Data Storage &amp; Security</h3>
              <p>
                Assessment and plan records are stored in Google Cloud Firestore with strict security rules ensuring that only authenticated owners can read their own documents.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">5. Data Deletion Requests</h3>
              <p>
                You may request complete deletion of your assessment records and data at any time by emailing our data privacy desk at{" "}
                <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
                  {APP_CONFIG.supportEmail}
                </a>
                .
              </p>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
