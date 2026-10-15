import React from "react";
import Link from "next/link";
import { BmyFitLogo } from "./logo";
import { ProgressStepper } from "./progress-stepper";

export interface FunnelShellProps {
  currentStep?: 1 | 2 | 3;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FunnelShell({
  currentStep,
  title,
  subtitle,
  children,
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
      <main className="flex-1 flex flex-col justify-start py-8 sm:py-12 px-4 sm:px-6 relative">
        <div className="w-full max-w-xl mx-auto">
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-sm text-ink-muted dark:text-surface-400 leading-relaxed">
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
        <div className="container">
          <span>Private &amp; Anonymous · No account wall · Secured with Razorpay</span>
        </div>
      </footer>
    </div>
  );
}
