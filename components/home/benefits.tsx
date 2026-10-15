import React from "react";
import { Card } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Fast & Frictionless",
    description: "Get your body metrics and BMI analysis immediately. Zero phone number requests, zero OTP walls, zero pushy marketing calls.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Affordable Rs. 99 One-Time",
    description: "Personal training packages cost Rs. 5,000–15,000. BMYFIT delivers science-backed meal and workout splits for the price of a coffee.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "100% Private & Anonymous",
    description: "You start anonymously with Firebase. Your measurements and plan are protected by cryptographic server-side checks and Razorpay verification.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: "Real Indian Kitchen Foods",
    description: "No expensive exotic superfoods. Every meal uses dal, roti, rice, curd, paneer, eggs, chicken, fish, chana, and vegetables available in every Indian market.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Downloadable PDF Plan",
    description: "Save your full routine and grocery list as a clean, print-friendly PDF to your phone or fridge door with a single click.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: "Safe Calorie Floors",
    description: "We enforce strict safety minimums (1500 kcal men, 1200 kcal women) and never generate crash starvation diets that harm metabolic rate.",
  },
];

export function Benefits() {
  return (
    <section className="py-24 bg-white dark:bg-surface-950 transition-colors">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Why BMYFIT
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-ink dark:text-white">
            Engineered for results, priced for everyone
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-muted dark:text-surface-400">
            Everything you need to kickstart an intelligent fitness transformation without the fitness industry markup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <Card key={i} hoverEffect className="p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 mb-5 border border-emerald-100 dark:border-emerald-800/60">
                {b.icon}
              </div>
              <h3 className="text-lg font-bold text-ink dark:text-white">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted dark:text-surface-400 leading-relaxed">
                {b.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
