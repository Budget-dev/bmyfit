"use client";

import React from "react";
import {
  X,
  Scale,
  Activity,
  Flame,
  Utensils,
  Dumbbell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Rocket,
  ShieldCheck,
  CreditCard,
} from "@/components/ui/icons";
import type { AdminUserRecord, MedicalDocument } from "@/types/admin";

interface BiometricsModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onOpenPlanStudio: (user: AdminUserRecord) => void;
  onPushToUser: (user: AdminUserRecord) => void;
}

export function BiometricsModal({
  user,
  onClose,
  onOpenPlanStudio,
  onPushToUser,
}: BiometricsModalProps) {
  const [previewDoc, setPreviewDoc] = React.useState<MedicalDocument | null>(null);

  if (!user) return null;

  const { biometrics, order, plan, medicalAssessment } = user;
  const isPending = plan.status === "pending_review";
  const weightDelta = (biometrics.weightKg - biometrics.targetWeightKg).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-gray-950">{user.name}</h3>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                    user.membershipCategory === "purchased"
                      ? "bg-emerald-100 text-emerald-800"
                      : user.membershipCategory === "membership"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.membershipCategory === "purchased"
                    ? "Purchased Plan"
                    : user.membershipCategory === "membership"
                    ? "Active Membership"
                    : "Free Member"}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {user.email} · {user.phone} · {user.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-gray-800">
          {/* Status Alert Banner */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border ${
              isPending
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {isPending ? (
                <Clock className="w-5 h-5 text-amber-600 animate-pulse flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  {isPending ? "Awaiting Coach Plan Push" : "Plan Live on User Dashboard"}
                </p>
                <p className="text-xs font-medium">
                  {isPending
                    ? "This user has registered body details. Review stats and customize the multi-week plan below."
                    : `Approved & published on client dashboard (${plan.weeksCount} Total Weeks active).`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPending && (
                <button
                  type="button"
                  onClick={() => onPushToUser(user)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Push to Dashboard</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenPlanStudio(user)}
                className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open Plan Studio</span>
              </button>
            </div>
          </div>

          {/* 4-Column Primary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Height & Weight */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Height & Weight
              </span>
              <p className="text-xl font-black text-gray-950">
                {biometrics.heightCm} <span className="text-xs font-normal text-gray-500">cm</span> ·{" "}
                {biometrics.weightKg} <span className="text-xs font-normal text-gray-500">kg</span>
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                Target: <strong>{biometrics.targetWeightKg} kg</strong> ({weightDelta} kg delta)
              </p>
            </div>

            {/* BMI & Category */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                BMI Index
              </span>
              <p className="text-xl font-black text-gray-950">
                {biometrics.bmi}{" "}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    biometrics.bmiCategory === "normal"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {biometrics.bmiCategory}
                </span>
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Standard WHO Classification</p>
            </div>

            {/* Body Fat % */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Body Fat %
              </span>
              <p className="text-xl font-black text-gray-950">
                {biometrics.bodyFatPercent}%{" "}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {biometrics.bodyFatCategory}
                </span>
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Navy Tape Circumference Model</p>
            </div>

            {/* Daily Calorie Deficit/Surplus */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Target Calories
              </span>
              <p className="text-xl font-black text-emerald-950">
                {biometrics.caloricTarget}{" "}
                <span className="text-xs font-normal text-emerald-700">kcal/day</span>
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                {biometrics.proteinTargetGrams}g Protein Target
              </p>
            </div>
          </div>

          {/* Section: Circumference Measurements & Body Composition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-3">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Physical Tape Measurements</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Waist</span>
                  <span className="text-lg font-black text-gray-900">{biometrics.waistIn}&quot;</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Neck</span>
                  <span className="text-lg font-black text-gray-900">{biometrics.neckIn}&quot;</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Hip</span>
                  <span className="text-lg font-black text-gray-900">
                    {biometrics.hipIn ? `${biometrics.hipIn}"` : "N/A"}
                  </span>
                </div>
              </div>
              {biometrics.whr && (
                <div className="text-xs font-medium text-gray-600 flex items-center justify-between pt-1">
                  <span>Waist-to-Hip Ratio (WHR):</span>
                  <strong className="text-gray-900 font-mono">{biometrics.whr}</strong>
                </div>
              )}
            </div>

            {/* Metabolic Calculations */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-3">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Metabolic Engine Breakdown</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Basal Metabolic Rate (BMR):</span>
                  <span className="font-bold text-gray-950 font-mono">{biometrics.bmr} kcal/day</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Total Daily Energy Expenditure (TDEE):</span>
                  <span className="font-bold text-gray-950 font-mono">{biometrics.tdee} kcal/day</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-600">Calculated Energy Deficit:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {biometrics.caloricTarget - biometrics.tdee} kcal/day
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Lifestyle, Diet Preferences & Medical Context */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Lifestyle Habits & Medical Observations</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">
                  Dietary Preference
                </span>
                <span className="font-black text-gray-900 capitalize">
                  {biometrics.dietPreference}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">
                  Activity Level
                </span>
                <span className="font-black text-gray-900 capitalize">
                  {biometrics.activityLevel.replace("-", " ")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">
                  Water & Steps Target
                </span>
                <span className="font-black text-gray-900">
                  {biometrics.waterLitres}L · {biometrics.dailyStepGoal.toLocaleString()} steps
                </span>
              </div>
            </div>

            {biometrics.medicalConditions && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900">
                <strong className="block font-bold mb-0.5">Health & Injury Notes:</strong>
                <p>{biometrics.medicalConditions}</p>
              </div>
            )}

            {biometrics.allergies && biometrics.allergies !== "None" && (
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/70 text-xs text-red-900">
                <strong className="block font-bold mb-0.5">Food Sensitivities / Allergies:</strong>
                <p>{biometrics.allergies}</p>
              </div>
            )}
          </div>

          {/* Section: Clinical Health Dossier & Uploaded Medical Documents */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <span className="text-base">🩺</span>
                <span>Clinical Health Dossier &amp; Medical Reports</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  medicalAssessment?.hasDisease
                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                }`}
              >
                {medicalAssessment?.hasDisease
                  ? "⚠️ Medical Conditions Reported"
                  : "✓ No Pre-Existing Disease"}
              </span>
            </div>

            {/* Reported Diseases Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-700 block">
                Reported Medical Conditions / Diseases:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {medicalAssessment?.diseases && medicalAssessment.diseases.length > 0 ? (
                  medicalAssessment.diseases.map((dis, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs flex items-center gap-1"
                    >
                      <span>•</span>
                      <span>{dis}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">None reported</span>
                )}
              </div>
            </div>

            {/* Doctor notes or medications */}
            {(medicalAssessment?.customDiseaseDescription || medicalAssessment?.medications) && (
              <div className="p-3.5 rounded-xl bg-white/90 border border-gray-200/80 space-y-2 text-xs">
                {medicalAssessment.customDiseaseDescription && (
                  <div>
                    <span className="font-bold text-gray-500 text-[10px] uppercase block">
                      Client Symptoms &amp; Doctor Advice:
                    </span>
                    <p className="text-gray-900 mt-0.5">{medicalAssessment.customDiseaseDescription}</p>
                  </div>
                )}
                {medicalAssessment.medications && (
                  <div className="pt-1 border-t border-gray-100">
                    <span className="font-bold text-gray-500 text-[10px] uppercase block">
                      Active Medications:
                    </span>
                    <p className="text-gray-900 mt-0.5 font-mono text-[11px]">{medicalAssessment.medications}</p>
                  </div>
                )}
              </div>
            )}

            {/* Attached Medical Documents Gallery */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700">
                  Attached Medical Documents ({medicalAssessment?.documents?.length || 0}):
                </span>
                <span className="text-[10px] text-gray-400">Click to view &amp; inspect</span>
              </div>

              {medicalAssessment?.documents && medicalAssessment.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {medicalAssessment.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setPreviewDoc(doc)}
                      className="p-3 rounded-xl bg-white border border-gray-200 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shrink-0">
                          {doc.type === "pdf" ? "📑" : "🖼️"}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-gray-900 text-xs truncate">{doc.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {doc.sizeFormatted} &bull; {doc.category || "Lab Report"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        View
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-200 text-center text-xs text-gray-400">
                  No medical reports attached yet for this client.
                </div>
              )}
            </div>
          </div>

          {/* Section: Purchase & Order Info (if available) */}
          {order && (
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Verified Payment & Package Transaction</span>
              </h4>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-gray-900">{order.packageTitle}</span>
                  <span className="block text-gray-500 font-mono text-[11px]">
                    Order #{order.orderId} · {order.razorpayPaymentId || "Verified Razorpay"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700">{order.amountFormatted}</span>
                  <span className="block text-[11px] text-gray-500">
                    Paid {new Date(order.purchasedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-3xl">
          <a
            href={`/plan/${plan.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1.5 transition"
          >
            <span>Preview Client Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPlanStudio(user);
              }}
              className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Weekly Plan</span>
            </button>
            {isPending && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPushToUser(user);
                }}
                className="px-5 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Push to User Dashboard</span>
              </button>
            )}
          </div>
        </div>
        {/* Document Preview Inspector Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{previewDoc.type === "pdf" ? "📑" : "🖼️"}</span>
                  <div>
                    <h5 className="font-bold text-sm truncate max-w-md">{previewDoc.name}</h5>
                    <p className="text-[10px] text-gray-400">
                      {previewDoc.sizeFormatted} &bull; {previewDoc.category || "Clinical Document"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 flex flex-col items-center justify-center">
                {previewDoc.fileUrl?.startsWith("data:image") ? (
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.name}
                    className="max-h-[60vh] max-w-full rounded-lg shadow-md object-contain"
                  />
                ) : (
                  <div className="w-full bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Medical File Verification
                      </span>
                      <span className="text-xs font-mono text-gray-400">Status: Verified</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Document Title:</strong> {previewDoc.name}
                      </p>
                      <p>
                        <strong>Uploaded At:</strong>{" "}
                        {previewDoc.uploadedAt
                          ? new Date(previewDoc.uploadedAt).toLocaleString()
                          : "Today"}
                      </p>
                      <p>
                        <strong>Category:</strong> {previewDoc.category || "Medical / Lab Report"}
                      </p>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                        <strong>Clinical Assessment Note:</strong>
                        <p className="mt-1">
                          Our clinical and sports nutrition team uses this document to adjust
                          macronutrients, avoid inflamed joint stress, and calibrate exercise
                          selection safely.
                        </p>
                      </div>
                    </div>
                    {previewDoc.fileUrl && (
                      <a
                        href={previewDoc.fileUrl}
                        download={previewDoc.name}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        <span>Open / Download Full Document</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end p-3 bg-gray-100 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
