import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

/**
 * Optional named database id (e.g. `default` if the console DB wasn't `(default)`).
 * Leave unset to use the project `(default)` database.
 */
const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim() || undefined;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createDb() {
  // memoryLocalCache avoids server isolates hanging in offline write queues when
  // Firestore is missing/misconfigured (otherwise setDoc can spin until Vercel times out).
  if (databaseId) {
    return getFirestore(app, databaseId);
  }
  try {
    return initializeFirestore(app, { localCache: memoryLocalCache() });
  } catch {
    return getFirestore(app);
  }
}

const db = createDb();

export { db };
