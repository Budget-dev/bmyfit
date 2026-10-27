import { z } from "zod";
import { updateAdminUserMedicalAssessment } from "@/features/admin/admin-data";
import { AppError, toErrorResponse } from "@/lib/errors";
import type { MedicalAssessment, MedicalDocument } from "@/types/admin";

export const runtime = "nodejs";

const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  sizeFormatted: z.string(),
  dataUrl: z.string().optional(),
  uploadedAt: z.string(),
  category: z.enum(["blood_test", "prescription", "scans", "other"]).optional(),
});

const consultationSchema = z.object({
  assessmentId: z.string().min(1),
  userId: z.string().optional(),
  hasDisease: z.boolean(),
  diseases: z.array(z.string()),
  customDiseaseDescription: z.string().optional(),
  medications: z.string().optional(),
  documents: z.array(documentSchema),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "Malformed JSON payload", 400);
    }

    const input = consultationSchema.parse(body);

    const medical: MedicalAssessment = {
      hasDisease: input.hasDisease,
      diseases: input.diseases,
      customDiseaseDescription: input.customDiseaseDescription,
      medications: input.medications,
      documents: input.documents as MedicalDocument[],
      submittedAt: new Date().toISOString(),
    };

    const targetId = input.userId || input.assessmentId;
    const updated = await updateAdminUserMedicalAssessment(targetId, medical);

    return Response.json({
      success: true,
      message: "Medical consultation and documents registered successfully",
      assessmentId: input.assessmentId,
      userFound: !!updated,
      medical,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
