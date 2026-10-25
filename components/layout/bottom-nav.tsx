"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname() || "";
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isHome = pathname === "/";
  const isPlans = pathname.startsWith("/details") || pathname.startsWith("/goal") || pathname.startsWith("/checkout") || pathname.startsWith("/plan");
  const isResults = pathname.startsWith("/result");

  const scrollToCalculator = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("calculator-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const ageInput = document.getElementById("input-age");
      if (ageInput) ageInput.focus();
    }
  };

  const scrollToResults = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("calculator-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      {/* Crisp White Fixed Bottom Navigation matching Image 2 */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_15px_rgba(0,0,0,0.03)] pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="max-w-md mx-auto h-13 sm:h-14 flex items-center justify-between relative px-2 divide-x divide-gray-100">
          
          {/* 1. Home */}
          <Link
            href="/"
            className="flex-1 flex flex-col items-center justify-center py-1 group select-none"
            aria-label="Home"
          >
            <svg
              className={`w-5 h-5 transition-colors ${isHome ? "text-gray-950" : "text-gray-500 group-hover:text-gray-950"}`}
              fill={isHome ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke={isHome ? "none" : "currentColor"}
              strokeWidth={isHome ? 0 : 2}
            >
              <path d="M12 3l9 8-1.4 1.4L18 11V20a1 1 0 01-1 1h-4v-5h-2v5H7a1 1 0 01-1-1v-9l-1.6 1.4L3 11l9-8z" />
            </svg>
            <span className={`text-[9.5px] mt-0.5 leading-none ${isHome ? "font-bold text-gray-950" : "font-medium text-gray-500 group-hover:text-gray-950"}`}>
              Home
            </span>
            {isHome && <span className="w-5 h-0.5 bg-[#00c853] rounded-full mt-1" />}
          </Link>

          {/* 2. Plans */}
          <Link
            href="/details"
            className="flex-1 flex flex-col items-center justify-center py-1 group select-none transition-colors"
            aria-label="Plans"
          >
            <svg
              className={`w-5 h-5 transition-colors ${isPlans ? "text-gray-950" : "text-gray-500 group-hover:text-gray-950"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isPlans ? 2.3 : 1.9}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className={`text-[9.5px] mt-0.5 leading-none ${isPlans ? "font-bold text-gray-950" : "font-medium text-gray-500 group-hover:text-gray-950"}`}>
              Plans
            </span>
            {isPlans && <span className="w-5 h-0.5 bg-[#00c853] rounded-full mt-1" />}
          </Link>

          {/* 3. Central Elevated Green Calculator Button */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <button
              type="button"
              onClick={scrollToCalculator}
              aria-label="Calculate Body Metrics"
              className="relative -top-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00e676] hover:bg-[#00c864] text-black flex items-center justify-center shadow-[0_4px_16px_rgba(0,230,118,0.5)] active:scale-95 transition-all cursor-pointer group"
            >
              <svg
                className="w-5 h-5 text-black group-hover:scale-105 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.3"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" />
                <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" />
                <line x1="8" y1="11" x2="10" y2="11" stroke="currentColor" />
                <line x1="14" y1="11" x2="16" y2="11" stroke="currentColor" />
                <line x1="8" y1="15" x2="10" y2="15" stroke="currentColor" />
                <line x1="14" y1="15" x2="16" y2="15" stroke="currentColor" />
              </svg>
            </button>
          </div>

          {/* 4. Results */}
          <Link
            href="/result"
            className="flex-1 flex flex-col items-center justify-center py-1 group select-none transition-colors cursor-pointer"
            aria-label="Results"
          >
            <svg
              className={`w-5 h-5 transition-colors ${isResults ? "text-gray-950" : "text-gray-500 group-hover:text-gray-950"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isResults ? 2.3 : 1.9}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
            <span className={`text-[9.5px] mt-0.5 leading-none ${isResults ? "font-bold text-gray-950" : "font-medium text-gray-500 group-hover:text-gray-950"}`}>
              Results
            </span>
            {isResults && <span className="w-5 h-0.5 bg-[#00c853] rounded-full mt-1" />}
          </Link>

          {/* 5. Profile */}
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="flex-1 flex flex-col items-center justify-center py-1 group select-none text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Profile"
          >
            <svg
              className="w-5 h-5 text-gray-700 group-hover:text-gray-950 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.9"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span className="text-[9.5px] font-medium text-gray-700 mt-0.5 leading-none group-hover:text-gray-950">
              Profile
            </span>
          </button>

        </div>
      </nav>

      {/* Profile Quick Modal */}
      {showProfileModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-100 relative text-gray-900">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                BF
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-950">
                  BMYFIT Profile
                </h3>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  100% Private · No Login Required
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-600 mb-4">
              <div className="flex justify-between items-center">
                <span>Assessment Status:</span>
                <span className="font-bold text-emerald-700">Ready</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Personalized Plan:</span>
                <span className="font-bold text-gray-800">Rs. 99</span>
              </div>
            </div>

            <Link
              href="/details"
              onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 px-3 rounded-full bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-xs text-center block transition-colors shadow-md"
            >
              Complete Full Assessment →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
