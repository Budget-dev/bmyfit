import React from "react";
import Link from "next/link";
import { BmyFitLogo } from "./logo";
import { ProgressStepper } from "./progress-stepper";

export interface FunnelShellProps {
  currentStep?: 1 | 2 | 3;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function FunnelShell({
  currentStep,
  title,
  subtitle,
  children,
  maxWidthClass = "w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto",
}: FunnelShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-ink dark:text-white transition-colors relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-surface-200/80 dark:border-surface-800/80 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <BmyFitLogo />
          {currentStep && (
            <div className="hidden sm:block flex-1 max-w-xs mx-8">
              <ProgressStepper currentStep={currentStep} />
            </div>
          )}
          <Link
            href="/"
            className="text-xs font-semibold text-ink-muted dark:text-surface-400 hover:text-ink dark:hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            Exit Funnel
          </Link>
        </div>
        {/* Mobile Stepper bar */}
        {currentStep && (
          <div className="sm:hidden px-4 pb-3 pt-1 border-t border-surface-100 dark:border-surface-900">
            <ProgressStepper currentStep={currentStep} />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start py-6 sm:py-10 md:py-12 px-4 sm:px-6 relative">
        <div className={maxWidthClass}>
          {(title || subtitle) && (
            <div className="text-center mb-6 sm:mb-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-ink dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-sm md:text-base text-ink-muted dark:text-surface-400 leading-relaxed max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Clean Bottom Note */}
      <footer className="py-6 text-center text-xs text-ink-muted dark:text-surface-500 border-t border-surface-200/60 dark:border-surface-800/60">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Private &amp; Anonymous · No account wall · Secured with Razorpay</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:underline hover:text-emerald-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:underline hover:text-emerald-600 transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="hover:underline hover:text-emerald-600 transition-colors">Refunds</Link>
            <Link href="/shipping-policy" className="hover:underline hover:text-emerald-600 transition-colors">Delivery</Link>
            <Link href="/contact" className="hover:underline hover:text-emerald-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
