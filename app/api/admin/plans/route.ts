import { listAllDashboardPlans } from "@/lib/firestore/repositories";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    const plans = await listAllDashboardPlans();
    return Response.json({ plans: plans || [] });
  } catch (error) {
    return toErrorResponse(error);
  }
}
