"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, MenuItem, VegFlag } from "@/lib/types";

function tableKey(n: number): string {
  return String(n);
}

interface CartState {
  tableNumber: number | null;
  items: CartItem[];
  /** Persisted carts scoped by table (0 = pickup). */
  cartsByTable: Record<string, CartItem[]>;
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
      cartsByTable: {},
      setTable: (n) => {
        const state = get();
        const carts = { ...state.cartsByTable };
        if (state.tableNumber !== null) {
          carts[tableKey(state.tableNumber)] = state.items;
        }
        set({
          tableNumber: n,
          items: carts[tableKey(n)] ?? [],
          cartsByTable: carts,
        });
      },
      addItem: (item) => {
        const existing = get().items.find((i) => i.itemId === item.id);
        const nextItems = existing
          ? get().items.map((i) =>
              i.itemId === item.id
                ? { ...i, quantity: Math.min(20, i.quantity + 1) }
                : i,
            )
          : [
              ...get().items,
              {
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                veg: item.veg as VegFlag,
              },
            ];
        const tableNumber = get().tableNumber;
        const carts = { ...get().cartsByTable };
        if (tableNumber !== null) carts[tableKey(tableNumber)] = nextItems;
        set({ items: nextItems, cartsByTable: carts });
      },
      removeItem: (itemId) => {
        const nextItems = get().items.filter((i) => i.itemId !== itemId);
        const tableNumber = get().tableNumber;
        const carts = { ...get().cartsByTable };
        if (tableNumber !== null) carts[tableKey(tableNumber)] = nextItems;
        set({ items: nextItems, cartsByTable: carts });
      },
      setQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        const nextItems = get().items.map((i) =>
          i.itemId === itemId
            ? { ...i, quantity: Math.min(20, quantity) }
            : i,
        );
        const tableNumber = get().tableNumber;
        const carts = { ...get().cartsByTable };
        if (tableNumber !== null) carts[tableKey(tableNumber)] = nextItems;
        set({ items: nextItems, cartsByTable: carts });
      },
      clear: () => {
        const tableNumber = get().tableNumber;
        const carts = { ...get().cartsByTable };
        if (tableNumber !== null) carts[tableKey(tableNumber)] = [];
        set({ items: [], cartsByTable: carts });
      },
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: "chatkara-cart-v2",
      partialize: (state) => ({
        tableNumber: state.tableNumber,
        items: state.items,
        cartsByTable: state.cartsByTable,
      }),
    },
  ),
);
