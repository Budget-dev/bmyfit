"use client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { publicEnv } from "@/lib/env/public";

const app = getApps().length ? getApp() : initializeApp({ apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID, storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID });
export const auth = getAuth(app);
export const db = getFirestore(app);
if (typeof window !== "undefined" && publicEnv.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") { connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true }); connectFirestoreEmulator(db, "127.0.0.1", 8080); }
