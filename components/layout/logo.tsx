import React from "react";
import Link from "next/link";

export function BmyFitLogo({ className = "", showTagline = true }: { className?: string; showTagline?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex flex-col group select-none text-left ${className}`}
      aria-label="BMYFIT Home"
    >
      <span className="text-xl sm:text-2xl font-black tracking-tight text-black leading-none">
        BMY<span className="text-[#057a44]">FIT</span>
      </span>
      {showTagline && (
        <span className="text-[6.5px] sm:text-[7px] tracking-wider uppercase text-gray-500 font-semibold mt-0.5 leading-none">
          PERSONALIZED FITNESS &amp; NUTRITION
        </span>
      )}
    </Link>
  );
}
