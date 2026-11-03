import { promoteAdminUserToPaid } from "@/features/admin/admin-data";
import { requireAdminUser } from "@/lib/firebase/auth";
import { AppError, toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(request);
    const { id } = await params;
    if (!id) throw new AppError("INVALID_REQUEST", "User ID is required", 400);

    let body: {
      paymentMethod?: "cash" | "upi" | "upi_manual" | "razorpay";
      transactionId?: string;
      notes?: string;
      amountPaise?: number;
    } = {};
    try {
      body = await request.json();
    } catch {}

    const updatedUser = await promoteAdminUserToPaid(id, body);
    return Response.json({ success: true, user: updatedUser });
  } catch (error) {
    return toErrorResponse(error);
  }
}

