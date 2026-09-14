import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  createOrder,
  InvalidParentOrderError,
  listOrders,
  normalizePhone,
} from "@/lib/orders";
import { sanitizeOrderItems } from "@/lib/sanitize-order-items";
import { isAdminRequest, unauthorizedJson } from "@/lib/admin-auth";
import { notifyKitchenTelegram } from "@/lib/telegram";
import { RESTAURANT } from "@/lib/restaurant";
import { tableTokenValid } from "@/lib/table-tokens";
import type { CartItem, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";
// Telegram Bot API often times out from US regions on Vercel.
export const preferredRegion = ["fra1"];
export const maxDuration = 60;

/** Simple in-memory sliding-window rate limiter — 30 req/min per IP. */
const orderRateMap = new Map<string, number[]>();
const ORDER_RATE_LIMIT = 30;
const ORDER_RATE_WINDOW_MS = 60_000;

function isOrderRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (orderRateMap.get(ip) ?? []).filter(
    (t) => now - t < ORDER_RATE_WINDOW_MS,
  );
  hits.push(now);
  orderRateMap.set(ip, hits);
  if (orderRateMap.size > 5000) {
    const cutoff = now - ORDER_RATE_WINDOW_MS;
    for (const [key, timestamps] of orderRateMap) {
      if (timestamps.every((t) => t < cutoff)) orderRateMap.delete(key);
    }
  }
  return hits.length > ORDER_RATE_LIMIT;
}

function isAuthorizedTestRequest(request: Request): boolean {
  const secret = process.env.E2E_TEST_SECRET;
  if (!secret) return false;
  const key = request.headers.get("x-chatkara-test-key");
  if (typeof key !== "string") return false;

  const a = Buffer.from(key, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedJson();
  return NextResponse.json({ orders: await listOrders() });
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (isOrderRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests — please slow down" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const tableNumber = Number(body.tableNumber);
    const items = body.items as CartItem[];
    const paymentMethod = body.paymentMethod as PaymentMethod;
    const isTest = isAuthorizedTestRequest(request);

    if (
      !Number.isInteger(tableNumber) ||
      tableNumber < 0 ||
      tableNumber > RESTAURANT.tableCount ||
      !Array.isArray(items) ||
      items.length === 0 ||
      (paymentMethod !== "upi" && paymentMethod !== "cash") ||
      (tableNumber === 0 && paymentMethod !== "upi")
    ) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    // Dine-in orders must present the table QR credential. Pickup (0) is open.
    if (tableNumber !== 0 && !tableTokenValid(tableNumber, body.tableToken)) {
      return NextResponse.json(
        { error: "Invalid or missing table credential — scan the table QR again" },
        { status: 403 },
      );
    }

    const sanitized = sanitizeOrderItems(items);
    if (!sanitized.ok) {
      return NextResponse.json({ error: sanitized.error }, { status: 400 });
    }

    if (sanitized.items.length > 30) {
      return NextResponse.json(
        { error: "Too many distinct items — max 30 per order" },
        { status: 400 },
      );
    }

    const customerName = body.customerName
      ? String(body.customerName).slice(0, 80).trim() || undefined
      : undefined;
    const rawPhone =
      body.customerPhone != null ? String(body.customerPhone) : "";
    let customerPhone: string | undefined;
    if (rawPhone) {
      const normalized = normalizePhone(rawPhone);
      if (!normalized) {
        return NextResponse.json(
          { error: "Enter a valid 10-digit mobile number" },
          { status: 400 },
        );
      }
      customerPhone = normalized;
    }
    const notes = body.notes
      ? String(body.notes).slice(0, 500).trim() || undefined
      : undefined;
    const parentOrderId = body.parentOrderId
      ? String(body.parentOrderId).slice(0, 36)
      : undefined;

    const order = await createOrder({
      tableNumber,
      items: sanitized.items,
      paymentMethod,
      customerName,
      customerPhone,
      notes,
      parentOrderId,
      isTest: isTest || undefined,
    });

    // Await notify so Production doesn't lose the Telegram call if `after()` is cut short.
    // Failures are swallowed inside notifyKitchenTelegram / telegramApi.
    try {
      await notifyKitchenTelegram(order);
    } catch (err) {
      console.error("Telegram notify threw:", err);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    console.error("POST /api/orders failed:", message);
    if (err instanceof InvalidParentOrderError) {
      return NextResponse.json(
        {
          error:
            "This order can no longer be updated. Return to your table menu and start a new order.",
        },
        { status: 409 },
      );
    }
    const isFirestore =
      /firestore/i.test(message) || /NOT_FOUND/i.test(message) || /timed out/i.test(message);
    return NextResponse.json(
      {
        error: isFirestore
          ? "Database unavailable — Firestore may not be set up for this environment"
          : "Failed to create order",
      },
      { status: 503 },
    );
  }
}
