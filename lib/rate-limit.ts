import "server-only";
import { AppError } from "@/lib/errors";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** A small process-local limiter suitable for a single Next.js instance. */
export function enforceRateLimit(key: string, limit = 30, windowMs = 60_000): void {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5_000) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
    }
    return;
  }
  if (current.count >= limit) {
    throw new AppError("RATE_LIMITED", "Too many requests", 429);
  }
  current.count += 1;
}

export function requestKey(request: Request, scope: string, userId?: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${userId ?? address}`;
}
