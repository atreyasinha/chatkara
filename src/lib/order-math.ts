import { RESTAURANT } from "./restaurant";
import type { CartItem } from "./types";

export function computeOrderTotals(items: CartItem[]): {
  subtotal: number;
  gst: number;
  total: number;
} {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gst = Math.round((subtotal * RESTAURANT.gstPercent) / 100);
  return { subtotal, gst, total: subtotal + gst };
}

export function mergeCartItems(
  existing: CartItem[],
  incoming: CartItem[],
): CartItem[] {
  const merged = existing.map((i) => ({ ...i }));
  for (const newItem of incoming) {
    const found = merged.find(
      (i) => i.itemId === newItem.itemId && i.notes === newItem.notes,
    );
    if (found) {
      found.quantity += newItem.quantity;
    } else {
      merged.push({ ...newItem });
    }
  }
  return merged;
}

export const KITCHEN_STATUS_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
] as const;

export function nextKitchenStatus(
  status: (typeof KITCHEN_STATUS_FLOW)[number],
): (typeof KITCHEN_STATUS_FLOW)[number] | null {
  const idx = KITCHEN_STATUS_FLOW.indexOf(status);
  if (idx < 0 || idx >= KITCHEN_STATUS_FLOW.length - 1) return null;
  return KITCHEN_STATUS_FLOW[idx + 1];
}
