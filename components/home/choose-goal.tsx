"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveDraftGoal } from "@/features/assessment/session-store";
import type { FitnessGoal } from "@/types/fitness";

interface GoalItem {
  id: FitnessGoal;
  title: string;
  splitTitle?: [string, string];
  description: string;
  image: string;
  badgeBg: string;
  badgeIcon: React.ReactNode;
}

const GOALS: GoalItem[] = [
  {
    id: "fat-loss",
    title: "Fat Loss",
    description: "Lose body fat while maintaining muscle.",
    image: "/images/goal-fat-loss.jpg",
    badgeBg: "bg-[#fff3eb] text-orange-500",
    badgeIcon: (
      <svg className="w-3.5 h-3.5 text-[#f97316]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2c1.1 2.2 2.5 4.5 2.5 7 0 2.8-2.2 5-5 5-1.5 0-2.8-.7-3.7-1.7C5.3 14 7 16.5 9 18c3.9 2.9 9.3 1.8 11.8-2.2 2-3.2 1.4-7.4-1.3-9.9-.4-.4-.9-.8-1.5-1.1.2 1.3-.2 2.6-1 3.5-.8.9-1.9 1.4-3 1.4-.4 0-.8-.1-1.2-.2 1.4-1.8 1.4-4.4-.8-7.5z" />
      </svg>
    ),
  },
  {
    id: "muscle-gain",
    title: "Muscle Gain",
    description: "Build lean muscle with structured training.",
    image: "/images/goal-muscle-gain.jpg",
    badgeBg: "bg-[#eaf8f0] text-[#059669]",
    badgeIcon: (
      <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
        <rect x="2.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
        <rect x="5.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
        <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2.4" />
        <rect x="16.5" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
        <rect x="19" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "weight-loss",
    title: "Body Recomposition",
    splitTitle: ["Body", "Recomposition"],
    description: "Lose fat while building muscle.",
    image: "/images/goal-body-recomp.jpg",
    badgeBg: "bg-[#eaf8f0] text-[#059669]",
    badgeIcon: (
      <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    id: "weight-gain",
    title: "General Fitness",
    description: "Get stronger, move better and feel healthier.",
    image: "/images/goal-general-fitness.jpg",
    badgeBg: "bg-[#eaf8f0] text-[#059669]",
    badgeIcon: (
      <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <rect x="4" y="14" width="3.2" height="6" rx="0.8" fill="currentColor" />
        <rect x="10.4" y="9.5" width="3.2" height="10.5" rx="0.8" fill="currentColor" />
        <rect x="16.8" y="5" width="3.2" height="15" rx="0.8" fill="currentColor" />
      </svg>
    ),
  },
];

export function ChooseGoal() {
  const router = useRouter();

  const handleSelectGoal = (goal: GoalItem) => {
    saveDraftGoal({ goal: goal.id });
    router.push("/details");
  };

  return (
    <section id="goals-section" className="relative px-2.5 sm:px-4 py-1 sm:py-1.5 max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <h2 className="text-[11.5px] sm:text-xs font-black uppercase tracking-tight text-[#0a291f]">
          CHOOSE YOUR GOAL
        </h2>

        <button
          type="button"
          onClick={() => router.push("/details")}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f7ee] hover:bg-[#d8f2e2] text-[#0f3822] text-[9.5px] font-bold transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <span>View All</span>
          <span className="text-[#0f3822]">→</span>
        </button>
      </div>

      {/* 4 Cards in 1 Row (Grid of 4) */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {GOALS.map((goal) => {
          return (
            <div
              key={goal.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectGoal(goal)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectGoal(goal);
                }
              }}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-emerald-400 transition-all duration-150 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md active:scale-[0.98]"
            >
              {/* Card Image */}
              <div className="relative w-full aspect-[4/3.2] bg-gray-100 overflow-hidden">
                <Image
                  src={goal.image}
                  alt={goal.title}
                  fill
                  sizes="(max-width: 640px) 25vw, 25vw"
                  className="object-cover object-top select-none group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Floating Round Badge at the boundary */}
                <div
                  className={`absolute -bottom-2.5 left-1.5 sm:left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white ${goal.badgeBg} flex items-center justify-center shadow-sm z-10`}
                >
                  {goal.badgeIcon}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-1 sm:p-1.5 pt-2.5 sm:pt-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-0.5">
                    <h3 className="text-[9px] sm:text-[10.5px] font-black text-gray-950 leading-[1.05]">
                      {goal.splitTitle ? (
                        <>
                          <span>{goal.splitTitle[0]}</span>
                          <br />
                          <span>{goal.splitTitle[1]}</span>
                        </>
                      ) : (
                        goal.title
                      )}
                    </h3>

                    <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#f4f5f6] group-hover:bg-[#00e676] group-hover:text-black flex items-center justify-center text-gray-800 text-[8px] sm:text-[9px] font-extrabold shrink-0 transition-colors mt-0.5">
                      →
                    </span>
                  </div>

                  <p className="text-[6.5px] sm:text-[8px] text-gray-500 mt-0.5 leading-tight">
                    {goal.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
