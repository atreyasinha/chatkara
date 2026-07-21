import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let dbInstance: Firestore | null = null;

/**
 * Dynamically fetches the server-configured Firebase keys and initializes the Firestore Client SDK.
 * This runs fully in the browser client and returns the singleton Firestore instance.
 */
export async function getClientDb(): Promise<Firestore> {
  if (dbInstance) return dbInstance;

  const res = await fetch("/api/config");
  if (!res.ok) {
    throw new Error("Failed to fetch Firebase configuration from the server");
  }
  const config = (await res.json()) as {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    firestoreDatabaseId?: string | null;
  };
  const firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  };

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const databaseId = config.firestoreDatabaseId?.trim();
  // Must match server `FIRESTORE_DATABASE_ID` (Production uses `default`, not `(default)`).
  dbInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  return dbInstance;
}
