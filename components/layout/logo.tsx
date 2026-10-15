import React from "react";
import Link from "next/link";

export function BmyFitLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      aria-label="BMYFIT Home"
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-white"
        >
          {/* Stylized body / vitality pulse vector */}
          <path d="M4 12h3l2-5 4 10 3-7 2 3h3" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tight text-ink dark:text-white leading-none">
          BMY<span className="text-emerald-500">FIT</span>
        </span>
        <span className="text-[9px] font-semibold tracking-wider text-ink-muted dark:text-surface-400 uppercase -mt-0.5">
          Body Analytics
        </span>
      </div>
    </Link>
  );
}
