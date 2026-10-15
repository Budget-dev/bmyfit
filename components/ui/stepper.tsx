import React from "react";

export interface StepperProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

const STEPS = [
  { step: 1, label: "Details" },
  { step: 2, label: "Goal" },
  { step: 3, label: "Result" },
];

export function Stepper({ currentStep, className = "" }: StepperProps) {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-surface-200 dark:bg-surface-800 -z-0" />
        
        {/* Active connector progress */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-300 -z-0"
          style={{
            width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "calc(100% - 48px)",
          }}
        />

        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div key={s.step} className="flex flex-col items-center relative z-10">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60"
                      : "bg-surface-200 dark:bg-surface-800 text-ink-muted dark:text-surface-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.step
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium tracking-tight ${
                  isCurrent
                    ? "font-bold text-emerald-600 dark:text-emerald-400"
                    : "text-ink-muted dark:text-surface-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
