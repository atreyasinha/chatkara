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
  const config = await res.json();
  const firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  };

  // Initialize the client SDK with the fetched configuration keys
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  // (default) database — passing "default" looks up a different (missing) DB id
  dbInstance = getFirestore(app);
  return dbInstance;
}
