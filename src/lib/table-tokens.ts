import "server-only";

import { timingSafeEqual } from "crypto";
import { RESTAURANT } from "./restaurant";

/**
 * Table QR credentials. Prefer TABLE_TOKEN_* env vars (server-only);
 * fall back to legacy values so already-printed QR cards keep working
 * until rotated. Never import RESTAURANT.tableTokens in client code —
 * use /api/table/verify (public, rate-limited) and
 * /api/admin/table-tokens (admin-only) instead.
 */
const LEGACY_TABLE_TOKENS: Record<number, string> = {
  1: "ck_t1_x92a",
  2: "ck_t2_p83b",
  3: "ck_t3_m17c",
  4: "ck_t4_y64d",
  5: "ck_t5_r28e",
  6: "ck_t6_v59f",
  7: "ck_t7_w41g",
};

export function getTableToken(tableNumber: number): string | undefined {
  if (
    !Number.isInteger(tableNumber) ||
    tableNumber < 1 ||
    tableNumber > RESTAURANT.tableCount
  ) {
    return undefined;
  }
  return (
    process.env[`TABLE_TOKEN_${tableNumber}`]?.trim() ||
    LEGACY_TABLE_TOKENS[tableNumber]
  );
}

export function getTableTokens(): Record<number, string> {
  return Object.fromEntries(
    Array.from({ length: RESTAURANT.tableCount }, (_, index) => {
      const tableNumber = index + 1;
      return [tableNumber, getTableToken(tableNumber) ?? ""];
    }),
  );
}

export function tableTokenValid(tableNumber: number, token: unknown): boolean {
  const expected = getTableToken(tableNumber);
  if (!expected || typeof token !== "string") return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
