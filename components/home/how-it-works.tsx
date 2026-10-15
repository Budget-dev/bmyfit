import React from "react";
import { Card } from "@/components/ui/card";

const STEPS = [
  {
    number: "01",
    title: "Enter Simple Measurements",
    description:
      "Share your height, weight, waist, neck, and hip (for females). No logins, no spam, and no personal contact info required.",
    tag: "30 seconds",
  },
  {
    number: "02",
    title: "Pick Your Fitness Goal",
    description:
      "Choose from Fat Loss, Weight Loss, Muscle Gain, or Weight Gain, plus your preferred Indian diet style.",
    tag: "Customized",
  },
  {
    number: "03",
    title: "Get Your Free Body Analysis",
    description:
      "Instantly see your WHO BMI classification and scientific US Navy Body Fat % estimate on an interactive gauge.",
    tag: "Instant & Free",
  },
  {
    number: "04",
    title: "Unlock Your Detailed Plan",
    description:
      "For just Rs. 99, unlock a 7-day Indian meal plan with grocery lists, target calories/macros, and a complete workout routine.",
    tag: "Rs. 99 One-Time",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-surface-100 dark:bg-surface-900/40 border-y border-surface-200/80 dark:border-surface-800/80">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-ink dark:text-white">
            From your numbers to an actionable routine
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-muted dark:text-surface-400">
            Four simple steps to understand your current body composition and receive an actionable plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <Card
              key={s.number}
              hoverEffect
              className="flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-emerald-500/80 dark:text-emerald-400">
                    {s.number}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-ink-muted dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-ink-muted dark:text-surface-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
