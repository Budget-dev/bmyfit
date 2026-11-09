import { assessmentSchema } from "@/lib/validation/assessment";
import { calculateAssessment } from "@/lib/assessment/plan";
import { optionalUser } from "@/lib/firebase/auth";
import { createAssessment } from "@/lib/firestore/repositories";
import { AppError, toErrorResponse } from "@/lib/errors";
import { enforceRateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await optionalUser();
    const uid = user?.uid || `guest_${Date.now().toString(36)}`;
    enforceRateLimit(requestKey(request, "assessment", uid), 20);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "The request payload is invalid", 400);
    }
    let preferredId: string | undefined;
    if (typeof body === "object" && body !== null && "id" in body && typeof (body as { id?: unknown }).id === "string") {
      preferredId = (body as { id: string }).id;
    }
    const input = assessmentSchema.parse(body);
    const assessmentId = await createAssessment(uid, input, calculateAssessment(input), preferredId);
    return Response.json({ assessmentId }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
