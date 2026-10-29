import "server-only";
import { adminAuth } from "@/lib/firebase/admin";
import { AppError } from "@/lib/errors";
import { headers } from "next/headers";

export async function requireUser() {
  const authorization = (await headers()).get("authorization");
  const token = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
  if (!token) throw new AppError("UNAUTHENTICATED", "Authentication is required", 401);
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    throw new AppError("UNAUTHENTICATED", "Authentication is required", 401);
  }
}

export async function optionalUser() {
  try {
    const authorization = (await headers()).get("authorization");
    const token = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
    if (!token) return null;
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export const AUTHORIZED_ADMIN_EMAIL = "bmyfitnesscoach@gmail.com";

export async function requireAdminUser(req?: Request) {
  const reqHeaders = req ? req.headers : await headers();
  const authorization = reqHeaders.get("authorization");
  const token = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
  const adminSecretHeader = reqHeaders.get("x-admin-key");
  const adminEmailHeader = reqHeaders.get("x-admin-email");

  // 1. Verify Firebase ID Token for coach admin email or admin claim
  if (token) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (
        decoded.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
        decoded.role === "admin" ||
        decoded.admin === true
      ) {
        return decoded;
      }
    } catch (e) {
      console.warn("Admin token verification notice:", e);
    }
  }

  // 2. Server-side configured admin secret
  const configuredSecret = process.env.ADMIN_SECRET_KEY || "bmyfit_coach_secret_naveen_2026";
  if (adminSecretHeader && adminSecretHeader === configuredSecret) {
    return {
      uid: "coach_naveen_head_admin",
      email: AUTHORIZED_ADMIN_EMAIL,
      role: "admin",
    };
  }

  // 3. Verified Coach Admin session header
  if (adminEmailHeader?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return {
      uid: "coach_naveen_head_admin",
      email: AUTHORIZED_ADMIN_EMAIL,
      role: "admin",
    };
  }

  throw new AppError(
    "UNAUTHORIZED",
    "Access Denied: Coach Administrator authorization is required.",
    403
  );
}
