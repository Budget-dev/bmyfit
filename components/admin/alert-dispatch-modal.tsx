"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Send,
  AlertTriangle,
  BellRing,
  Sparkles,
  CheckCircle2,
  Clock,
  Scale,
  CreditCard,
  Flame,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import { sendChatMessage } from "@/lib/firestore/chat";

interface AlertDispatchModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AlertDispatchModal({
  user,
  onClose,
  onSuccess,
}: AlertDispatchModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "adherence" | "weighin" | "hydration" | "subscription" | "praise" | "medical"
  >("adherence");
  const [customText, setCustomText] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  if (!user) return null;

  const firstName = user.name.split(" ")[0];

  const presets: Record<
    "adherence" | "weighin" | "hydration" | "subscription" | "praise" | "medical",
    { title: string; icon: string; text: string }
  > = {
    adherence: {
      title: "🚨 Low Compliance Nudge",
      icon: "⚠️",
      text: `🚨 Coach Naveen Alert: Hey ${firstName}, I noticed you've missed a couple of daily meal and workout logs this week. Consistency is key to hitting your target weight of ${user.biometrics.targetWeightKg}kg. Let's get today's checklist marked off!`,
    },
    weighin: {
      title: "⚖️ Weigh-in Reminder",
      icon: "⚖️",
      text: `⚖️ Weekly Check-in: Hey ${firstName}, please log your morning fasting weight in your BMYFIT dashboard today so I can calibrate your upcoming week's caloric target (${user.plan.calorieTarget} kcal) and progressive overload.`,
    },
    hydration: {
      title: "💧 Hydration Target Alert",
      icon: "💧",
      text: `💧 Hydration Notice: Your logged water intake is under target. Please drink at least ${user.biometrics.waterLitres || 3.5}L today to flush metabolic waste and maintain energy during your workouts.`,
    },
    subscription: {
      title: "💳 Subscription Expiry Notice",
      icon: "💳",
      text: `💳 Subscription Update: Hey ${firstName}, your ${user.plan.weeksCount}-week transformation subscription period is nearing its renewal date. Let's review your body fat changes and prepare your next milestone phase!`,
    },
    praise: {
      title: "🎉 Top Performance Praise",
      icon: "🔥",
      text: `🔥 Fantastic Work, ${firstName}! Coach Naveen reviewed your high adherence this week. Your dedication to your meals and workouts is outstanding. Keep this momentum going!`,
    },
    medical: {
      title: "🩺 Medical / Joint Safety Alert",
      icon: "🩺",
      text: `🩺 Medical Review: Hey ${firstName}, I have reviewed your clinical notes and adjusted your exercises in Week ${user.plan.weeks[0]?.weekNumber || 1} to be completely joint-safe and protect your back. Check the updated split now!`,
    },
  };

  const activeMessage = customText || presets[selectedCategory].text;

  const handleSendAlert = async () => {
    if (sending || !activeMessage.trim()) return;

    try {
      setSending(true);
      await sendChatMessage({
        userId: user.id,
        senderRole: "coach",
        senderId: "coach_naveen",
        senderName: "Coach Naveen",
        text: activeMessage.trim(),
      });

      onSuccess(`Alert sent directly to ${user.name} via WhatsApp & In-App Chat!`);
      onClose();
    } catch (err) {
      console.warn("Failed to dispatch alert:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#032e1c] via-[#054228] to-[#075E54] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
              <BellRing className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Dispatch Coach Alert</span>
                <span className="text-[9px] bg-[#25D366] text-gray-950 font-black px-2 py-0.2 rounded-full uppercase">
                  Instant Sync
                </span>
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                Recipient: <strong className="text-white">{user.name}</strong> ({user.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Quick Category Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
              Select Alert Reason / Template:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  "adherence",
                  "weighin",
                  "hydration",
                  "subscription",
                  "praise",
                  "medical",
                ] as const
              ).map((cat) => {
                const item = presets[cat];
                const isSelected = selectedCategory === cat && !customText;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCustomText("");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "border-[#075E54] bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-[#075E54]/20"
                        : "border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-gray-700 font-bold"
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[11px] mt-1 leading-snug">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Alert Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                Message Content (WhatsApp &amp; In-App):
              </label>
              <button
                type="button"
                onClick={() => setCustomText("")}
                className="text-[10px] text-emerald-700 hover:underline font-bold"
              >
                Reset to Template
              </button>
            </div>
            <textarea
              rows={4}
              value={customText || presets[selectedCategory].text}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition leading-relaxed font-medium"
              placeholder="Type your custom coaching alert..."
            />
          </div>

          {/* Live Preview Container (WhatsApp Style) */}
          <div className="bg-[#efeae2] p-4 rounded-2xl border border-gray-300/80 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              What {firstName} Will See:
            </span>
            <div className="flex justify-start">
              <div className="bg-[#d9fdd3] text-gray-900 rounded-2xl rounded-tl-xs p-3 shadow-xs border border-emerald-300/60 max-w-[90%] text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black text-[#075E54]">Coach Naveen</span>
                  <span className="text-[8px] bg-[#25D366] text-black px-1.5 py-0.2 rounded font-black uppercase">
                    ALERT
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {activeMessage}
                </p>
                <div className="text-right mt-1 text-[9px] text-gray-400 font-mono">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendAlert}
            disabled={sending || !activeMessage.trim()}
            className="px-6 py-2.5 rounded-2xl bg-[#00c853] hover:bg-[#00b047] text-white text-xs font-black shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? "Delivering Alert..." : "Dispatch Alert Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
