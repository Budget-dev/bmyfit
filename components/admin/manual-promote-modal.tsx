"use client";

import React, { useState } from "react";
import { X, Zap, CheckCircle2, CreditCard } from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";

export interface ManualPromoteOptions {
  paymentMethod: "cash" | "upi_manual";
  transactionId?: string;
  notes?: string;
  amountPaise: number;
}

interface ManualPromoteModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onConfirm: (options: ManualPromoteOptions) => Promise<void>;
  isPromoting: boolean;
}

export function ManualPromoteModal({
  user,
  onClose,
  onConfirm,
  isPromoting,
}: ManualPromoteModalProps) {
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash">("upi");
  const [transactionId, setTransactionId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isCash = paymentMode === "cash";
    const cleanTxnId = transactionId.trim();

    if (!isCash && !cleanTxnId) {
      setErrorMsg("Please enter the UPI Transaction ID / 12-digit UTR, or toggle to 'Cash Received by Hand'.");
      return;
    }

    try {
      await onConfirm({
        paymentMethod: isCash ? "cash" : "upi_manual",
        transactionId: isCash ? undefined : cleanTxnId,
        notes: notes.trim() || undefined,
        amountPaise: 9900,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Promotion failed. Please try again.";
      setErrorMsg(msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#032e1c] via-[#054228] to-[#075E54] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-400 border border-amber-400/30">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                Promote Client to Paid
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  ₹99 Plan
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                Record payment and immediately grant 8-Week Transformation access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Client Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-base shrink-0 shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                  {user.membershipCategory === "free" ? "Free Lead" : "Unpaid"}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{user.email || "No email"}</p>
              {user.phone && (
                <p className="text-xs text-slate-600 font-mono mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option A: UPI / Online */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMode("upi");
                  setErrorMsg(null);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  paymentMode === "upi"
                    ? "border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <span className="text-xs font-bold text-slate-900">UPI / Online</span>
                  </div>
                  {paymentMode === "upi" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  PhonePe, GPay, Paytm, or direct IMPS/NEFT transfer
                </p>
              </button>

              {/* Option B: Cash Received */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMode("cash");
                  setErrorMsg(null);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  paymentMode === "cash"
                    ? "border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💵</span>
                    <span className="text-xs font-bold text-slate-900">Cash Received</span>
                  </div>
                  {paymentMode === "cash" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Hand-to-hand cash paid at gym desk or directly to coach
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Input based on Payment Mode */}
          {paymentMode === "upi" ? (
            <div>
              <label
                htmlFor="txn-id-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                UPI Transaction ID / 12-Digit UTR <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="txn-id-input"
                  type="text"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="e.g. 429108392102 or T2411021430..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans outline-hidden transition"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the reference number from the customer&apos;s payment confirmation or bank SMS.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <div className="text-xl shrink-0">🤝</div>
              <div className="text-xs">
                <p className="font-bold text-emerald-900">Hand-to-Hand Cash Payment</p>
                <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed">
                  Coach Naveen confirmed cash collected in person. A verified receipt code (<code>cash_...</code>) will be recorded in Firestore and local storage.
                </p>
              </div>
            </div>
          )}

          {/* Optional Coach / Receipt Notes */}
          <div>
            <label
              htmlFor="coach-notes-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Coach / Receipt Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="coach-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                paymentMode === "cash"
                  ? "e.g. ₹100 cash given at gym counter"
                  : "e.g. Transferred from father's Google Pay"
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition"
            />
          </div>

          {/* Pricing & Plan Review Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Custom 8-Week Transformation</p>
                <p className="text-[11px] text-slate-500">Unlocks dashboard &amp; queues plan for review</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-sm text-emerald-700">₹99</span>
              <span className="block text-[10px] text-slate-500">Paid in Full</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPromoting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPromoting || (paymentMode === "upi" && !transactionId.trim())}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isPromoting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Promoting...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Confirm &amp; Promote to Paid (₹99)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
