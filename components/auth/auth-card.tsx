"use client";

import React, { useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { sendResetEmail, loginDevSandbox } from "@/features/auth/auth-service";

interface AuthCardProps {
  initialMode?: "signin" | "signup";
  onSuccess?: () => void;
  className?: string;
}

export function AuthCard({ initialMode = "signup", onSuccess, className = "" }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/plan";

  const { signInWithGoogle, loginWithEmail, signupWithEmail, userProfile, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<string>("26");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "sent">("idle");

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const ageId = useId();
  const passwordId = useId();

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-gray-200" };
    if (pass.length < 6) return { score: 1, label: "Weak (min 6 chars)", color: "bg-rose-500" };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (pass.length >= 8 && hasNum && hasSpecial) {
      return { score: 3, label: "Strong & Secure", color: "bg-[#00e676]" };
    }
    return { score: 2, label: "Good", color: "bg-amber-400" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const profile = await signInWithGoogle();
      setSuccessMessage(`Welcome back, ${profile.name.split(" ")[0]}! Redirecting...`);

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(redirectTarget);
        }, 800);
      }
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      console.error("Google sign-in error:", err);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMessage("Google Sign-In was cancelled.");
      } else {
        setErrorMessage(error.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "signup") {
      // Form Validation
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage("Please enter your full name (minimum 2 characters).");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMessage("Please provide a valid email address.");
        return;
      }
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setErrorMessage("Please enter a valid 10-digit WhatsApp/mobile number.");
        return;
      }
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
        setErrorMessage("Please enter a valid age between 18 and 99 years.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      try {
        setLoading(true);
        const fullPhone = phone.startsWith("+") ? phone : `+91 ${phone}`;
        const profile = await signupWithEmail({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: fullPhone,
          age: ageNum,
        });

        setSuccessMessage(`Account created! Welcome, ${profile.name.split(" ")[0]}! Redirecting...`);
        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            router.push(redirectTarget);
          }, 800);
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === "auth/email-already-in-use") {
          setErrorMessage("This email is already registered. Please sign in instead.");
        } else {
          setErrorMessage(error.message || "Registration failed. Please check your details.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Sign In mode
      if (!email.trim() || !email.includes("@")) {
        setErrorMessage("Please enter your registered email address.");
        return;
      }
      if (!password) {
        setErrorMessage("Please enter your password.");
        return;
      }

      try {
        setLoading(true);
        const profile = await loginWithEmail({
          email: email.trim(),
          password,
        });

        setSuccessMessage(`Welcome back, ${profile.name.split(" ")[0]}! Redirecting...`);
        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            router.push(redirectTarget);
          }, 800);
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
          setErrorMessage("Invalid email or password. Please check your credentials.");
        } else {
          setErrorMessage(error.message || "Failed to sign in. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      setErrorMessage("Enter a valid email address to receive reset instructions.");
      return;
    }
    try {
      setResetStatus("loading");
      await sendResetEmail(resetEmail.trim());
      setResetStatus("sent");
    } catch {
      setResetStatus("sent"); // Do not leak whether user exists for security
    }
  };

  const handleSandboxDemoLogin = async () => {
    try {
      setLoading(true);
      const demoProfile = await loginDevSandbox("new_client");
      setSuccessMessage(`Demo profile loaded as ${demoProfile.name}! Redirecting...`);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 sm:p-8 text-left ${className}`}
    >
      {/* Top Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00c853]/20 via-[#00e676]/30 to-emerald-100 text-[#00c853] mb-3 shadow-inner">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
          {mode === "signup" ? "Create Your BMYFIT Account" : "Sign In to BMYFIT"}
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          {mode === "signup"
            ? "Access your personalized nutrition & workout plan, tracked metrics & coach feedback."
            : "Continue your transformation and access your active weekly plan."}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-gray-100/90 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "signup"
              ? "bg-white text-gray-950 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "signin"
              ? "bg-white text-gray-950 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Alert Notices */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <svg className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1 font-semibold">{successMessage}</div>
        </div>
      )}

      {/* DIRECT GOOGLE LOGIN BUTTON */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-3 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm rounded-2xl border border-gray-200/90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 relative focus:outline-none focus:ring-2 focus:ring-[#00e676]/40 mb-4 disabled:opacity-60"
        aria-label="Continue with Google"
      >
        {googleLoading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider relative">
          or with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === "signup" && (
          <>
            {/* Full Name Field */}
            <div>
              <label htmlFor={nameId} className="block text-xs font-bold text-gray-800 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  id={nameId}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aryan Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Phone & Age Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Phone Field (7 cols) */}
              <div className="sm:col-span-7">
                <label htmlFor={phoneId} className="block text-xs font-bold text-gray-800 mb-1">
                  WhatsApp / Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs font-semibold text-gray-500 select-none flex items-center gap-1 bg-gray-200/60 px-1.5 py-0.5 rounded-md">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    id={phoneId}
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98201 44821"
                    maxLength={14}
                    className="w-full pl-[4.5rem] pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Age Field (5 cols) */}
              <div className="sm:col-span-5">
                <label htmlFor={ageId} className="block text-xs font-bold text-gray-800 mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    id={ageId}
                    type="number"
                    required
                    min={18}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="26"
                    className="w-full pl-9 pr-2 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor={emailId} className="block text-xs font-bold text-gray-800 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@bmyfit.in"
              autoComplete="email"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor={passwordId} className="block text-xs font-bold text-gray-800">
              Password <span className="text-rose-500">*</span>
            </label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsResetOpen(true);
                }}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Create a secure password (min 6 chars)" : "••••••••"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all font-medium"
            />
            {/* Show / Hide Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength bar for signup */}
          {mode === "signup" && password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-500">{passwordStrength.label}</span>
            </div>
          )}
        </div>

        {/* Remember me & Terms */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 text-[#00c853] rounded border-gray-300 focus:ring-[#00e676]"
            />
            <span>Remember me</span>
          </label>
          {mode === "signup" && (
            <span className="text-[10px] text-gray-400">
              By joining, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms
              </Link>
            </span>
          )}
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-[#00e676] via-[#00c853] to-[#057a44] hover:from-[#00c864] hover:to-[#04683a] active:scale-[0.99] text-gray-950 font-black text-sm rounded-2xl shadow-[0_10px_25px_rgba(0,200,83,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-gray-950 font-bold">
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              <span>{mode === "signup" ? "Creating Account..." : "Signing In..."}</span>
            </div>
          ) : (
            <>
              <span>{mode === "signup" ? "Create BMYFIT Account" : "Sign In to BMYFIT"}</span>
              <span className="text-base font-bold">→</span>
            </>
          )}
        </button>
      </form>

      {/* Dev Testing Sandbox Shortcut Button */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSandboxDemoLogin}
          className="text-[11px] font-semibold text-gray-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          title="Instant mock sign-in for testing without filling the form"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Quick Demo Sign-In (Local Testing)</span>
        </button>

        <span className="text-[10px] text-gray-400">SSL 256-Bit</span>
      </div>

      {/* Forgot Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                setIsResetOpen(false);
                setResetStatus("idle");
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-gray-900 mb-1">Reset Your Password</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>
            {resetStatus === "sent" ? (
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800 text-xs font-semibold mb-4">
                ✓ If an account exists with this email, a reset link has been dispatched. Check your inbox and spam folder.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00e676]"
                />
                <button
                  type="submit"
                  disabled={resetStatus === "loading"}
                  className="w-full py-2.5 bg-[#00c853] hover:bg-[#00b048] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  {resetStatus === "loading" ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
