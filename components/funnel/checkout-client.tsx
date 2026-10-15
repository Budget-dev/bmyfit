"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRazorpay } from "@/hooks/use-razorpay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";
import type { VerifyPaymentRequest } from "@/types/payment";

export interface CheckoutClientProps {
  id?: string;
  assessmentId?: string;
}

export function CheckoutClient({ id, assessmentId: propAssessmentId }: CheckoutClientProps) {
  const router = useRouter();
  const assessmentId = propAssessmentId || id || "";
  const { getIdToken, loading: authLoading } = useAuth();
  const { openCheckout } = useRazorpay();

  const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating" | "verifying" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = async () => {
    try {
      setPaymentStatus("creating");
      setErrorMessage(null);

      const token = await getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Step 1: Create Razorpay order on server
      const createOrderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({ assessmentId }),
      });

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to initiate payment order");
      }

      const orderData = await createOrderRes.json();
      const { orderId, amount, currency, keyId } = orderData;

      // Step 2: Open Razorpay checkout modal
      await openCheckout({
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount,
        currency: currency || "INR",
        name: APP_CONFIG.brandName,
        description: "Detailed Personalized Fitness & Nutrition Plan",
        order_id: orderId,
        theme: {
          color: "#10b981",
        },
        handler: async (response: VerifyPaymentRequest) => {
          try {
            setPaymentStatus("verifying");
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers,
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json().catch(() => ({}));
              throw new Error(err.error || "Payment verification failed");
            }

            // On success, redirect to plan page
            router.push(`/plan/${assessmentId}`);
          } catch (verifyErr) {
            setPaymentStatus("failed");
            setErrorMessage(
              verifyErr instanceof Error ? verifyErr.message : "Payment verification failed. Please contact support.",
            );
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("idle");
          },
        },
      });
    } catch (err) {
      setPaymentStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "Payment processing error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Order Summary Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between pb-6 border-b border-surface-200 dark:border-surface-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Order Summary
            </span>
            <h3 className="text-xl font-bold text-ink dark:text-white mt-1">
              BMYFIT Detailed Personalized Plan
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-ink dark:text-white">
              {APP_CONFIG.pricing.formatted}
            </span>
            <div className="text-[10px] text-ink-muted dark:text-surface-400">One-time payment</div>
          </div>
        </div>

        {/* What is included */}
        <div className="py-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-surface-400 mb-2">
            What You Receive Instantly:
          </h4>
          {[
            "7-Day Indian Meal Plan with exact portions (idli, dal, roti, rice, paneer/chicken/eggs)",
            "Calorie, protein, carbohydrate, and healthy fat daily targets",
            "Targeted Weekly Workout Schedule (Home & Gym versions) with sets, reps, and rest",
            "Comprehensive Indian Grocery Checklist tailored to your diet preference",
            "Daily habit checklist (sleep, hydration, step goals)",
            "Progress Tracking Guide (when to weigh, measure & adjust calories)",
            "Clean, branded, printable PDF download",
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-ink-muted dark:text-surface-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-0.5">
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div className="pt-4 border-t border-surface-200 dark:border-surface-800 space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted dark:text-surface-400">
            <span>Detailed Plan License</span>
            <span>{APP_CONFIG.pricing.formatted}</span>
          </div>
          <div className="flex justify-between text-ink-muted dark:text-surface-400">
            <span>GST / Taxes</span>
            <span>Included</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink dark:text-white pt-2 border-t border-surface-100 dark:border-surface-800">
            <span>Total Payable</span>
            <span className="text-emerald-600 dark:text-emerald-400">{APP_CONFIG.pricing.formatted}</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 dark:text-rose-300 font-bold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Payment Button */}
        <div className="mt-8 space-y-3">
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={handlePay}
            loading={paymentStatus === "creating" || paymentStatus === "verifying"}
            disabled={authLoading}
            className="shadow-glow"
          >
            {paymentStatus === "verifying"
              ? "Verifying Payment & Unlocking Plan..."
              : `Pay ${APP_CONFIG.pricing.formatted} via Razorpay`}
          </Button>

          <p className="text-center text-xs text-ink-muted dark:text-surface-400">
            Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking &amp; Wallets
          </p>
        </div>
      </Card>

      {/* Trust & Guarantee Badges */}
      <div className="p-6 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs text-ink-muted dark:text-surface-400 space-y-3">
        <div className="flex items-center justify-center gap-6 font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>256-Bit SSL Encryption</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Instant Unlocking</span>
          </span>
        </div>
        <p className="text-center text-[11px]">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-emerald-500">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/refund-policy" className="underline hover:text-emerald-500">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
