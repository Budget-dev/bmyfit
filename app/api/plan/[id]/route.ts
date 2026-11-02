import { optionalUser } from "@/lib/firebase/auth";
import { getPaidPlanForUser, getDashboardPlanById, storeDashboardPlan } from "@/lib/firestore/repositories";
import { fetchAdminUserById } from "@/features/admin/admin-data";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await optionalUser();
    const { id } = await params;
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new AppError("NOT_FOUND", "Plan not found", 404);

    if (user) {
      enforceRateLimit(requestKey(request, "plan-read", user.uid), 60);
    }

    // 1. Check if an admin-customized plan exists for this id
    const adminUser = await fetchAdminUserById(id);
    if (adminUser?.plan) {
      return Response.json({ dashboardPlan: adminUser.plan, isSubscribed: true });
    }

    // 2. Check Firestore direct dashboard plan
    let dashboardPlan = await getDashboardPlanById(id);
    if (dashboardPlan) {
      return Response.json({ dashboardPlan, isSubscribed: true });
    }

    // 3. If user is authenticated, check their paid plan
    if (user) {
      try {
        const plan = await getPaidPlanForUser(user.uid, id);
        if (plan) {
          dashboardPlan = generateDashboardPlan(id, {
            status: "approved",
            goal: plan.snapshot.goal,
            calorieTarget: plan.snapshot.calories,
            proteinTargetGrams: plan.snapshot.macros.proteinGrams,
            bmi: plan.snapshot.bmi,
            bodyFatPercent: plan.snapshot.bodyFatPercent ?? undefined,
            weeksCount: 8,
          });
          await storeDashboardPlan(user.uid, id, dashboardPlan);
          return Response.json({ plan, dashboardPlan, isSubscribed: true });
        }
      } catch {
        // Continue to access check
      }
    }

    // 4. Strict gate: Unsubscribed or unpaid users must not receive the week plan
    return Response.json(
      {
        dashboardPlan: null,
        isSubscribed: false,
        error: "Week plan access is reserved exclusively for ₹99 subscribed members.",
        code: "PAYMENT_REQUIRED",
      },
      { status: 402 }
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
