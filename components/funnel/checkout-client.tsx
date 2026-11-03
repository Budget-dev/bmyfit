"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { getStoredProfile, saveStoredProfile } from "@/features/auth/auth-service";
import { db, doc, setDoc } from "@/lib/firebase/client";
import { useRazorpay } from "@/hooks/use-razorpay";
import { APP_CONFIG } from "@/lib/config";
import type { VerifyPaymentRequest } from "@/types/payment";
import type { MedicalDocument, MedicalAssessment, AdminUserRecord, UserPurchaseOrder } from "@/types/admin";
import {
  saveStoredMedicalConsultation,
  upsertStoredAdminUser,
  saveStoredPlan,
} from "@/lib/storage/mock-storage";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import {
  FontAwesomeIcon,
  faShieldHalved,
  faBolt,
  faLock,
  faCheck,
  faArrowRight,
} from "@/components/ui/font-awesome-icons";
import { recordFootprint } from "@/lib/telemetry/footprints";

export interface CheckoutClientProps {
  id?: string;
  assessmentId?: string;
}

const DISEASE_OPTIONS = [
  { id: "diabetes", label: "Diabetes (Type 1 / 2)", icon: "🩺" },
  { id: "bp", label: "Hypertension / High BP", icon: "💓" },
  { id: "thyroid", label: "Thyroid (Hypo / Hyper)", icon: "🦋" },
  { id: "pcod", label: "PCOD / PCOS", icon: "🌸" },
  { id: "asthma", label: "Asthma / Respiratory", icon: "🫁" },
  { id: "back", label: "Lower Back / Spine issue", icon: "🦴" },
  { id: "joints", label: "Knee / Joint Pain", icon: "🦵" },
  { id: "heart", label: "Heart / Cardio issue", icon: "🫀" },
  { id: "liver", label: "Fatty Liver / Cholesterol", icon: "🧪" },
  { id: "allergies", label: "Food Allergies / Celiac", icon: "🌾" },
  { id: "none", label: "None / Completely Healthy", icon: "✅" },
];

function getSessionBiometrics(): AdminUserRecord["biometrics"] {
  let biometrics: AdminUserRecord["biometrics"] = {
    gender: "male",
    age: 28,
    heightCm: 175,
    weightKg: 78,
    targetWeightKg: 70,
    waistIn: 34,
    neckIn: 15.5,
    bmi: 25.5,
    bmiCategory: "overweight",
    bodyFatPercent: 22.0,
    bodyFatCategory: "average",
    bmr: 1720,
    tdee: 2380,
    caloricTarget: 1850,
    proteinTargetGrams: 130,
    activityLevel: "moderately-active",
    dietPreference: "vegetarian",
    waterLitres: 3.5,
    dailyStepGoal: 10000,
  };
  try {
    if (typeof window !== "undefined") {
      const rawAssess =
        sessionStorage.getItem("bmyfit_local_assessment") ||
        localStorage.getItem("bmyfit_local_assessment");
      const rawCalc =
        sessionStorage.getItem("bmyfit_local_calculated") ||
        localStorage.getItem("bmyfit_local_calculated");
      if (rawAssess) {
        const parsedAssess = JSON.parse(rawAssess);
        const parsedCalc = rawCalc ? JSON.parse(rawCalc) : {};
        biometrics = {
          ...biometrics,
          gender: parsedAssess.gender || biometrics?.gender || "male",
          age: Number(parsedAssess.age) || biometrics?.age || 28,
          heightCm: Number(parsedAssess.heightCm) || biometrics?.heightCm || 175,
          weightKg: Number(parsedAssess.weightKg) || biometrics?.weightKg || 78,
          targetWeightKg: Number(parsedAssess.targetWeightKg) || biometrics?.targetWeightKg || 70,
          waistIn: Number(parsedAssess.waistIn) || biometrics?.waistIn || 34,
          neckIn: Number(parsedAssess.neckIn) || biometrics?.neckIn || 15.5,
          bmi: Number(parsedCalc.bmi) || biometrics?.bmi || 25.5,
          bmiCategory: parsedCalc.bmiCategory || biometrics?.bmiCategory || "average",
          bodyFatPercent: Number(parsedCalc.bodyFatPercent) || biometrics?.bodyFatPercent || 22.0,
          bodyFatCategory: parsedCalc.bodyFatCategory || biometrics?.bodyFatCategory || "average",
          bmr: Number(parsedCalc.bmr) || biometrics?.bmr || 1720,
          tdee: Number(parsedCalc.tdee) || biometrics?.tdee || 2380,
          caloricTarget: Number(parsedCalc.caloricTarget) || biometrics?.caloricTarget || 1850,
          proteinTargetGrams: Number(parsedCalc.proteinTargetGrams) || biometrics?.proteinTargetGrams || 130,
          activityLevel: parsedAssess.activityLevel || biometrics?.activityLevel || "moderately-active",
          dietPreference: parsedAssess.dietPreference || biometrics?.dietPreference || "vegetarian",
        };
      }
    }
  } catch { }
  return biometrics;
}

