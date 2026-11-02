import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactFormClient } from "@/components/contact/contact-form-client";

export const metadata: Metadata = {
  title: "Public Contact Details & Customer Support · BMYFIT",
  description:
    "Official public merchant contact details, support desk, Bengaluru operating address, Razorpay payment verification, and direct Coach Naveen WhatsApp helpline.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-gray-900 selection:bg-emerald-500 selection:text-white">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header Banner */}
          <div className="text-center sm:text-left mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Public Contact Details &amp; Merchant Support</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Customer Support &amp; Public Merchant Desk
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
              Have questions regarding your ₹99 transformation plan, payment status, meal calibrations, or
              need official merchant assistance? Our support team and Head Coach Naveen are here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Official Public Merchant Details & WhatsApp (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Official Public Merchant Credentials (Razorpay & IT Act Compliance) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      🏛️
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-950">
                        Public Merchant &amp; Business Details
                      </h2>
                      <p className="text-xs text-gray-500">
                        Official regulatory disclosure under Consumer Protection (E-Commerce) Rules, 2020
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    Verified Merchant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Legal Business Name
                    </span>
                    <p className="font-extrabold text-sm text-gray-950">
                      BMYFIT Health Technologies
                    </p>
                    <p className="text-gray-500 text-[11px]">Sole Proprietor: Coach Naveen</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Authorized Payment Partner
                    </span>
                    <p className="font-extrabold text-sm text-gray-950">
                      Razorpay Software Pvt. Ltd.
                    </p>
                    <p className="text-emerald-700 font-medium text-[11px]">UPI &bull; NetBanking &bull; Cards</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Customer Support Email
                    </span>
                    <p className="font-extrabold text-sm text-emerald-700">
                      <a href="mailto:support@bmyfit.in" className="hover:underline">
                        support@bmyfit.in
                      </a>
                    </p>
                    <p className="text-gray-500 text-[11px]">SLA: 2–6 business hours</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Customer Helpline &amp; WhatsApp
                    </span>
                    <p className="font-extrabold text-sm text-gray-950">
                      <a href="tel:+919849012345" className="hover:underline text-emerald-700">
                        +91 98490 12345
                      </a>
                    </p>
                    <p className="text-gray-500 text-[11px]">Mon–Sat: 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>

                {/* Operating Address */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-950 font-bold">
                    <span>📍</span>
                    <span>Operational &amp; Physical Address</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>BMYFIT Health Technologies</strong><br />
                    #42, 2nd Cross, 5th Main, 100 Feet Ring Road,<br />
                    BTM Layout 2nd Stage, Bengaluru, Karnataka, 560076, India.
                  </p>
                </div>

                {/* Grievance Officer */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Grievance Redressal Officer (DPDP Act &amp; IT Act)
                  </span>
                  <p className="text-slate-900 font-bold">Officer: Mr. Naveen / Customer Grievance Desk</p>
                  <p className="text-slate-600">
                    Direct Email:{" "}
                    <a href="mailto:grievance@bmyfit.in" className="text-emerald-700 font-bold hover:underline">
                      grievance@bmyfit.in
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Grievances acknowledged within 48 hours and redressed within 30 days as prescribed by law.
                  </p>
                </div>
              </div>

              {/* Card 2: Razorpay Payment Verification Quick Desk */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4 text-left">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    💳
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Razorpay Payment Assistance Desk
                    </h2>
                    <p className="text-xs text-gray-500">
                      Was ₹99 debited but your plan dashboard did not unlock immediately?
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                  <p>
                    Our payment listener automatically verifies transactions via webhook. In rare cases of bank network
                    delay or slow UPI confirmation:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                    <li>Allow 2–3 minutes for your bank&rsquo;s UPI switch to transmit confirmation to Razorpay.</li>
                    <li>Refresh your plan page at <Link href="/plan" className="text-emerald-700 font-bold underline">https://bmyfit.in/plan</Link>.</li>
                    <li>
                      If your plan remains locked, send your <strong>Razorpay Payment ID</strong> (starts with <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">pay_...</code>) or your bank&rsquo;s 12-digit <strong>UPI UTR Number</strong> to{" "}
                      <a href="mailto:support@bmyfit.in" className="text-emerald-700 font-bold hover:underline">support@bmyfit.in</a> or message us on WhatsApp. We will manually unlock your plan within 30 minutes.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Card 3: WhatsApp 1-on-1 Hotline with Coach Naveen */}
              <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-3xl p-6 sm:p-8 text-white shadow-md space-y-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
                      💬
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white">
                        Direct 1-on-1 Coach WhatsApp Helpline
                      </h2>
                      <p className="text-xs text-emerald-100 font-medium">
                        Head Coach Naveen · Bengaluru Blaze Fitness Hub
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#25D366] text-black px-2.5 py-1 rounded-full shrink-0">
                    ONLINE NOW
                  </span>
                </div>

                <p className="text-xs text-emerald-50 leading-relaxed">
                  Have questions before unlocking your plan? Ask about diet substitutions, home workout
                  adaptations, or verify your body fat calculation directly with Coach Naveen.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://wa.me/919849012345?text=Namaste%20Coach%20Naveen!%20I%20have%20a%20question%20about%20my%20BMYFIT%20assessment."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
                  >
                    <span>Open in WhatsApp</span>
                    <span>↗</span>
                  </a>
                  <span className="text-[11px] text-emerald-200">
                    Official Mobile / WhatsApp: +91 98490 12345
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Support Ticket Form & FAQ (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Interactive Contact Form (Client Component) */}
              <ContactFormClient />

              {/* Quick FAQ Helper Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4 text-left">
                <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                  <span>❓</span>
                  <span>Frequently Asked Questions</span>
                </h3>

                <div className="space-y-3 text-xs text-gray-600">
                  <div className="space-y-1 pb-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900">How soon do I receive my plan after paying ₹99?</p>
                    <p className="text-gray-500">
                      Instantly! Once payment is complete, your dashboard unlocks immediately with your personalized workout and nutrition schedule.
                    </p>
                  </div>

                  <div className="space-y-1 pb-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900">Can I request vegetarian or egg-based diet swaps?</p>
                    <p className="text-gray-500">
                      Yes. The BMYFIT plan includes dedicated vegetarian, eggetarian, and non-vegetarian Indian food options with equivalent protein calibrations.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">How do I request a refund if I was charged twice?</p>
                    <p className="text-gray-500">
                      Simply email <a href="mailto:support@bmyfit.in" className="text-emerald-700 underline font-semibold">support@bmyfit.in</a> with both payment IDs. Any duplicate debit is refunded within 5–7 business days to your original payment method.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/faq"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Read all FAQs</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
