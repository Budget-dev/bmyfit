import React from "react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-surface-50 dark:bg-surface-900/60 relative overflow-hidden">
      <div className="container">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 sm:p-14 text-white shadow-2xl overflow-hidden border border-emerald-500/20">
          {/* Subtle glow highlight */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
              Instant Assessment
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start with your numbers.
              <br />
              <span className="text-emerald-300">Leave with a realistic routine.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Takes just 60 seconds. Know your Body Mass Index and US Navy Body Fat % instantly. Unlock your complete personalized Indian plan for just {APP_CONFIG.pricing.formatted}.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                href="/details"
                size="lg"
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold shadow-glow"
              >
                Start My Free Assessment
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
              <span className="text-xs text-slate-400 text-center sm:text-left">
                No credit card needed to calculate BMI &amp; Body Fat
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
