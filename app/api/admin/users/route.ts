import { fetchAllAdminUsers } from "@/features/admin/admin-data";
import { requireAdminUser } from "@/lib/firebase/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);
    const { users, stats } = await fetchAllAdminUsers();
    return Response.json({ users, stats });
  } catch (error) {
    return toErrorResponse(error);
  }
}
