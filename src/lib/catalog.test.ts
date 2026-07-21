import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MENU, CATEGORIES, getMenuItem, searchMenu } from "./menu.ts";
import {
  RESTAURANT,
  formatINR,
  buildUpiLink,
} from "./restaurant.ts";
import {
  computeOrderTotals,
  mergeCartItems,
  nextKitchenStatus,
  KITCHEN_STATUS_FLOW,
} from "./order-math.ts";
import type { CartItem } from "./types.ts";

describe("menu catalog", () => {
  it("has dishes across categories", () => {
    assert.ok(MENU.length >= 50);
    assert.ok(CATEGORIES.length >= 5);
  });

  it("every item has id, name, positive price, veg flag", () => {
    for (const item of MENU) {
      assert.ok(item.id, `missing id for ${item.name}`);
      assert.ok(item.name.length > 0);
      assert.ok(item.price > 0, `${item.name} price`);
      assert.ok(["veg", "nonveg", "egg"].includes(item.veg));
    }
  });

  it("menu ids are unique", () => {
    const ids = MENU.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("getMenuItem and searchMenu work", () => {
    const first = MENU[0];
    assert.equal(getMenuItem(first.id)?.name, first.name);
    assert.equal(getMenuItem("nope"), undefined);
    const hits = searchMenu(first.name.slice(0, 4));
    assert.ok(hits.length >= 1);
    assert.equal(searchMenu("").length, MENU.length);
  });

  it("search matches dishes when words are reordered (butter chicken)", () => {
    const hits = searchMenu("butter chicken");
    assert.ok(
      hits.some((m) => m.name === "Chicken Butter Masala"),
      `expected Chicken Butter Masala in ${hits.map((m) => m.name).join(", ")}`,
    );
  });
});

describe("restaurant config", () => {
  it("has Bokaro location and 7 tables with tokens", () => {
    assert.equal(RESTAURANT.location.city, "Bokaro");
    assert.equal(RESTAURANT.tableCount, 7);
    assert.equal(RESTAURANT.gstPercent, 5);
    for (let t = 1; t <= 7; t++) {
      assert.ok(RESTAURANT.tableTokens[t], `token for table ${t}`);
    }
  });

  it("formatINR and UPI link", () => {
    assert.match(formatINR(199), /₹/);
    const link = buildUpiLink(250.5, "abcdef12-xxxx");
    assert.match(link, /^upi:\/\/pay\?/);
    assert.match(link, /pa=/);
    assert.match(link, /am=250\.50/);
    assert.match(link, /cu=INR/);
  });
});

describe("order math", () => {
  it("computes GST at restaurant rate", () => {
    const items: CartItem[] = [
      {
        itemId: "a",
        name: "A",
        price: 100,
        quantity: 2,
        veg: "veg",
      },
    ];
    const { subtotal, gst, total } = computeOrderTotals(items);
    assert.equal(subtotal, 200);
    assert.equal(gst, Math.round((200 * RESTAURANT.gstPercent) / 100));
    assert.equal(total, subtotal + gst);
  });

  it("computes discount and GST correctly", () => {
    const items: CartItem[] = [
      {
        itemId: "a",
        name: "A",
        price: 100,
        quantity: 2,
        veg: "veg",
      },
    ];
    const { subtotal, discountAmount, gst, total } = computeOrderTotals(items, 10);
    assert.equal(subtotal, 200);
    assert.equal(discountAmount, 20);
    assert.equal(gst, Math.round((180 * RESTAURANT.gstPercent) / 100));
    assert.equal(total, 180 + gst);
  });

  it("merges duplicate cart lines by itemId+notes", () => {
    const base: CartItem[] = [
      { itemId: "x", name: "X", price: 50, quantity: 1, veg: "veg" },
    ];
    const merged = mergeCartItems(base, [
      { itemId: "x", name: "X", price: 50, quantity: 2, veg: "veg" },
      {
        itemId: "x",
        name: "X",
        price: 50,
        quantity: 1,
        veg: "veg",
        notes: "less spicy",
      },
    ]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].quantity, 3);
    assert.equal(merged[1].notes, "less spicy");
  });

  it("kitchen status flow advances correctly", () => {
    assert.deepEqual([...KITCHEN_STATUS_FLOW], [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
    ]);
    assert.equal(nextKitchenStatus("pending"), "confirmed");
    assert.equal(nextKitchenStatus("ready"), "served");
    assert.equal(nextKitchenStatus("served"), null);
  });
});
