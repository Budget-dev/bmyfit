// lib/telemetry/footprints.ts
//
// Client telemetry utility to capture and register user footprints across the
// BMYFIT conversion funnel: tracks how far users reach in the funnel, what stage
// they entered, what actions they took, and where they dropped off ("came and went").

export type FootprintStage =
  | "landing"
  | "goal_selected"
  | "details_entered"
  | "calculating_viewed"
  | "result_viewed"
  | "checkout_viewed"
  | "payment_method_selected"
  | "razorpay_checkout_opened"
  | "razorpay_payment_success"
  | "phonepe_intent_clicked"
  | "upi_fallback_clicked"
  | "upi_copied"
  | "utr_submitted"
  | "medical_submitted"
  | "plan_waiting";

export interface FootprintEvent {
  stage: FootprintStage;
  title: string;
  path: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface VisitorFootprintRecord {
  visitorId: string;
  userId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  goal?: string | null;
  highestStage: FootprintStage;
  highestStageTitle: string;
  firstSeenAt: string;
  lastActive: string;
  durationSeconds: number;
  device: "mobile" | "desktop";
  userAgent: string;
  referrer?: string;
  isPaid?: boolean;
  utr?: string | null;
  orderId?: string | null;
  timeline: FootprintEvent[];
}

export const STAGE_TITLES: Record<FootprintStage, string> = {
  landing: "Landed on BMYFIT",
  goal_selected: "Selected Fitness Goal",
  details_entered: "Entered Body Measurements & Biometrics",
  calculating_viewed: "Viewed Assessment Calculation Animation",
  result_viewed: "Viewed Free Assessment Result & Score",
  checkout_viewed: "Reached Payment Checkout (₹99)",
  payment_method_selected: "Selected Payment Option",
  razorpay_checkout_opened: "Clicked 'Pay ₹99 via Razorpay'",
  razorpay_payment_success: "Payment Verified via Razorpay Gateway",
  phonepe_intent_clicked: "Tapped 'Open PhonePe App' (₹99.00)",
  upi_fallback_clicked: "Tapped 'Or Pay via GPay / Paytm / UPI'",
  upi_copied: "Copied Payee UPI ID (9959729662-2@ybl)",
  utr_submitted: "Submitted Payment UTR Reference",
  medical_submitted: "Completed Health Profile & Medical Questions",
  plan_waiting: "Waiting for Coach Naveen's Plan Release",
};

export const STAGE_RANK: Record<FootprintStage, number> = {
  landing: 1,
  goal_selected: 2,
  details_entered: 3,
  calculating_viewed: 4,
  result_viewed: 5,
  checkout_viewed: 6,
  payment_method_selected: 7,
  razorpay_checkout_opened: 8,
  phonepe_intent_clicked: 8,
  upi_fallback_clicked: 8,
  upi_copied: 8,
  razorpay_payment_success: 9,
  utr_submitted: 9,
  medical_submitted: 10,
  plan_waiting: 11,
};

/**
 * Returns a persistent anonymous visitor ID stored across browser sessions.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server_anonymous";
  try {
    let vid = localStorage.getItem("bmyfit_visitor_id");
    if (!vid) {
      const rand = Math.random().toString(36).substring(2, 10);
      vid = `fp_${Date.now()}_${rand}`;
      localStorage.setItem("bmyfit_visitor_id", vid);
    }
    return vid;
  } catch {
    return `fp_${Date.now()}_fallback`;
  }
}

/**
 * Detects whether the current device is mobile or desktop.
 */
export function detectDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined" || !navigator) return "desktop";
  const ua = navigator.userAgent || "";
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    ? "mobile"
    : "desktop";
}

/**
 * Extracts any stored user profile data (name, phone, email, goal) from localStorage.
 */
export function getStoredVisitorMetadata(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const meta: Record<string, unknown> = {};

  try {
    const rawProfile = localStorage.getItem("bmyfit_user_profile");
    if (rawProfile) {
      const p = JSON.parse(rawProfile);
      if (p.name) meta.customerName = p.name;
      if (p.phone) meta.customerPhone = p.phone;
      if (p.email) meta.customerEmail = p.email;
      if (p.goal) meta.goal = p.goal;
    }

    const rawAssessment = localStorage.getItem("bmyfit_assessment");
    if (rawAssessment) {
      const a = JSON.parse(rawAssessment);
      if (a.goal && !meta.goal) meta.goal = a.goal;
      if (a.weightKg) meta.weightKg = a.weightKg;
      if (a.heightCm) meta.heightCm = a.heightCm;
      if (a.bmi) meta.bmi = a.bmi;
    }
  } catch (err) {
    console.debug("[Footprint] Could not parse stored visitor metadata", err);
  }

  return meta;
}

/**
 * Records a visitor footprint transition event.
 * Disabled: Footprint telemetry deactivated per admin privacy & user requirement.
 */
export function recordFootprint(
  _stage?: FootprintStage,
  _customMeta?: Record<string, unknown>
): void {
  void _stage;
  void _customMeta;
  // Intentionally disabled: visitor footprints deactivated
}

