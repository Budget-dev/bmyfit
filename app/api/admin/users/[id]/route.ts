import { fetchAdminUserById } from "@/features/admin/admin-data";
import { requireAdminUser } from "@/lib/firebase/auth";
import { AppError, toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(request);
    const { id } = await params;
    if (!id) throw new AppError("INVALID_REQUEST", "User ID is required", 400);

    const user = await fetchAdminUserById(id);
    if (!user) throw new AppError("NOT_FOUND", "User not found", 404);

    return Response.json({ user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
