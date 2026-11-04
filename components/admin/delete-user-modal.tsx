"use client";

import React from "react";
import { X, Trash2, AlertTriangle } from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";

export interface DeleteUserModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteUserModalProps) {
  if (!user) return null;

  const isPaid =
    user.membershipCategory === "purchased" ||
    user.membershipCategory === "membership" ||
    Boolean(user.isPaid) ||
    Boolean(user.order && user.order.status === "paid");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeleting) return;
    await onConfirm();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-red-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Danger Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-white p-5 flex items-center justify-between border-b border-red-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-400/30">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                Delete User Account
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/30 font-bold uppercase tracking-wider">
                  Irreversible
                </span>
              </h3>
              <p className="text-xs text-red-200/80 font-medium">
                Permanently purge client from Firestore &amp; Auth
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleDelete} className="p-6 flex flex-col gap-5">
          {/* Client Summary Card */}
          <div className="bg-red-50/50 border border-red-200/70 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-700 text-white font-extrabold flex items-center justify-center text-base shrink-0 shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {isPaid ? "Paid ₹99 Client" : "Free Member / Lead"}
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5">{user.email || "No email"}</p>
              {user.phone && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>

          {/* Critical Warning Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-1">
                Are you sure you want to delete this user?
              </p>
              <p className="text-amber-900/90 mb-1.5">
                This action is permanent and will immediately delete:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                <li>Firebase Authentication login credentials</li>
                <li>Live database profile &amp; health records</li>
                <li>All assigned multi-week meal &amp; workout plans</li>
                <li>Daily compliance check-in logs &amp; metrics</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-spin" : ""}`} />
              <span>{isDeleting ? "Deleting Account..." : "Yes, Delete User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
