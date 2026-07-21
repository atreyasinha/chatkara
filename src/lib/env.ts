/**
 * ChatKara runtime environment.
 *
 * Use two Firebase projects so development/test orders never share a DB with
 * production. Wire credentials via env vars (see .env.example + README).
 *
 * Resolution order:
 * 1. CHATKARA_ENV=development|production (explicit override)
 * 2. VERCEL_ENV=production → production
 * 3. everything else → development (local, Vercel Preview, CI)
 */
export type ChatkaraEnv = "development" | "production";

export function getChatkaraEnv(): ChatkaraEnv {
  const explicit = process.env.CHATKARA_ENV?.trim().toLowerCase();
  if (explicit === "production" || explicit === "prod") return "production";
  if (explicit === "development" || explicit === "dev") return "development";

  if (process.env.VERCEL_ENV === "production") return "production";
  return "development";
}

export function isProductionEnv(): boolean {
  return getChatkaraEnv() === "production";
}

export function getFirebaseProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID?.trim() || "";
}
