import { MENU } from "./menu";
import type { CartItem, VegFlag } from "./types";

export type SanitizeResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string };

const VEG_FLAGS: readonly VegFlag[] = ["veg", "nonveg", "egg"];

export type SanitizeOptions = {
  /** Staff (waiter) may add off-menu custom lines (itemId must start with `custom:`). */
  allowCustom?: boolean;
};

/**
 * Reprice cart lines from the server menu. Never trust client price/name/veg
 * for catalog items. Custom lines are only accepted when allowCustom is set.
 */
export function sanitizeOrderItems(
  items: Array<{
    itemId?: unknown;
    quantity?: unknown;
    notes?: unknown;
    name?: unknown;
    price?: unknown;
    veg?: unknown;
  }>,
  options: SanitizeOptions = {},
): SanitizeResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Invalid items" };
  }

  const sanitized: CartItem[] = [];
  for (const item of items) {
    const itemId = String(item.itemId ?? "");
    const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
    const notes = item.notes ? String(item.notes).slice(0, 120) : undefined;

    const dbItem = MENU.find((m) => m.id === itemId);
    if (dbItem) {
      sanitized.push({
        itemId,
        name: dbItem.name,
        price: dbItem.price,
        quantity,
        veg: dbItem.veg as VegFlag,
        notes,
      });
      continue;
    }

    if (options.allowCustom && itemId.startsWith("custom:")) {
      const name = String(item.name ?? "")
        .trim()
        .slice(0, 80);
      const price = Math.round(Number(item.price));
      const vegRaw = String(item.veg ?? "veg");
      const veg = (VEG_FLAGS.includes(vegRaw as VegFlag)
        ? vegRaw
        : "veg") as VegFlag;

      if (!name) {
        return { ok: false, error: "Custom item needs a name" };
      }
      if (!Number.isFinite(price) || price < 1 || price > 9999) {
        return { ok: false, error: "Custom item price must be ₹1–9999" };
      }

      sanitized.push({
        itemId: itemId.slice(0, 64),
        name,
        price,
        quantity,
        veg,
        notes,
      });
      continue;
    }

    return { ok: false, error: `Item not found: ${itemId}` };
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
