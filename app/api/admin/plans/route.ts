import { listAllDashboardPlans } from "@/lib/firestore/repositories";
import { requireAdminUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);
    const plans = await listAllDashboardPlans();
    return Response.json({ plans: plans || [] });
  } catch (error) {
    return toErrorResponse(error);
  }
}
