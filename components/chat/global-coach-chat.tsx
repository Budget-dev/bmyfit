"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ClientChatWidget } from "@/components/chat/client-chat-widget";

export function GlobalCoachChat() {
  const pathname = usePathname();
  const { userProfile, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to open chat global event
  useEffect(() => {
    const handleOpenChat = () => {
      setChatOpen(true);
    };
    window.addEventListener("bmyfit_open_chat", handleOpenChat);
    return () => {
      window.removeEventListener("bmyfit_open_chat", handleOpenChat);
    };
  }, []);

  if (!mounted) return null;

  // Never render on admin console routes (Coach Naveen has his own full desktop WhatsApp console)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Determine user identity (Authenticated user -> Stored local assessment lead -> Persistent guest visitor)
  let effectiveUserId = "";
  let effectiveUserName = "Valued Athlete";
  let effectiveUserEmail = "";
  let effectiveGoal = "Fitness Consultation";
  let effectiveCategory: "purchased" | "membership" | "free" = "free";

  if (isAuthenticated && userProfile?.uid) {
    effectiveUserId = userProfile.uid;
    effectiveUserName = userProfile.name || "Member";
    effectiveUserEmail = userProfile.email || "";
    effectiveGoal = "Personalized Fitness Plan";
    effectiveCategory =
      (userProfile.membershipCategory as "purchased" | "membership" | "free") ||
      (userProfile.isPaid ? "purchased" : "free");
  } else if (typeof window !== "undefined") {
    // Check if user completed an assessment
    const rawLocal = sessionStorage.getItem("bmyfit_local_assessment");
    if (rawLocal) {
      try {
        const local = JSON.parse(rawLocal);
        if (local && (local.id || local.uid)) {
          effectiveUserId =
            local.uid && local.uid !== "anonymous-user" && !String(local.uid).startsWith("guest_")
              ? local.uid
              : local.id;
          effectiveUserName = local.name || `Free Score Lead (${String(local.id).slice(0, 6)})`;
          effectiveUserEmail = local.email || "";
          effectiveGoal = local.goal ? String(local.goal).replace("-", " ") : "Fat Loss";
          effectiveCategory = "free";
        }
      } catch {}
    }

    // Fallback: persistent guest chat identity
    if (!effectiveUserId) {
      let guestId = localStorage.getItem("bmyfit_guest_chat_uid");
      if (!guestId) {
        guestId = `lead_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("bmyfit_guest_chat_uid", guestId);
      }
      effectiveUserId = guestId;
      effectiveUserName = "Guest Visitor";
      effectiveGoal = "Fitness Consultation";
      effectiveCategory = "free";
    }
  }

  if (!effectiveUserId) return null;

  // On /plan, if the user is already subscribed, PlanDashboard already includes its own widget.
  // But if the user is an unpaid visitor or lead (PlanLockScreen), render this global widget so they can chat with Coach Naveen!
  const isSubscribedOnPlan =
    pathname?.startsWith("/plan") &&
    (effectiveCategory === "purchased" || effectiveCategory === "membership");

  if (isSubscribedOnPlan) {
    return null;
  }

  return (
    <ClientChatWidget
      userId={effectiveUserId}
      userName={effectiveUserName}
      userEmail={effectiveUserEmail}
      planGoal={effectiveGoal}
      membershipCategory={effectiveCategory}
      isOpenControlled={chatOpen}
      onOpenChange={setChatOpen}
    />
  );
}
