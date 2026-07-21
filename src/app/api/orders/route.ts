import { after, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createOrder, listOrders } from "@/lib/orders";
import { sanitizeOrderItems } from "@/lib/sanitize-order-items";
import { isAdminRequest, unauthorizedJson } from "@/lib/admin-auth";
import { notifyKitchenTelegram } from "@/lib/telegram";
import type { CartItem, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";
// Telegram Bot API often times out from US regions on Vercel.
export const preferredRegion = ["fra1"];

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
    const body = await request.json();
    const tableNumber = Number(body.tableNumber);
    const items = body.items as CartItem[];
    const paymentMethod = body.paymentMethod as PaymentMethod;
    const isTest = isAuthorizedTestRequest(request);

    if (
      !Number.isFinite(tableNumber) ||
      tableNumber < 0 ||
      !Array.isArray(items) ||
      items.length === 0 ||
      (paymentMethod !== "upi" && paymentMethod !== "cash") ||
      (tableNumber === 0 && paymentMethod !== "upi")
    ) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const sanitized = sanitizeOrderItems(items);
    if (!sanitized.ok) {
      return NextResponse.json({ error: sanitized.error }, { status: 400 });
    }

    const order = await createOrder({
      tableNumber,
      items: sanitized.items,
      paymentMethod,
      customerName: body.customerName ? String(body.customerName) : undefined,
      customerPhone: body.customerPhone
        ? String(body.customerPhone)
        : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      parentOrderId: body.parentOrderId
        ? String(body.parentOrderId)
        : undefined,
      isTest: isTest || undefined,
    });

    // Keep the isolate alive after the response so notify isn't frozen mid-fetch.
    after(() => notifyKitchenTelegram(order));

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
