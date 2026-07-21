import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { formatKitchenTelegramMessage } from "./telegram.ts";
import type { Order } from "./types.ts";

function sampleOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "abcdef12-xxxx-yyyy",
    tableNumber: 3,
    items: [
      {
        itemId: "ck-butter-masala",
        name: "Chicken Butter Masala",
        price: 300,
        quantity: 1,
        veg: "nonveg",
      },
      {
        itemId: "st-veg-manchurian",
        name: "Veg Manchurian",
        price: 140,
        quantity: 2,
        veg: "veg",
        notes: "less spicy",
      },
    ],
    subtotal: 580,
    gst: 29,
    total: 609,
    paymentMethod: "cash",
    paymentStatus: "cash_on_delivery",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("formatKitchenTelegramMessage", () => {
  const keys = ["CHATKARA_ENV", "VERCEL_ENV"] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    process.env.CHATKARA_ENV = "production";
  });

  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("formats a new dine-in cash order", () => {
    const text = formatKitchenTelegramMessage(sampleOrder());
    assert.match(text, /🆕 New order/);
    assert.match(text, /Table 3 · Cash/);
    assert.match(text, /Chicken Butter Masala ×1/);
    assert.match(text, /Veg Manchurian ×2 \(less spicy\)/);
    assert.match(text, /Total ₹/);
    assert.match(text, /#ABCDEF12/);
    assert.doesNotMatch(text, /\[DEV\]/);
  });

  it("marks pickup and append + DEV/TEST prefixes", () => {
    process.env.CHATKARA_ENV = "development";
    const text = formatKitchenTelegramMessage(
      sampleOrder({
        tableNumber: 0,
        paymentMethod: "upi",
        paymentStatus: "pending",
        needsKitchenAck: true,
        isTest: true,
      }),
    );
    assert.match(text, /\[DEV · TEST\]/);
    assert.match(text, /➕ Items added/);
    assert.match(text, /Pickup · UPI \(awaiting pay\)/);
  });
});
