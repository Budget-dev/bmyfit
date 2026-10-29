"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
} from "@/components/ui/icons";
import { ShoppingBag } from "@/components/ui/supplement-icons";
import type { AdminUserRecord } from "@/types/admin";
import type { PlanVideo, PlanSupplementRecommendation } from "@/types/plan-dashboard";
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
    supplements?: PlanSupplementRecommendation[]
  ) => Promise<void>;
  onOpenStudio: (user: AdminUserRecord) => void;
  onOpenChat: (user: AdminUserRecord) => void;
  onSendAlert: (user: AdminUserRecord) => void;
  initialTab?: "dispatch" | "biometrics" | "plan" | "alert";
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
  const [activeTab, setActiveTab] = useState<"dispatch" | "biometrics" | "plan" | "alert">(initialTab);

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

  // Loading & success
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state whenever selected user changes
  useEffect(() => {
    if (user) {
      setActiveTab(initialTab);
      setSuccessMessage(null);
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
        // Pre-select 1 recommended protein supplement matching their goal by default
        const defaultProtein = SUPPLEMENT_PRODUCTS.find((p) => p.category === "protein") || SUPPLEMENT_PRODUCTS[0];
        if (defaultProtein) {
          setSelectedSupplements([
            {
              productId: defaultProtein.id,
              name: defaultProtein.name,
              subtitle: defaultProtein.subtitle,
              affiliateUrl: defaultProtein.amazonUrl,
              price: defaultProtein.price,
              originalPrice: defaultProtein.originalPrice,
              image: defaultProtein.image,
              customCoachNote: "Consume 1 scoop in 200ml water post workout to hit your daily protein goal.",
            },
          ]);
        } else {
          setSelectedSupplements([]);
        }
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

      await onPushPlan(user, coachNotes, videoPayload, selectedSupplements);
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
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
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
                  {isPending ? (
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
                  {user.email} · {user.phone} · {user.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
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
            <nav className="flex space-x-6 text-xs font-semibold" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab("dispatch")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "dispatch"
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

              <button
                type="button"
                onClick={() => setActiveTab("biometrics")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "biometrics"
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
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "plan"
                    ? "border-emerald-600 text-emerald-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Targets &amp; Routine</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("alert")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "alert"
                    ? "border-emerald-600 text-emerald-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
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
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                            videoRatio === "16:9"
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span>16:9 (Landscape)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoRatio("9:16")}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                            videoRatio === "9:16"
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
                          className={`overflow-hidden rounded-xl bg-black shadow-md relative ${
                            videoRatio === "9:16"
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
                        className={`rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center ${
                          videoRatio === "9:16" ? "h-64 max-w-[220px] mx-auto" : "h-40 w-full"
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

                {/* Section B: Suggested Supplements & Affiliate Links */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Suggested Supplements &amp; Affiliate Products
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Recommend tailored supplements with your affiliate links
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {selectedSupplements.length} Selected
                    </span>
                  </div>

                  {/* Selected Supplements Active List */}
                  {selectedSupplements.length > 0 && (
                    <div className="space-y-3">
                      <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Attached Recommendations for {user.name}
                      </span>
                      <div className="space-y-2.5">
                        {selectedSupplements.map((supp) => (
                          <div
                            key={supp.productId}
                            className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-9 h-9 rounded-lg bg-slate-50 p-1 shrink-0 border border-slate-100 overflow-hidden">
                                  <Image
                                    src={supp.image}
                                    alt={supp.name}
                                    fill
                                    className="object-contain"
                                    sizes="36px"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold text-slate-900 truncate">
                                    {supp.name}
                                  </span>
                                  <span className="block text-[10px] text-slate-400">
                                    ₹{supp.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedSupplements(
                                    selectedSupplements.filter((s) => s.productId !== supp.productId)
                                  )
                                }
                                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition"
                                title="Remove supplement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

                            {/* Affiliate URL */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                Affiliate Purchase URL
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="url"
                                  value={supp.affiliateUrl}
                                  onChange={(e) =>
                                    handleUpdateSupplementUrl(supp.productId, e.target.value)
                                  }
                                  className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-600 truncate"
                                />
                                <a
                                  href={supp.affiliateUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition shrink-0"
                                  title="Test link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add More from Catalog */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Quick Add From Catalog
                      </span>
                      <input
                        type="text"
                        placeholder="Filter supplements..."
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
                            className={`p-2 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative w-7 h-7 rounded-md bg-slate-50 p-0.5 shrink-0 overflow-hidden">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-contain"
                                  sizes="28px"
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
                              className={`p-1 rounded-md text-[10px] font-bold shrink-0 ${
                                isSelected
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

                  <div className="grid grid-cols-3 gap-3">
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

                {/* Main Action Push Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendPlanSubmit}
                    disabled={isPushing}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
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
                    This updates Firestore instantly and unlocks the client&apos;s full 8-week dashboard.
                  </p>
                </div>
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

                {/* Clinical / Medical Assessment Dossier */}
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

            {/* ---------------- TAB 4: WHATSAPP ALERT ---------------- */}
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
                      onClick={() => onOpenChat(user)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
                    >
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

