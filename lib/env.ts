/**
 * Backwards-compatible public configuration export. Server credentials live in
 * `lib/env/server.ts` and must never be imported by a client module.
 */
export { publicEnv as env } from "@/lib/env/public";
