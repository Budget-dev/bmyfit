import { assessmentSchema } from "@/lib/validation/assessment";
import { calculateAssessment } from "@/lib/assessment/plan";
import { requireUser } from "@/lib/firebase/auth";
import { createAssessment } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    enforceRateLimit(requestKey(request, "assessment", user.uid), 10);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "The request payload is invalid", 400);
    }
    const input = assessmentSchema.parse(body);
    const assessmentId = await createAssessment(user.uid, input, calculateAssessment(input));
    return Response.json({ assessmentId }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
