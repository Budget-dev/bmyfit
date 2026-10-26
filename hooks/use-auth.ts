"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { publicEnv } from "@/lib/env/public";
import type { UserProfile, SignupData, SigninData } from "@/types/auth";
import {
  getStoredProfile,
  saveStoredProfile,
  signInWithGoogle as authSignInWithGoogle,
  loginWithEmail as authLoginWithEmail,
  signupWithEmail as authSignupWithEmail,
  logoutUser as authLogoutUser,
} from "@/features/auth/auth-service";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getStoredProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check stored profile immediately on mount
    const stored = getStoredProfile();
    if (stored) {
      setUserProfile(stored);
    }

    if (!publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY && publicEnv.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== "true") {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
          // If profile exists in storage, keep it updated with latest firebase info
          const currentProfile = getStoredProfile();
          if (currentProfile) {
            setUserProfile(currentProfile);
          } else if (!currentUser.isAnonymous) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || "BMYFIT Athlete",
              email: currentUser.email || "",
              phone: currentUser.phoneNumber || "",
              age: 28,
              avatarUrl: currentUser.photoURL || undefined,
              provider: currentUser.providerData[0]?.providerId === "google.com" ? "google" : "password",
              createdAt: new Date().toISOString(),
            };
            saveStoredProfile(newProfile);
            setUserProfile(newProfile);
          }
          setLoading(false);
        } else {
          // If no stored profile and no user, optionally sign in anonymously for public API access
          const existingProfile = getStoredProfile();
          if (!existingProfile) {
            try {
              const credential = await signInAnonymously(auth);
              if (isMounted) {
                setUser(credential.user);
                setLoading(false);
              }
            } catch (err) {
              if (isMounted) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
              }
            }
          } else {
            setLoading(false);
          }
        }
      },
      (authError) => {
        if (isMounted) {
          setError(authError);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (user) {
      return user.getIdToken();
    }
    if (auth.currentUser) {
      return auth.currentUser.getIdToken();
    }
    return null;
  }, [user]);

  const signInWithGoogle = useCallback(async (): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await authSignInWithGoogle();
      setUserProfile(profile);
      return profile;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, []);

  const loginWithEmail = useCallback(async (data: SigninData): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await authLoginWithEmail(data);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, []);

  const signupWithEmail = useCallback(async (data: SignupData): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await authSignupWithEmail(data);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, []);

  const signOutUser = useCallback(async (): Promise<void> => {
    await authLogoutUser();
    setUser(null);
    setUserProfile(null);
  }, []);

  const refreshProfile = useCallback(() => {
    const p = getStoredProfile();
    setUserProfile(p);
  }, []);

  return {
    user,
    userProfile,
    loading,
    error,
    getIdToken,
    isAuthenticated: !!userProfile || (!!user && !user.isAnonymous),
    isAnonymous: !!user?.isAnonymous && !userProfile,
    signInWithGoogle,
    loginWithEmail,
    signupWithEmail,
    signOutUser,
    refreshProfile,
  };
}
