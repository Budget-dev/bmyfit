"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Rocket,
  CheckCircle2,
  Clock,
  Video,
  Target,
  BarChart2,
  MessageCircle,
  ExternalLink,
  Edit3,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  Send,
  CheckCheck,
  Sparkles,
} from "@/components/ui/icons";
import { ShoppingBag } from "@/components/ui/supplement-icons";
import type { AdminUserRecord } from "@/types/admin";
import type { PlanVideo, PlanSupplementRecommendation } from "@/types/plan-dashboard";
import type { ChatMessage } from "@/types/chat";
import { subscribeToChatMessages, sendChatMessage, markChatThreadRead } from "@/lib/firestore/chat";
import { SUPPLEMENT_PRODUCTS, type SupplementProduct } from "@/features/supplements/supplements-data";
import { parseVideoUrl } from "@/lib/video-helper";

interface ClientDetailSidebarProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPushPlan: (
    user: AdminUserRecord,
    coachNotes: string,
    video?: PlanVideo,
    supplements?: PlanSupplementRecommendation[],
    targets?: { calorieTarget?: number; proteinTargetGrams?: number; workoutDaysPerWeek?: number }
  ) => Promise<void>;
  onOpenStudio: (user: AdminUserRecord) => void;
  onOpenChat: (user: AdminUserRecord) => void;
  onSendAlert: (user: AdminUserRecord) => void;
  initialTab?: "dispatch" | "tracking" | "biometrics" | "plan" | "alert" | "chat";
}

