"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db, doc, setDoc, getDoc } from "@/lib/firebase/client";
import type { UserProfile, SignupData, SigninData } from "@/types/auth";

const DETAILS_STORAGE_KEY = "bmyfit_draft_details_v1";
const LOCAL_ASSESSMENT_KEY = "bmyfit_local_assessment";
const AUTH_PROFILE_KEY = "bmyfit_auth_profile";

// In-memory runtime profile with sessionStorage persistence for client sessions
let inMemoryProfile: UserProfile | null = null;

export function getStoredProfile(): UserProfile | null {
  if (inMemoryProfile) return inMemoryProfile;
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(AUTH_PROFILE_KEY);
      if (raw) {
        inMemoryProfile = JSON.parse(raw);
        return inMemoryProfile;
      }
    } catch {}
  }
  return null;
}

export function saveStoredProfile(profile: UserProfile): void {
  inMemoryProfile = profile;

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }

  // Persist directly to Firebase Firestore
  if (typeof window !== "undefined" && profile.uid) {
    try {
      const userRef = doc(db, "users", profile.uid);
      const isCoach = profile.email?.toLowerCase() === "bmyfitnesscoach@gmail.com";
      const payload: Record<string, unknown> = {
        id: profile.uid,
        uid: profile.uid,
        name: profile.name || (isCoach ? "Coach Naveen" : "BMYFIT Member"),
        email: profile.email || "",
        phone: profile.phone || "+91 98000 00000",
        age: typeof profile.age === "number" && !isNaN(profile.age) ? profile.age : 26,
        provider: profile.provider || "password",
        role: isCoach ? "admin" : (profile.role || "user"),
        membershipCategory: isCoach ? "membership" : "free",
        updatedAt: new Date().toISOString(),
      };
      if (profile.avatarUrl) {
        payload.avatarUrl = profile.avatarUrl;
      }

      // Check for locally calculated assessment biometrics and link to user
      try {
        const rawAss = sessionStorage.getItem(LOCAL_ASSESSMENT_KEY);
        if (rawAss) {
          const ass = JSON.parse(rawAss);
          if (ass.weightKg) {
            payload.biometrics = {
              gender: ass.gender || "male",
              age: ass.age || profile.age || 26,
              heightCm: ass.heightCm || 175,
              weightKg: ass.weightKg || 70,
              waistIn: ass.waistIn || 32,
              neckIn: ass.neckIn || 14.5,
              hipIn: ass.hipIn,
              bmi: ass.bmi || 24.2,
              bmiCategory: ass.bmiCategory || "normal",
              bodyFatPercent: ass.bodyFatPercent || 18.4,
              bodyFatCategory: ass.bodyFatCategory || "average",
              caloricTarget: 1800,
              proteinTargetGrams: 120,
              activityLevel: ass.activityLevel || "moderately-active",
              dietPreference: ass.dietPreference || "vegetarian",
            };
            payload.goal = ass.goal || "fat-loss";
            payload.goalDisplay = ass.goal ? String(ass.goal).replace("-", " ") : "Fat Loss";

            // Also persist assessment document with user UID in Firestore
            const asmId = ass.id || `asm_${profile.uid}`;
            void setDoc(
              doc(db, "assessments", asmId),
              {
                id: asmId,
                uid: profile.uid,
                email: profile.email,
                name: profile.name,
                phone: profile.phone,
                ...ass,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch((err) => console.warn("Link assessment notice:", err));
          }
        }
      } catch (e) {
        console.warn("Notice checking draft biometrics:", e);
      }

      void setDoc(userRef, payload, { merge: true }).catch((err) => {
        console.warn("Firebase profile sync notice:", err);
      });
    } catch (e) {
      console.warn("Failed to dispatch profile to Firebase Firestore:", e);
    }
  }

  // Sync draft assessment details for multi-step funnel if in browser
  if (typeof window !== "undefined") {
    try {
      const rawDetails = sessionStorage.getItem(DETAILS_STORAGE_KEY);
      const details = rawDetails ? JSON.parse(rawDetails) : {};
      details.age = profile.age || details.age || 28;
      sessionStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
    } catch {}

    try {
      const rawAss = sessionStorage.getItem(LOCAL_ASSESSMENT_KEY);
      const ass = rawAss ? JSON.parse(rawAss) : {};
      ass.name = profile.name;
      ass.email = profile.email;
      ass.phone = profile.phone;
      sessionStorage.setItem(LOCAL_ASSESSMENT_KEY, JSON.stringify(ass));
    } catch {}
  }
}

export function clearStoredProfile(): void {
  inMemoryProfile = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(AUTH_PROFILE_KEY);
      sessionStorage.removeItem("bmyfit_admin_authorized");
    } catch {}
  }
}

export async function fetchFirebaseProfile(uid: string): Promise<UserProfile | null> {
  if (inMemoryProfile && inMemoryProfile.uid === uid) return inMemoryProfile;
  if (typeof window === "undefined") return null;

  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      inMemoryProfile = data;
      try {
        sessionStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn("Firebase fetchProfile notice:", err);
  }
  return null;
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

  const cred = await signInWithPopup(auth, provider);
  const fbUser = cred.user;

  // Retrieve any existing remote profile from Firestore to keep stored age, phone, etc.
  const remoteProfile = await fetchFirebaseProfile(fbUser.uid);

  const profile: UserProfile = {
    uid: fbUser.uid,
    name: fbUser.displayName || remoteProfile?.name || "BMYFIT Athlete",
    email: fbUser.email || remoteProfile?.email || "",
    phone: fbUser.phoneNumber || remoteProfile?.phone || "",
    age: remoteProfile?.age || 28,
    avatarUrl: fbUser.photoURL || remoteProfile?.avatarUrl || undefined,
    provider: "google",
    createdAt: remoteProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveStoredProfile(profile);
  const token = await fbUser.getIdToken().catch(() => null);
  await syncProfileToServer(profile, token);

  return profile;
}

/**
 * Email & Password Login
 */
export async function loginWithEmail(data: SigninData): Promise<UserProfile> {
  const { email, password } = data;
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = cred.user;

  // Retrieve user document from Firestore to restore user's registered name, phone, and age
  const remoteProfile = await fetchFirebaseProfile(fbUser.uid);

  const profile: UserProfile = {
    uid: fbUser.uid,
    name: remoteProfile?.name || fbUser.displayName || email.split("@")[0],
    email: fbUser.email || email.trim(),
    phone: remoteProfile?.phone || fbUser.phoneNumber || "",
    age: remoteProfile?.age || 28,
    avatarUrl: fbUser.photoURL || remoteProfile?.avatarUrl || undefined,
    provider: "password",
    createdAt: remoteProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveStoredProfile(profile);
  const token = await fbUser.getIdToken().catch(() => null);
  await syncProfileToServer(profile, token);

  return profile;
}

/**
 * Sign Up with Full Name, Email, Password, Phone Number, and Age
 */
export async function signupWithEmail(data: SignupData): Promise<UserProfile> {
  const { name, email, password, phone, age } = data;

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
    updatedAt: new Date().toISOString(),
  };

  saveStoredProfile(profile);
  const token = await fbUser.getIdToken().catch(() => null);
  await syncProfileToServer(profile, token);

  return profile;
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
  await sendPasswordResetEmail(auth, email.trim());
}
