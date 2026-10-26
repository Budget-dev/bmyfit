import { getDashboardPlanById, updateDashboardPlanStatus, storeDashboardPlan } from "@/lib/firestore/repositories";
import { generateDashboardPlan } from "@/features/plan/dashboard-data";
import { fetchAdminUserById, updateAdminUserPlan } from "@/features/admin/admin-data";
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

    // 1. Try checking in admin user store
    const adminUser = await fetchAdminUserById(id);
    if (adminUser?.plan) {
      return Response.json({ plan: adminUser.plan, user: adminUser });
    }

    // 2. Try Firestore
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

    const body = (await request.json()) as PlanDashboardData & { status?: PlanStatus };
    const status: PlanStatus = body.status || "approved";

    // Update in Admin Data Store
    if (body.weeks) {
      await updateAdminUserPlan(id, { ...body, status });
    }

    // Update in Firestore
    await updateDashboardPlanStatus(id, status, body);

    return Response.json({ success: true, id, status, plan: body });
  } catch (error) {
    return toErrorResponse(error);
  }
}
