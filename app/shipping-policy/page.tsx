import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy · BMYFIT",
  description: "Shipping and digital fulfillment terms for BMYFIT assessments and plans.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Fulfillment &amp; Delivery
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                Shipping &amp; Delivery Policy
              </h1>
              <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
                Last updated: October 2026
              </p>
            </div>

            <div className="space-y-4 text-sm text-ink-muted dark:text-surface-300 leading-relaxed border-t border-surface-200 dark:border-surface-800 pt-6">
              <h3 className="text-base font-bold text-ink dark:text-white">1. Nature of Service &amp; Delivery Method</h3>
              <p>
                BMYFIT provides 100% digital goods and algorithmic health assessment reports. We do not dispatch any physical merchandise, apparel, supplements, or paper reports to physical addresses.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">2. Delivery Timeframe</h3>
              <p>
                Access to your personalized fitness and nutrition plan is provided <strong>instantly (within seconds)</strong> upon real-time payment confirmation via our payment gateway partner (Razorpay). You will be automatically redirected to your customized plan dashboard.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">3. Shipping Fees</h3>
              <p>
                Because all deliverables are digital and made available online, there are absolutely <strong>zero shipping, handling, or delivery charges</strong>. The price quoted on the checkout screen ({APP_CONFIG.pricing.formatted}) is all-inclusive.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">4. Technical Delays or Undelivered Access</h3>
              <p>
                In the rare event of network interruption during payment checkout, please wait 2–5 minutes for background synchronization. If access does not unlock automatically, email us at{" "}
                <a
                  href={`mailto:${APP_CONFIG.supportEmail}`}
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
                >
                  {APP_CONFIG.supportEmail}
                </a>{" "}
                with your Razorpay payment ID or UPI transaction reference, and our customer support team will manually verify and activate your plan within 4 to 24 business hours.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
