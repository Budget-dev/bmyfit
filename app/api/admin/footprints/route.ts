import { requireAdminUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);
    return Response.json({
      footprints: [],
      totalVisitors: 0,
      stageCounts: {},
      conversionRates: {},
      dropOffCounts: {},
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
