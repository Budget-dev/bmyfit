import React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Medical & Health Disclaimer · BMYFIT",
  description: "Important health, medical, and nutritional disclaimer information for BMYFIT users.",
};

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-3xl">
          <Card className="p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Health &amp; Safety Notice
              </span>
              <h1 className="text-3xl font-black text-ink dark:text-white mt-1">
                Medical Disclaimer
              </h1>
              <p className="text-xs text-ink-muted dark:text-surface-400 mt-1">
                Last updated: October 2026
              </p>
            </div>

            <div className="space-y-4 text-sm text-ink-muted dark:text-surface-300 leading-relaxed border-t border-surface-200 dark:border-surface-800 pt-6">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-300 font-medium">
                <strong className="block text-base font-bold mb-1">Non-Medical Advisory:</strong>
                {APP_CONFIG.medicalDisclaimer}
              </div>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">1. Educational &amp; Estimation Purposes Only</h3>
              <p>
                All calculations, including Body Mass Index (BMI), estimated Body Fat Percentage via the US Navy Circumference Method, Basal Metabolic Rate (BMR), and Total Daily Energy Expenditure (TDEE), provided by {APP_CONFIG.brandName} are intended strictly for educational, informational, and personal lifestyle tracking purposes.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">2. No Doctor-Patient Relationship</h3>
              <p>
                Use of this website and purchasing digital fitness or nutrition plans does not establish a doctor-patient, dietitian-patient, or licensed medical healthcare relationship. The recommendations are generated algorithmically and should not replace clinical medical evaluation, diagnosis, or treatment.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">3. Prior Medical Clearance</h3>
              <p>
                Always consult with a qualified physician, cardiologist, endocrinologist, or registered clinical dietitian prior to initiating any new dietary regimen, calorie restriction, or physical exercise program, especially if you have pre-existing cardiovascular conditions, diabetes, hypertension, injuries, eating disorders, or are pregnant or nursing.
              </p>

              <h3 className="text-base font-bold text-ink dark:text-white pt-2">4. Assumption of Risk</h3>
              <p>
                Physical exercise and dietary modifications carry inherent physical risks. By utilizing the {APP_CONFIG.brandName} platform and participating in suggested activities, you voluntarily assume all associated risks and agree to exercise within your safe personal capabilities.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
