import React from "react";
import Link from "next/link";
import { BmyFitLogo } from "./logo";
import { APP_CONFIG } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 py-12 transition-colors">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 items-start">
          <div className="md:col-span-2">
            <BmyFitLogo />
            <p className="mt-3 text-sm text-ink-muted dark:text-surface-400 max-w-sm leading-relaxed">
              {APP_CONFIG.tagline}. Evidence-based BMI &amp; body fat calculations tailored for Indian bodies, with instant, actionable routines for just Rs. 99.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
              Legal &amp; Policy
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-surface-400">
              <li>
                <Link href="/privacy" className="hover:text-emerald-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-500 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-emerald-500 transition-colors">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
              Support
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-surface-400">
              <li>
                <Link href="/contact" className="hover:text-emerald-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li className="text-xs text-ink-muted dark:text-surface-500">
                Email: {APP_CONFIG.supportEmail}
              </li>
              <li className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Razorpay Verified Merchant
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-10 pt-6 border-t border-surface-200 dark:border-surface-800">
          <p className="text-xs leading-relaxed text-ink-muted dark:text-surface-400 text-center md:text-left">
            <span className="font-bold text-ink dark:text-surface-200">Medical Disclaimer: </span>
            {APP_CONFIG.medicalDisclaimer}
          </p>
          <div className="mt-4 flex flex-col md:flex-row items-center justify-between text-xs text-ink-muted dark:text-surface-500 gap-2">
            <p>© {new Date().getFullYear()} BMYFIT. All rights reserved.</p>
            <p>Made for India · Secure 256-bit Encrypted Payments</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
