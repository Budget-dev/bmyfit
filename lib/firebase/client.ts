"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { publicEnv } from "@/lib/env/public";

export const firebaseConfig = {
  apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBTDlDEskEIE_QV7_-T30iq__4u6xY_3NU",
  authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bmyfit-809a8.firebaseapp.com",
  projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bmyfit-809a8",
  storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bmyfit-809a8.firebasestorage.app",
  messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "378122370612",
  appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID || "1:378122370612:web:640061563e06e44e179461",
  measurementId: publicEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7P72H4FP7D",
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

let analyticsInstance: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics unsupported in current environment
    });
}
export const analytics = analyticsInstance;

if (typeof window !== "undefined" && publicEnv.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  } catch {
    // Emulator connection already established
  }
}

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
};
