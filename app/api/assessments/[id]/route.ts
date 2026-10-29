import { getAssessment, getAssessmentById } from "@/lib/firestore/repositories";
import { optionalUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await optionalUser();
    const { id } = await params;
    // Always attempt direct ID retrieval first (covers anonymous and guest assessments)
    let assessment = await getAssessmentById(id);
    if (!assessment && user) {
      assessment = await getAssessment(user.uid, id);
    }
    return Response.json({ assessment });
  } catch (error) {
    return toErrorResponse(error);
  }
}
