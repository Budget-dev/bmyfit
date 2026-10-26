"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import type { UserProfile, SignupData, SigninData } from "@/types/auth";
import { publicEnv } from "@/lib/env/public";

const STORAGE_KEY = "bmyfit_user_profile";
const DETAILS_STORAGE_KEY = "bmyfit_draft_details_v1";
const LOCAL_ASSESSMENT_KEY = "bmyfit_local_assessment";

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(profile);
    localStorage.setItem(STORAGE_KEY, json);
    sessionStorage.setItem(STORAGE_KEY, json);

    // Sync age into draft assessment details
    try {
      const rawDetails = sessionStorage.getItem(DETAILS_STORAGE_KEY);
      const details = rawDetails ? JSON.parse(rawDetails) : {};
      details.age = profile.age || details.age || 28;
      sessionStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
    } catch {}

    // Sync name, email, phone into local assessment for checkout & coach connection
    try {
      const rawAss = sessionStorage.getItem(LOCAL_ASSESSMENT_KEY);
      const ass = rawAss ? JSON.parse(rawAss) : {};
      ass.name = profile.name;
      ass.email = profile.email;
      ass.phone = profile.phone;
      sessionStorage.setItem(LOCAL_ASSESSMENT_KEY, JSON.stringify(ass));
    } catch {}
  } catch {
    // Ignore storage quota
  }
}

export function clearStoredProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Sync user profile to backend Firestore / Admin directory
 */
export async function syncProfileToServer(profile: UserProfile, idToken?: string | null): Promise<void> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

    await fetch("/api/auth/profile", {
      method: "POST",
      headers,
      body: JSON.stringify(profile),
    });
  } catch (err) {
    console.warn("Failed to sync profile to server:", err);
  }
}

/**
 * Direct Google Login via Firebase Auth Popup
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const cred = await signInWithPopup(auth, provider);
    const fbUser = cred.user;

    const existing = getStoredProfile();
    const profile: UserProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || existing?.name || "BMYFIT Athlete",
      email: fbUser.email || existing?.email || "",
      phone: fbUser.phoneNumber || existing?.phone || "",
      age: existing?.age || 28,
      avatarUrl: fbUser.photoURL || undefined,
      provider: "google",
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredProfile(profile);
    const token = await fbUser.getIdToken().catch(() => null);
    await syncProfileToServer(profile, token);

    return profile;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    // If API key is dummy or not configured in development, provide graceful dev sandbox fallback
    const isDevKey = !publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");
    if (isDevKey || error.code === "auth/api-key-not-valid" || error.code === "auth/configuration-not-found") {
      console.warn("Firebase Google login bypassed for local development sandbox mode.");
      const demoProfile: UserProfile = {
        uid: "google_dev_demo_" + Math.random().toString(36).substring(2, 9),
        name: "Devendra Verma (Google)",
        email: "devendra.google@bmyfit.in",
        phone: "+91 98201 44821",
        age: 29,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        provider: "google",
        createdAt: new Date().toISOString(),
      };
      saveStoredProfile(demoProfile);
      await syncProfileToServer(demoProfile);
      return demoProfile;
    }
    throw err;
  }
}

/**
 * Email & Password Login
 */
export async function loginWithEmail(data: SigninData): Promise<UserProfile> {
  const { email, password } = data;
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = cred.user;

    const existing = getStoredProfile();
    const profile: UserProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || existing?.name || email.split("@")[0],
      email: fbUser.email || email.trim(),
      phone: existing?.phone || "+91 98000 00000",
      age: existing?.age || 28,
      avatarUrl: fbUser.photoURL || undefined,
      provider: "password",
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredProfile(profile);
    const token = await fbUser.getIdToken().catch(() => null);
    await syncProfileToServer(profile, token);

    return profile;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    const isDevKey = !publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");
    if (isDevKey || error.code === "auth/api-key-not-valid" || error.code === "auth/configuration-not-found") {
      console.warn("Firebase email login bypassed for local development sandbox mode.");
      const existing = getStoredProfile();
      const demoProfile: UserProfile = {
        uid: "usr_dev_" + Math.random().toString(36).substring(2, 9),
        name: existing?.name || email.split("@")[0],
        email: email.trim(),
        phone: existing?.phone || "+91 98201 44821",
        age: existing?.age || 28,
        provider: "password",
        createdAt: new Date().toISOString(),
      };
      saveStoredProfile(demoProfile);
      await syncProfileToServer(demoProfile);
      return demoProfile;
    }
    throw err;
  }
}

/**
 * Sign Up with Full Name, Email, Password, Phone Number, and Age
 */
export async function signupWithEmail(data: SignupData): Promise<UserProfile> {
  const { name, email, password, phone, age } = data;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = cred.user;

    // Update display name in Firebase Auth
    await updateProfile(fbUser, { displayName: name.trim() });

    const profile: UserProfile = {
      uid: fbUser.uid,
      name: name.trim(),
      email: fbUser.email || email.trim(),
      phone: phone.trim(),
      age: Number(age),
      provider: "password",
      createdAt: new Date().toISOString(),
    };

    saveStoredProfile(profile);
    const token = await fbUser.getIdToken().catch(() => null);
    await syncProfileToServer(profile, token);

    return profile;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    const isDevKey = !publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");
    if (isDevKey || error.code === "auth/api-key-not-valid" || error.code === "auth/configuration-not-found") {
      console.warn("Firebase signup bypassed for local development sandbox mode.");
      const demoProfile: UserProfile = {
        uid: "usr_signup_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        age: Number(age),
        provider: "password",
        createdAt: new Date().toISOString(),
      };
      saveStoredProfile(demoProfile);
      await syncProfileToServer(demoProfile);
      return demoProfile;
    }
    throw err;
  }
}

/**
 * Log Out
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Ignore sign out error if offline
  } finally {
    clearStoredProfile();
  }
}

/**
 * Reset Password Email
 */
export async function sendResetEmail(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: unknown) {
    const error = err as { code?: string };
    const isDevKey = !publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");
    if (isDevKey || error.code === "auth/api-key-not-valid") {
      // In dev sandbox, simulate success
      return;
    }
    throw err;
  }
}

/**
 * Dev Sandbox One-Click Instant Sign-In
 */
export async function loginDevSandbox(preset: "new_client" | "member" = "new_client"): Promise<UserProfile> {
  const profile: UserProfile =
    preset === "new_client"
      ? {
          uid: "demo_user_" + Math.random().toString(36).substring(2, 8),
          name: "Aryan Sharma",
          email: "aryan.sharma@bmyfit.in",
          phone: "+91 98201 44821",
          age: 26,
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          provider: "demo",
          createdAt: new Date().toISOString(),
        }
      : {
          uid: "demo_member_" + Math.random().toString(36).substring(2, 8),
          name: "Simran Kaur",
          email: "simran.kaur@bmyfit.in",
          phone: "+91 98881 23456",
          age: 29,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          provider: "demo",
          createdAt: new Date().toISOString(),
        };

  saveStoredProfile(profile);
  await syncProfileToServer(profile);
  return profile;
}
