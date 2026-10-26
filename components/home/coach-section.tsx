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
          
          {/* Left Column: Coach Portrait */}
          <div className="w-[30%] min-[390px]:w-[32%] sm:w-40 md:w-52 lg:w-56 shrink-0">
            <div className="relative w-full aspect-[4/4.8] rounded-xl md:rounded-2xl overflow-hidden border border-emerald-500/30 bg-gray-900 shadow-md">
              <Image
                src="/images/coach-naveen.jpg"
                alt="Coach Naveen · Blaze Gym Owner & Head Coach"
                fill
                sizes="(max-width: 768px) 35vw, 240px"
                className="object-cover object-top select-none"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021811]/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Coach Info & Credentials */}
          <div className="flex-1 flex flex-col justify-between text-left">
            
            {/* Top row with tag & Know More CTA */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[7.5px] min-[390px]:text-[8.5px] md:text-xs font-black uppercase tracking-widest text-[#00e676] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
                <span>MEET YOUR COACH</span>
              </span>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-emerald-500/40 hover:border-[#00e676] bg-black/50 text-white text-[8px] min-[390px]:text-[8.5px] md:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm hover:bg-emerald-950/40"
              >
                <span>Know More</span>
                <span className="text-[#00e676]">→</span>
              </button>
            </div>

            {/* Headline */}
            <h2 className="text-xs min-[390px]:text-[13.5px] sm:text-base md:text-2xl lg:text-3xl font-black text-white mt-0.5 md:mt-1 leading-tight tracking-tight">
              Hi, I’m{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e676] to-[#00c853]">
                Coach Naveen
              </span>
            </h2>

            {/* Coach Bio */}
            <p className="mt-0.5 md:mt-1.5 text-[7.5px] min-[390px]:text-[8.5px] sm:text-[9.5px] md:text-sm text-gray-300 leading-tight md:leading-normal">
              Owner of <strong className="text-white font-bold">Blaze Gym</strong> &amp; several fitness centers. As a Certified Fitness Coach &amp; Sports Nutritionist, I help Indian adults achieve sustainable body recomposition through tailored nutrition and evidence-based training.
            </p>

            {/* 4 Credentials Bar with Vertical Dividers */}
            <div
              onClick={() => setShowModal(true)}
              className="mt-1.5 md:mt-3 pt-1.5 md:pt-3 border-t border-emerald-900/60 grid grid-cols-4 gap-0.5 md:gap-2 divide-x divide-emerald-900/60 text-center cursor-pointer hover:bg-emerald-950/30 rounded-lg p-0.5 md:p-1.5 transition-colors"
              title="Click to view coach credentials & certifications"
            >
              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Blaze Gym<br />Owner
                </span>
              </div>

              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5 pl-1 md:pl-2">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" stroke="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14L6 22l6-3 6 3-2.5-8" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Certified<br />Nutritionist
                </span>
              </div>

              <div className="flex items-center justify-center gap-0.5 md:gap-1.5 px-0.5 pl-1 md:pl-2">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00e676] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.533 1.035-.688 1.587a6.994 6.994 0 00-.73 2.59c-.014.28-.02.56-.02.84 0 .107.008.214.016.32a4.484 4.484 0 01-1.076-.843A6.97 6.97 0 007 6a1 1 0 00-1 1c0 3.866 3.134 7 7 7a6.978 6.978 0 005.15-2.274 1 1 0 00-.285-1.503 6.992 6.992 0 01-2.91-2.67 6.98 6.98 0 00-.56-4zm-4.7 10.4A5.002 5.002 0 018 7.37c.36.4.78.74 1.25 1.01.2.11.41.2.63.28-.15.4-.23.82-.23 1.25 0 1.93 1.34 3.55 3.15 3.96A5.002 5.002 0 017.695 12.953z" clipRule="evenodd" />
                </svg>
                <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[8px] md:text-[11px] font-bold text-gray-200 leading-none text-left">
                  Fat Loss<br />Expert
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative text-gray-900 text-left">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                <Image
                  src="/images/coach-naveen.jpg"
                  alt="Coach Naveen"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-950">
                  Coach Naveen
                </h3>
                <p className="text-xs text-emerald-700 font-bold">
                  Founder of Blaze Gym · Certified Fitness Coach &amp; Sports Nutritionist
                </p>
                <p className="text-[10px] text-gray-400">Owner of Multi-Branch Fitness Facilities across India</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Over a decade of elite physical conditioning and sports nutrition experience. Coach Naveen owns and operates Blaze Gym along with several leading fitness centers, specializing in drug-free muscle building, visceral fat reduction, and tailored Indian diet formulations (Vegetarian, Eggetarian, Non-Veg).
            </p>

            <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-3.5 space-y-1.5 text-xs text-emerald-950 mb-5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <span className="text-[#00c853]">✓</span>
                <span>Owner of Blaze Gym &amp; Multiple Fitness Facilities</span>
              </div>
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <span className="text-[#00c853]">✓</span>
                <span>Certified Fitness Trainer &amp; Advanced Sports Nutritionist</span>
              </div>
              <div className="font-medium flex items-center gap-1.5 text-emerald-800">
                <span className="text-[#00c853]">✓</span>
                <span>15,000+ Verified South Asian Body Transformations</span>
              </div>
              <div className="font-medium flex items-center gap-1.5 text-emerald-800">
                <span className="text-[#00c853]">✓</span>
                <span>Scientific Resistance Protocols &amp; Direct Coach WhatsApp Review</span>
              </div>
            </div>

            <Link
              href="/details"
              onClick={() => setShowModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00e676] to-[#00c853] hover:from-[#00c864] hover:to-[#00b349] text-gray-950 font-black text-xs text-center block transition-all shadow-md active:scale-95"
            >
              Get Coach Naveen-Designed Plan (Rs. 99) →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
