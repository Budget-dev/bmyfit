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
