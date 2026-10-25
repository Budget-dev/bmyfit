import { getDashboardPlanById, updateDashboardPlanStatus, storeDashboardPlan } from "@/lib/firestore/repositories";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { AppError, toErrorResponse } from "@/lib/errors";
import type { PlanStatus, PlanDashboardData } from "@/types/plan-dashboard";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) throw new AppError("INVALID_REQUEST", "Plan ID is required", 400);

    let plan = await getDashboardPlanById(id);

    if (!plan) {
      // Fallback generator for demo or newly created assessment
      plan = generateDashboardPlan(id, {
        customerName: "Client " + id.slice(0, 6),
        status: "pending_review",
        weeksCount: 8,
      });
      await storeDashboardPlan("system", id, plan);
    }

    return Response.json({ plan });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) throw new AppError("INVALID_REQUEST", "Plan ID is required", 400);

    const body = (await request.json()) as Partial<PlanDashboardData> & { status?: PlanStatus };
    const status: PlanStatus = body.status || "approved";

    await updateDashboardPlanStatus(id, status, body);

    return Response.json({ success: true, id, status });
  } catch (error) {
    return toErrorResponse(error);
  }
}
