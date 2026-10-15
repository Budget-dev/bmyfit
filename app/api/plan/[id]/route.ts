import { requireUser } from "@/lib/firebase/auth";
import { getPaidPlanForUser } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    enforceRateLimit(requestKey(request, "plan-read", user.uid), 30);
    const { id } = await params;
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new AppError("NOT_FOUND", "Plan not found", 404);
    const plan = await getPaidPlanForUser(user.uid, id);
    return Response.json({ plan });
  } catch (error) {
    return toErrorResponse(error);
  }
}
