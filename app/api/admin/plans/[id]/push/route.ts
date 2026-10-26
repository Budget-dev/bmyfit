import { pushPlanToUserDashboard } from "@/features/admin/admin-data";
import { AppError, toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) throw new AppError("INVALID_REQUEST", "Plan ID is required", 400);

    let body: { coachName?: string; notes?: string } = {};
    try {
      body = await request.json();
    } catch {
      // optional payload
    }

    const result = await pushPlanToUserDashboard(
      id,
      body.coachName || "Coach Naveen (Blaze Gym Owner & Head Coach)",
      body.notes
    );

    return Response.json({
      success: true,
      message: `Plan ${id} successfully pushed to client dashboard!`,
      plan: result.pushedPlan,
      user: result.user,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
