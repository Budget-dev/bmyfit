import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { STAGE_RANK, type FootprintStage, type VisitorFootprintRecord } from "@/lib/telemetry/footprints";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// In-memory fallback cache for development or when Firebase credentials are not provided
declare global {
  var __bmyfit_visitor_footprints__: Map<string, VisitorFootprintRecord> | undefined;
}

if (!globalThis.__bmyfit_visitor_footprints__) {
  globalThis.__bmyfit_visitor_footprints__ = new Map<string, VisitorFootprintRecord>();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      visitorId,
      stage,
      stageTitle,
      path,
      device = "mobile",
      userAgent = "",
      referrer = "",
      metadata = {},
      timestamp = new Date().toISOString(),
    } = body;

    if (!visitorId || !stage) {
      return Response.json({ success: false, error: "Missing visitorId or stage" }, { status: 400 });
    }

    const event = {
      stage: stage as FootprintStage,
      title: stageTitle || stage,
      path: path || "/",
      timestamp,
      metadata: metadata || {},
    };

    // 1. In-Memory Store Update (Instantaneous & Resilient)
    const store = globalThis.__bmyfit_visitor_footprints__!;
    const existing = store.get(visitorId);

    const nowIso = timestamp;
    const firstSeen = existing ? existing.firstSeenAt : nowIso;
    const durationSeconds = Math.max(
      0,
      Math.round((new Date(nowIso).getTime() - new Date(firstSeen).getTime()) / 1000)
    );

    // Calculate highest stage achieved
    let highestStage = (existing ? existing.highestStage : stage) as FootprintStage;
    let highestStageTitle = existing ? existing.highestStageTitle : stageTitle || stage;

    const currentRank = STAGE_RANK[stage as FootprintStage] || 0;
    const previousRank = STAGE_RANK[highestStage] || 0;

    if (currentRank >= previousRank) {
      highestStage = stage as FootprintStage;
      highestStageTitle = stageTitle || stage;
    }

    const customerName = metadata.customerName || existing?.customerName || null;
    const customerPhone = metadata.customerPhone || existing?.customerPhone || null;
    const customerEmail = metadata.customerEmail || existing?.customerEmail || null;
    const goal = metadata.goal || existing?.goal || null;
    const utr = metadata.utr || metadata.upiTransactionId || existing?.utr || null;
    const orderId = metadata.orderId || existing?.orderId || null;
    const isPaid = stage === "utr_submitted" || !!utr || existing?.isPaid || false;

    const updatedTimeline = existing ? [...existing.timeline, event] : [event];

    const footprintRecord: VisitorFootprintRecord = {
      visitorId,
      userId: metadata.userId || existing?.userId || null,
      customerName,
      customerPhone,
      customerEmail,
      goal,
      highestStage,
      highestStageTitle,
      firstSeenAt: firstSeen,
      lastActive: nowIso,
      durationSeconds,
      device: (device as "mobile" | "desktop") || "mobile",
      userAgent: userAgent || existing?.userAgent || "",
      referrer: referrer || existing?.referrer || "",
      isPaid,
      utr,
      orderId,
      timeline: updatedTimeline.slice(-30), // keep latest 30 actions
    };

    store.set(visitorId, footprintRecord);

    // 2. Persist to Firestore if Admin Credentials are operational
    if (hasAdminCredentials) {
      try {
        const docRef = adminDb.collection("visitor_footprints").doc(visitorId);
        await docRef.set(
          {
            visitorId,
            userId: footprintRecord.userId,
            customerName: footprintRecord.customerName,
            customerPhone: footprintRecord.customerPhone,
            customerEmail: footprintRecord.customerEmail,
            goal: footprintRecord.goal,
            highestStage: footprintRecord.highestStage,
            highestStageTitle: footprintRecord.highestStageTitle,
            firstSeenAt: footprintRecord.firstSeenAt,
            lastActive: footprintRecord.lastActive,
            durationSeconds: footprintRecord.durationSeconds,
            device: footprintRecord.device,
            userAgent: footprintRecord.userAgent,
            referrer: footprintRecord.referrer,
            isPaid: footprintRecord.isPaid,
            utr: footprintRecord.utr,
            orderId: footprintRecord.orderId,
            timeline: FieldValue.arrayUnion(event),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn("[Footprint Telemetry DB Notice]", dbErr);
      }
    }

    return Response.json({ success: true, visitorId, stage: highestStage });
  } catch (error: unknown) {
    console.error("[Footprint Telemetry API Error]", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

