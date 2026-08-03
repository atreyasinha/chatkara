import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createOrder, listOrders } from "@/lib/orders";
import { sanitizeOrderItems } from "@/lib/sanitize-order-items";
import { isAdminRequest, unauthorizedJson } from "@/lib/admin-auth";
import { notifyKitchenTelegram } from "@/lib/telegram";
import { isProductionEnv } from "@/lib/env";
import { RESTAURANT } from "@/lib/restaurant";
import type { CartItem, Order, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";
// Telegram Bot API often times out from US regions on Vercel.
export const preferredRegion = ["fra1"];
export const maxDuration = 60;

/** In-memory per-IP throttle — best effort on serverless, still stops casual spam. */
const orderRateMap = new Map<string, number[]>();
const ORDER_RATE_LIMIT = 12;
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
  // Never honor the test channel in Production, even if the secret leaks.
  if (isProductionEnv()) return false;
  const secret = process.env.E2E_TEST_SECRET;
  if (!secret) return false;
  const key = request.headers.get("x-chatkara-test-key");
  if (typeof key !== "string") return false;

  const a = Buffer.from(key, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

function tableTokenValid(tableNumber: number, token: unknown): boolean {
  const expected = RESTAURANT.tableTokens[tableNumber];
  if (!expected || typeof token !== "string") return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Never return PII to non-admin callers — even the customer who just ordered. */
function scrubOrder(order: Order): Omit<Order, "customerPhone"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { customerPhone: _stripped, ...pub } = order;
  return pub;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedJson();
  try {
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const since = sinceParam && !isNaN(new Date(sinceParam).getTime()) ? new Date(sinceParam) : undefined;
    return NextResponse.json({ orders: await listOrders(since) });
  } catch (err) {
    console.error("GET /api/orders failed:", err);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const isTest = isAuthorizedTestRequest(request);
    const isAdmin = isAdminRequest(request);

    // Staff and the test harness are exempt — the limiter guards the public path.
    if (!isAdmin && !isTest) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      if (isOrderRateLimited(ip)) {
        return NextResponse.json(
          { error: "Too many orders — please wait a moment" },
          { status: 429 },
        );
      }
    }

    const body = await request.json();
    const tableNumber = Number(body.tableNumber);
    const items = body.items as CartItem[];
    const paymentMethod = body.paymentMethod as PaymentMethod;

    if (
      !Number.isFinite(tableNumber) ||
      tableNumber < 0 ||
      tableNumber > RESTAURANT.tableCount ||
      !Array.isArray(items) ||
      items.length === 0 ||
      (paymentMethod !== "upi" && paymentMethod !== "cash") ||
      // Pickup is UPI-only for customers; waiters/staff may take cash at the counter
      (tableNumber === 0 && paymentMethod !== "upi" && !isAdmin)
    ) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    // Dine-in orders from customers must carry the table's QR token.
    if (
      tableNumber > 0 &&
      !isAdmin &&
      !isTest &&
      !tableTokenValid(tableNumber, body.tableToken)
    ) {
      return NextResponse.json({ error: "Invalid table" }, { status: 403 });
    }

    const sanitized = sanitizeOrderItems(items, { allowCustom: isAdmin });
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
    const rawPhone = body.customerPhone
      ? String(body.customerPhone).replace(/\D/g, "")
      : "";
    const customerPhone = /^\d{10}$/.test(rawPhone) ? rawPhone : undefined;
    const notes = body.notes
      ? String(body.notes).slice(0, 500).trim() || undefined
      : undefined;
    const parentOrderId = body.parentOrderId
      ? String(body.parentOrderId).slice(0, 36)
      : undefined;
    const requestId =
      typeof body.requestId === "string" && /^[\w-]{8,64}$/.test(body.requestId)
        ? body.requestId
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
      requestId,
      skipDiscount: isAdmin,
      allowAnyParent: isAdmin,
    });

    // Await notify so Production doesn't lose the Telegram call if `after()` is cut short.
    // Failures are swallowed inside notifyKitchenTelegram / telegramApi.
    // Safe against client-timeout retries: requestId dedupes above.
    try {
      await notifyKitchenTelegram(order);
    } catch (err) {
      console.error("Telegram notify threw:", err);
    }

    return NextResponse.json(
      { order: isAdmin ? order : scrubOrder(order) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    console.error("POST /api/orders failed:", message);
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