export function ClientDetailSidebar({
  user,
  isOpen,
  onClose,
  onPushPlan,
  onOpenStudio,
  onOpenChat,
  onSendAlert,
  initialTab = "dispatch",
}: ClientDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState<"dispatch" | "tracking" | "biometrics" | "plan" | "alert" | "chat">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Live Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState<string>("");
  const [chatSending, setChatSending] = useState<boolean>(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id || !isOpen || activeTab !== "chat") return;
    void markChatThreadRead(user.id, "coach");
    const unsubscribe = subscribeToChatMessages(user.id, (msgs) => {
      setChatMessages(msgs);
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
    return () => {
      unsubscribe();
    };
  }, [user?.id, isOpen, activeTab]);

  const handleSendSidebarMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text || !user?.id || chatSending) return;
    try {
      setChatSending(true);
      setChatInputText("");
      await sendChatMessage({
        userId: user.id,
        senderRole: "coach",
        senderId: "coach_naveen",
        senderName: "Coach Naveen",
        text,
      });
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } finally {
      setChatSending(false);
    }
  };

  // Video state
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoRatio, setVideoRatio] = useState<"16:9" | "9:16">("16:9");
  const [videoNotes, setVideoNotes] = useState<string>("");

  // Plan coach notes & macros
  const [coachNotes, setCoachNotes] = useState<string>("");
  const [calorieTarget, setCalorieTarget] = useState<number>(1800);
  const [proteinTargetGrams, setProteinTargetGrams] = useState<number>(120);
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(4);

  // Suggested supplements state
  const [selectedSupplements, setSelectedSupplements] = useState<PlanSupplementRecommendation[]>([]);
  const [supplementSearch, setSupplementSearch] = useState<string>("");
  const [showAddCustomProduct, setShowAddCustomProduct] = useState<boolean>(false);
  const [customProdName, setCustomProdName] = useState<string>("");
  const [customProdPrice, setCustomProdPrice] = useState<string>("");
  const [customProdUrl, setCustomProdUrl] = useState<string>("");
  const [customProdImageUrl, setCustomProdImageUrl] = useState<string>("");
  const [customProdNote, setCustomProdNote] = useState<string>("");

  // Daily tracking coach feedback state
  const [coachFeedbackText, setCoachFeedbackText] = useState<string>("");
  const [sendingFeedback, setSendingFeedback] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Version history accordion
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);

  // Loading & success
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state whenever selected user changes
  useEffect(() => {
    if (user) {
      setActiveTab(initialTab);
      setSuccessMessage(null);
      setFeedbackNotice(null);
      setCoachNotes(user.plan?.coachNotes || "Plan customized & verified by Head Coach Naveen. Ready for execution!");
      setCalorieTarget(user.plan?.calorieTarget || 1800);
      setProteinTargetGrams(user.plan?.proteinTargetGrams || 120);
      setWorkoutDaysPerWeek(user.plan?.workoutDaysPerWeek || 4);

      if (user.plan?.video) {
        setVideoUrl(user.plan.video.url || "");
        setVideoTitle(user.plan.video.title || "");
        setVideoRatio(user.plan.video.aspectRatio || "16:9");
        setVideoNotes(user.plan.video.notes || "");
      } else {
        setVideoUrl("");
        setVideoTitle(`Form & Technique Guidance for ${user.name}`);
        setVideoRatio("16:9");
        setVideoNotes("");
      }

      if (user.plan?.suggestedSupplements && user.plan.suggestedSupplements.length > 0) {
        setSelectedSupplements(user.plan.suggestedSupplements);
      } else {
        // Admin will manually add or recommend products (no hardcoded mock supplements)
        setSelectedSupplements([]);
      }
    }
  }, [user, initialTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isPending = (user.plan?.status === "pending_review") || user.needsPlanReview;
  const parsedVideo = parseVideoUrl(videoUrl);

  const handleToggleSupplement = (product: SupplementProduct) => {
    const exists = selectedSupplements.some((s) => s.productId === product.id);
    if (exists) {
      setSelectedSupplements(selectedSupplements.filter((s) => s.productId !== product.id));
    } else {
      setSelectedSupplements([
        ...selectedSupplements,
        {
          productId: product.id,
          name: product.name,
          subtitle: product.subtitle,
          affiliateUrl: product.amazonUrl,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          customCoachNote: "Recommended based on your daily targets.",
        },
      ]);
    }
  };

  const handleAddCustomProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customProdName.trim()) return;
    const newSupp: PlanSupplementRecommendation = {
      productId: `custom_${Date.now()}`,
      name: customProdName.trim(),
      subtitle: "Coach Custom Recommendation",
      affiliateUrl: customProdUrl.trim() || "#",
      price: Number(customProdPrice) || 0,
      image: customProdImageUrl.trim() || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80",
      customCoachNote: customProdNote.trim() || "Prescribed by Head Coach Naveen.",
    };
    setSelectedSupplements([...selectedSupplements, newSupp]);
    setCustomProdName("");
    setCustomProdPrice("");
    setCustomProdUrl("");
    setCustomProdImageUrl("");
    setCustomProdNote("");
    setShowAddCustomProduct(false);
  };

  const handleRemoveSupplement = (productId: string) => {
    setSelectedSupplements(selectedSupplements.filter((s) => s.productId !== productId));
  };

  const handleUpdateSupplementImage = (productId: string, imageUrl: string) => {
    setSelectedSupplements(
      selectedSupplements.map((s) => (s.productId === productId ? { ...s, image: imageUrl } : s))
    );
  };

  const handleUpdateSupplementNote = (productId: string, note: string) => {
    setSelectedSupplements(
      selectedSupplements.map((s) => (s.productId === productId ? { ...s, customCoachNote: note } : s))
    );
  };

  const handleUpdateSupplementUrl = (productId: string, url: string) => {
    setSelectedSupplements(
      selectedSupplements.map((s) => (s.productId === productId ? { ...s, affiliateUrl: url } : s))
    );
  };

  const handleSendCoachFeedback = async (targetDate: string) => {
    if (!coachFeedbackText.trim() || !user) return;
    setSendingFeedback(true);
    setFeedbackNotice(null);
    try {
      const planId = user.plan?.id || user.id;
      const res = await fetch(`/api/plan/${encodeURIComponent(planId)}/daily-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: targetDate,
          coachFeedback: coachFeedbackText.trim(),
        }),
      });
      if (res.ok) {
        if (!user.dailyLogs) user.dailyLogs = {};
        if (user.dailyLogs[targetDate]) {
          user.dailyLogs[targetDate].coachFeedback = coachFeedbackText.trim();
        }
        setFeedbackNotice("Coach feedback successfully delivered to client dashboard!");
        setCoachFeedbackText("");
        setTimeout(() => setFeedbackNotice(null), 4000);
      }
    } catch (err) {
      console.error("Failed to send coach feedback:", err);
      setFeedbackNotice("Failed to send feedback.");
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleSendPlanSubmit = async () => {
    setIsPushing(true);
    setSuccessMessage(null);
    try {
      const videoPayload: PlanVideo | undefined = videoUrl.trim()
        ? {
          url: videoUrl.trim(),
          title: videoTitle.trim() || `Form & Routine Breakdown for ${user.name}`,
          aspectRatio: videoRatio,
          notes: videoNotes.trim(),
        }
        : undefined;

      await onPushPlan(user, coachNotes, videoPayload, selectedSupplements, {
        calorieTarget,
        proteinTargetGrams,
        workoutDaysPerWeek,
      });
      setSuccessMessage(`Plan successfully delivered and published to ${user.name}'s live dashboard!`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to push plan:", err);
      alert("Failed to send plan. Please try again.");
    } finally {
      setIsPushing(false);
    }
  };

  const filteredCatalog = SUPPLEMENT_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(supplementSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(supplementSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">

          {/* ================= HEADER ================= */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-200 bg-white shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900 truncate">{user.name}</h2>
                  {user.membershipCategory === "free" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                      <span>Free Lead</span>
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                      <span>₹99 Paid · Needs Plan</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Live &amp; Pushed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {[user.email, user.phone, user.city].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => onOpenStudio(user)}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Open Week Plan Studio to customize and give plan"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isPending ? "Give Plan" : "Plan Studio"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer ${activeTab === "chat"
                    ? "bg-[#075E54] text-white"
                    : "bg-[#25D366] hover:bg-[#20bd5a] text-black"
                  }`}
                title="Open 1-on-1 Chat with Client"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Close Sidebar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="px-6 pt-2 border-b border-slate-100 bg-white">
            <nav className="flex space-x-6 text-xs font-semibold overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab("dispatch")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${activeTab === "dispatch"
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                <Rocket className="w-4 h-4 text-emerald-600" />
                <span>Send Plan &amp; Video</span>
                {isPending && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
                )}
              </button>

              {/* TAB: DAILY ADHERENCE */}
              <button
                type="button"
                onClick={() => setActiveTab("tracking")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${activeTab === "tracking"
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Daily Adherence</span>
                {(user.dailyLogs?.[new Date().toISOString().split("T")[0]] || user.plan?.dailyLogs?.[new Date().toISOString().split("T")[0]]) ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5 shadow-xs" title="Logged Today ✓" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 ml-0.5 animate-pulse" title="Awaiting Today's Log" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("biometrics")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${activeTab === "biometrics"
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Body Stats &amp; Health</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("plan")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${activeTab === "plan"
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Targets &amp; Routine</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${activeTab === "chat"
                  ? "border-[#25D366] text-[#075E54] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>1-on-1 Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("alert")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${activeTab === "alert"
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Alert</span>
              </button>
            </nav>
          </div>

          {/* ================= SCROLLABLE CONTENT BODY ================= */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Success Notice Banner */}
            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <a
                  href={`/plan/${user.plan?.id || user.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition"
                >
                  View Client Plan &rarr;
                </a>
              </div>
            )}

            {/* ---------------- TAB 1: SEND PLAN & VIDEO ---------------- */}
            {activeTab === "dispatch" && (
              <div className="space-y-6">

                {/* Section 0: Payment & UTR Verification Record (Direct PhonePe / Razorpay) */}
                {user.order && (
                  <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-2.5 text-xs text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💳</span>
                        <span className="font-bold text-slate-900">
                          Payment Verification ({user.order.amountFormatted || "₹99"})
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {user.order.paymentMethod === "phonepe"
                          ? "🟣 PhonePe Direct UPI"
                          : user.order.paymentMethod === "upi_manual"
                          ? "🟢 Direct UPI"
                          : "Razorpay Gateway"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          UTR / Transaction ID
                        </span>
                        <span className="font-mono font-bold text-slate-900 select-all">
                          {user.order.utr || user.order.razorpayPaymentId || user.order.orderId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Transaction Date
                        </span>
                        <span className="text-slate-900 font-medium">
                          {user.order.purchasedAt
                            ? new Date(user.order.purchasedAt).toLocaleString()
                            : "Active Today"}
                        </span>
                      </div>
                    </div>

                    {user.order.paymentScreenshot && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                        <span className="text-slate-600 font-medium text-[11px]">
                          Payment Screenshot / Receipt:
                        </span>
                        <a
                          href={user.order.paymentScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <span>View Receipt Image</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Section A: Personalized Video Instruction */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Personalized Coach Video
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Provide a personalized form analysis or workout routine video for {user.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video URL Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Video URL (YouTube, Shorts, Vimeo, Loom, or MP4)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Video Title & Aspect Ratio Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Video Title / Heading
                      </label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. Form Analysis & Day 1 Routine"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Video Aspect Ratio
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoRatio("16:9")}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${videoRatio === "16:9"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                          <span>16:9 (Landscape)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoRatio("9:16")}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${videoRatio === "9:16"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                          <span>9:16 (Shorts/Reel)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Video Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Coach Video Notes &amp; Timestamps (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={videoNotes}
                      onChange={(e) => setVideoNotes(e.target.value)}
                      placeholder="e.g. Pay special attention to shoulder retraction at 01:45..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Video Live Preview */}
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Live Preview ({videoRatio === "16:9" ? "16:9 Landscape" : "9:16 Portrait"})
                    </span>
                    {parsedVideo.embedUrl ? (
                      <div className="flex justify-center bg-black/5 rounded-2xl p-2 border border-slate-200/80">
                        <div
                          className={`overflow-hidden rounded-xl bg-black shadow-md relative ${videoRatio === "9:16"
                            ? "aspect-[9/16] w-[220px]"
                            : "aspect-[16/9] w-full"
                            }`}
                        >
                          {parsedVideo.isDirectVideo ? (
                            <video
                              src={parsedVideo.embedUrl}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <iframe
                              src={parsedVideo.embedUrl}
                              title="Coach Video Preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center ${videoRatio === "9:16" ? "h-64 max-w-[220px] mx-auto" : "h-40 w-full"
                          }`}
                      >
                        <Video className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-xs font-semibold text-slate-500">
                          Video preview will appear here
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Paste any YouTube link, Shorts, or video URL above
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: Suggested Supplements & Custom Products */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Suggested Supplements &amp; Products
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Recommend verified supplements with store links &amp; image URLs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {selectedSupplements.length} Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomProduct(!showAddCustomProduct)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Product Inline Form */}
                  {showAddCustomProduct && (
                    <div className="p-4 bg-white rounded-xl border-2 border-emerald-300 shadow-sm space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                          + Add Coach-Recommended Product
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowAddCustomProduct(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Product Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Optimum Nutrition Gold Standard Whey"
                            value={customProdName}
                            onChange={(e) => setCustomProdName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Price (₹) *</label>
                          <input
                            type="number"
                            placeholder="e.g. 3199"
                            value={customProdPrice}
                            onChange={(e) => setCustomProdPrice(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Purchase / Store URL</label>
                          <input
                            type="url"
                            placeholder="e.g. https://amazon.in/dp/..."
                            value={customProdUrl}
                            onChange={(e) => setCustomProdUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Image URL (Web Link)</label>
                          <input
                            type="url"
                            placeholder="e.g. https://images.unsplash.com/... or img link"
                            value={customProdImageUrl}
                            onChange={(e) => setCustomProdImageUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px]"
                          />
                          <p className="text-[9.5px] text-slate-400">Uses direct URL to keep Firestore lean &amp; fast.</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Dosage &amp; Coach Instructions</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 scoop with 250ml water immediately post-workout"
                          value={customProdNote}
                          onChange={(e) => setCustomProdNote(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCustomProduct(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomProduct}
                          disabled={!customProdName.trim()}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white shadow-xs cursor-pointer"
                        >
                          + Add to Recommendations
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected Supplements Active List */}
                  {selectedSupplements.length > 0 ? (
                    <div className="space-y-3">
                      <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Attached Recommendations for {user.name}
                      </span>
                      <div className="space-y-2.5">
                        {selectedSupplements.map((supp) => (
                          <div
                            key={supp.productId}
                            className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-10 h-10 rounded-lg bg-slate-50 p-1 shrink-0 border border-slate-100 overflow-hidden">
                                  <img
                                    src={supp.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80"}
                                    alt={supp.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      // Fallback on broken image link
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80";
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold text-slate-900 truncate">
                                    {supp.name}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 font-semibold">
                                    ₹{supp.price ? supp.price.toLocaleString() : "Free / Included"}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSupplement(supp.productId)}
                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 px-2 py-1 rounded-lg hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                                title="Remove supplement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            {/* Coach Custom Note for this Supplement */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                Prescription / Coach Note
                              </label>
                              <input
                                type="text"
                                value={supp.customCoachNote || ""}
                                onChange={(e) =>
                                  handleUpdateSupplementNote(supp.productId, e.target.value)
                                }
                                placeholder="e.g. 1 scoop with 200ml water post workout"
                                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Affiliate URL & Image URL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Store / Purchase URL
                                </label>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="url"
                                    value={supp.affiliateUrl}
                                    onChange={(e) =>
                                      handleUpdateSupplementUrl(supp.productId, e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-600 truncate"
                                  />
                                  {supp.affiliateUrl && supp.affiliateUrl !== "#" && (
                                    <a
                                      href={supp.affiliateUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition shrink-0"
                                      title="Test link"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Product Image URL
                                </label>
                                <input
                                  type="url"
                                  value={supp.image}
                                  onChange={(e) =>
                                    handleUpdateSupplementImage(supp.productId, e.target.value)
                                  }
                                  placeholder="https://... direct image link"
                                  className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-600 truncate"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-2">
                      <p className="text-xs text-slate-500 font-medium">
                        No products recommended yet. Click <strong>+ Add Product</strong> above to suggest specific brands, protein, creatine or multivitamins.
                      </p>
                    </div>
                  )}

                  {/* Add More from Catalog */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Or Pick From Verified Catalog
                      </span>
                      <input
                        type="text"
                        placeholder="Filter catalog..."
                        value={supplementSearch}
                        onChange={(e) => setSupplementSearch(e.target.value)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredCatalog.slice(0, 6).map((product) => {
                        const isSelected = selectedSupplements.some((s) => s.productId === product.id);
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleToggleSupplement(product)}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-2 ${isSelected
                              ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative w-7 h-7 rounded-md bg-slate-50 p-0.5 shrink-0 overflow-hidden">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-bold text-slate-800 truncate">
                                  {product.name}
                                </span>
                                <span className="block text-[10px] text-slate-500 font-medium">
                                  ₹{product.price}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`p-1 rounded-md text-[10px] font-bold shrink-0 ${isSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section C: Daily Nutrition & Training Calibrations */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Targets &amp; Routine Review
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Verified against {user.name}&apos;s biometrics &amp; US Navy Body Fat %
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Calories (kcal/day)
                      </label>
                      <input
                        type="number"
                        value={calorieTarget}
                        onChange={(e) => setCalorieTarget(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Protein Target (g)
                      </label>
                      <input
                        type="number"
                        value={proteinTargetGrams}
                        onChange={(e) => setProteinTargetGrams(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Workouts (Days/Wk)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={workoutDaysPerWeek}
                        onChange={(e) => setWorkoutDaysPerWeek(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Coach Note on Dashboard
                    </label>
                    <textarea
                      rows={2}
                      value={coachNotes}
                      onChange={(e) => setCoachNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Plan Version & Reassurance Info */}
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-950">
                        Live Status: {user.needsPlanReview || user.plan?.status === "pending_review" ? "Pending Initial Review" : `Version ${user.plan?.planHistory?.length ? user.plan.planHistory.length : 1} Active`}
                      </span>
                      <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        {user.plan?.weeksCount || user.plan?.weeks?.length || 1} Week(s) Active
                      </span>
                    </div>

                    {user.plan?.planHistory && user.plan.planHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowVersionHistory(!showVersionHistory)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        {showVersionHistory ? "Hide History" : `View ${user.plan.planHistory.length} Previous Pushes`}
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-emerald-800">
                    💡 <strong>Safe Updates:</strong> Re-sending or updating the plan preserves all existing weeks, athlete task completions, and daily compliance records.
                  </p>

                  {/* Expandable Release History Log */}
                  {showVersionHistory && user.plan?.planHistory && (
                    <div className="pt-2 border-t border-emerald-200 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {user.plan.planHistory.map((h, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white border border-emerald-100 text-[10px] space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>Version {h.version} · {h.weeksCount} Week(s)</span>
                            <span className="text-slate-400 font-normal">{new Date(h.pushedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 truncate">{h.notes || h.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Action Push Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendPlanSubmit}
                    disabled={isPushing}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>
                      {isPushing
                        ? "Delivering Plan to User..."
                        : isPending
                          ? `Send Customized Plan to ${user.name} (Push Live)`
                          : `Update & Re-send Live Plan to ${user.name}`}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                    This updates Firestore instantly and unlocks the client&apos;s live customized dashboard with full history intact.
                  </p>
                </div>
              </div>
            )}

            {/* ---------------- TAB: DAILY ADHERENCE & TRACKING ---------------- */}
            {activeTab === "tracking" && (
              <div className="space-y-6">
                {(() => {
                  const todayDateStr = new Date().toISOString().split("T")[0];
                  const allDailyLogs = user.dailyLogs || user.plan?.dailyLogs || {};
                  const todayCheckin = allDailyLogs[todayDateStr];
                  const sortedLogs = Object.values(allDailyLogs).sort((a, b) => b.date.localeCompare(a.date));
                  const totalLoggedDays = sortedLogs.length;
                  const workoutsCompleted = sortedLogs.filter((l) => l.workoutCompleted).length;
                  const dietAdherentDays = sortedLogs.filter((l) => l.dietAdherence === "100% on track").length;
                  const complianceRate = totalLoggedDays > 0 ? Math.round((dietAdherentDays / totalLoggedDays) * 100) : 0;

                  return (
                    <>
                      {/* Metric Stats Banner */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Days Tracked</span>
                          <span className="text-xl font-black text-slate-900">{totalLoggedDays}</span>
                          <span className="block text-[10px] text-slate-500">Total Check-ins</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center">
                          <span className="block text-[10px] font-bold text-emerald-700 uppercase">Workouts Done</span>
                          <span className="text-xl font-black text-emerald-950">{workoutsCompleted}</span>
                          <span className="block text-[10px] text-emerald-700">Completed Sessions</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-center">
                          <span className="block text-[10px] font-bold text-teal-700 uppercase">Diet Adherence</span>
                          <span className="text-xl font-black text-teal-950">{complianceRate}%</span>
                          <span className="block text-[10px] text-teal-700">{dietAdherentDays} Days 100% On Plan</span>
                        </div>
                      </div>

                      {/* Today's Check-in Status Card */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <div>
                              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Today&apos;s Athlete Log ({todayDateStr})
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Real-time daily progress report from {user.name}
                              </p>
                            </div>
                          </div>

                          {todayCheckin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Logged Today ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Awaiting Today&apos;s Log</span>
                            </span>
                          )}
                        </div>

                        {todayCheckin ? (
                          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Workout</span>
                                <span className="font-bold text-slate-900">
                                  {todayCheckin.workoutCompleted ? "Completed ✓" : "Rest / Skipped"}
                                </span>
                                <span className="block text-[10px] text-slate-500 truncate">
                                  {todayCheckin.workoutDayTitle || "Today's Routine"}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Nutrition</span>
                                <span className="font-bold text-slate-900 capitalize">
                                  {todayCheckin.dietAdherence}
                                </span>
                                <span className="block text-[10px] text-slate-500">
                                  {todayCheckin.caloriesActual ? `${todayCheckin.caloriesActual} kcal` : "Target Met"}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Hydration &amp; Steps</span>
                                <span className="font-bold text-slate-900">
                                  {todayCheckin.waterLitres ?? 3.0} L Water
                                </span>
                                <span className="block text-[10px] text-slate-500">
                                  {(todayCheckin.stepsCompleted ?? 8000).toLocaleString()} steps
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Supplements</span>
                                <span className="font-bold text-slate-900">
                                  {todayCheckin.supplementsTaken ? "Taken ✓" : "Missed"}
                                </span>
                                <span className="block text-[10px] text-slate-500">
                                  Energy: {todayCheckin.energyLevel || "High"}
                                </span>
                              </div>
                            </div>

                            {todayCheckin.workoutNotes && (
                              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                                <strong className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Workout Notes:</strong>
                                <p className="text-slate-800">{todayCheckin.workoutNotes}</p>
                              </div>
                            )}

                            {todayCheckin.clientNote && (
                              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs">
                                <strong className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Message from {user.name}:</strong>
                                <p className="text-emerald-950 font-medium">{todayCheckin.clientNote}</p>
                              </div>
                            )}

                            {todayCheckin.coachFeedback && (
                              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                                <strong className="text-[10px] font-bold text-teal-800 uppercase block mb-0.5">Your Coach Feedback:</strong>
                                <p className="text-teal-950 font-medium">{todayCheckin.coachFeedback}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-2">
                            <p className="font-semibold">
                              {user.name} hasn&apos;t marked today&apos;s daily routine yet.
                            </p>
                            <p className="text-[11px] text-amber-800">
                              Clients mark today&apos;s workout and diet using the &ldquo;Track Today&apos;s Plan&rdquo; button directly on their dashboard.
                            </p>
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveTab("chat")}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Send In-App Reminder in Chat</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Coach Response / Feedback Form */}
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">
                            Send Coach Feedback for Today ({todayDateStr})
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={coachFeedbackText}
                              onChange={(e) => setCoachFeedbackText(e.target.value)}
                              placeholder={`Great job on the form, ${user.name.split(" ")[0]}! Rest well tonight.`}
                              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendCoachFeedback(todayDateStr)}
                              disabled={sendingFeedback || !coachFeedbackText.trim()}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingFeedback ? "Sending..." : "Send"}</span>
                            </button>
                          </div>
                          {feedbackNotice && (
                            <p className="text-[11px] font-bold text-emerald-600 animate-in fade-in">
                              ✓ {feedbackNotice}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Past Daily Logs Timeline */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Daily Compliance History ({sortedLogs.length} Days)
                          </h4>
                          <span className="text-[10px] text-slate-400">Chronological</span>
                        </div>

                        {sortedLogs.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {sortedLogs.map((log) => (
                              <div
                                key={log.id}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-3"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{log.date}</span>
                                    <span
                                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                                        log.workoutCompleted
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {log.workoutCompleted ? "Workout Done" : "Rest Day"}
                                    </span>
                                    <span
                                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                                        log.dietAdherence === "100% on track"
                                          ? "bg-teal-100 text-teal-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {log.dietAdherence}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {log.clientNote || log.workoutDayTitle || "No extra note added."}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="block text-[11px] font-bold text-slate-800">
                                    {log.waterLitres ?? 3.0}L · {(log.stepsCompleted ?? 8000).toLocaleString()} steps
                                  </span>
                                  <span className="block text-[9.5px] text-slate-400">
                                    Supplements: {log.supplementsTaken ? "Yes" : "No"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-4">
                            No past check-ins recorded yet. As {user.name} uses the daily tracking button, daily progress will appear here.
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ---------------- TAB 2: BIOMETRICS & HEALTH ---------------- */}
            {activeTab === "biometrics" && (
              <div className="space-y-6">

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Weight</span>
                    <span className="text-lg font-black text-slate-900">{user.biometrics?.weightKg ?? "—"} kg</span>
                    <span className="block text-[10px] text-slate-500">Target: {user.biometrics?.targetWeightKg ?? "—"} kg</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Height</span>
                    <span className="text-lg font-black text-slate-900">{user.biometrics?.heightCm ?? "—"} cm</span>
                    <span className="block text-[10px] text-slate-500">Age: {user.biometrics?.age ?? 28} yrs</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase">BMI</span>
                    <span className="text-lg font-black text-emerald-900">{user.biometrics?.bmi ?? "—"}</span>
                    <span className="block text-[10px] text-emerald-700 capitalize">{user.biometrics?.bmiCategory ?? "normal"}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80">
                    <span className="block text-[10px] font-bold text-teal-700 uppercase">US Navy Body Fat</span>
                    <span className="text-lg font-black text-teal-900">{user.biometrics?.bodyFatPercent ?? "—"}%</span>
                    <span className="block text-[10px] text-teal-700 capitalize">{user.biometrics?.bodyFatCategory ?? "average"}</span>
                  </div>
                </div>

                {/* Circumferences Details */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Body Measurements (Hodgdon-Beckett Inputs)
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Waist</span>
                      <span className="font-bold text-slate-900">{user.biometrics?.waistIn ?? "—"} inches</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Neck</span>
                      <span className="font-bold text-slate-900">{user.biometrics?.neckIn ?? "—"} inches</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Hip (if female)</span>
                      <span className="font-bold text-slate-900">{user.biometrics?.hipIn ? `${user.biometrics.hipIn} inches` : "N/A (Male)"}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical / Medical Assessment Profile */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Medical Profile &amp; Attached Reports
                    </h4>
                  </div>

                  {user.medicalAssessment ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reported Health Conditions:</span>
                        {user.medicalAssessment.diseases && user.medicalAssessment.diseases.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {user.medicalAssessment.diseases.map((d, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]"
                              >
                                🩺 {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium">None reported</span>
                        )}
                      </div>

                      {user.medicalAssessment.customDiseaseDescription && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Condition Notes:</span>
                          <p className="text-slate-700 bg-slate-50 p-2 rounded-lg mt-0.5">
                            {user.medicalAssessment.customDiseaseDescription}
                          </p>
                        </div>
                      )}

                      {user.medicalAssessment.medications && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Current Medications:</span>
                          <span className="font-medium text-slate-800">{user.medicalAssessment.medications}</span>
                        </div>
                      )}

                      {user.medicalAssessment.documents && user.medicalAssessment.documents.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-slate-500 block text-[11px] font-bold mb-1.5">
                            Attached Lab Reports ({user.medicalAssessment.documents.length})
                          </span>
                          <div className="space-y-1.5">
                            {user.medicalAssessment.documents.map((doc, idx) => (
                              <a
                                key={idx}
                                href={doc.fileUrl || doc.dataUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-emerald-900 font-semibold"
                              >
                                <span>📎 {doc.name || `Medical Report ${idx + 1}`}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">
                      No clinical restrictions or medical reports flagged for this member.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: TARGETS & ROUTINE ---------------- */}
            {activeTab === "plan" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Week-by-Week Plan Overview
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Total duration: {user.plan?.weeksCount || 8} Weeks ({user.plan?.weeks?.length || 0} active phases)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenStudio(user)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Launch Studio Editor</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(user.plan?.weeks || []).slice(0, 4).map((w) => (
                    <div
                      key={w.weekNumber}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          Week {w.weekNumber}: {w.phaseTitle}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {(w.workouts?.days || []).length} Workout Days
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{w.phaseSubtitle}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
                        <span>🥗 {w.nutrition?.calories || 1800} kcal</span>
                        <span>🥩 {w.nutrition?.proteinGrams || 120}g Protein</span>
                        <span>🏋️ {w.workouts?.daysPerWeek || 4}d Training</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- TAB 4: 1-ON-1 WHATSAPP CHAT ---------------- */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-[520px] rounded-2xl border border-emerald-200 overflow-hidden bg-[#efeae2] shadow-sm">
                {/* Chat Header Bar */}
                <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-emerald-800 text-white font-bold text-xs flex items-center justify-center border border-emerald-400">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{user.name}</span>
                        {user.membershipCategory === "purchased" ? (
                          <span className="text-[9px] bg-emerald-400 text-gray-950 font-black px-1.5 py-0.2 rounded-full">
                            ₹99 PAID
                          </span>
                        ) : user.membershipCategory === "membership" ? (
                          <span className="text-[9px] bg-purple-300 text-purple-950 font-black px-1.5 py-0.2 rounded-full">
                            MEMBERSHIP
                          </span>
                        ) : (
                          <span className="text-[9px] bg-gray-200 text-gray-800 font-black px-1.5 py-0.2 rounded-full">
                            FREE LEAD
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-100 font-mono">
                        {user.phone || "+91 Mobile"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${user.name}! Coach Naveen here from BMYFIT. How is your transformation going?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black text-[11px] font-black flex items-center gap-1 shadow-xs transition"
                      title="Open WhatsApp Web"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-black" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenChat(user)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition"
                      title="Open in Full Screen Console"
                    >
                      <span>Full View ↗</span>
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div
                  className="flex-1 overflow-y-auto p-3.5 space-y-2.5"
                  style={{
                    backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #efeae2 0.75px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 10px 10px",
                  }}
                >
                  <div className="flex justify-center">
                    <span className="bg-white/95 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs border border-gray-200/60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Direct 1-on-1 Consultation Thread</span>
                    </span>
                  </div>

                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      No message history yet. Type below to send your first message!
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isCoach = msg.senderRole === "coach";
                      return (
                        <div key={msg.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-xs relative text-left leading-relaxed ${isCoach
                                ? "bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-emerald-200/50"
                                : "bg-white text-gray-900 rounded-tl-xs border border-gray-200/70"
                              }`}
                          >
                            <p className={`text-[10px] font-black mb-0.5 ${isCoach ? "text-[#075E54]" : "text-emerald-800"}`}>
                              {isCoach ? "Coach Naveen" : (msg.senderName || user.name)}
                            </p>
                            <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-500 font-mono">
                              <span>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                              </span>
                              {isCoach && (
                                <CheckCheck className={`w-3 h-3 ${msg.read ? "text-[#53bdeb]" : "text-gray-400"}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Quick Reply Chips */}
                <div className="bg-[#f0f2f5] px-3 py-1.5 border-t border-gray-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
                  {[
                    "Plan reviewed! Protein targets updated.",
                    "Great work! Keep hydration above 3.5L.",
                    "Please share morning weigh-in.",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => void handleSendSidebarMessage(preset)}
                      className="shrink-0 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 border border-gray-200 rounded-full px-2.5 py-0.5 text-[10px] font-medium transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendSidebarMessage();
                  }}
                  className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 border-t border-gray-200 shrink-0"
                >
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder={`Message ${user.name.split(" ")[0]}...`}
                    className="flex-1 bg-white text-gray-900 text-xs rounded-full py-2 pl-3.5 pr-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition"
                  />
                  <button
                    type="submit"
                    disabled={!chatInputText.trim() || chatSending}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs shrink-0 ${chatInputText.trim()
                        ? "bg-[#25D366] hover:bg-[#1faa53] text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <Send className="w-3.5 h-3.5 translate-x-0.2" />
                  </button>
                </form>
              </div>
            )}

            {/* ---------------- TAB 5: WHATSAPP ALERT ---------------- */}
            {activeTab === "alert" && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <h3 className="text-xs font-black uppercase tracking-wider">
                      Direct WhatsApp Communication
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Message {user.name} directly on WhatsApp ({user.phone}) to notify them that their personalized plan, video breakdown, and supplement guide are ready.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${user.name}! Coach Naveen here from BMYFIT. Your personalized ${user.plan?.weeksCount || 8}-week plan, custom video routine, and supplement recommendations are live on your dashboard: https://bmyfit.in/plan/${user.plan?.id || user.id}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs shadow-xs transition"
                    >
                      <MessageCircle className="w-4 h-4 fill-black" />
                      <span>Open WhatsApp Chat</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveTab("chat")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>In-App Coach Messenger</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Quick Notification Nudges
                  </h4>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => onSendAlert(user)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-between"
                    >
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          🔔 Plan Ready &amp; Video Available
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Alert user that Coach Naveen has published their routine
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Dispatch &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendAlert(user)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-between"
                    >
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          ⚠️ Daily Adherence Checkup
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Friendly reminder to log meals and completed workout tasks
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600">Dispatch &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= FOOTER ================= */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <a
              href={`/plan/${user.plan?.id || user.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Client Dashboard</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {activeTab !== "dispatch" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("dispatch")}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Send Plan</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

