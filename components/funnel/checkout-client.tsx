"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useRazorpay } from "@/hooks/use-razorpay";
import { APP_CONFIG } from "@/lib/config";
import type { VerifyPaymentRequest } from "@/types/payment";

export interface CheckoutClientProps {
  id?: string;
  assessmentId?: string;
}

export function CheckoutClient({ id, assessmentId: propAssessmentId }: CheckoutClientProps) {
  const router = useRouter();
  const assessmentId = propAssessmentId || id || "local";
  const { getIdToken } = useAuth();
  const { openCheckout } = useRazorpay();

  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating" | "verifying" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Customer contact state for receipt & coach connection
  const [customerDetails, setCustomerDetails] = useState({
    name: "Aryan Sharma",
    email: "client@bmyfit.in",
    phone: "+91 98201 44821",
  });
  const [showEditContact, setShowEditContact] = useState(false);

  // Dev sandbox modal state when running locally without real Razorpay keys
  const [sandboxOrder, setSandboxOrder] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  } | null>(null);
  const [sandboxSecurityTestResult, setSandboxSecurityTestResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawUser =
        (typeof window !== "undefined" && localStorage.getItem("bmyfit_user_profile")) ||
        sessionStorage.getItem("bmyfit_user_profile");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) {
          setCustomerDetails((prev) => ({
            ...prev,
            name: u.name || prev.name,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
          }));
        }
      }

      const raw = sessionStorage.getItem("bmyfit_local_assessment");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) {
          setCustomerDetails((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
          }));
        }
      }
    } catch {}
  }, []);

  const handlePay = async () => {
    try {
      setPaymentStatus("creating");
      setErrorMessage(null);
      setSuccessNotice(null);

      const token = await getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Step 1: Request authoritative server order creation (Price strictly set to ₹99 by server)
      const createOrderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          assessmentId,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
        }),
      });

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            errorData.message ||
            "Unable to initialize payment order. Please try again."
        );
      }

      const orderData = await createOrderRes.json();
      const { orderId, amount, currency, keyId, isSandbox } = orderData;

      // Step 2A: Local Dev Sandbox mode when live gateway credentials are not configured in .env.local
      if (isSandbox) {
        setPaymentStatus("idle");
        setSandboxOrder({ orderId, amount, currency, keyId });
        return;
      }

      // Step 2B: Open official Razorpay modal when credentials are configured
      await openCheckout({
        key: keyId,
        amount,
        currency: currency || "INR",
        name: APP_CONFIG.brandName,
        description: "8-Week Personalized Fitness & Nutrition Plan",
        order_id: orderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: "#00c853",
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("idle");
          },
        },
        handler: async (response: VerifyPaymentRequest) => {
          try {
            setPaymentStatus("verifying");
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers,
              body: JSON.stringify({
                ...response,
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                customerPhone: customerDetails.phone,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => ({}));
              throw new Error(
                verifyErr.error?.message || "Payment verification failed. Signature was rejected."
              );
            }

            sessionStorage.setItem("bmyfit_local_paid", "true");
            try {
              const raw = sessionStorage.getItem("bmyfit_local_assessment");
              if (raw) {
                const parsed = JSON.parse(raw);
                parsed.isPaid = true;
                sessionStorage.setItem("bmyfit_local_assessment", JSON.stringify(parsed));
              }
            } catch {}

            router.push(`/plan/${assessmentId}`);
          } catch (verifyErr) {
            setPaymentStatus("failed");
            setErrorMessage(
              verifyErr instanceof Error ? verifyErr.message : "Payment verification failed."
            );
          }
        },
      });
    } catch (err) {
      setPaymentStatus("failed");
      setErrorMessage(
        err instanceof Error ? err.message : "Payment processing error. Please try again."
      );
    }
  };

  // Complete genuine simulation in Dev Sandbox
  const handleSandboxSimulateSuccess = async () => {
    if (!sandboxOrder) return;
    try {
      setPaymentStatus("verifying");
      setSandboxSecurityTestResult(null);

      const paymentId = `pay_sbx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

      // Ask dev helper on server for genuine HMAC SHA-256 signature
      const sigRes = await fetch("/api/payments/sandbox-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: sandboxOrder.orderId,
          paymentId,
        }),
      });

      if (!sigRes.ok) {
        throw new Error("Sandbox signature generation failed");
      }

      const { signature } = await sigRes.json();

      // Submit signature to server /api/payments/verify for HMAC timingSafeEqual validation
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: sandboxOrder.orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
        }),
      });

      if (!verifyRes.ok) {
        const verifyErr = await verifyRes.json().catch(() => ({}));
        throw new Error(verifyErr.error?.message || "Server verification failed.");
      }

      sessionStorage.setItem("bmyfit_local_paid", "true");
      try {
        const raw = sessionStorage.getItem("bmyfit_local_assessment");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.isPaid = true;
          sessionStorage.setItem("bmyfit_local_assessment", JSON.stringify(parsed));
        }
      } catch {}

      setSandboxOrder(null);
      router.push(`/plan/${assessmentId}`);
    } catch (err) {
      setPaymentStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "Sandbox verification error");
    }
  };

  // Test security defense against tampered/forged signatures
  const handleSandboxTestTamperedAttack = async () => {
    if (!sandboxOrder) return;
    try {
      setSandboxSecurityTestResult("Sending forged signature to server...");
      const fakePaymentId = `pay_fake_${Date.now()}`;
      // Tampered 64-char invalid signature
      const tamperedSignature = "0".repeat(64);

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: sandboxOrder.orderId,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: tamperedSignature,
        }),
      });

      if (verifyRes.status === 400) {
        const errJson = await verifyRes.json();
        setSandboxSecurityTestResult(
          `🛡️ Security Defended: Server rejected the forged signature with HTTP 400 (${errJson.error?.code}: ${errJson.error?.message}). TimingSafeEqual prevented unauthorized access!`
        );
      } else {
        setSandboxSecurityTestResult(`Unexpected response: HTTP ${verifyRes.status}`);
      }
    } catch (err) {
      setSandboxSecurityTestResult(`Error during test: ${String(err)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900 font-sans antialiased overflow-x-hidden">
      {/* Top Header */}
      <SiteHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md mx-auto w-full px-3 pt-1 pb-16 flex flex-col justify-between">
        <div>
          {/* Subtitle & 4-Step Stepper Bar */}
          <div className="flex items-center justify-between gap-1 pt-0.5 pb-1">
            {/* Back button + UNLOCK YOUR PLAN */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-1 -ml-1 text-gray-700 hover:text-black transition-colors"
                aria-label="Go back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#00c853]">
                UNLOCK YOUR PLAN
              </span>
            </div>

            {/* 4-Step Stepper */}
            <div className="flex items-center justify-end shrink-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00c853] text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </div>
                <span className="text-[7.5px] text-gray-500 font-medium whitespace-nowrap mt-0.5">
                  Select Goal
                </span>
              </div>
              <div className="w-3.5 sm:w-5 h-[1.5px] bg-[#00c853] -mt-3 mx-0.5" />

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00c853] text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </div>
                <span className="text-[7.5px] text-gray-500 font-medium whitespace-nowrap mt-0.5">
                  Body Details
                </span>
              </div>
              <div className="w-3.5 sm:w-5 h-[1.5px] bg-[#00c853] -mt-3 mx-0.5" />

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00c853] text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </div>
                <span className="text-[7.5px] text-gray-500 font-medium whitespace-nowrap mt-0.5">
                  Analysis
                </span>
              </div>
              <div className="w-3.5 sm:w-5 h-[1.5px] bg-[#00c853] -mt-3 mx-0.5" />

              {/* Step 4 */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#073820] text-white flex items-center justify-center text-[8px] font-black">
                  4
                </div>
                <span className="text-[7.5px] text-gray-900 font-bold whitespace-nowrap mt-0.5">
                  Payment
                </span>
              </div>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="mt-0.5">
            <h1 className="text-[17px] sm:text-[19px] font-black text-gray-900 tracking-tight leading-tight">
              Get Your Personalized <span className="text-[#00c853]">Fitness Plan</span>
            </h1>
            <p className="text-[8.5px] sm:text-[9.5px] text-gray-500 mt-0.5 leading-snug">
              Your analysis is complete. Unlock your full 8-week plan and start your transformation today.
            </p>
          </div>

          {/* Dual Offer Comparison Cards */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Card 1: Your Plan Includes */}
            <div className="bg-white rounded-xl border border-gray-150 p-2 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <h2 className="font-bold text-gray-900 text-[9.5px] sm:text-[10.5px] leading-tight">
                    Your Plan Includes
                  </h2>
                  <span className="text-[7px] sm:text-[7.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-full whitespace-nowrap">
                    8 WEEK PLAN
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* 1. Nutrition */}
                  <div className="flex items-start gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-[#e8f5e9] text-[#00c853] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-gray-900 leading-tight">
                        Personalized Nutrition Plan
                      </div>
                      <div className="text-[7px] text-gray-500 leading-none mt-0.5">
                        Daily calorie target + Indian meal options
                      </div>
                    </div>
                  </div>

                  {/* 2. Workout */}
                  <div className="flex items-start gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-[#e8f5e9] text-[#00c853] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 5v14M18 5v14M4 9h4M16 9h4M4 15h4M16 15h4M8 12h8" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-gray-900 leading-tight">
                        Goal-Specific Workout Plan
                      </div>
                      <div className="text-[7px] text-gray-500 leading-none mt-0.5">
                        Sets, reps &amp; progressive structure
                      </div>
                    </div>
                  </div>

                  {/* 3. Progress Tracking */}
                  <div className="flex items-start gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-[#e8f5e9] text-[#00c853] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-gray-900 leading-tight">
                        Progress Tracking
                      </div>
                      <div className="text-[7px] text-gray-500 leading-none mt-0.5">
                        Weekly milestones and adjustments
                      </div>
                    </div>
                  </div>

                  {/* 4. Body Data */}
                  <div className="flex items-start gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-[#e8f5e9] text-[#00c853] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-gray-900 leading-tight">
                        Built Around Your Body Data
                      </div>
                      <div className="text-[7px] text-gray-500 leading-none mt-0.5">
                        Customized for your BMI, body fat and goal
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Phone Screens Showcase */}
              <div className="mt-1.5 rounded-md overflow-hidden border border-gray-100 bg-gray-50">
                <Image
                  src="/images/plan-triple-screens.jpg"
                  alt="Meal Plan, Workout Plan and Progress Tracker"
                  width={300}
                  height={190}
                  className="w-full h-[62px] sm:h-[70px] object-cover"
                />
              </div>
            </div>

            {/* Card 2: BMYFIT Personalized Plan */}
            <div className="bg-white rounded-xl border border-gray-150 p-2 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h2 className="font-bold text-gray-900 text-[9.5px] sm:text-[10.5px] leading-tight">
                    BMYFIT<br />Personalized Plan
                  </h2>
                  <span className="text-[7px] sm:text-[7.5px] font-bold text-white bg-[#00c853] px-1.5 py-0.5 rounded-full whitespace-nowrap self-start">
                    BEST VALUE
                  </span>
                </div>

                {/* Price */}
                <div className="mt-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
                    ₹99
                  </div>
                  <div className="text-[7.5px] sm:text-[8px] text-gray-500 font-medium">
                    One-time payment
                  </div>
                </div>

                {/* 7 Checklist Points */}
                <div className="bg-[#f8fafc] rounded-lg p-1.5 space-y-1 mt-1 border border-gray-100">
                  {[
                    "Daily calorie target",
                    "Protein target",
                    "Personalized Indian diet",
                    "Goal-specific workout",
                    "8-week structure",
                    "Progress tracking",
                    "Lifetime access to your plan",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#00c853] text-white flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5l2.5 2.5 4.5-5" />
                        </svg>
                      </div>
                      <span className="text-[7.5px] sm:text-[8px] text-gray-700 font-medium leading-none">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gift Box Guarantee callout */}
              <div className="mt-1 flex items-center gap-1 p-1 rounded-md bg-emerald-50/70 border border-emerald-100/60">
                <div className="w-4 h-4 rounded bg-emerald-100 text-[#00c853] flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <p className="text-[6.5px] sm:text-[7.5px] text-gray-600 leading-tight">
                  No subscription. No hidden charges. Just your personalized plan.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details summary / edit row */}
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#00c853]/15 text-[#00c853] flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-[9.5px] font-bold text-gray-900 leading-tight">
                    Deliver Plan &amp; Receipt To: {customerDetails.name}
                  </div>
                  <div className="text-[7.5px] text-gray-500 leading-tight">
                    {customerDetails.email} • {customerDetails.phone}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditContact(!showEditContact)}
                className="text-[8px] font-bold text-[#00c853] hover:underline"
              >
                {showEditContact ? "Done" : "Edit Details"}
              </button>
            </div>

            {showEditContact && (
              <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 gap-1.5">
                <div>
                  <label className="text-[7.5px] font-semibold text-gray-600 block mb-0.5">Your Full Name</label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="w-full text-[9px] px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[7.5px] font-semibold text-gray-600 block mb-0.5">Email Address</label>
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      className="w-full text-[9px] px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-[#00c853]"
                    />
                  </div>
                  <div>
                    <label className="text-[7.5px] font-semibold text-gray-600 block mb-0.5">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                      className="w-full text-[9px] px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-[#00c853]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Choose a Payment Method Section */}
          <div className="mt-2">
            <h2 className="text-[11.5px] sm:text-[12.5px] font-bold text-gray-900 leading-tight">
              Choose a Payment Method
            </h2>
            <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5 mb-1.5 leading-none">
              Secure and encrypted payment gateway powered by Razorpay.
            </p>

            <div className="space-y-1">
              {/* Option 1: UPI */}
              <div
                onClick={() => setSelectedMethod("upi")}
                className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between border ${
                  selectedMethod === "upi"
                    ? "border-1.5 border-[#00c853] bg-[#f0fdf4]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="h-3.5 px-1 rounded bg-white flex items-center justify-center border border-gray-200 shadow-2xs">
                      <span className="text-[6.5px] font-black text-gray-800 tracking-tighter">UPI</span>
                    </div>
                    <div className="h-3.5 px-1 rounded bg-white flex items-center justify-center border border-gray-200 shadow-2xs">
                      <span className="text-[6.5px] font-bold text-gray-700 flex items-center gap-0.5">
                        <span className="text-blue-500 font-black">G</span>Pay
                      </span>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[6.5px] font-bold">
                      पे
                    </div>
                    <div className="h-3.5 px-1 rounded bg-[#002e6e] text-white flex items-center justify-center text-[6px] font-bold">
                      Pay<span className="text-[#00b9f5]">tm</span>
                    </div>
                  </div>

                  <div>
                    <div className={`text-[9.5px] sm:text-[10.5px] font-bold ${selectedMethod === "upi" ? "text-[#00c853]" : "text-gray-900"}`}>
                      UPI (Google Pay, PhonePe, Paytm, QR)
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-gray-500 leading-none">
                      Zero convenience fee • Instant plan activation
                    </div>
                  </div>
                </div>

                <div className="w-3.5 h-3.5 rounded-full border-1.5 flex items-center justify-center shrink-0 ml-2 border-[#00c853]">
                  {selectedMethod === "upi" && <div className="w-1.5 h-1.5 rounded-full bg-[#00c853]" />}
                </div>
              </div>

              {/* Option 2: Card */}
              <div
                onClick={() => setSelectedMethod("card")}
                className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between border ${
                  selectedMethod === "card"
                    ? "border-1.5 border-[#00c853] bg-[#f0fdf4]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-900">
                      Debit / Credit Card
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-gray-500 leading-none">
                      Visa, Mastercard, RuPay &amp; Diners Club
                    </div>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border-1.5 flex items-center justify-center shrink-0 ml-2 ${selectedMethod === "card" ? "border-[#00c853]" : "border-gray-300"}`}>
                  {selectedMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-[#00c853]" />}
                </div>
              </div>

              {/* Option 3: Net Banking */}
              <div
                onClick={() => setSelectedMethod("netbanking")}
                className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between border ${
                  selectedMethod === "netbanking"
                    ? "border-1.5 border-[#00c853] bg-[#f0fdf4]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-900">
                      Net Banking &amp; Wallets
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-gray-500 leading-none">
                      HDFC, ICICI, SBI, Axis &amp; 50+ banks
                    </div>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border-1.5 flex items-center justify-center shrink-0 ml-2 ${selectedMethod === "netbanking" ? "border-[#00c853]" : "border-gray-300"}`}>
                  {selectedMethod === "netbanking" && <div className="w-1.5 h-1.5 rounded-full bg-[#00c853]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Error notice if needed */}
          {errorMessage && (
            <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[9.5px] flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success notice if needed */}
          {successNotice && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9.5px] flex items-center gap-1.5">
              <span>{successNotice}</span>
            </div>
          )}

          {/* Main Action Button */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={handlePay}
              disabled={paymentStatus === "creating" || paymentStatus === "verifying"}
              className="w-full py-2.5 px-4 rounded-full bg-[#073820] hover:bg-[#052b18] active:bg-[#031d10] text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75"
            >
              {paymentStatus === "creating" || paymentStatus === "verifying" ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>
                    {paymentStatus === "creating" ? "Initializing Gateway..." : "Verifying HMAC Signature..."}
                  </span>
                </>
              ) : (
                <>
                  <span>Pay ₹99 &amp; Unlock Plan</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Secure payment text */}
            <div className="flex items-center justify-center gap-1.5 text-[8.5px] sm:text-[9px] text-gray-500 mt-1.5">
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>256-Bit SSL Encrypted &bull; Razorpay Payment Gateway</span>
            </div>
          </div>

          {/* 3 Trust Badges */}
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            <div className="p-1 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center gap-1 text-center">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-[7.5px] text-gray-700 font-semibold leading-tight">
                100% Secure Payments
              </span>
            </div>

            <div className="p-1 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center gap-1 text-center">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-[7.5px] text-gray-700 font-semibold leading-tight">
                Instant Access After Payment
              </span>
            </div>

            <div className="p-1 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center gap-1 text-center">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="11" r="1.5" />
                </svg>
              </div>
              <span className="text-[7.5px] text-gray-700 font-semibold leading-tight">
                Your Data is Private
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Razorpay Development Sandbox Modal for Local Offline Testing */}
      {sandboxOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#002e6e] text-white flex items-center justify-center font-black text-xs">
                  R
                </div>
                <div>
                  <div className="text-xs font-black text-gray-900 leading-tight">
                    Razorpay Gateway Sandbox
                  </div>
                  <div className="text-[8.5px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Local Development Security Simulator
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSandboxOrder(null)}
                className="w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono font-bold text-gray-800">{sandboxOrder.orderId}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-bold text-gray-900">₹99.00 ({sandboxOrder.amount} paise)</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-500">Security:</span>
                  <span className="font-mono text-emerald-700 font-semibold">HMAC SHA-256 (timingSafeEqual)</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-500">Target User:</span>
                  <span className="font-semibold text-gray-800">{customerDetails.name}</span>
                </div>
              </div>

              <p className="text-[8.5px] text-gray-500 leading-snug">
                This sandbox tests the real cryptographic backend pipeline. Real Razorpay API keys can be supplied anytime in <code className="bg-gray-100 px-1 py-0.5 rounded text-[8px]">.env.local</code>.
              </p>

              {sandboxSecurityTestResult && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[8.5px] leading-relaxed">
                  {sandboxSecurityTestResult}
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <button
                type="button"
                onClick={handleSandboxSimulateSuccess}
                disabled={paymentStatus === "verifying"}
                className="w-full py-2 px-3 rounded-xl bg-[#00c853] hover:bg-[#00b048] active:bg-[#00963d] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {paymentStatus === "verifying" ? (
                  <span>Verifying HMAC Signature on Server...</span>
                ) : (
                  <span>✓ Authorize &amp; Verify Payment (₹99)</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleSandboxTestTamperedAttack}
                className="w-full py-1.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[10px] flex items-center justify-center gap-1 transition-all"
              >
                🛡️ Test Tampered Signature Rejection (Security Defense)
              </button>

              <button
                type="button"
                onClick={() => setSandboxOrder(null)}
                className="w-full py-1 text-center text-gray-400 hover:text-gray-600 text-[9px]"
              >
                Cancel and return to checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
