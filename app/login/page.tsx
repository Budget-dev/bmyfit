import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { BmyFitLogo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Sign In · BMYFIT",
  description: "Sign in to your BMYFIT dashboard to access your customized 8-week nutrition & workout roadmap.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#071811] text-white flex flex-col justify-between selection:bg-[#00e676] selection:text-black relative overflow-hidden">
      {/* Dynamic Background Mesh Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#00e676]/15 via-emerald-600/10 to-transparent rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-[#057a44]/20 via-[#00c853]/10 to-transparent rounded-full blur-[140px] pointer-events-none translate-y-1/3" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="bg-white px-3.5 py-1.5 rounded-2xl shadow-sm">
          <BmyFitLogo />
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-gray-400 hidden sm:inline">Don&apos;t have an account yet?</span>
          <Link
            href="/signup"
            className="text-[#00e676] hover:text-[#00c853] underline-offset-4 hover:underline transition-colors"
          >
            Create Account →
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Visual Brand & Social Proof (Visible on Desktop lg+) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 text-left pr-4">
            <div className="inline-flex items-center gap-2 bg-[#00e676]/10 border border-[#00e676]/25 px-3 py-1.5 rounded-full text-[#00e676] text-xs font-bold tracking-wide w-fit">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
              <span>BMYFIT CLIENT PORTAL</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome Back to Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e676] via-emerald-400 to-[#00c853]">Transformation.</span>
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed">
              Track your weekly macro targets, access doctor-approved workout splits, and review progress check-ins with your assigned BMYFIT coach.
            </p>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-200 bg-white/[0.04] p-2.5 rounded-2xl border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-[#00e676]/20 text-[#00e676] flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span>Full 8-Week Nutrition &amp; Workout Plan Access</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-200 bg-white/[0.04] p-2.5 rounded-2xl border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-[#00e676]/20 text-[#00e676] flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span>US Navy Clinical Body Composition Updates</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-200 bg-white/[0.04] p-2.5 rounded-2xl border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-[#00e676]/20 text-[#00e676] flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span>Direct WhatsApp Coach Sync &amp; PDF Downloads</span>
              </div>
            </div>

            {/* Coach Quote Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 text-left">
              <p className="text-xs text-gray-300 italic mb-2">
                &ldquo;Consistency over perfection. Every meal and every rep recorded in your plan gets you one step closer to sustainable health.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00e676] text-black font-extrabold flex items-center justify-center text-xs">
                  CB
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">Coach Brijesh</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Head of Clinical Nutrition &amp; Performance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Auth Card */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl bg-white/10 animate-pulse" />}>
              <AuthCard initialMode="signin" />
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
