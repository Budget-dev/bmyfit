import { auth } from "@/lib/firebase/client";

/**
 * Authorized admin fetch helper.
 * Automatically injects Firebase ID token and Coach Admin credentials
 * to pass server-side admin authentication and authorization guards.
 */
export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  let idToken = "";
  try {
    if (auth?.currentUser) {
      idToken = await auth.currentUser.getIdToken();
    }
  } catch (e) {
    console.warn("Could not retrieve current admin ID token:", e);
  }

  const headers = new Headers(init.headers || {});
  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  }
  headers.set("x-admin-email", "bmyfitnesscoach@gmail.com");
  headers.set("x-admin-key", "bmyfit_coach_secret_naveen_2026");

  return fetch(url, {
    ...init,
    headers,
  });
}
