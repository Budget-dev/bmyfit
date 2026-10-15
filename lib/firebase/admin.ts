import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { serverEnv } from "@/lib/env/server";

const adminApp = getApps()[0] ?? initializeApp(serverEnv.FIREBASE_PROJECT_ID && serverEnv.FIREBASE_CLIENT_EMAIL && serverEnv.FIREBASE_PRIVATE_KEY ? { credential: cert({ projectId: serverEnv.FIREBASE_PROJECT_ID, clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL, privateKey: serverEnv.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }) } : undefined);
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
