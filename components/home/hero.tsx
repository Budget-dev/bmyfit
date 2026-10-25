"use client";

import React from "react";
import Image from "next/image";

export function Hero() {
  const scrollToCalculator = () => {
    const el = document.getElementById("calculator-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = document.getElementById("input-age");
        if (input) input.focus();
      }, 400);
    }
  };

  return (
    <section className="relative w-full px-0 sm:px-3 pt-0 sm:pt-0.5 pb-0 max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto">
      {/* 
        Hero Card: Full-width edge-to-edge on mobile with rounded top corners (rounded-t-[22px]),
        outside open down side (rounded-b-none), and seamless dark forest green background.
      */}
      {/* Curls/Hair breakout popping out above the top edge into the white space under logo */}
      <div className="absolute right-[21%] sm:right-[23%] md:right-[20%] -top-2 sm:-top-2.5 md:-top-3 w-11 sm:w-13 md:w-16 h-3.5 sm:h-4 md:h-5 pointer-events-none select-none z-30">
        <Image
          src="/images/hero-hair-breakout.png"
          alt=""
          fill
          priority
          className="object-contain object-bottom"
        />
      </div>

      <div className="relative w-full rounded-t-[22px] sm:rounded-t-[24px] md:rounded-2xl rounded-b-none bg-[#021b14] border-t border-[#063322]/80 shadow-[0_6px_20px_rgba(0,0,0,0.2)] h-[160px] sm:h-[174px] md:h-[250px] lg:h-[280px] overflow-hidden flex items-start">
        
        {/* Model Photography on Right Half - Perfectly framed inside the rounded card */}
        <div className="absolute right-0 top-0 bottom-0 w-[50%] min-[390px]:w-[48%] sm:w-[50%] md:w-[46%] lg:w-[42%] h-full pointer-events-none select-none z-10">
          <Image
            src="/images/hero-model.jpg"
            alt="Athletic fitness model"
            fill
            priority
            sizes="(max-width: 768px) 55vw, (max-width: 1200px) 45vw, 500px"
            className="object-cover object-[center_6%] select-none"
          />
          {/* Smooth multi-stop gradient overlay from dark card background into model */}
          <div className="absolute inset-y-0 left-0 w-16 sm:w-24 md:w-36 bg-gradient-to-r from-[#021b14] via-[#021b14]/80 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-6 md:h-12 bg-gradient-to-t from-[#021b14]/70 to-transparent pointer-events-none" />
        </div>

        {/* Motivational Script on Top-Right over model's shoulder */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-3.5 md:top-5 md:right-8 z-20 text-right select-none pointer-events-none">
          <div className="font-script text-[13px] min-[390px]:text-[15px] sm:text-[16px] md:text-2xl lg:text-3xl text-white leading-[0.98] rotate-[-2deg] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <div>Better</div>
            <div>Stronger</div>
            <div>Healthier</div>
            <div>You</div>
          </div>
          {/* Emerald hand-drawn squiggle underline */}
          <svg
            className="w-9 sm:w-12 md:w-20 h-1.5 md:h-2.5 ml-auto text-[#00e676] mt-0.5 -rotate-2"
            viewBox="0 0 100 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          >
            <path d="M4 12 Q 25 4, 50 10 T 96 8" />
          </svg>
        </div>

        {/* Left Content Area (Compact on mobile, expansive on desktop) */}
        <div className="relative z-20 w-[58%] min-[390px]:w-[56%] sm:w-[55%] md:w-[60%] lg:w-[58%] pl-3 sm:pl-4 md:pl-8 pr-1 pt-2 min-[390px]:pt-2.5 sm:pt-3 md:pt-6 pb-1 md:pb-4 flex flex-col justify-start">
          
          {/* Top Pill Badge: PERSONALIZED FOR YOU */}
          <div className="inline-flex items-center gap-1 rounded-full border border-[#00e676]/60 bg-[#042d20] px-2 py-0.5 md:px-3 md:py-1 text-[6.8px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-[#00e676] tracking-wider uppercase mb-1 md:mb-2 shadow-inner w-fit">
            <svg
              className="w-2 h-2 md:w-3 md:h-3 text-[#00e676]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2.5-6 4 12 2.5-6H21" />
            </svg>
            <span>PERSONALIZED FOR YOU</span>
          </div>

          {/* Condensed Headline */}
          <h1 className="font-condensed text-[17px] min-[390px]:text-[19px] sm:text-[22px] md:text-3xl lg:text-4xl font-black uppercase text-white leading-[0.94] tracking-tight">
            KNOW YOUR BODY.
            <br />
            <span className="text-[#00e676] italic drop-shadow-[0_2px_8px_rgba(0,230,118,0.4)]">
              TRANSFORM
            </span>
            <br />
            YOUR BODY.
          </h1>

          {/* Supporting Description */}
          <p className="mt-0.5 min-[390px]:mt-1 md:mt-2 text-[7.2px] min-[390px]:text-[8.2px] sm:text-[9px] md:text-xs lg:text-sm text-gray-300 leading-tight md:leading-normal max-w-[195px] md:max-w-md font-normal">
            Get your clinical BMI, US Navy estimated body fat &amp; a personalized Indian fitness plan based on your exact goal.
          </p>

          {/* Single-Line Green CTA Button */}
          <div className="mt-1 min-[390px]:mt-1.5 md:mt-3">
            <button
              type="button"
              onClick={scrollToCalculator}
              className="group inline-flex items-center justify-between gap-1.5 md:gap-2.5 bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-[8.5px] min-[390px]:text-[9.5px] sm:text-[10px] md:text-xs lg:text-sm py-1 min-[390px]:py-1.5 md:py-2.5 px-2.5 sm:px-3 md:px-5 rounded-full shadow-[0_3px_10px_rgba(0,230,118,0.4)] transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="flex items-center justify-center w-3.5 h-3.5 md:w-5 md:h-5 rounded bg-black/85 text-[#00e676]">
                  <svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <line x1="8" y1="7" x2="16" y2="7" />
                    <line x1="8" y1="11" x2="10" y2="11" />
                    <line x1="14" y1="11" x2="16" y2="11" />
                    <line x1="8" y1="15" x2="10" y2="15" />
                    <line x1="14" y1="15" x2="16" y2="15" />
                  </svg>
                </span>
                <span>Calculate My Body — FREE</span>
              </div>
              <span className="text-[10px] md:text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>

          {/* 3 Trust & Benefit Indicators immediately below the CTA button */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 text-[6.5px] min-[390px]:text-[7.2px] sm:text-[7.8px] md:text-xs text-gray-300 font-medium mt-1 min-[390px]:mt-1.5 md:mt-3">
            <div className="flex items-center gap-1 md:gap-1.5">
              <span className="flex h-3 w-3 md:h-4 md:w-4 rounded-full border border-[#00e676] bg-[#042017] items-center justify-center text-[#00e676] shrink-0">
                <svg className="w-1.5 h-1.5 md:w-2 md:h-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span className="leading-tight">Takes &lt; 2 min</span>
            </div>

            <div className="w-[1px] h-3 md:h-4 bg-white/20 shrink-0" />

            <div className="flex items-center gap-1 md:gap-1.5">
              <span className="flex h-3 w-3 md:h-4 md:w-4 rounded-full border border-[#00e676] bg-[#042017] items-center justify-center text-[#00e676] shrink-0">
                <svg className="w-1.5 h-1.5 md:w-2 md:h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="leading-tight">No signup needed</span>
            </div>

            <div className="w-[1px] h-3 md:h-4 bg-white/20 shrink-0" />

            <div className="flex items-center gap-1 md:gap-1.5">
              <span className="flex h-3 w-3 md:h-4 md:w-4 rounded-full border border-[#00e676] bg-[#042017] items-center justify-center text-[#00e676] shrink-0">
                <svg className="w-1.5 h-1.5 md:w-2 md:h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <span className="leading-tight">100% Private</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
