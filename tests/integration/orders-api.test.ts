import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { MENU } from "../../src/lib/menu.ts";
import { RESTAURANT } from "../../src/lib/restaurant.ts";
import {
  adminLogin,
  createTestOrder,
  getOrder,
  patchOrder,
  waitForServer,
  apiJson,
} from "../helpers/http.ts";
import {
  firebaseConfigured,
  sampleMenuItems,
  TEST_NAME,
  TEST_PHONE,
  underpricedPayload,
} from "../helpers/fixtures.ts";
import { cleanupTestData } from "../helpers/cleanup.ts";

const enabled = firebaseConfigured();

describe("API integration — auth, pricing, kitchen life", () => {
  before(async () => {
    if (!enabled) {
      console.log("Skipping integration suite: Firebase env not configured");
      return;
    }
    if (!process.env.E2E_TEST_SECRET) {
      throw new Error("E2E_TEST_SECRET is required for integration tests");
    }
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is required for integration tests");
    }
    await waitForServer();
    await cleanupTestData();
    const ok = await adminLogin(process.env.ADMIN_PASSWORD);
    assert.equal(ok, true, "admin login should set session cookie");
  });

  after(async () => {
    if (!enabled) return;
    await cleanupTestData();
  });

  it("rejects invalid payloads", async (t) => {
    if (!enabled) return t.skip();

    const empty = await createTestOrder({
      tableNumber: 1,
      paymentMethod: "cash",
      items: [],
    });
    assert.equal(empty.status, 400);

    const pickupCash = await createTestOrder({
      tableNumber: 0,
      paymentMethod: "cash",
      items: sampleMenuItems(1),
    });
    assert.equal(pickupCash.status, 400);

    const badItem = await createTestOrder({
      tableNumber: 1,
      paymentMethod: "upi",
      items: [{ itemId: "totally-fake", quantity: 1 }],
    });
    assert.equal(badItem.status, 400);
  });

  it("reprices underpaid client payloads from MENU", async (t) => {
    if (!enabled) return t.skip();
    const item = MENU[0];
    const { status, order } = await createTestOrder({
      tableNumber: 2,
      paymentMethod: "upi",
      items: [underpricedPayload(item.id)],
      customerName: TEST_NAME,
      customerPhone: TEST_PHONE,
      notes: "integration underpay check",
    });
    assert.equal(status, 201);
    assert.ok(order);
    assert.equal(order!.items[0].price, item.price);
    assert.equal(order!.items[0].name, item.name);
    assert.ok(order!.total >= item.price);
    assert.equal(order!.isTest, true);
    assert.equal(order!.paymentStatus, "pending");
  });

  it("blocks unauthenticated kitchen mutations", async (t) => {
    if (!enabled) return t.skip();
    const created = await createTestOrder({
      tableNumber: 3,
      paymentMethod: "cash",
      items: sampleMenuItems(1),
    });
    assert.ok(created.order);

    const unauth = await patchOrder(
      created.order!.id,
      { markPaid: true },
      { admin: false },
    );
    assert.equal(unauth.status, 401);

    const list = await apiJson<{ error?: string }>("/api/orders", {
      admin: false,
    });
    assert.equal(list.status, 401);
  });

  it("creates cash dine-in order and tracks kitchen status to served", async (t) => {
    if (!enabled) return t.skip();
    const { status, order } = await createTestOrder({
      tableNumber: 3,
      paymentMethod: "cash",
      items: sampleMenuItems(2),
      customerPhone: TEST_PHONE,
      notes: "cash flow",
    });
    assert.equal(status, 201);
    assert.ok(order);
    assert.equal(order!.paymentStatus, "cash_on_delivery");
    assert.equal(order!.status, "pending");

    for (const next of ["confirmed", "preparing", "ready", "served"] as const) {
      const patched = await patchOrder(order!.id, { status: next });
      assert.equal(patched.status, 200);
      assert.equal(patched.body.order?.status, next);
      if (next === "served") {
        assert.ok(patched.body.order?.completedAt);
      }
    }

    const paid = await patchOrder(order!.id, { markPaid: true });
    assert.equal(paid.status, 200);
    assert.equal(paid.body.order?.paymentStatus, "paid");
  });

  it("pickup UPI stays unpaid until kitchen marks paid", async (t) => {
    if (!enabled) return t.skip();
    const { status, order } = await createTestOrder({
      tableNumber: 0,
      paymentMethod: "upi",
      items: sampleMenuItems(1),
      customerName: TEST_NAME,
      customerPhone: TEST_PHONE,
      notes: "pickup flow",
    });
    assert.equal(status, 201);
    assert.ok(order);
    assert.equal(order!.tableNumber, 0);
    assert.equal(order!.paymentStatus, "pending");

    const paid = await patchOrder(order!.id, { markPaid: true });
    assert.equal(paid.status, 200);
    assert.equal(paid.body.order?.paymentStatus, "paid");
    assert.equal(paid.body.order?.status, "confirmed");
  });

  it("appends items without resetting cook status; sets kitchen ack", async (t) => {
    if (!enabled) return t.skip();
    const firstItem = sampleMenuItems(1);
    const created = await createTestOrder({
      tableNumber: 4,
      paymentMethod: "cash",
      items: firstItem,
      notes: "parent",
    });
    assert.equal(created.status, 201);
    assert.ok(created.order);

    await patchOrder(created.order!.id, { status: "preparing" });

    const second = MENU.find((m) => m.id !== firstItem[0].itemId) ?? MENU[1];
    const appended = await createTestOrder({
      tableNumber: 4,
      paymentMethod: "cash",
      items: [{ itemId: second.id, quantity: 1 }],
      parentOrderId: created.order!.id,
      notes: "extra dish",
    });
    assert.equal(appended.status, 201);
    assert.ok(appended.order);
    assert.equal(appended.order!.id, created.order!.id);
    assert.ok(appended.order!.items.length >= 2);
    assert.equal(appended.order!.status, "preparing");
    assert.equal(appended.order!.needsKitchenAck, true);
    assert.match(appended.order!.notes || "", /extra dish/);

    const acked = await patchOrder(created.order!.id, {
      clearKitchenAck: true,
    });
    assert.equal(acked.status, 200);
    assert.equal(acked.body.order?.needsKitchenAck, false);
  });

  it("does not append to paid parent — creates a new order instead", async (t) => {
    if (!enabled) return t.skip();
    const parent = await createTestOrder({
      tableNumber: 5,
      paymentMethod: "upi",
      items: sampleMenuItems(1),
    });
    assert.ok(parent.order);
    await patchOrder(parent.order!.id, { markPaid: true });

    const child = await createTestOrder({
      tableNumber: 5,
      paymentMethod: "upi",
      items: sampleMenuItems(1),
      parentOrderId: parent.order!.id,
    });
    assert.equal(child.status, 201);
    assert.ok(child.order);
    assert.notEqual(child.order!.id, parent.order!.id);
  });

  it("GET order by id stays public; list requires admin", async (t) => {
    if (!enabled) return t.skip();
    const created = await createTestOrder({
      tableNumber: 1,
      paymentMethod: "upi",
      items: sampleMenuItems(1),
    });
    assert.ok(created.order);

    const fetched = await getOrder(created.order!.id);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.order?.id, created.order!.id);

    const missing = await getOrder("00000000-0000-0000-0000-000000000000");
    assert.equal(missing.status, 404);

    const list = await apiJson<{ orders: unknown[] }>("/api/orders", {
      admin: true,
    });
    assert.equal(list.status, 200);
    assert.ok(Array.isArray(list.body.orders));
  });

  it("rejects invalid status patches", async (t) => {
    if (!enabled) return t.skip();
    const created = await createTestOrder({
      tableNumber: 6,
      paymentMethod: "cash",
      items: sampleMenuItems(1),
    });
    assert.ok(created.order);

    const bad = await patchOrder(created.order!.id, {
      status: "cooking" as never,
    });
    assert.equal(bad.status, 400);
  });

  it("admin login rejects wrong password", async (t) => {
    if (!enabled) return t.skip();
    const bad = await apiJson<{ success: boolean }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: "wrong-password-xyz" }),
    });
    assert.equal(bad.status, 401);
  });

  it("analytics requires admin session", async (t) => {
    if (!enabled) return t.skip();
    const denied = await apiJson<{ error?: string }>(
      "/api/admin/analytics?timeframe=daily",
      { admin: false },
    );
    assert.equal(denied.status, 401);

    const { status, body } = await apiJson<{
      success: boolean;
      data?: {
        totalRevenue: number;
        activeOrders: number;
        topItems: unknown[];
        orders: unknown[];
      };
    }>("/api/admin/analytics?timeframe=daily", { admin: true });
    assert.equal(status, 200);
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.ok(typeof body.data!.totalRevenue === "number");
  });

  it("config exposes firebase project id for client", async (t) => {
    if (!enabled) return t.skip();
    const { status, body } = await apiJson<{ projectId?: string }>(
      "/api/config",
    );
    assert.equal(status, 200);
    assert.ok(body.projectId);
  });

  it("table tokens cover all tables", () => {
    for (let n = 1; n <= RESTAURANT.tableCount; n++) {
      assert.ok(RESTAURANT.tableTokens[n]);
    }
  });
});
