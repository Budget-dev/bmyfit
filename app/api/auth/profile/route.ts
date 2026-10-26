import { NextResponse } from "next/server";
import { registerOrUpdateAuthUser } from "@/features/admin/admin-data";
import { optionalUser } from "@/lib/firebase/auth";
import type { UserProfile } from "@/types/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<UserProfile>;
    const tokenUser = await optionalUser();

    const uid = body.uid || tokenUser?.uid || `usr_${Date.now()}`;
    const name = body.name?.trim() || tokenUser?.name || "BMYFIT User";
    const email = body.email?.trim() || tokenUser?.email || "user@bmyfit.in";
    const phone = body.phone?.trim();
    const age = body.age ? Number(body.age) : undefined;
    const avatarUrl = body.avatarUrl || tokenUser?.picture;

    const record = await registerOrUpdateAuthUser({
      id: uid,
      name,
      email,
      phone,
      age,
      avatarUrl,
    });

    return NextResponse.json({
      success: true,
      profile: {
        uid: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        age: record.biometrics?.age,
        avatarUrl: record.avatar,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/profile:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_SYNC_ERROR",
          message: error instanceof Error ? error.message : "Failed to sync profile",
        },
      },
      { status: 500 }
    );
  }
}
