import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MENU } from "./menu.ts";
import {
  isActiveOrderStatus,
  sanitizeOrderItems,
} from "./sanitize-order-items.ts";

describe("sanitizeOrderItems (order → priced lines)", () => {
  it("reprices from MENU and ignores client price/name", () => {
    const sample = MENU[0];
    assert.ok(sample);

    const result = sanitizeOrderItems([
      {
        itemId: sample.id,
        quantity: 2,
      },
    ]);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].name, sample.name);
    assert.equal(result.items[0].price, sample.price);
    assert.equal(result.items[0].quantity, 2);
    assert.equal(result.items[0].veg, sample.veg);
  });

  it("rejects unknown menu ids", () => {
    const result = sanitizeOrderItems([
      { itemId: "not-a-real-dish", quantity: 1 },
    ]);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /not found/i);
  });

  it("clamps quantity between 1 and 20", () => {
    const sample = MENU[0];
    assert.ok(sample);

    const tooHigh = sanitizeOrderItems([
      { itemId: sample.id, quantity: 999 },
    ]);
    assert.equal(tooHigh.ok, true);
    if (tooHigh.ok) assert.equal(tooHigh.items[0].quantity, 20);

    const tooLow = sanitizeOrderItems([{ itemId: sample.id, quantity: 0 }]);
    assert.equal(tooLow.ok, true);
    if (tooLow.ok) assert.equal(tooLow.items[0].quantity, 1);
  });

  it("rejects empty cart", () => {
    const result = sanitizeOrderItems([]);
    assert.equal(result.ok, false);
  });

  it("sanitizes multiple line items", () => {
    const a = MENU[0];
    const b = MENU[1];
    assert.ok(a && b);
    const result = sanitizeOrderItems([
      { itemId: a.id, quantity: 1 },
      { itemId: b.id, quantity: 3 },
    ]);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.items.length, 2);
    assert.equal(result.items[1].quantity, 3);
  });
});

describe("isActiveOrderStatus (kitchen board filter)", () => {
  it("treats preparing as active, not cooking", () => {
    assert.equal(isActiveOrderStatus("preparing"), true);
    assert.equal(isActiveOrderStatus("cooking"), false);
    assert.equal(isActiveOrderStatus("served"), false);
    assert.equal(isActiveOrderStatus("cancelled"), false);
    assert.equal(isActiveOrderStatus("pending"), true);
    assert.equal(isActiveOrderStatus("ready"), true);
  });
});
