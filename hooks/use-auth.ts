"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { publicEnv } from "@/lib/env/public";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If client config is empty (e.g. initial build without env), skip emulator/auth calls gracefully
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
          setLoading(false);
        } else {
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
        }
      },
      (authError) => {
        if (isMounted) {
          setError(authError);
          setLoading(false);
        }
      },
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

  return {
    user,
    loading,
    error,
    getIdToken,
    isAuthenticated: !!user,
  };
}
