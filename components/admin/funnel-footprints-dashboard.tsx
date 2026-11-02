"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { VisitorFootprintRecord, FootprintStage } from "@/lib/telemetry/footprints";
import { adminFetch } from "@/lib/admin-api-client";
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  Monitor,
  ChevronDown,
  ChevronUp,
  Activity,
  MessageCircle,
} from "@/components/ui/icons";

function Smartphone({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function Phone({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

interface FunnelStats {
  totalVisitors: number;
  stageCounts: Record<string, number>;
  mobilePercentage: number;
  desktopPercentage: number;
  avgTimeSpentSeconds: number;
  dropOffAtCheckoutPercentage: number;
  checkoutToPaymentConversion: number;
  paymentToUtrConversion: number;
}

export function FunnelFootprintsDashboard() {
  const [footprints, setFootprints] = useState<VisitorFootprintRecord[]>([]);
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "mobile" | "desktop">("all");
  const [expandedVisitorId, setExpandedVisitorId] = useState<string | null>(null);

  const fetchFootprints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/footprints");
      if (res.ok) {
        const data = await res.json();
        setFootprints(data.footprints || []);
        setFunnelStats(data.funnelStats || null);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.warn("[FunnelFootprints] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFootprints();
  }, [fetchFootprints]);

  // Live Auto-Refresh every 12 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchFootprints();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFootprints]);

  // Filtered Footprints
  const filteredFootprints = useMemo(() => {
    return footprints.filter((fp) => {
      // Device filter
      if (deviceFilter !== "all" && fp.device !== deviceFilter) return false;

      // Stage filter
      if (stageFilter === "checkout") {
        const hasCheckout = fp.timeline?.some((e) => e.stage === "checkout_viewed") || fp.highestStage === "checkout_viewed";
        if (!hasCheckout) return false;
      } else if (stageFilter === "payment_clicked") {
        const hasClick = fp.timeline?.some((e) => e.stage === "razorpay_checkout_opened" || e.stage === "phonepe_intent_clicked" || e.stage === "upi_fallback_clicked");
        if (!hasClick) return false;
      } else if (stageFilter === "utr_submitted") {
        const isVerified = fp.isPaid || Boolean(fp.utr) || fp.highestStage === "utr_submitted" || fp.highestStage === "razorpay_payment_success" || fp.timeline?.some((e) => e.stage === "razorpay_payment_success");
        if (!isVerified) return false;
      } else if (stageFilter === "dropped_checkout") {
        const hasCheckout = fp.timeline?.some((e) => e.stage === "checkout_viewed");
        const hasPaid = fp.isPaid || Boolean(fp.utr) || fp.highestStage === "utr_submitted" || fp.highestStage === "razorpay_payment_success" || fp.timeline?.some((e) => e.stage === "razorpay_payment_success");
        if (!hasCheckout || hasPaid) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = fp.customerName?.toLowerCase().includes(q);
        const matchesPhone = fp.customerPhone?.toLowerCase().includes(q);
        const matchesEmail = fp.customerEmail?.toLowerCase().includes(q);
        const matchesUtr = fp.utr?.toLowerCase().includes(q);
        const matchesId = fp.visitorId?.toLowerCase().includes(q);
        const matchesGoal = fp.goal?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesUtr && !matchesId && !matchesGoal) {
          return false;
        }
      }

      return true;
    });
  }, [footprints, stageFilter, deviceFilter, searchQuery]);

  // Funnel Step Aggregation Data for Chart
  const total = funnelStats?.totalVisitors || footprints.length || 1;
  const stageCounts = funnelStats?.stageCounts || {
    landing: footprints.length,
    goal_selected: footprints.filter((f) => f.timeline?.some((e) => e.stage === "goal_selected")).length,
    details_entered: footprints.filter((f) => f.timeline?.some((e) => e.stage === "details_entered")).length,
    result_viewed: footprints.filter((f) => f.timeline?.some((e) => e.stage === "result_viewed")).length,
    checkout_viewed: footprints.filter((f) => f.timeline?.some((e) => e.stage === "checkout_viewed")).length,
    payment_clicked: footprints.filter((f) => f.timeline?.some((e) => e.stage === "razorpay_checkout_opened" || e.stage === "phonepe_intent_clicked" || e.stage === "upi_fallback_clicked")).length,
    utr_submitted: footprints.filter((f) => f.utr || f.isPaid || f.highestStage === "utr_submitted" || f.highestStage === "razorpay_payment_success" || f.timeline?.some((e) => e.stage === "razorpay_payment_success")).length,
  };

  const funnelSteps = [
    { id: "landing", label: "1. Landed", count: stageCounts.landing || total, color: "bg-blue-500", text: "text-blue-700" },
    { id: "goal_selected", label: "2. Goal Picked", count: stageCounts.goal_selected, color: "bg-indigo-500", text: "text-indigo-700" },
    { id: "details_entered", label: "3. Details Filled", count: stageCounts.details_entered, color: "bg-violet-500", text: "text-violet-700" },
    { id: "result_viewed", label: "4. Free Score", count: stageCounts.result_viewed, color: "bg-teal-500", text: "text-teal-700" },
    { id: "checkout_viewed", label: "5. Checkout (₹99)", count: stageCounts.checkout_viewed, color: "bg-amber-500", text: "text-amber-700", highlight: true },
    { id: "payment_clicked", label: "6. Razorpay Initiated", count: stageCounts.payment_clicked, color: "bg-emerald-600", text: "text-emerald-700", highlight: true },
    { id: "utr_submitted", label: "7. Payment Verified", count: stageCounts.utr_submitted, color: "bg-emerald-500", text: "text-emerald-700", highlight: true },
  ];

  function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return "< 30s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  function formatTime(isoString: string): string {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return isoString;
    }
  }

  function getBadgeStyle(stage: FootprintStage, isPaid?: boolean) {
    if (isPaid || stage === "razorpay_payment_success" || stage === "utr_submitted") {
      return "bg-emerald-50 text-emerald-800 border-emerald-300";
    }
    if (stage === "razorpay_checkout_opened" || stage === "phonepe_intent_clicked" || stage === "upi_fallback_clicked") {
      return "bg-purple-50 text-purple-900 border-purple-300";
    }
    if (stage === "checkout_viewed") {
      return "bg-amber-50 text-amber-900 border-amber-300";
    }
    if (stage === "result_viewed") {
      return "bg-teal-50 text-teal-800 border-teal-300";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  return (
    <div className="space-y-6">
      {/* Top Header Summary Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <span>Visitor Footprints &amp; Funnel Drop-Offs</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Audit
              </span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time stage tracking showing how far prospective athletes travel into your checkout before dropping off or paying.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Auto-Sync (12s)</span>
          </label>

          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
            Updated {lastRefreshedAt.toLocaleTimeString()}
          </span>

          <button
            type="button"
            onClick={() => void fetchFootprints()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Key Performance Indicator (KPI) Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Total Visitors</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-black text-gray-950">{total}</div>
          <div className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
            <span>📱 {funnelStats?.mobilePercentage ?? 75}% Mobile</span>
            <span>·</span>
            <span>💻 {funnelStats?.desktopPercentage ?? 25}% Desktop</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Reached Checkout (₹99)</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">
            {stageCounts.checkout_viewed}
          </div>
          <div className="text-[10px] text-amber-700 font-bold">
            {total > 0 ? Math.round((stageCounts.checkout_viewed / total) * 100) : 0}% of all visitors
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#5f259f]">
            <span>PhonePe / UPI Tapped</span>
            <span className="w-4 h-4 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[9px] font-black">
              पे
            </span>
          </div>
          <div className="text-2xl font-black text-[#5f259f]">
            {stageCounts.payment_clicked}
          </div>
          <div className="text-[10px] text-purple-700 font-bold">
            {stageCounts.checkout_viewed > 0
              ? Math.round((stageCounts.payment_clicked / stageCounts.checkout_viewed) * 100)
              : 0}% click-through intent
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>UTR Paid &amp; Submitted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {stageCounts.utr_submitted}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            {stageCounts.payment_clicked > 0
              ? Math.round((stageCounts.utr_submitted / stageCounts.payment_clicked) * 100)
              : 0}% payment completion
          </div>
        </div>
      </div>

      {/* Visual Funnel Progression & Drop-Off Bar */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Stage-by-Stage Funnel Conversion &amp; Drop-Off Rate
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">
            Avg. Time on Site: <strong>{formatDuration(funnelStats?.avgTimeSpentSeconds || 190)}</strong>
          </span>
        </div>

        {/* Funnel Step Bars */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {funnelSteps.map((step, idx) => {
            const prevCount = idx === 0 ? step.count : funnelSteps[idx - 1].count;
            const dropOffCount = Math.max(0, prevCount - step.count);
            const dropOffRate = prevCount > 0 ? Math.round((dropOffCount / prevCount) * 100) : 0;
            const pctOfTotal = total > 0 ? Math.round((step.count / total) * 100) : 0;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition ${
                  step.highlight ? "border-emerald-300 bg-emerald-50/20" : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                  <span className="truncate">{step.label}</span>
                </div>

                <div className="text-lg font-black text-gray-950 mt-1">
                  {step.count}
                </div>

                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`${step.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(8, pctOfTotal))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mt-1.5">
                  <span>{pctOfTotal}%</span>
                  {idx > 0 && dropOffRate > 0 && (
                    <span className="text-rose-600 font-black">-{dropOffRate}% drop</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Users" },
            { id: "checkout", label: "Reached Checkout" },
            { id: "payment_clicked", label: "Payment Initiated" },
            { id: "utr_submitted", label: "Payment Verified" },
            { id: "dropped_checkout", label: "Dropped at Checkout" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStageFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                stageFilter === tab.id
                  ? "bg-[#032e1c] text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center rounded-xl bg-gray-100 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDeviceFilter("all")}
              className={`px-2 py-1 rounded-lg transition ${deviceFilter === "all" ? "bg-white shadow-xs text-gray-900" : "text-gray-500"}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDeviceFilter("mobile")}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${deviceFilter === "mobile" ? "bg-white shadow-xs text-gray-900" : "text-gray-500"}`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceFilter("desktop")}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${deviceFilter === "desktop" ? "bg-white shadow-xs text-gray-900" : "text-gray-500"}`}
            >
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, phone, UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Visitor Footprint Ledger Cards */}
      <div className="space-y-3">
        {filteredFootprints.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-gray-200 text-gray-500 text-xs">
            <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-bold">No visitor footprints matching this filter.</p>
            <p className="text-gray-400 mt-1">Visitors moving through your funnel will appear here in real time.</p>
          </div>
        ) : (
          filteredFootprints.map((fp) => {
            const isExpanded = expandedVisitorId === fp.visitorId;
            const displayName = fp.customerName || `Athlete (${fp.visitorId.slice(0, 10)})`;
            const phone = fp.customerPhone;
            const email = fp.customerEmail;
            const timeline = fp.timeline || [];

            return (
              <div
                key={fp.visitorId}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition shadow-xs space-y-3"
              >
                {/* Header row: User Identity + Badges + Came & Went */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-950 font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-gray-950">{displayName}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getBadgeStyle(
                            fp.highestStage,
                            fp.isPaid
                          )}`}
                        >
                          {fp.isPaid || fp.utr
                            ? `✓ Paid · UTR ${fp.utr || "Verified"}`
                            : fp.highestStageTitle || fp.highestStage}
                        </span>

                        <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {fp.device === "mobile" ? <Smartphone className="w-2.5 h-2.5" /> : <Monitor className="w-2.5 h-2.5" />}
                          <span>{fp.device === "mobile" ? "Mobile" : "Desktop"}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium mt-0.5">
                        {phone && (
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{phone}</span>
                          </span>
                        )}
                        {email && <span>{email}</span>}
                        {fp.goal && (
                          <span className="capitalize text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded font-semibold">
                            {fp.goal.replace("-", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Came and Went Timing & WhatsApp Action */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right text-[11px] text-gray-500">
                      <div>
                        First Seen: <strong>{formatTime(fp.firstSeenAt)}</strong>
                      </div>
                      <div>
                        Last Active: <strong>{formatTime(fp.lastActive)}</strong> ({formatDuration(fp.durationSeconds)})
                      </div>
                    </div>

                    {phone && (
                      <a
                        href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Namaste ${displayName}! Coach Naveen here from BMYFIT. I noticed you checked out your custom plan. Let me know if you had any questions completing your payment!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] font-black text-xs flex items-center gap-1 transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedVisitorId(isExpanded ? null : fp.visitorId)}
                      className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Footprint Trail Breadcrumbs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100 text-[11px]">
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">Trail:</span>
                  {timeline.map((event, idx) => (
                    <React.Fragment key={idx}>
                      <span
                        className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-bold text-[10px] ${
                          idx === timeline.length - 1
                            ? "bg-emerald-950 text-white shadow-2xs"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {event.title}
                      </span>
                      {idx < timeline.length - 1 && (
                        <span className="text-gray-300 font-bold shrink-0">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Expanded Detailed Step-by-Step History */}
                {isExpanded && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 mt-2">
                    <h4 className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      Chronological Footprint Trail ({timeline.length} Recorded Steps)
                    </h4>

                    <div className="space-y-2 border-l-2 border-emerald-400 pl-3 ml-2">
                      {timeline.map((event, idx) => (
                        <div key={idx} className="relative text-xs">
                          <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-900">{event.title}</span>
                            <span className="text-gray-400 font-mono text-[10px]">{formatTime(event.timestamp)}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            Path: <code>{event.path}</code>
                          </p>
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="text-[10px] text-gray-600 bg-white p-1.5 rounded-lg border border-gray-200 mt-1 space-y-0.5">
                              {Object.entries(event.metadata).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-1">
                                  <span className="font-bold text-gray-500">{k}:</span>
                                  <span className="font-mono truncate">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

