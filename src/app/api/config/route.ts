import { NextResponse } from "next/server";
import { getChatkaraEnv, getFirebaseProjectId } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Returns Firebase client configuration for the browser SDK.
 * Firebase API keys are safe to expose publicly (protected by Firestore security rules),
 * but we mark this private so CDNs/proxies don't cache environment-specific values.
 */
export async function GET() {
  const firestoreDatabaseId =
    process.env.FIRESTORE_DATABASE_ID?.trim() || undefined;

  return NextResponse.json(
    {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      /** Named Firestore DB id when not `(default)` — e.g. Production `default`. */
      firestoreDatabaseId: firestoreDatabaseId || null,
      /** development | production — which logical env this deploy is */
      environment: getChatkaraEnv(),
      /** Echo for kitchen/debug banner (same as projectId) */
      firebaseProjectId: getFirebaseProjectId(),
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
