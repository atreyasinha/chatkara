import { NextResponse } from "next/server";
import { getChatkaraEnv, getFirebaseProjectId } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    /** development | production — which logical env this deploy is */
    environment: getChatkaraEnv(),
    /** Echo for kitchen/debug banner (same as projectId) */
    firebaseProjectId: getFirebaseProjectId(),
  });
}
