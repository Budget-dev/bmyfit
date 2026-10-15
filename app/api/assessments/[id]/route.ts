import { getAssessment } from "@/lib/firestore/repositories";
import { requireUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const assessment = await getAssessment(user.uid, (await params).id);
    return Response.json({ assessment });
  } catch (error) {
    return toErrorResponse(error);
  }
}
