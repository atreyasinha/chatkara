"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, MenuItem, VegFlag } from "@/lib/types";

interface CartState {
  tableNumber: number | null;
  items: CartItem[];
  setTable: (n: number) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: null,
      items: [],
      setTable: (n) => set({ tableNumber: n }),
      addItem: (item) => {
        const existing = get().items.find((i) => i.itemId === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.itemId === item.id
                ? { ...i, quantity: Math.min(20, i.quantity + 1) }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                veg: item.veg as VegFlag,
              },
            ],
          });
        }
      },
      removeItem: (itemId) =>
        set({ items: get().items.filter((i) => i.itemId !== itemId) }),
      setQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.itemId === itemId
              ? { ...i, quantity: Math.min(20, quantity) }
              : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: "chatkara-cart" },
  ),
);
