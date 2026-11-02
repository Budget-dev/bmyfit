import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { AppError, toErrorResponse } from "@/lib/errors";
import { fetchAdminUserById } from "@/features/admin/admin-data";
import type { DailyCheckInLog } from "@/types/plan-dashboard";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !/^[A-Za-z0-9_-]{1,200}$/.test(id)) {
      throw new AppError("INVALID_REQUEST", "Invalid plan id", 400);
    }

    const body = (await request.json()) as Partial<DailyCheckInLog>;
    const dateKey = body.date || new Date().toISOString().split("T")[0];

    const dailyLog: DailyCheckInLog = {
      id: dateKey,
      date: dateKey,
      timestamp: new Date().toISOString(),
      workoutCompleted: !!body.workoutCompleted,
      workoutDayTitle: body.workoutDayTitle || "Today's Workout",
      workoutNotes: body.workoutNotes || "",
      dietAdherence: body.dietAdherence || "100% on track",
      caloriesActual: body.caloriesActual,
      proteinGramsActual: body.proteinGramsActual,
      waterLitres: body.waterLitres ?? 3.0,
      stepsCompleted: body.stepsCompleted ?? 8000,
      supplementsTaken: body.supplementsTaken ?? true,
      energyLevel: body.energyLevel || "High",
      clientNote: body.clientNote || "",
      coachFeedback: body.coachFeedback || "",
    };

    // 1. Update in-memory user record if available
    const adminUser = await fetchAdminUserById(id);
    if (adminUser) {
      if (!adminUser.dailyLogs) adminUser.dailyLogs = {};
      adminUser.dailyLogs[dateKey] = dailyLog;
      if (adminUser.plan) {
        if (!adminUser.plan.dailyLogs) adminUser.plan.dailyLogs = {};
        adminUser.plan.dailyLogs[dateKey] = dailyLog;
      }
    }

    // 2. Persist to Firestore
    if (hasAdminCredentials) {
      try {
        const logRef = adminDb.collection("daily_checkins").doc(id);
        await logRef.set(
          {
            [dateKey]: dailyLog,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Also merge into user_logs doc
        const userLogsRef = adminDb.collection("user_logs").doc(id);
        await userLogsRef.set(
          {
            dailyLogs: {
              [dateKey]: dailyLog,
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Also merge directly into plans collection
        await adminDb.collection("plans").doc(id).set(
          {
            dailyLogs: {
              [dateKey]: dailyLog,
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Also merge into users collection
        await adminDb.collection("users").doc(id).set(
          {
            dailyLogs: {
              [dateKey]: dailyLog,
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Firestore daily_checkin save notice:", err);
      }
    }

    return Response.json({
      success: true,
      dailyLog,
      message: "Daily plan log saved successfully!",
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) throw new AppError("INVALID_REQUEST", "Invalid plan id", 400);

    const adminUser = await fetchAdminUserById(id);
    let dailyLogs: Record<string, DailyCheckInLog> = adminUser?.dailyLogs || adminUser?.plan?.dailyLogs || {};

    if (Object.keys(dailyLogs).length === 0 && hasAdminCredentials) {
      try {
        const docSnap = await adminDb.collection("daily_checkins").doc(id).get();
        if (docSnap.exists) {
          const data = docSnap.data() as Record<string, unknown>;
          const logs = { ...data };
          delete logs.updatedAt;
          dailyLogs = logs as Record<string, DailyCheckInLog>;
        }
      } catch (err) {
        console.warn("Firestore daily_checkin fetch error:", err);
      }
    }

    return Response.json({
      success: true,
      dailyLogs,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
