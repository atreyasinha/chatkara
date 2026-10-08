import { MENU } from "../../src/lib/menu.ts";

export const TEST_PHONE = "9876543210";
export const TEST_NAME = "E2E Nightly Customer";

export function sampleMenuItems(count = 2) {
  const picks = MENU.filter((m) => m.price > 0).slice(0, Math.max(1, count));
  if (picks.length === 0) throw new Error("MENU is empty");
  return picks.map((m, idx) => ({
    itemId: m.id,
    quantity: idx === 0 ? 2 : 1,
  }));
}

export function underpricedPayload(itemId: string) {
  return {
    itemId,
    name: "Hacked Free Meal",
    price: 1,
    quantity: 1,
    veg: "veg" as const,
  };
}

export function baseUrl(): string {
  return (
    process.env.BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL ||
    "http://127.0.0.1:3000"
  );
}

export function testHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = process.env.E2E_TEST_SECRET;
  if (key) headers["x-chatkara-test-key"] = key;
  return headers;
}

export function firebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_API_KEY,
  );
}

export function skipWithoutFirebase(): boolean {
  if (firebaseConfigured()) return false;
  console.log("Skipping: Firebase env not configured");
  return true;
}
