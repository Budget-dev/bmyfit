import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) · BMYFIT",
  description: "Find answers to commonly asked questions about BMYFIT body composition calculations, personalized plans, and delivery.",
};

const FAQS = [
  {
    q: "How does BMYFIT calculate my Body Fat Percentage?",
    a: "We use the proven US Navy Circumference Method, which calculates estimated body fat percentage using your gender, height, waist circumference, neck circumference, and hip circumference (for women). It is clinically recognized as one of the most reliable non-invasive circumference methods.",
  },
  {
    q: "Why is BMYFIT priced at only ₹99?",
    a: "We believe actionable health insights shouldn't require ₹5,000/month subscriptions. For a one-time ₹99, you get instant access to your clinical BMI, body fat percentage, calorie breakdown, customized Indian meal structure, and recommended workout routine.",
  },
  {
    q: "How will I receive my personalized fitness & diet plan?",
    a: "Immediately upon successful completion of payment via Razorpay, your complete customized plan unlocks on screen. You can bookmark the private URL, review it anytime, or print/save it as a PDF.",
  },
  {
    q: "Do you accommodate Indian vegetarian diets?",
    a: "Yes! Our nutrition plans are specially crafted for Indian eating habits, offering detailed macro-balanced options for Vegetarian, Non-Vegetarian, Eggetarian, and Vegan preferences.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support all major Indian payment methods through Razorpay, including UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, Net Banking, and popular Wallets.",
  },
  {
    q: "What if my payment went through but my plan didn't unlock?",
    a: "Don't worry! In rare cases of network delays, our webhook syncs the transaction within a couple of minutes. If it doesn't update, email support@bmyfit.in with your payment ID and our team will unlock it manually right away.",
  },
  {
    q: "Is BMYFIT considered medical advice?",
    a: "No. BMYFIT provides educational and lifestyle fitness estimations based on standard anthropometric formulas. It is not intended to diagnose, treat, or cure medical conditions. Always consult a healthcare professional before making major changes to your diet or exercise routine.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl space-y-8">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Help &amp; Answers
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                Frequently Asked Questions
              </h1>
              <p className="text-sm text-ink-muted dark:text-surface-400 mt-1">
                Everything you need to know about BMYFIT assessments, plans, and delivery.
              </p>
            </div>

            <div className="space-y-6 border-t border-surface-200 dark:border-surface-800 pt-6">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-bold text-ink dark:text-white flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">Q.</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-ink-muted dark:text-surface-300 pl-6 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">Still have questions?</p>
                <p className="text-xs text-ink-muted dark:text-surface-400">
                  Reach out to us at{" "}
                  <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-emerald-600 dark:text-emerald-400 underline">
                    {APP_CONFIG.supportEmail}
                  </a>
                </p>
              </div>
              <Button href="/details" className="w-full sm:w-auto">
                Calculate My Plan
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
