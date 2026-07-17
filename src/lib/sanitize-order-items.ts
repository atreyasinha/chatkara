import { MENU } from "./menu";
import type { CartItem, VegFlag } from "./types";

export type SanitizeResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string };

/**
 * Reprice cart lines from the server menu. Never trust client price/name/veg.
 */
export function sanitizeOrderItems(
  items: Array<{
    itemId?: unknown;
    quantity?: unknown;
    notes?: unknown;
  }>,
): SanitizeResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Invalid items" };
  }

  const sanitized: CartItem[] = [];
  for (const item of items) {
    const itemId = String(item.itemId ?? "");
    const dbItem = MENU.find((m) => m.id === itemId);
    if (!dbItem) {
      return { ok: false, error: `Item not found: ${itemId}` };
    }
    sanitized.push({
      itemId,
      name: dbItem.name,
      price: dbItem.price,
      quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1)),
      veg: dbItem.veg as VegFlag,
      notes: item.notes ? String(item.notes) : undefined,
    });
  }
  return { ok: true, items: sanitized };
}

export const ACTIVE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
] as const;

export function isActiveOrderStatus(status: string): boolean {
  return (ACTIVE_ORDER_STATUSES as readonly string[]).includes(status);
}
