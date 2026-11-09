import { z } from "zod";
import { optionalUser } from "@/lib/firebase/auth";
import {
  getAssessmentById,
  storePlan,
  storeDashboardPlan,
} from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { PLAN_PRICE_PAISE } from "@/lib/payments/razorpay";
import { generatePlan } from "@/features/plan";
import type { Assessment, AssessmentInput } from "@/types/fitness";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { registerPurchasedClient } from "@/features/admin/admin-data";
import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

const manualVerifySchema = z.object({
  assessmentId: z.string().min(1).max(200),
  utr: z.string().min(4).max(60),
  paymentApp: z.string().max(50).optional(),
  paymentScreenshot: z.string().max(2000000).optional(), // Max ~2MB base64
  customerName: z.string().max(100).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().max(30).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await optionalUser();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "The request payload is invalid", 400);
    }
    const input = manualVerifySchema.parse(body);

    const uid =
      user?.uid ||
      request.headers.get("x-session-id")?.trim() ||
      `guest_${input.assessmentId}`;

    enforceRateLimit(requestKey(request, "payment-manual-upi", uid), 30);

    const utrClean = input.utr.trim();
    const customerName = input.customerName?.trim() || "Valued Athlete";
    const paymentMethod = (input.paymentApp?.toLowerCase().includes("phonepe") ? "phonepe" : "upi_manual") as "phonepe" | "upi_manual";

    // 1. Fetch or generate assessment data
    const rawAssessment = await getAssessmentById(input.assessmentId).catch(() => null);
    const assessment: Assessment = rawAssessment || {
      id: input.assessmentId,
      uid,
      gender: "male" as const,
      age: 28,
      heightCm: 175,
      weightKg: 78,
      waistIn: 34,
      neckIn: 15.5,
      bmi: 25.5,
      bmiCategory: "normal",
      bodyFatPercent: 21.0,
      bodyFatCategory: "average",
      goal: "fat-loss" as const,
      activityLevel: "moderately-active" as const,
      dietPreference: "vegetarian" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Generate and store customized plan
    const assessmentInput: AssessmentInput = {
      gender: assessment.gender,
      age: assessment.age,
      heightCm: assessment.heightCm,
      weightKg: assessment.weightKg,
      waistIn: assessment.waistIn,
      neckIn: assessment.neckIn,
      hipIn: (assessment as { hipIn?: number }).hipIn,
      goal: assessment.goal,
      activityLevel: assessment.activityLevel,
      dietPreference: assessment.dietPreference,
    };
    const detailedPlan = generatePlan(assessmentInput, input.assessmentId);
    try {
      await storePlan(uid, input.assessmentId, detailedPlan);
    } catch (e) {
      console.warn("storePlan notice:", e);
    }

    const dashboardPlan = generateDashboardPlan(input.assessmentId, {
      status: "pending_review",
      goal: assessment.goal,
      bmi: assessment.bmi ?? undefined,
      bodyFatPercent: assessment.bodyFatPercent ?? undefined,
      weeksCount: 8,
      customerName,
      coachNotes: `DIRECT UPI / PHONEPE PAYMENT: Client submitted UTR ${utrClean} via ${input.paymentApp || "PhonePe"}. Verification recorded.`,
    });

    try {
      await storeDashboardPlan(uid, input.assessmentId, dashboardPlan);
    } catch (e) {
      console.warn("storeDashboardPlan notice:", e);
    }

    // 3. Register client in Admin Store & Firestore
    await registerPurchasedClient({
      userId: uid,
      assessmentId: input.assessmentId,
      utr: utrClean,
      paymentMethod,
      paymentScreenshot: input.paymentScreenshot,
      amountPaise: PLAN_PRICE_PAISE,
      customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      goal: assessment.goal,
      goalDisplay:
        assessment.goal === "fat-loss"
          ? "Fat Loss & Metabolic Reset"
          : assessment.goal === "muscle-gain"
          ? "Hypertrophy & Conditioning"
          : assessment.goal === "recomposition"
          ? "Body Recomposition & Muscle Sculpt"
          : "General Fitness & Health",
      biometrics: {
        gender: assessment.gender,
        age: assessment.age,
        heightCm: assessment.heightCm,
        weightKg: assessment.weightKg,
        waistIn: assessment.waistIn,
        neckIn: assessment.neckIn,
        hipIn: assessment.hipIn,
        bmi: assessment.bmi,
        bmiCategory: assessment.bmiCategory,
        bodyFatPercent: assessment.bodyFatPercent ?? undefined,
        bodyFatCategory: assessment.bodyFatCategory ?? undefined,
        dietPreference: assessment.dietPreference,
        activityLevel: assessment.activityLevel,
      },
    });

    // 4. Also store in Firestore "orders" collection if admin credentials exist
    if (hasAdminCredentials) {
      try {
        const orderDocRef = adminDb.collection("orders").doc(`upi_${utrClean}`);
        await orderDocRef.set({
          id: `upi_${utrClean}`,
          utr: utrClean,
          uid,
          userId: uid,
          assessmentId: input.assessmentId,
          amountPaise: PLAN_PRICE_PAISE,
          amountFormatted: "₹99",
          currency: "INR",
          status: "paid",
          paymentMethod,
          paymentApp: input.paymentApp || "PhonePe",
          customerName,
          customerEmail: input.customerEmail || "",
          customerPhone: input.customerPhone || "",
          hasScreenshot: Boolean(input.paymentScreenshot),
          createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        // Sync footprint in Firestore
        const fpRef = adminDb.collection("visitor_footprints").doc(uid);
        await fpRef.set(
          {
            visitorId: uid,
            customerName,
            customerEmail: input.customerEmail || "",
            customerPhone: input.customerPhone || "",
            isPaid: true,
            utr: utrClean,
            orderId: `upi_${utrClean}`,
            highestStage: "utr_submitted",
            highestStageTitle: "Submitted Payment UTR Reference",
            lastActive: new Date().toISOString(),
            timeline: FieldValue.arrayUnion({
              stage: "utr_submitted",
              title: `Submitted UTR (${utrClean}) via ${input.paymentApp || "PhonePe"}`,
              path: "/checkout",
              timestamp: new Date().toISOString(),
              metadata: { utr: utrClean, paymentApp: input.paymentApp || "PhonePe" },
            }),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Firestore order sync warning:", err);
      }
    }

    return Response.json({
      verified: true,
      assessmentId: input.assessmentId,
      utr: utrClean,
      orderId: `upi_${utrClean}`,
      status: "paid",
      planUrl: `/plan/${input.assessmentId}`,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
