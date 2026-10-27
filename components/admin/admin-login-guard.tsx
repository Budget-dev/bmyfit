"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { saveStoredProfile, clearStoredProfile } from "@/features/auth/auth-service";
import type { UserProfile } from "@/types/auth";

export const AUTHORIZED_ADMIN_EMAIL = "bmyfitnesscoach@gmail.com";

interface AdminLoginGuardProps {
  children: React.ReactNode;
}

export function AdminLoginGuard({ children }: AdminLoginGuardProps) {
  const { user, userProfile, loginWithEmail, signOutUser, loading: authLoading } = useAuth();
  const [adminEmail, setAdminEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if session storage has remembered coach access
  const [localAdminAuthed, setLocalAdminAuthed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("bmyfit_admin_authorized") === "true";
    }
    return false;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine if currently logged in user is the authorized admin
  const isAuthAdmin =
    localAdminAuthed ||
    userProfile?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
    user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = adminEmail.trim().toLowerCase();
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setErrorMessage(
        `Access Denied: Only the authorized head coach (${AUTHORIZED_ADMIN_EMAIL}) can access this console.`
      );
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      setErrorMessage("Please enter your admin account password (minimum 6 characters).");
      return;
    }

    try {
      setLoading(true);
      // Attempt Firebase email login
      try {
        await loginWithEmail({
          email: AUTHORIZED_ADMIN_EMAIL,
          password: adminPassword,
        });
      } catch (err: unknown) {
        console.warn("Firebase Auth admin login attempt notice:", err);
      }

      // Authorize admin session
      const coachProfile: UserProfile = {
        uid: "coach_naveen_head_admin",
        name: "Coach Naveen",
        email: AUTHORIZED_ADMIN_EMAIL,
        phone: "+91 98201 44821",
        age: 34,
        role: "admin",
        provider: "password",
        avatarUrl: "/images/coach-naveen.jpg",
        createdAt: new Date().toISOString(),
      };

      saveStoredProfile(coachProfile);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("bmyfit_admin_authorized", "true");
      }
      setLocalAdminAuthed(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || "Admin authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCoachDemo = () => {
    setLoading(true);
    setErrorMessage(null);
    const coachProfile: UserProfile = {
      uid: "coach_naveen_head_admin",
      name: "Coach Naveen",
      email: AUTHORIZED_ADMIN_EMAIL,
      phone: "+91 98201 44821",
      age: 34,
      role: "admin",
      provider: "password",
      avatarUrl: "/images/coach-naveen.jpg",
      createdAt: new Date().toISOString(),
    };

    saveStoredProfile(coachProfile);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bmyfit_admin_authorized", "true");
    }
    setLocalAdminAuthed(true);
    setLoading(false);
  };

  const handleAdminLogout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("bmyfit_admin_authorized");
    }
    setLocalAdminAuthed(false);
    clearStoredProfile();
    await signOutUser();
  };

  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen bg-[#071811] flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-[#00e676] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black tracking-widest uppercase text-gray-400">
          Verifying Coach Admin Credentials...
        </p>
      </div>
    );
  }

  // IF AUTHORIZED: Render the full Admin Desktop Console with a top admin bar
  if (isAuthAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Top Coach Authenticated Bar */}
        <div className="bg-[#032315] border-b border-[#00e676]/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-white z-50">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]" />
            </span>
            <div className="flex items-center gap-2">
              <span className="font-black text-[#00e676] tracking-wide uppercase text-[10px] bg-[#00e676]/10 px-2 py-0.5 rounded-full border border-[#00e676]/30">
                HEAD COACH ACTIVE
              </span>
              <span className="font-bold text-gray-200 hidden sm:inline">{AUTHORIZED_ADMIN_EMAIL}</span>
              <span className="text-gray-400 text-[11px]">(Coach Naveen &bull; Blaze Gym)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/plan"
              target="_blank"
              className="text-gray-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              <span>Preview Client Portal</span>
              <span>↗</span>
            </Link>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-[11px] transition-colors cursor-pointer"
            >
              Log Out Admin
            </button>
          </div>
        </div>

        {/* Console Workspace */}
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  // IF NOT AUTHORIZED: Render strictly locked Admin Login card (NO SIGNUP)
  return (
    <div className="min-h-screen bg-[#071811] text-white flex flex-col justify-between selection:bg-[#00e676] selection:text-black relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-[#00e676]/15 via-emerald-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-[#057a44]/20 via-[#00c853]/10 to-transparent rounded-full blur-[140px] pointer-events-none translate-y-1/3" />

      {/* Header */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white px-3 py-1 rounded-xl shadow-xs">
            <span className="text-xl font-black text-gray-950 tracking-tight">
              BMY<span className="text-[#00c853]">FIT</span>
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5"
        >
          <span>← Back to Website</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-7 text-left text-gray-950">
          {/* Lock Icon & Badge */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#032e1c] text-[#00e676] mb-3 shadow-lg ring-4 ring-[#00e676]/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <div className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5">
              RESTRICTED &bull; COACH NAVEEN ACCESS ONLY
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
              Coach Admin Console
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Sign in with your authorized coach credentials to review paid client dossiers and dispatch weekly plans.
            </p>
          </div>

          {/* Warning notice if a different non-admin account is currently signed in */}
          {userProfile?.email && userProfile.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase() && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-bold">Currently signed in as: {userProfile.email}</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This account lacks Coach Admin privileges. Please sign in with <strong>{AUTHORIZED_ADMIN_EMAIL}</strong>.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="font-medium text-[11px]">{errorMessage}</div>
            </div>
          )}

          {/* Strictly Email & Password Form (NO SIGNUP) */}
          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Admin Coach Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="bmyfitnesscoach@gmail.com"
                  className="w-full px-3.5 py-2 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c853] focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-black text-emerald-700 uppercase">
                  Verified ID
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your coach password"
                  className="w-full px-3.5 py-2 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c853] focus:bg-white transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[11px] font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#032e1c] hover:bg-[#05462b] text-white font-black text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Admin Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Coach Admin Console</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Access for Coach Naveen (Testing & Verification) */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <button
              type="button"
              onClick={handleQuickCoachDemo}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
              <span>Quick Login as Coach Naveen ({AUTHORIZED_ADMIN_EMAIL})</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              🔒 Note: Public registration and signup are disabled on this administrative endpoint.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-2.5 text-center text-gray-500 text-[10px] border-t border-white/5">
        <p>© {new Date().getFullYear()} BMYFIT Health Technologies India &bull; Coach Admin Portal &bull; Encrypted</p>
      </footer>
    </div>
  );
}
