import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrderFromTodayIST } from "./waiter-day.ts";

describe("isOrderFromTodayIST", () => {
  it("matches orders created on the same Kolkata calendar day", () => {
    // 2026-07-31 22:30 UTC = 2026-08-01 04:00 IST — different IST day
    const lateUtc = "2026-07-31T22:30:00.000Z";
    const noonIstAsUtc = "2026-07-31T06:30:00.000Z"; // 12:00 IST Jul 31
    const nowJul31Ist = new Date("2026-07-31T10:00:00.000Z"); // 15:30 IST Jul 31

    assert.equal(isOrderFromTodayIST(noonIstAsUtc, nowJul31Ist), true);
    assert.equal(isOrderFromTodayIST(lateUtc, nowJul31Ist), false);
  });
});
