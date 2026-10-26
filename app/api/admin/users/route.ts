import { fetchAllAdminUsers } from "@/features/admin/admin-data";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { users, stats } = await fetchAllAdminUsers();
    return Response.json({ users, stats });
  } catch (error) {
    return toErrorResponse(error);
  }
}
