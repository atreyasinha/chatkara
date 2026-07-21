import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import {
  adminLogin,
  createTestOrder,
  getOrder,
  waitForServer,
} from "../helpers/http.ts";
import {
  firebaseConfigured,
  sampleMenuItems,
  TEST_PHONE,
  baseUrl,
} from "../helpers/fixtures.ts";
import { buildKitchenCallbackData } from "../../src/lib/telegram.ts";

const enabled = firebaseConfigured();

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const CHAT_ID = Number(process.env.TELEGRAM_CHAT_ID || "0");

async function postTelegramCallback(payload: unknown, secret?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["x-telegram-bot-api-secret-token"] = secret;
  }
  const res = await fetch(`${baseUrl()}/api/telegram/webhook`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function callbackUpdate(orderId: string, action: "n" | "p" | "k" | "x") {
  return {
    callback_query: {
      id: `cb-${action}-${orderId.slice(0, 8)}`,
      data: buildKitchenCallbackData(action, orderId),
      from: { id: CHAT_ID, username: "ci_chef" },
      message: {
        message_id: 1,
        chat: { id: CHAT_ID },
      },
    },
  };
}

/**
 * Simulates Telegram button taps by POSTing webhook updates.
 * Does not call the real Telegram API — CI only needs WEBHOOK_SECRET + CHAT_ID.
 */
describe(
  "Telegram kitchen webhook (simulated button taps)",
  { concurrency: false },
  () => {
    before(async () => {
      if (!enabled) {
        console.log("Skipping telegram webhook suite: Firebase not configured");
        return;
      }
      if (!WEBHOOK_SECRET || !CHAT_ID) {
        console.log(
          "Skipping telegram webhook suite: set TELEGRAM_WEBHOOK_SECRET + TELEGRAM_CHAT_ID",
        );
        return;
      }
      await waitForServer();
      const ok = await adminLogin(process.env.ADMIN_PASSWORD || "");
      assert.equal(ok, true, "admin login required to read back orders");
    });

    it("rejects webhook without secret", async (t) => {
      if (!enabled || !WEBHOOK_SECRET) return t.skip();
      const res = await postTelegramCallback({ update_id: 1 });
      assert.equal(res.status, 401);
    });

    it("advances status and marks paid via callback_query", async (t) => {
      if (!enabled || !WEBHOOK_SECRET || !CHAT_ID) return t.skip();

      const created = await createTestOrder({
        tableNumber: 5,
        paymentMethod: "upi",
        items: sampleMenuItems(1),
        customerPhone: TEST_PHONE,
        notes: "telegram webhook flow",
      });
      assert.equal(created.status, 201);
      assert.ok(created.order);
      const id = created.order!.id;

      // Mark confirmed (n)
      let wh = await postTelegramCallback(
        callbackUpdate(id, "n"),
        WEBHOOK_SECRET,
      );
      assert.equal(wh.status, 200, JSON.stringify(wh.body));
      let got = await getOrder(id);
      assert.equal(got.body.order?.status, "confirmed");

      // Mark paid (p)
      wh = await postTelegramCallback(callbackUpdate(id, "p"), WEBHOOK_SECRET);
      assert.equal(wh.status, 200);
      got = await getOrder(id);
      assert.equal(got.body.order?.paymentStatus, "paid");

      // Advance preparing → ready → served
      for (const expected of ["preparing", "ready", "served"] as const) {
        wh = await postTelegramCallback(callbackUpdate(id, "n"), WEBHOOK_SECRET);
        assert.equal(wh.status, 200);
        got = await getOrder(id);
        assert.equal(got.body.order?.status, expected);
      }
    });

    it("cancels an order via callback_query", async (t) => {
      if (!enabled || !WEBHOOK_SECRET || !CHAT_ID) return t.skip();

      const created = await createTestOrder({
        tableNumber: 6,
        paymentMethod: "cash",
        items: sampleMenuItems(1),
        notes: "telegram cancel",
      });
      assert.equal(created.status, 201);
      const id = created.order!.id;

      const wh = await postTelegramCallback(
        callbackUpdate(id, "x"),
        WEBHOOK_SECRET,
      );
      assert.equal(wh.status, 200);
      const got = await getOrder(id);
      assert.equal(got.body.order?.status, "cancelled");
    });

    it("ignores callbacks from an unauthorized chat", async (t) => {
      if (!enabled || !WEBHOOK_SECRET || !CHAT_ID) return t.skip();

      const created = await createTestOrder({
        tableNumber: 1,
        paymentMethod: "cash",
        items: sampleMenuItems(1),
      });
      assert.equal(created.status, 201);
      const id = created.order!.id;

      const wh = await postTelegramCallback(
        {
          callback_query: {
            id: "cb-bad-chat",
            data: buildKitchenCallbackData("n", id),
            message: { message_id: 2, chat: { id: CHAT_ID + 999 } },
          },
        },
        WEBHOOK_SECRET,
      );
      assert.equal(wh.status, 200);
      const got = await getOrder(id);
      assert.equal(got.body.order?.status, "pending");
    });
  },
);
