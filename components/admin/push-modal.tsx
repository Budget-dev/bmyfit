"use client";

import React, { useState } from "react";
import {
  X,
  Rocket,
  CheckCircle2,
  ExternalLink,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";

interface PushModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onSuccess: (updatedUser: AdminUserRecord) => void;
}

export function PushModal({ user, onClose, onSuccess }: PushModalProps) {
  const [coachName, setCoachName] = useState<string>("Coach Naveen (Blaze Gym Owner & Head Coach)");
  const [coachNotes, setCoachNotes] = useState<string>(
    user?.plan.coachNotes ||
      "Weekly plan tailored to your biometrics and goals. Stay consistent with your protein and daily step count!"
  );
  const [pushing, setPushing] = useState<boolean>(false);
  const [pushedSuccess, setPushedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) return null;

  const handlePush = async () => {
    try {
      setPushing(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/plans/${user.plan.id}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachName,
          notes: coachNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushedSuccess(true);
        if (data.user) {
          onSuccess(data.user);
        }
      } else {
        setErrorMessage(data.message || "Failed to push plan to user dashboard.");
      }
    } catch (err: unknown) {
      console.error("Push error:", err);
      setErrorMessage("Network error while pushing plan.");
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Push Plan to Client Dashboard</h3>
              <p className="text-[11px] text-emerald-200 font-medium">
                Live Deployment for {user.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-gray-800">
          {pushedSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-black text-gray-950">Plan Successfully Pushed!</h4>
                <p className="text-xs text-gray-500 font-medium mt-1 max-w-sm mx-auto">
                  The personalized {user.plan.weeksCount}-week plan is now live on{" "}
                  <strong>{user.name}&apos;s</strong> user dashboard.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Client:</span>
                  <span className="font-bold text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan ID:</span>
                  <span className="font-mono text-gray-700">{user.plan.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Live Status:</span>
                  <span className="font-bold text-emerald-600">Approved & Active</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`/plan/${user.plan.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Open Live Client Dashboard</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition"
                >
                  Done & Return to Admin Console
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Plan Specifications
                  </span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Ready to Dispatch
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Goal</span>
                    <strong className="text-gray-900">{user.goalDisplay}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Duration</span>
                    <strong className="text-gray-900">{user.plan.weeksCount} Weeks Schedule</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Daily Target</span>
                    <strong className="text-gray-900">
                      {user.plan.calorieTarget} kcal · {user.plan.proteinTargetGrams}g Protein
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Workouts</span>
                    <strong className="text-gray-900">{user.plan.workoutDaysPerWeek} Days/Week</strong>
                  </div>
                </div>
              </div>

              {/* Coach Sign-Off Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Approving Head Coach
                  </label>
                  <input
                    type="text"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Custom Coach Message for Client Dashboard
                  </label>
                  <textarea
                    rows={3}
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Provide specific notes regarding portion adjustments, warm-ups, or hydration..."
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pushing}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePush}
                  disabled={pushing}
                  className="px-5 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-md flex items-center gap-2 transition"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{pushing ? "Pushing Live..." : "Publish & Push to Dashboard"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