export function CheckoutClient({ id, assessmentId: propAssessmentId }: CheckoutClientProps) {
  const router = useRouter();
  const assessmentId = propAssessmentId || id || "local";
  const { user, userProfile, getIdToken } = useAuth();
  const { openCheckout } = useRazorpay();

  const [funnelStep, setFunnelStep] = useState<"payment" | "medical_questionnaire" | "medical_submitted">("payment");
  const [, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating" | "verifying" | "failed" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Payment Successful Popup & Waitlisting State
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState<boolean>(false);
  const [confirmedPaymentDetails, setConfirmedPaymentDetails] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
  } | null>(null);

  // Post-payment Medical Health Profile & Documents State
  const [hasDisease, setHasDisease] = useState<boolean | null>(null);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [customDiseaseDescription, setCustomDiseaseDescription] = useState<string>("");
  const [medications, setMedications] = useState<string>("");
  const [uploadedDocuments, setUploadedDocuments] = useState<MedicalDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
  const [isSubmittingMedical, setIsSubmittingMedical] = useState<boolean>(false);

  // Customer contact state for receipt & coach connection
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

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
      const u = getStoredProfile();
      if (u && u.name) {
        setCustomerDetails((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
        }));
      }

      const raw =
        sessionStorage.getItem("bmyfit_local_assessment") ||
        localStorage.getItem("bmyfit_local_assessment");
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
    } catch (e) {
      console.warn("Could not load stored user profile", e);
    }
  }, []);

  const handlePaymentSuccessPostProcess = (paymentId?: string, orderId?: string) => {
    const effectivePaymentId = paymentId || `pay_${Date.now()}`;
    const effectiveOrderId = orderId || `ord_${Date.now()}`;
    const primaryUserId = user?.uid || userProfile?.uid || (assessmentId !== "local" ? assessmentId : `client_${Date.now()}`);

    sessionStorage.setItem("bmyfit_local_paid", "true");
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bmyfit_local_paid", "true");
        localStorage.setItem("bmyfit_active_assessment_id", assessmentId);
        localStorage.setItem("bmyfit_active_plan_id", assessmentId);
        localStorage.setItem(`bmyfit_paid_${assessmentId}`, "true");
        if (primaryUserId) {
          localStorage.setItem(`bmyfit_paid_${primaryUserId}`, "true");
        }
      } catch { }
    }
    try {
      const raw =
        sessionStorage.getItem("bmyfit_local_assessment") ||
        localStorage.getItem("bmyfit_local_assessment");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.isPaid = true;
        parsed.membershipCategory = "purchased";
        if (primaryUserId) parsed.uid = primaryUserId;
        sessionStorage.setItem("bmyfit_local_assessment", JSON.stringify(parsed));
        localStorage.setItem("bmyfit_local_assessment", JSON.stringify(parsed));
      }
    } catch { }

    const realBiometrics = getSessionBiometrics();
    const now = new Date().toISOString();

    const initialOrderRecord: UserPurchaseOrder = {
      orderId: effectiveOrderId,
      razorpayOrderId: effectiveOrderId,
      razorpayPaymentId: effectivePaymentId,
      amountPaise: 9900,
      amountFormatted: "₹99",
      currency: "INR",
      status: "paid",
      paymentMethod: "razorpay",
      packageTitle: "Custom 8-Week Transformation Plan",
      durationWeeks: 8,
      purchasedAt: now,
    };

    const sanitizedFirestoreOrder = {
      id: effectiveOrderId,
      orderId: effectiveOrderId,
      uid: primaryUserId,
      userId: primaryUserId,
      assessmentId,
      customerName: customerDetails.name || userProfile?.name || "Purchased Member",
      customerPhone: customerDetails.phone || userProfile?.phone || "",
      customerEmail: customerDetails.email || userProfile?.email || "",
      amount: 99,
      amountPaise: 9900,
      amountFormatted: "₹99",
      currency: "INR",
      status: "paid",
      paymentMethod: "razorpay",
      razorpayOrderId: effectiveOrderId,
      razorpayPaymentId: effectivePaymentId,
      packageTitle: "Custom 8-Week Transformation Plan",
      createdAt: now,
      paidAt: now,
      updatedAt: now,
    };

    const dashboardPlan = generateDashboardPlan(assessmentId, {
      customerName: customerDetails.name || userProfile?.name || "Purchased Member",
      weeksCount: 8,
      monthsCount: 2,
      status: "pending_review",
      coachNotes: "NEW ₹99 PURCHASE: Payment verified. Plan created in pending review status. Awaiting coach review & dispatch.",
    });

    const initialRecord: AdminUserRecord = {
      id: primaryUserId,
      assessmentId,
      name: customerDetails.name || userProfile?.name || "Purchased Member",
      email: customerDetails.email || userProfile?.email || `${primaryUserId}@client.bmyfit.in`,
      phone: customerDetails.phone || userProfile?.phone || "+91 98000 00000",
      city: "",
      avatar: userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      joinedAt: now,
      lastActive: "Active Now",
      membershipCategory: "purchased",
      membershipTitle: "Purchased Client Plan",
      goal: "fat-loss",
      goalDisplay: "Fat Loss & Metabolic Reset",
      needsPlanReview: true,
      isPaid: true,
      biometrics: realBiometrics,
      order: initialOrderRecord,
      plan: dashboardPlan,
    };

    upsertStoredAdminUser(initialRecord);
    saveStoredPlan(dashboardPlan);

    // Update in-memory & stored auth profile
    try {
      const current = getStoredProfile() || {
        uid: primaryUserId,
        name: customerDetails.name || userProfile?.name || "Purchased Member",
        email: customerDetails.email || userProfile?.email || "",
        phone: customerDetails.phone || userProfile?.phone || "",
        age: 26,
        provider: "password" as const,
        createdAt: now,
        role: "user" as const,
      };
      saveStoredProfile({
        ...current,
        membershipCategory: "purchased",
        isPaid: true,
      });
    } catch { }

    // Direct Firestore synchronization
    try {
      if (typeof window !== "undefined") {
        const userPayload = {
          id: primaryUserId,
          uid: primaryUserId,
          name: initialRecord.name,
          email: initialRecord.email,
          phone: initialRecord.phone,
          membershipCategory: "purchased",
          membershipTitle: "Purchased Client Plan",
          needsPlanReview: true,
          isPaid: true,
          order: sanitizedFirestoreOrder,
          plan: dashboardPlan,
          updatedAt: now,
        };
        void setDoc(doc(db, "users", primaryUserId), userPayload, { merge: true }).catch(() => {});
        void setDoc(doc(db, "orders", effectiveOrderId), sanitizedFirestoreOrder, { merge: true }).catch(() => {});
        void setDoc(doc(db, "plans", assessmentId), dashboardPlan, { merge: true }).catch(() => {});
        if (primaryUserId !== assessmentId) {
          void setDoc(doc(db, "plans", primaryUserId), dashboardPlan, { merge: true }).catch(() => {});
        }
      }
    } catch (fsErr) {
      console.warn("Direct Firestore persist notice:", fsErr);
    }

    recordFootprint("razorpay_payment_success", {
      assessmentId,
      paymentId: effectivePaymentId,
      orderId: effectiveOrderId,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      amount: 99,
    });

    setPaymentStatus("success");
    setConfirmedPaymentDetails({
      paymentId: effectivePaymentId,
      orderId: effectiveOrderId,
      amount: 99,
      customerName: customerDetails.name || userProfile?.name || "Purchased Member",
      customerEmail: customerDetails.email || userProfile?.email || "",
    });
    setShowPaymentSuccessModal(true);
  };

  const handleToggleDisease = (diseaseLabel: string) => {
    if (diseaseLabel.includes("None")) {
      setSelectedDiseases(["None / Completely Healthy"]);
      setHasDisease(false);
      return;
    }
    setHasDisease(true);
    setSelectedDiseases((prev) => {
      const filtered = prev.filter((d) => !d.includes("None"));
      if (filtered.includes(diseaseLabel)) {
        return filtered.filter((d) => d !== diseaseLabel);
      }
      return [...filtered, diseaseLabel];
    });
  };

  const compressImageFile = async (file: File, maxDim = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!file.type.startsWith("image/")) {
          resolve((e.target?.result as string) || "");
          return;
        }
        const img = new window.Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve((e.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || "");
        img.src = (e.target?.result as string) || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(async (file) => {
      const dataUrl = await compressImageFile(file, 800, 0.6);
      const newDoc: MedicalDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: file.type.includes("pdf") ? "pdf" : "image",
        sizeFormatted: `${Math.max(1, Math.round(dataUrl.length / 1024))} KB`,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        category: file.name.toLowerCase().includes("blood")
          ? "blood_test"
          : file.name.toLowerCase().includes("rx") || file.name.toLowerCase().includes("prescription")
            ? "prescription"
            : "other",
      };
      setUploadedDocuments((prev) => [...prev, newDoc]);
    });
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmitMedical = async () => {
    try {
      setIsSubmittingMedical(true);
      const isHealthy = hasDisease === false || selectedDiseases.some((d) => d.includes("None"));
      const diseases = isHealthy ? [] : selectedDiseases;

      const medicalData: MedicalAssessment = {
        hasDisease: !isHealthy && diseases.length > 0,
        diseases: isHealthy ? ["None / Completely Healthy"] : diseases,
        customDiseaseDescription: customDiseaseDescription.trim() || undefined,
        medications: medications.trim() || undefined,
        documents: uploadedDocuments,
        submittedAt: new Date().toISOString(),
      };

      // 1. Store directly in Firebase Firestore
      saveStoredMedicalConsultation(assessmentId, medicalData);

      // 2. Sync to Firebase user record
      const now = new Date().toISOString();
      const primaryUserId = user?.uid || userProfile?.uid || (assessmentId !== "local" ? assessmentId : `client_${Date.now()}`);

      const updatedRecord: AdminUserRecord = {
        id: primaryUserId,
        assessmentId,
        name: customerDetails.name || userProfile?.name || "Purchased Member",
        email: customerDetails.email || userProfile?.email || `${primaryUserId}@client.bmyfit.in`,
        phone: customerDetails.phone || userProfile?.phone || "+91 98000 00000",
        city: "",
        avatar: userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        joinedAt: now,
        lastActive: "Active Now",
        membershipCategory: "purchased",
        membershipTitle: "Purchased Client Plan",
        goal: "fat-loss",
        goalDisplay: "Fat Loss & Metabolic Reset",
        needsPlanReview: true,
        isPaid: true,
        medicalAssessment: medicalData,
        biometrics: {
          ...getSessionBiometrics(),
          medicalConditions: diseases.length > 0 ? diseases.join(", ") : "None reported",
        },
        order: {
          orderId: `ord_${Date.now()}`,
          razorpayPaymentId: `pay_${Date.now()}`,
          amountPaise: 9900,
          amountFormatted: "₹99",
          currency: "INR",
          status: "paid",
          packageTitle: "Custom 8-Week Transformation Plan (₹99 Assessment)",
          durationWeeks: 8,
          purchasedAt: now,
        },
        plan: generateDashboardPlan(assessmentId, {
          customerName: customerDetails.name || userProfile?.name || "Purchased Member",
          weeksCount: 8,
          monthsCount: 2,
          status: "pending_review",
          coachNotes: "NEW ₹99 PURCHASE: Client submitted health profile and medical reports. Review documents before pushing plan.",
          medicalSummary: {
            hasDisease: medicalData.hasDisease,
            diseases: medicalData.diseases,
            customDiseaseDescription: medicalData.customDiseaseDescription,
            medications: medicalData.medications,
            documentsCount: medicalData.documents.length,
          },
        }),
      };
      upsertStoredAdminUser(updatedRecord);
      if (updatedRecord.plan) {
        saveStoredPlan(updatedRecord.plan);
      }

      // Direct Firestore synchronization
      try {
        if (typeof window !== "undefined") {
          const userPayload = {
            ...updatedRecord,
            id: primaryUserId,
            uid: primaryUserId,
            membershipCategory: "purchased",
            membershipTitle: "Purchased Client Plan",
            needsPlanReview: true,
            isPaid: true,
            medicalAssessment: medicalData,
            updatedAt: now,
          };
          void setDoc(doc(db, "users", primaryUserId), userPayload, { merge: true }).catch(() => {});
          if (assessmentId && assessmentId !== primaryUserId) {
            void setDoc(doc(db, "users", assessmentId), userPayload, { merge: true }).catch(() => {});
          }
          if (updatedRecord.plan) {
            void setDoc(doc(db, "plans", assessmentId), updatedRecord.plan, { merge: true }).catch(() => {});
            if (primaryUserId !== assessmentId) {
              void setDoc(doc(db, "plans", primaryUserId), updatedRecord.plan, { merge: true }).catch(() => {});
            }
          }
        }
      } catch (fsErr) {
        console.warn("Direct Firestore medical sync notice:", fsErr);
      }

      // 3. Post to backend API
      await fetch("/api/assessment/medical-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          hasDisease: medicalData.hasDisease,
          diseases: medicalData.diseases,
          customDiseaseDescription: medicalData.customDiseaseDescription,
          medications: medicalData.medications,
          documents: medicalData.documents,
        }),
      }).catch((err) => console.warn("Medical API sync warning (offline ok):", err));

      recordFootprint("medical_submitted", {
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        customerEmail: customerDetails.email,
        diseases: medicalData.diseases,
      });

      setFunnelStep("medical_submitted");
    } catch (err) {
      console.error("Submit medical error:", err);
    } finally {
      setIsSubmittingMedical(false);
    }
  };

  const handlePay = async () => {
    try {
      setPaymentStatus("creating");
      setErrorMessage(null);
      setSuccessNotice(null);

      // Clean customer contact before sending
      const cleanEmail =
        customerDetails.email && customerDetails.email.includes("@")
          ? customerDetails.email.trim()
          : undefined;
      const cleanName = customerDetails.name?.trim() || undefined;
      const cleanPhone = customerDetails.phone?.trim() || undefined;

      recordFootprint("razorpay_checkout_opened", {
        assessmentId,
        customerName: cleanName || "Athlete",
        customerEmail: cleanEmail || "anonymous@bmyfit.in",
        customerPhone: cleanPhone || "",
        amount: 99,
      });

      const token = await getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Idempotency-Key": `attempt_${assessmentId}_${Date.now()}`,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let orderId = "";
      let amount = 9900;
      let currency = "INR";
      let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Tv9FNcDsjXLKfQ";
      let isSandbox = false;

      // Primary attempt: /api/payments/create-order
      try {
        const createOrderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers,
          body: JSON.stringify({
            assessmentId,
            customerName: cleanName,
            customerEmail: cleanEmail,
            customerPhone: cleanPhone,
          }),
        });

        if (createOrderRes.ok) {
          const orderData = await createOrderRes.json();
          orderId = orderData.orderId || orderData.order_id;
          amount = orderData.amount || 9900;
          currency = orderData.currency || "INR";
          keyId = orderData.keyId || keyId;
          isSandbox = Boolean(orderData.isSandbox);
        } else {
          // Direct fallback to standard /api/create-order endpoint
          const fallbackRes = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: 9900,
              currency: "INR",
              receipt: `rcpt_${assessmentId.slice(0, 15)}_${Date.now().toString(36)}`,
            }),
          });
          if (!fallbackRes.ok) {
            const errData = await fallbackRes.json().catch(() => ({}));
            throw new Error(errData.error || "Unable to initialize payment order. Please try again.");
          }
          const fbData = await fallbackRes.json();
          orderId = fbData.order_id || fbData.id;
          amount = fbData.amount || 9900;
          currency = fbData.currency || "INR";
          keyId = fbData.keyId || keyId;
        }
      } catch (firstErr: unknown) {
        // Direct attempt via /api/create-order
        const fallbackRes = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 9900,
            currency: "INR",
            receipt: `rcpt_${Date.now().toString(36)}`,
          }),
        });
        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json().catch(() => ({}));
          throw new Error(
            errData.error ||
            (firstErr instanceof Error ? firstErr.message : "Unable to initialize payment order. Please try again.")
          );
        }
        const fbData = await fallbackRes.json();
        orderId = fbData.order_id || fbData.id;
        amount = fbData.amount || 9900;
        currency = fbData.currency || "INR";
        keyId = fbData.keyId || keyId;
      }

      // Step 2A: Local Dev Sandbox mode when live gateway credentials are not configured
      if (isSandbox) {
        setPaymentStatus("idle");
        setSandboxOrder({ orderId, amount, currency, keyId });
        return;
      }

      // Step 2B: Open official Razorpay modal
      await openCheckout({
        key: keyId,
        amount,
        currency: currency || "INR",
        name: APP_CONFIG.brandName,
        description: "Personalized Fitness & Nutrition Plan",
        order_id: orderId,
        prefill: {
          name: cleanName || "",
          email: cleanEmail || "",
          contact: cleanPhone || "",
        },
        theme: {
          color: "#00c853",
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("idle");
            setErrorMessage("Payment was cancelled. You can retry whenever ready.");
          },
        },
        onPaymentFailed: (failure) => {
          setPaymentStatus("failed");
          setErrorMessage(
            failure.error?.description || "Payment failed. Please try a different payment method or card."
          );
        },
        handler: async (response: VerifyPaymentRequest) => {
          try {
            setPaymentStatus("verifying");
            let verifyOk = false;
            let verifyMsg = "";

            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers,
              body: JSON.stringify({
                ...response,
                customerName: cleanName,
                customerEmail: cleanEmail,
                customerPhone: cleanPhone,
              }),
            });

            if (verifyRes.ok) {
              verifyOk = true;
            } else {
              // Fallback to /api/verify-payment
              const fallbackVerifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-assessment-id": assessmentId,
                  "x-customer-name": cleanName || "",
                  "x-customer-email": cleanEmail || "",
                  "x-customer-phone": cleanPhone || "",
                },
                body: JSON.stringify({
                  ...response,
                  customerName: cleanName,
                  customerEmail: cleanEmail,
                  customerPhone: cleanPhone,
                  assessmentId,
                }),
              });
              if (fallbackVerifyRes.ok) {
                verifyOk = true;
              } else {
                const verifyErr = await fallbackVerifyRes.json().catch(() => ({}));
                verifyMsg = verifyErr.error || "Payment verification failed. Signature was rejected.";
              }
            }

            if (!verifyOk) {
              throw new Error(verifyMsg || "Payment verification failed. Signature was rejected.");
            }

            handlePaymentSuccessPostProcess(response.razorpay_payment_id, response.razorpay_order_id);
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

      setSandboxOrder(null);
      handlePaymentSuccessPostProcess(paymentId, sandboxOrder.orderId);
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
      <main className="flex-1 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-1 md:pt-6 pb-24 md:pb-16 flex flex-col justify-between">
        {funnelStep === "payment" && (
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
                <span className="text-[10px] sm:text-[11px] md:text-xs font-extrabold uppercase tracking-wider text-[#00c853]">
                  UNLOCK YOUR PLAN
                </span>
              </div>

              {/* 4-Step Stepper */}
              <div className="flex items-center justify-end shrink-0">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#00c853] text-white flex items-center justify-center text-[8px] md:text-[9px] font-bold">
                    ✓
                  </div>
                  <span className="text-[7.5px] md:text-[9px] text-gray-500 font-medium whitespace-nowrap mt-0.5">
                    Select Goal
                  </span>
                </div>
                <div className="w-3.5 sm:w-5 md:w-8 h-[1.5px] bg-[#00c853] -mt-3 mx-0.5" />

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#00c853] text-white flex items-center justify-center text-[8px] md:text-[9px] font-bold">
                    ✓
                  </div>
                  <span className="text-[7.5px] md:text-[9px] text-gray-500 font-medium whitespace-nowrap mt-0.5">
                    Body Details
                  </span>
                </div>
                <div className="w-3.5 sm:w-5 md:w-8 h-[1.5px] bg-[#00c853] -mt-3 mx-0.5" />

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#00c853] text-white flex items-center justify-center text-[8px] md:text-[9px] font-bold">
                    ✓
                  </div>
                  <span className="text-[7.5px] md:text-[9px] text-gray-500 font-medium whitespace-nowrap mt-0.5">
                    Analysis
                  </span>
                </div>
                <div className="w-3.5 sm:w-5 md:w-8 h-[1.5px] bg-[#00c853] -mt-3 mx-0.5" />

                {/* Step 4 */}
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#073820] text-white flex items-center justify-center text-[8px] md:text-[9px] font-black">
                    4
                  </div>
                  <span className="text-[7.5px] md:text-[9px] text-gray-900 font-bold whitespace-nowrap mt-0.5">
                    Payment
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Responsive Grid for Payment */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start mt-1 md:mt-4">
              {/* Left Column: Plan Benefits & Visual Previews (md:col-span-7) */}
              <div className="md:col-span-7 space-y-4">
                {/* Headline & Subtitle */}
                <div className="mt-0.5 text-left">
                  <h1 className="text-[17px] sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                    Get Your Personalized <span className="text-[#00c853]">Fitness Plan</span>
                  </h1>
                  <p className="text-[8.5px] sm:text-xs md:text-sm text-gray-500 mt-1 leading-snug">
                    Your analysis is complete. Unlock your personalized plan and start your transformation today.
                  </p>
                </div>

                {/* Dual Offer Comparison Cards */}
                <div className="grid grid-cols-2 gap-2 md:gap-5 mt-2 md:mt-4">
                  {/* Card 1: Your Plan Includes */}
                  <div className="bg-white rounded-xl md:rounded-2xl border border-gray-150 md:border-gray-200 p-2 md:p-5 shadow-2xs md:shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5 md:mb-3">
                        <h2 className="font-bold text-gray-900 text-[9.5px] sm:text-[10.5px] md:text-base leading-tight">
                          Your Plan Includes
                        </h2>
                        <span className="text-[7px] sm:text-[7.5px] md:text-xs font-bold text-emerald-700 bg-emerald-50 px-1 md:px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          CUSTOM PLAN
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
                    <div className="mt-1.5 md:mt-3 rounded-md md:rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src="/images/plan-triple-screens.jpg"
                        alt="Meal Plan, Workout Plan and Progress Tracker"
                        width={400}
                        height={250}
                        className="w-full h-[62px] sm:h-[70px] md:h-[135px] object-cover md:object-contain bg-white"
                      />
                    </div>
                  </div>

                  {/* Card 2: BMYFIT Personalized Plan */}
                  <div className="bg-white rounded-xl md:rounded-2xl border border-gray-150 md:border-gray-200 p-2 md:p-5 shadow-2xs md:shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5 md:mb-2">
                        <h2 className="font-bold text-gray-900 text-[9.5px] sm:text-[10.5px] md:text-base leading-tight">
                          BMYFIT<br />Personalized Plan
                        </h2>
                        <span className="text-[7px] sm:text-[7.5px] md:text-xs font-bold text-white bg-[#00c853] px-1.5 md:px-2.5 py-0.5 rounded-full whitespace-nowrap self-start">
                          BEST VALUE
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-0.5 md:mt-2">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                          ₹99
                        </div>
                        <div className="text-[7.5px] sm:text-[8px] md:text-xs text-gray-500 font-medium mt-0.5">
                          One-time payment
                        </div>
                      </div>

                      {/* 7 Checklist Points */}
                      <div className="bg-[#f8fafc] rounded-lg md:rounded-xl p-1.5 md:p-3 space-y-1 md:space-y-2 mt-1 md:mt-3 border border-gray-100">
                        {[
                          "Daily calorie target",
                          "Protein target",
                          "Personalized Indian diet",
                          "Goal-specific workout",
                          "Structured progressive phases",
                          "Progress tracking",
                          "Lifetime access to your plan",
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#00c853] text-white flex items-center justify-center shrink-0">
                              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5l2.5 2.5 4.5-5" />
                              </svg>
                            </div>
                            <span className="text-[7.5px] sm:text-[8px] md:text-xs text-gray-700 font-medium leading-none">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gift Box Guarantee callout */}
                    <div className="mt-1 md:mt-3 flex items-center gap-1 md:gap-2 p-1 md:p-2.5 rounded-md md:rounded-xl bg-emerald-50/70 border border-emerald-100/60">
                      <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-emerald-100 text-[#00c853] flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 12 20 22 4 22 4 12" />
                          <rect x="2" y="7" width="20" height="5" />
                          <line x1="12" y1="22" x2="12" y2="7" />
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                      </div>
                      <p className="text-[6.5px] sm:text-[7.5px] md:text-xs text-gray-600 leading-tight">
                        No subscription. No hidden charges. Just your personalized plan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Trust Badges for Desktop Left Column */}
                <div className="hidden md:grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-2 text-center shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-700 font-bold leading-tight">
                      100% Secure Payments
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-2 text-center shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-700 font-bold leading-tight">
                      Instant Access After Payment
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-2 text-center shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-700 font-bold leading-tight">
                      Your Data is Private
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= SECURE RAZORPAY PAYMENT GATEWAY (md:col-span-5) ================= */}
              <div className="md:col-span-5 space-y-4">
                <div className="mt-3">
            <h2 className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight">
              Choose a Payment Method
            </h2>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 mb-2 leading-none">
              Secure 256-bit encrypted checkout powered by Razorpay.
            </p>

            <div className="space-y-1.5">
              {/* Single Comprehensive UPI & Online Payment Option */}
              <div
                onClick={() => setSelectedMethod("upi")}
                className="p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border-2 border-[#00c853] bg-[#f0fdf4] shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="h-4 px-1 rounded bg-white flex items-center justify-center border border-gray-200 shadow-2xs">
                      <span className="text-[7px] font-black text-gray-800 tracking-tighter">UPI</span>
                    </div>
                    <div className="h-4 px-1 rounded bg-white flex items-center justify-center border border-gray-200 shadow-2xs">
                      <span className="text-[7px] font-bold text-gray-700 flex items-center gap-0.5">
                        <span className="text-blue-500 font-black">G</span>Pay
                      </span>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[7px] font-bold">
                      पे
                    </div>
                    <div className="h-4 px-1 rounded bg-[#002e6e] text-white flex items-center justify-center text-[6.5px] font-bold">
                      Pay<span className="text-[#00b9f5]">tm</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10.5px] sm:text-[11.5px] font-bold text-[#00c853]">
                      UPI (Google Pay, PhonePe, Paytm, QR) &amp; Cards
                    </div>
                    <div className="text-[8px] sm:text-[8.5px] text-gray-500 leading-none">
                      Zero convenience fee • Instant automated plan activation
                    </div>
                  </div>
                </div>

                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 border-[#00c853]">
                  <div className="w-2 h-2 rounded-full bg-[#00c853]" />
                </div>
              </div>
            </div>

            {/* Main Action Button for Razorpay */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handlePay}
                disabled={paymentStatus === "creating" || paymentStatus === "verifying"}
                className="w-full py-3 px-4 rounded-full bg-[#073820] hover:bg-[#052b18] active:bg-[#031d10] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75"
              >
                {paymentStatus === "creating" || paymentStatus === "verifying" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>
                      {paymentStatus === "creating" ? "Initializing Razorpay..." : "Verifying Payment..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹99 via Razorpay &amp; Unlock</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
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

          <div className="mt-2.5">
            {/* Secure payment text */}
            <div className="flex items-center justify-center gap-1.5 text-[8.5px] sm:text-[9px] text-gray-500 mt-1.5">
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>256-Bit SSL Encrypted &bull; Razorpay Payment Gateway</span>
            </div>
          </div>

            {/* 3 Trust Badges (Mobile Only) */}
            <div className="md:hidden grid grid-cols-3 gap-1.5 mt-2">
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <span className="text-[7.5px] text-gray-700 font-semibold leading-tight">
                  Your Data is Private
                </span>
              </div>
            </div>

            {/* Coach Naveen Guarantee Card (Desktop Only) */}
            <div className="hidden md:flex bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 items-center gap-3 text-left">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-emerald-500 shrink-0">
                <Image src="/images/coach-naveen.jpg" alt="Coach Naveen" fill className="object-cover object-top" />
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-gray-900">Coach Naveen’s Guarantee</p>
                <p className="text-[11px] text-gray-600 mt-0.5">100% money-back guarantee if you follow the routine and don&apos;t see results. WhatsApp support included with every plan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Pay Bar (Always visible on mobile without scrolling) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-gray-400 line-through">₹999</span>
              <span className="text-base font-black text-gray-900">₹99</span>
              <span className="text-[9px] font-bold text-white bg-[#00c853] px-1.5 py-0.5 rounded-full">BEST VALUE</span>
            </div>
            <div className="text-[9px] text-[#00c853] font-bold">✓ Instant Plan Activation</div>
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={paymentStatus === "creating" || paymentStatus === "verifying"}
            className="py-2.5 px-5 rounded-full bg-[#073820] hover:bg-[#052b18] active:bg-[#031d10] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-75 cursor-pointer"
          >
            {paymentStatus === "creating" || paymentStatus === "verifying" ? (
              <>
                <svg className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay ₹99 &amp; Unlock</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
      )}

        {/* Medical & Clinical Questionnaire Step (After ₹99 Payment) */}
        {funnelStep === "medical_questionnaire" && (
          <div className="space-y-4 pt-1 animate-fade-in w-full">
            {/* Header & Status Indicator */}
            <div className="flex items-center justify-between gap-1 pb-1">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#00c853]">
                STEP 5: MEDICAL ASSESSMENT
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                ✓ ₹99 PAID (RECEIPT #BMY99)
              </span>
            </div>

            {/* Desktop 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
              {/* Left Column: Conditions & Symptoms (md:col-span-7) */}
              <div className="md:col-span-7 space-y-4">
                {/* Title Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🩺</span>
                    <h1 className="text-sm font-black text-gray-900 leading-tight">
                      Medical &amp; Clinical Health Profile
                    </h1>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    Before Coach Naveen and our clinical nutritionist design your customized transformation plan, please let us know if you have any existing diseases or injuries, and upload your lab reports.
                  </p>
                </div>

                {/* Section 1: Diseases / Medical Conditions */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                      <span>1. Do you have any existing diseases or health conditions?</span>
                    </label>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required</span>
                  </div>

                  {/* Disease Chips Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {DISEASE_OPTIONS.map((item) => {
                      const isSelected = selectedDiseases.includes(item.label);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleDisease(item.label)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-[1.01]"
                            : "bg-gray-50/80 hover:bg-gray-100 border-gray-200 text-gray-800"
                            }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="text-[11px] leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Specific notes or medications input */}
                  <div className="pt-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-700 block">
                      Describe symptoms or doctor advice (Optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Mild lower back pain on heavy squats; avoid high sodium..."
                      value={customDiseaseDescription}
                      onChange={(e) => setCustomDiseaseDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/40"
                    />
                  </div>
                  <div className="pt-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-700 block">
                      Ongoing medications (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Thyronorm 50mcg daily morning, Metformin 500mg..."
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/40"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Upload Medical Documents & Submit (md:col-span-5) */}
              <div className="md:col-span-5 space-y-4 md:sticky md:top-20">
                {/* Section 2: Upload Medical Documents & Lab Reports */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        <span>2. Upload Medical Reports &amp; Doctor Notes</span>
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        Blood tests, Thyroid profile, Prescription, Spine/MRI scan (PDF or Images)
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {uploadedDocuments.length} Attached
                    </span>
                  </div>

                  {/* Upload Dropzone */}
                  <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50/60 hover:bg-emerald-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-105 transition-transform text-xl">
                      📁
                    </div>
                    <span className="text-xs font-black text-gray-900">
                      Tap to upload medical reports &amp; prescriptions
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Supports PDF, PNG, JPG (Synced securely with Firebase)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>


                  {/* Uploaded Documents List */}
                  {uploadedDocuments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-gray-700 block">
                        Attached Documents ({uploadedDocuments.length}):
                      </span>
                      <div className="space-y-1.5">
                        {uploadedDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-base">{doc.type === "pdf" ? "📑" : "🖼️"}</span>
                              <div className="truncate">
                                <p className="font-bold text-gray-900 truncate text-[11px]">{doc.name}</p>
                                <p className="text-[9.5px] text-gray-400">{doc.sizeFormatted} · Uploaded</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {doc.dataUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="px-2 py-1 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-700 hover:bg-gray-100"
                                >
                                  Preview
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(doc.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md text-[11px]"
                                title="Remove document"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitMedical}
                    disabled={isSubmittingMedical || selectedDiseases.length === 0}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#00c853] hover:bg-[#00b047] active:bg-[#00963d] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {isSubmittingMedical ? (
                      <span>Registering Health Profile &amp; Notifying Coach...</span>
                    ) : (
                      <span>✓ Submit Health Profile to Head Coach</span>
                    )}
                  </button>
                  <p className="text-[9.5px] text-center text-gray-400 mt-2">
                    🔒 Stored securely in your private profile. Head Coach will review these medical inputs before assigning your custom plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Submitted Confirmation Screen */}
        {funnelStep === "medical_submitted" && (
          <div className="max-w-xl mx-auto w-full p-4 md:p-8 bg-white md:border md:border-gray-200 md:rounded-3xl md:shadow-md space-y-5 pt-3 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner text-3xl">
              🩺
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                HEALTH PROFILE REGISTERED · COACH NOTIFIED
              </span>
              <h2 className="text-xl font-black text-gray-950 mt-2">
                Health Assessment Submitted!
              </h2>
              <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Thank you, <strong>{customerDetails.name}</strong>! Your medical assessment and {uploadedDocuments.length} uploaded report(s) are now with Head Coach Naveen &amp; our clinical team.
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 max-w-sm mx-auto text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500 font-bold">Status:</span>
                <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-[10px]">
                  Waitlist · Nutritionist &amp; Trainer Preparing Plan
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Reported Condition(s):</span>
                <span className="font-bold text-gray-900">
                  {selectedDiseases.join(", ") || "None / Healthy"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Attached Reports:</span>
                <span className="font-bold text-emerald-700">
                  {uploadedDocuments.length} Document(s) Uploaded
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500">Assigned Head Coach:</span>
                <span className="font-bold text-gray-900">Coach Naveen (Blaze Gym)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/plan/${assessmentId}`)}
                className="w-full py-3 px-4 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View My Plan Dashboard</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Switch to Coach Admin Console (Review &amp; Push Plan)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Document Full Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="truncate">
                <h4 className="font-bold text-gray-900 text-sm truncate">{previewDoc.name}</h4>
                <p className="text-[10px] text-gray-400">
                  {previewDoc.sizeFormatted} &bull; {previewDoc.category || "Medical Report"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {previewDoc.type === "image" && previewDoc.dataUrl ? (
              <img
                src={previewDoc.dataUrl}
                alt={previewDoc.name}
                className="w-full rounded-xl max-h-96 object-contain bg-gray-50 border border-gray-100"
              />
            ) : (
              <div className="p-8 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-2">
                <span className="text-4xl block">📑</span>
                <p className="font-bold text-xs text-gray-900">PDF Medical Document</p>
                <p className="text-[11px] text-gray-500 font-mono">{previewDoc.name}</p>
                <p className="text-[10px] text-emerald-800 font-semibold">
                  Saved securely to local storage &bull; Ready for Clinical Review
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

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

      {/* Payment Successful Popup Modal with Waitlist Routing */}
      {showPaymentSuccessModal && confirmedPaymentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-emerald-400/50 text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Ambient celebratory top glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-400/20 blur-2xl rounded-full pointer-events-none" />

            {/* Pulsing Success Badge */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FontAwesomeIcon icon={faCheck} className="text-3xl font-black" />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-1.5">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ✓ PAYMENT VERIFIED · ₹99 RECEIVED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                Your <strong>Custom 8-Week Transformation Plan</strong> is activated and submitted to Head Coach Naveen&apos;s queue.
              </p>
            </div>

            {/* Receipt & Waitlist Details Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Amount Paid:</span>
                <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ₹99.00 (All-Inclusive)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Waitlist Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10.5px]">
                  ⏳ In Queue · Coach Preparing Plan
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Assigned Head Coach:</span>
                <span className="font-bold text-gray-900">Coach Naveen (Blaze Gym)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100 text-[11px]">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono text-gray-700 truncate max-w-[170px]">
                  {confirmedPaymentDetails.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-mono text-gray-700 truncate max-w-[170px]">
                  {confirmedPaymentDetails.paymentId}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/plan/${assessmentId}`;
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Waitlist / Plan Dashboard</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPaymentSuccessModal(false);
                  setFunnelStep("medical_questionnaire");
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🩺 Add Medical &amp; Health History (Optional)</span>
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
