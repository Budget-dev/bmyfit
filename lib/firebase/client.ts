"use client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { publicEnv } from "@/lib/env/public";

const firebaseConfig = {
  apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment1234567",
  authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
if (typeof window !== "undefined" && publicEnv.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") { connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true }); connectFirestoreEmulator(db, "127.0.0.1", 8080); }
