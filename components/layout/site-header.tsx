"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BmyFitLogo } from "./logo";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { userProfile, isAuthenticated, signOutUser } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between">
          {/* Brand Logo */}
          <BmyFitLogo />

          {/* Desktop Navigation Links (Visible on screens >= 768px) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-semibold text-gray-700">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/#calculator-card" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <span>Calculator</span>
              <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                FREE
              </span>
            </Link>
            <Link href="/#goals-section" className="hover:text-emerald-600 transition-colors">
              Fitness Goals
            </Link>
            <Link href="/#coach-section" className="hover:text-emerald-600 transition-colors">
              Meet Coach
            </Link>
            <Link href="/about" className="hover:text-emerald-600 transition-colors">
              About Us
            </Link>
            <Link href="/faq" className="hover:text-emerald-600 transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Header Buttons: Auth / CTA + Notification Bell + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Dropdown (when authenticated) */}
            {isAuthenticated && userProfile ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen((prev) => !prev);
                    setIsNotificationsOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-left"
                  aria-label="User Profile Menu"
                  aria-expanded={isProfileOpen}
                >
                  {userProfile.avatarUrl ? (
                    <Image
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#00e676] text-black font-black text-[10px] flex items-center justify-center">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-900 hidden sm:inline max-w-[100px] truncate">
                    {userProfile.name.split(" ")[0]}
                  </span>
                  <span className="text-gray-400 text-[10px]">▼</span>
                </button>

                {/* Profile Popover */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-gray-100 shadow-xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                    <div className="pb-2 border-b border-gray-100">
                      <p className="text-xs font-black text-gray-950 truncate">{userProfile.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{userProfile.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-600">
                        {userProfile.phone && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                            {userProfile.phone}
                          </span>
                        )}
                        {userProfile.age && (
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                            {userProfile.age} yrs
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        href="/plan"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <span>My 8-Week Plan</span>
                        <span className="text-[#00c853]">→</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <span>Desktop Admin Console</span>
                        <span className="text-gray-400 text-[10px]">Admin</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsProfileOpen(false);
                          await signOutUser();
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Desktop CTA Button */}
            <Link
              href="/#calculator-card"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-xs py-1.5 px-3.5 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
            >
              <span>Calculate Free</span>
              <span>→</span>
            </Link>

            {/* Bell Button */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setIsMenuOpen(false);
                  setIsProfileOpen(false);
                }}
                className="relative w-9 h-9 rounded-full bg-[#f4f5f6] hover:bg-[#eaecee] flex items-center justify-center text-gray-800 active:scale-95 transition-all shadow-none focus:outline-none"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
              >
                <svg
                  className="w-4 h-4 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>

                {/* Vivid Green Dot Badge at top-right */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00e676]" />
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-gray-100 shadow-xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
                    <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 mt-1 max-h-60 overflow-y-auto text-left">
                    <div className="py-2.5">
                      <p className="text-xs font-bold text-gray-900">Clinical Body Fat Calculator</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                        Instant South Asian BMI &amp; Body Fat assessment ready.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 text-center">
                    <a
                      href="#calculator-card"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Calculate Now →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger Menu Button (Mobile Only: hidden on md+) */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen((prev) => !prev);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-[#f4f5f6] hover:bg-[#eaecee] flex items-center justify-center text-gray-800 active:scale-95 transition-all shadow-none focus:outline-none"
                aria-label="Menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7h16.5M3.75 12h16.5m-16.5 5h16.5" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-gray-100 shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150 text-left">
                  {/* Top Mobile Auth Section */}
                  <div className="pb-2.5 mb-2 border-b border-gray-100">
                    {isAuthenticated && userProfile ? (
                      <div>
                        <p className="text-xs font-black text-gray-900">{userProfile.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{userProfile.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Link
                            href="/plan"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg"
                          >
                            My Plan
                          </Link>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsMenuOpen(false);
                              await signOutUser();
                            }}
                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="py-1.5 px-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold rounded-xl transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          onClick={() => setIsMenuOpen(false)}
                          className="py-1.5 px-3 text-center bg-[#00e676] hover:bg-[#00c864] text-black text-xs font-extrabold rounded-xl transition-colors"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>

                  <nav className="flex flex-col space-y-0.5 text-xs text-left">
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Home
                    </Link>
                    <a
                      href="/#calculator-card"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors flex items-center justify-between"
                    >
                      <span>Body Calculator</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
                    </a>
                    <a
                      href="/#goals-section"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Fitness Goals
                    </a>
                    <a
                      href="/#coach-section"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Meet Your Coach
                    </a>
                    <Link
                      href="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/faq"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Frequently Asked Questions
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Contact Support
                    </Link>
                    <div className="pt-1 border-t border-gray-100 my-1">
                      <Link
                        href="/terms"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-gray-500 hover:text-gray-900 text-[11px] block transition-colors"
                      >
                        Terms &amp; Conditions
                      </Link>
                      <Link
                        href="/privacy"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-gray-500 hover:text-gray-900 text-[11px] block transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </div>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
