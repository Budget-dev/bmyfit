import { requireUser } from "@/lib/firebase/auth";
import { getPaidPlanForUser, getDashboardPlanById, storeDashboardPlan } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    enforceRateLimit(requestKey(request, "plan-read", user.uid), 30);
    const { id } = await params;
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new AppError("NOT_FOUND", "Plan not found", 404);
    
    let dashboardPlan = await getDashboardPlanById(id);
    const plan = await getPaidPlanForUser(user.uid, id);

    if (!dashboardPlan && plan) {
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
    }

    return Response.json({ plan, dashboardPlan });
  } catch (error) {
    return toErrorResponse(error);
  }
}

