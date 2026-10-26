import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthCard } from "@/components/auth/auth-card";
import { BmyFitLogo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Create Account · BMYFIT",
  description: "Create your BMYFIT account with your phone, age, email and password for personalized fitness and nutrition plans.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#071811] text-white flex flex-col justify-between selection:bg-[#00e676] selection:text-black relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-1/4 w-[550px] h-[550px] bg-gradient-to-bl from-[#00e676]/15 via-emerald-600/10 to-transparent rounded-full blur-[130px] pointer-events-none -translate-y-1/3" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#057a44]/20 via-[#00c853]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="bg-white px-3.5 py-1.5 rounded-2xl shadow-sm">
          <BmyFitLogo />
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-gray-400 hidden sm:inline">Already have an account?</span>
          <Link
            href="/login"
            className="text-[#00e676] hover:text-[#00c853] underline-offset-4 hover:underline transition-colors"
          >
            Sign In →
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Why Join BMYFIT */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 text-left pr-4">
            <div className="inline-flex items-center gap-2 bg-[#00e676]/10 border border-[#00e676]/25 px-3 py-1.5 rounded-full text-[#00e676] text-xs font-bold tracking-wide w-fit">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
              <span>START YOUR JOURNEY</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Science-Backed Body Transformation for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e676] via-emerald-400 to-[#00c853]">Every Indian Lifestyle.</span>
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed">
              Join thousands of busy professionals, parents, and athletes getting tailored South Asian nutrition, calibrated calorie goals, and structured resistance training splits.
            </p>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-2xl font-black text-[#00e676]">15,000+</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Plans Delivered in India</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-2xl font-black text-white">₹99</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Full 8-Week Personalized Plan</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs text-gray-200">
              <div className="flex items-center gap-2.5">
                <span className="text-[#00e676] font-bold">✓</span>
                <span>Direct WhatsApp delivery of your workout &amp; diet plan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#00e676] font-bold">✓</span>
                <span>Calibrated for vegetarian, eggetarian &amp; non-vegetarian diets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#00e676] font-bold">✓</span>
                <span>Continuous coach updates &amp; multi-week progression</span>
              </div>
            </div>

            {/* Coach Naveen Endorsement Badge */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 mt-2">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#00e676]/60 shrink-0 shadow-sm">
                <Image
                  src="/images/coach-naveen.jpg"
                  alt="Coach Naveen"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white">Coach Naveen</p>
                  <span className="text-[9px] bg-emerald-500/20 text-[#00e676] px-1.5 py-0.2 rounded-full font-bold">
                    Blaze Gym Owner
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Every plan is verified by Coach Naveen before active delivery</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Auth Card (Signup mode) */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl bg-white/10 animate-pulse" />}>
              <AuthCard initialMode="signup" />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-4 text-center text-gray-500 text-[11px] border-t border-white/5">
        <p>© {new Date().getFullYear()} BMYFIT Health Technologies India. All rights reserved. 256-Bit SSL Encrypted.</p>
      </footer>
    </div>
  );
}
