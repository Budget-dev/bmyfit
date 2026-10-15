import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy · BMYFIT",
  description: "Refund terms, cancellation policy, and turnaround times for BMYFIT plan purchases.",
};

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Payment Compliance
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                Refund &amp; Cancellation Policy
              </h1>
              <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
                Last updated: October 2026
              </p>
            </div>

            <div className="space-y-4 text-sm text-ink-muted dark:text-surface-300 leading-relaxed border-t border-surface-200 dark:border-surface-800 pt-6">
              <h3 className="text-base font-bold text-ink dark:text-white">1. Digital Nature of Goods</h3>
              <p>
                BMYFIT delivers digital personalized fitness assessments and nutrition plans instantly upon successful payment verification. Because the digital service is immediately unlocked and consumable, standard returns of physical merchandise do not apply.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">2. Failed Delivery / Technical Discrepancies</h3>
              <p>
                If your payment was debited via UPI, Card, NetBanking, or Wallet, but you were unable to view or access your detailed plan due to a technical error, please reach out to us within <strong>7 days</strong> with your payment reference (Razorpay Payment ID / UTR number).
              </p>
              <p>
                Upon verification with Razorpay logs, if the service was indeed undelivered, we will immediately grant manual access or initiate a 100% full refund.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">3. Refund Processing Timeline</h3>
              <p>
                Once approved, refunds are credited back to the original payment source (same UPI account or card) within <strong>5 to 7 business days</strong>, in accordance with standard Indian banking and Razorpay settlement cycles.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">4. Contact for Refund Requests</h3>
              <p>
                To request assistance or report an undelivered transaction, email us at{" "}
                <a
                  href={`mailto:${APP_CONFIG.supportEmail}`}
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
                >
                  {APP_CONFIG.supportEmail}
                </a>{" "}
                with the subject line <code className="bg-surface-200 dark:bg-surface-800 px-1 py-0.5 rounded text-xs">Refund Request: [Your Order ID]</code>.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
