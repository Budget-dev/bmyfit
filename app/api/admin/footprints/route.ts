import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";
import type { VisitorFootprintRecord } from "@/lib/telemetry/footprints";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);

    const footprints: VisitorFootprintRecord[] = [];

    // 1. Fetch from Firestore if credentials exist
    if (hasAdminCredentials) {
      try {
        const snap = await adminDb
          .collection("visitor_footprints")
          .orderBy("lastActive", "desc")
          .limit(100)
          .get();

        snap.forEach((doc) => {
          footprints.push(doc.data() as VisitorFootprintRecord);
        });
      } catch (err) {
        console.warn("[Admin Footprints Fetch Notice]", err);
      }
    }

    // 2. Merge with In-Memory store
    if (globalThis.__bmyfit_visitor_footprints__) {
      for (const [vid, record] of globalThis.__bmyfit_visitor_footprints__.entries()) {
        const idx = footprints.findIndex((f) => f.visitorId === vid);
        if (idx >= 0) {
          if (new Date(record.lastActive).getTime() > new Date(footprints[idx].lastActive).getTime()) {
            footprints[idx] = record;
          }
        } else {
          footprints.push(record);
        }
      }
    }

    // Sort by last active desc
    footprints.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

    // 3. Compute Funnel Conversion & Drop-Off Aggregation
    const stageCounts: Record<string, number> = {
      landing: 0,
      goal_selected: 0,
      details_entered: 0,
      calculating_viewed: 0,
      result_viewed: 0,
      checkout_viewed: 0,
      payment_clicked: 0,
      utr_submitted: 0,
      medical_submitted: 0,
    };

    let mobileCount = 0;
    let desktopCount = 0;
    let totalDurationSeconds = 0;

    footprints.forEach((fp) => {
      if (fp.device === "mobile") mobileCount++;
      else desktopCount++;

      totalDurationSeconds += fp.durationSeconds || 0;

      // Check all stages this user traversed in their timeline
      const traversedStages = new Set<string>();
      (fp.timeline || []).forEach((e) => traversedStages.add(e.stage));
      traversedStages.add(fp.highestStage);

      if (traversedStages.has("landing")) stageCounts.landing++;
      if (traversedStages.has("goal_selected")) stageCounts.goal_selected++;
      if (traversedStages.has("details_entered")) stageCounts.details_entered++;
      if (traversedStages.has("calculating_viewed")) stageCounts.calculating_viewed++;
      if (traversedStages.has("result_viewed")) stageCounts.result_viewed++;
      if (traversedStages.has("checkout_viewed")) stageCounts.checkout_viewed++;
      if (
        traversedStages.has("razorpay_checkout_opened") ||
        traversedStages.has("phonepe_intent_clicked") ||
        traversedStages.has("upi_fallback_clicked") ||
        traversedStages.has("payment_method_selected")
      ) {
        stageCounts.payment_clicked++;
      }
      if (
        traversedStages.has("razorpay_payment_success") ||
        traversedStages.has("utr_submitted") ||
        fp.utr ||
        fp.isPaid
      ) {
        stageCounts.utr_submitted++;
      }
      if (traversedStages.has("medical_submitted")) {
        stageCounts.medical_submitted++;
      }
    });

    const totalVisitors = footprints.length;
    const checkoutViewers = stageCounts.checkout_viewed;
    const paymentClickers = stageCounts.payment_clicked;
    const utrSubmissions = stageCounts.utr_submitted;

    const funnelStats = {
      totalVisitors,
      stageCounts,
      mobilePercentage: totalVisitors > 0 ? Math.round((mobileCount / totalVisitors) * 100) : 0,
      desktopPercentage: totalVisitors > 0 ? Math.round((desktopCount / totalVisitors) * 100) : 0,
      avgTimeSpentSeconds: totalVisitors > 0 ? Math.round(totalDurationSeconds / totalVisitors) : 0,
      dropOffAtCheckoutPercentage:
        checkoutViewers > 0
          ? Math.round(((checkoutViewers - paymentClickers) / checkoutViewers) * 100)
          : 0,
      checkoutToPaymentConversion:
        checkoutViewers > 0 ? Math.round((paymentClickers / checkoutViewers) * 100) : 0,
      paymentToUtrConversion:
        paymentClickers > 0 ? Math.round((utrSubmissions / paymentClickers) * 100) : 0,
    };

    // 4. Also fetch recent orders for cross-reference
    let recentOrders: Record<string, unknown>[] = [];
    if (hasAdminCredentials) {
      try {
        const orderSnap = await adminDb
          .collection("orders")
          .orderBy("createdAt", "desc")
          .limit(20)
          .get();

        recentOrders = orderSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (orderErr) {
        console.warn("[Admin Orders Fetch Notice]", orderErr);
      }
    }

    return Response.json({
      success: true,
      footprints,
      funnelStats,
      recentOrders,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

