"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function CoachSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="coach-section" className="relative px-2.5 sm:px-4 py-1 sm:py-1.5 md:py-4 max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto w-full">
      {/* Dark Forest Green Card */}
      <div className="relative rounded-[22px] md:rounded-3xl bg-gradient-to-br from-[#021811] via-[#031d15] to-[#010e0a] p-2.5 min-[390px]:p-3 sm:p-3.5 md:p-6 lg:p-7 overflow-hidden border border-emerald-950/80 shadow-md">
        
        <div className="relative z-10 flex flex-row items-center gap-2.5 sm:gap-3.5 md:gap-6">
          
          {/* Left Column: Coach Portrait (28% on mobile, comfortable portrait on desktop) */}
          <div className="w-[28%] min-[390px]:w-[30%] sm:w-36 md:w-48 lg:w-52 shrink-0">
            <div className="relative w-full aspect-[4/4.8] rounded-xl md:rounded-2xl overflow-hidden border border-emerald-800/40 bg-gray-900 shadow-sm">
              <Image
                src="/images/coach-portrait.jpg"
                alt="BMYFIT Head Coach"
                fill
                sizes="(max-width: 768px) 30vw, 220px"
                className="object-cover object-top select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021811]/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Coach Info & Credentials (72% on mobile) */}
          <div className="flex-1 flex flex-col justify-between text-left">
            
            {/* Top row with tag & Know More CTA */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[7.5px] min-[390px]:text-[8.5px] md:text-xs font-bold uppercase tracking-widest text-emerald-400">
                MEET YOUR COACH
              </span>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-gray-600 hover:border-emerald-400 bg-black/40 text-white text-[8px] min-[390px]:text-[8.5px] md:text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span>Know More</span>
                <span className="text-[#00e676]">→</span>
              </button>
            </div>

            {/* Headline */}
            <h2 className="text-xs min-[390px]:text-[13.5px] sm:text-base md:text-2xl lg:text-3xl font-black text-white mt-0.5 md:mt-1 leading-tight tracking-tight">
              Hi, I’m Your{" "}
              <span className="text-[#00e676]">
                Fitness Coach
              </span>
            </h2>

            {/* Coach Bio */}
            <p className="mt-0.5 md:mt-1.5 text-[7.5px] min-[390px]:text-[8.5px] sm:text-[9px] md:text-sm text-gray-300 leading-tight md:leading-normal">
              I help Indian professionals and adults improve their body composition through evidence-based training, tailored South Asian nutrition, and sustainable daily habits.
            </p>

            {/* 4 Credentials Bar with Vertical Dividers - Clickable to open coach details */}
            <div
              onClick={() => setShowModal(true)}
              className="mt-1.5 md:mt-3 pt-1.5 md:pt-3 border-t border-emerald-900/60 grid grid-cols-4 gap-0.5 md:gap-2 divide-x divide-emerald-900/60 text-center cursor-pointer hover:bg-emerald-950/30 rounded-lg p-0.5 md:p-1.5 transition-colors"
              title="Click to view coach credentials & certifications"
            >
              
              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" stroke="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14L6 22l6-3 6 3-2.5-8" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Certified<br />Trainer
                </span>
              </div>

              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5 pl-1 md:pl-2">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.533 1.035-.688 1.587a6.994 6.994 0 00-.73 2.59c-.014.28-.02.56-.02.84 0 .107.008.214.016.32a4.484 4.484 0 01-1.076-.843A6.97 6.97 0 007 6a1 1 0 00-1 1c0 3.866 3.134 7 7 7a6.978 6.978 0 005.15-2.274 1 1 0 00-.285-1.503 6.992 6.992 0 01-2.91-2.67 6.98 6.98 0 00-.56-4zm-4.7 10.4A5.002 5.002 0 018 7.37c.36.4.78.74 1.25 1.01.2.11.41.2.63.28-.15.4-.23.82-.23 1.25 0 1.93 1.34 3.55 3.15 3.96A5.002 5.002 0 017.695 12.953z" clipRule="evenodd" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Fat Loss<br />Specialist
                </span>
              </div>

              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5 pl-1 md:pl-2">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="9" width="3" height="6" rx="1" />
                  <rect x="19" y="9" width="3" height="6" rx="1" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Muscle Gain<br />Expert
                </span>
              </div>

              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5 pl-1 md:pl-2">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Body<br />Recomposition
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Interactive Coach Biography Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 relative text-gray-900">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
                <Image
                  src="/images/coach-portrait.jpg"
                  alt="Coach"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-950">
                  Coach Vikram Sharma
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  Head Coach · ACE &amp; ISSA Certified
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
              Over 8 years of clinical transformation experience specializing in evidence-based nutrition protocols tailored for South Asian body composition and Indian foods.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 space-y-1 text-[11px] text-emerald-950 mb-4">
              <div>• 1,200+ Client Body Transformations</div>
              <div>• Indian Vegetarian &amp; Non-Veg Meal Formulations</div>
              <div>• Injury-Free Progressive Resistance Methods</div>
            </div>

            <Link
              href="/details"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 px-4 rounded-full bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-xs text-center block transition-colors shadow-md"
            >
              Get Coach-Designed Plan (Rs. 99) →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
