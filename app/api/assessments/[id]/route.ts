import { getAssessment, getAssessmentById } from "@/lib/firestore/repositories";
import { optionalUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await optionalUser();
    const { id } = await params;

    if (!id || id === "local" || id === "demo") {
      return Response.json({ assessment: null });
    }

    // Always attempt direct ID retrieval first (covers anonymous and guest assessments)
    let assessment = await getAssessmentById(id);
    if (assessment && assessment.uid === "guest_user") {
      if (user) {
        const userAssessment = await getAssessment(user.uid, id);
        if (userAssessment) return Response.json({ assessment: userAssessment });
      }
      return Response.json({ assessment: null });
    }

    if (!assessment && user) {
      assessment = await getAssessment(user.uid, id);
    }
    return Response.json({ assessment: assessment || null });
  } catch (error) {
    return toErrorResponse(error);
  }
}
