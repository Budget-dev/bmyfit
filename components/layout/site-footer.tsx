import React from "react";
import Link from "next/link";
import { BmyFitLogo } from "./logo";
import { APP_CONFIG } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 items-start">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <BmyFitLogo />
            <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
              {APP_CONFIG.tagline}. Evidence-based BMI &amp; US Navy body fat calculations tailored for Indian bodies, with instant, actionable 7-day Indian meal and workout plans for just Rs. 99.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-800">
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Razorpay Verified
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium text-gray-700">
                🔒 256-Bit SSL Encryption
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium text-gray-700">
                🇮🇳 Made for India
              </span>
            </div>
          </div>

          {/* Col 2: Solutions & Calculations */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Assessment &amp; Plans
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/#calculator-card" className="hover:text-emerald-600 transition-colors">
                  Free Body Calculator
                </Link>
              </li>
              <li>
                <Link href="/#goals-section" className="hover:text-emerald-600 transition-colors">
                  Fat Loss Blueprint
                </Link>
              </li>
              <li>
                <Link href="/#goals-section" className="hover:text-emerald-600 transition-colors">
                  Muscle Gain Hypertrophy
                </Link>
              </li>
              <li>
                <Link href="/#goals-section" className="hover:text-emerald-600 transition-colors">
                  Body Recomposition
                </Link>
              </li>
              <li>
                <Link href="/details" className="hover:text-emerald-600 transition-colors">
                  Personalized 7-Day Plan
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Legal &amp; Policy
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-emerald-600 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-emerald-600 transition-colors">
                  Refund &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-emerald-600 transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-emerald-600 transition-colors">
                  Medical &amp; Clinical Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Company &amp; Support
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition-colors">
                  About BMYFIT
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-600 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                  Contact Customer Support
                </Link>
              </li>
              <li className="pt-1 text-[11px] text-gray-500">
                Email: <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-emerald-600 hover:underline">{APP_CONFIG.supportEmail}</a>
              </li>
              <li className="text-[11px] text-gray-500">
                Bengaluru, Karnataka, India
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer & Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed mb-4">
            <strong className="font-bold">Medical Disclaimer: </strong>
            {APP_CONFIG.medicalDisclaimer}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} BMYFIT Health Technologies. All rights reserved.</p>
            <p>100% Private Assessment · Instant Digital Delivery · 256-Bit Bank-Grade Security</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
