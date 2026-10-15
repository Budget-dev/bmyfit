import React from "react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Background radial gradient glow (ElevenLabs style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20 glow-mesh -z-10" />

      <div className="container relative text-center max-w-4xl">
        {/* Subtle pill pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 backdrop-blur-sm mb-6 animate-fade-in shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>India&apos;s #1 Body Composition &amp; Plan Engine</span>
        </div>

        {/* Wordmark and Tagline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-ink dark:text-white leading-[1.08]">
          Know your Body.
          <br />
          <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Transform your Body.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-ink-muted dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
          Calculate your clinical BMI and Estimated Body Fat % in 60 seconds. Unlock your complete 7-day Indian meal plan and workout routine for just <strong className="text-ink dark:text-white font-bold">Rs. 99</strong>.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/details" size="lg" className="w-full sm:w-auto text-base px-8 shadow-float">
            Start Free Assessment
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted dark:text-surface-400">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free basic result · Detailed plan {APP_CONFIG.pricing.formatted}</span>
          </div>
        </div>

        {/* Trust metrics bar */}
        <div className="mt-16 pt-10 border-t border-surface-200/80 dark:border-surface-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ink dark:text-white">60s</div>
            <div className="text-xs text-ink-muted dark:text-surface-400 mt-1">Instant Assessment</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">US Navy</div>
            <div className="text-xs text-ink-muted dark:text-surface-400 mt-1">Validated Body Fat Formula</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ink dark:text-white">100%</div>
            <div className="text-xs text-ink-muted dark:text-surface-400 mt-1">Indian Food Ingredients</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">Rs. 99</div>
            <div className="text-xs text-ink-muted dark:text-surface-400 mt-1">One-time (No subscription)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
