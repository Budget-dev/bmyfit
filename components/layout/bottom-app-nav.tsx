"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, ShoppingBag, BarChart2, User } from "@/components/ui/supplement-icons";

interface BottomAppNavProps {
  currentTab?: "home" | "plans" | "shop" | "results" | "profile";
  className?: string;
}

export function BottomAppNav({ currentTab, className = "" }: BottomAppNavProps) {
  const pathname = usePathname();

  const active =
    currentTab ||
    (pathname?.startsWith("/supplements") || pathname?.startsWith("/shop")
      ? "shop"
      : pathname?.startsWith("/plan")
      ? "plans"
      : pathname === "/"
      ? "home"
      : pathname?.startsWith("/details")
      ? "results"
      : "home");

  return (
    <nav
      aria-label="App bottom navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-950/95 backdrop-blur-md border-t border-gray-100 dark:border-surface-800 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] py-2 px-4 ${className}`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
            active === "home"
              ? "text-gray-950 dark:text-white font-bold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px]">Home</span>
        </Link>

        {/* Plans */}
        <Link
          href="/plan/demo"
          className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
            active === "plans"
              ? "text-gray-950 dark:text-white font-bold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[11px]">Plans</span>
        </Link>

        {/* Shop - Center Raised Emerald Button */}
        <Link
          href="/supplements"
          className="flex flex-col items-center -mt-6 group focus:outline-none"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95 ${
              active === "shop"
                ? "bg-[#00e676] text-black shadow-[#00e676]/35"
                : "bg-[#00c853] text-white shadow-emerald-600/30"
            }`}
          >
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span
            className={`text-[11px] mt-1 font-bold ${
              active === "shop"
                ? "text-[#00c853] dark:text-[#00e676]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Shop
          </span>
        </Link>

        {/* Results */}
        <Link
          href="/details"
          className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
            active === "results"
              ? "text-gray-950 dark:text-white font-bold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[11px]">Results</span>
        </Link>

        {/* Profile */}
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
            active === "profile"
              ? "text-gray-950 dark:text-white font-bold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px]">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
