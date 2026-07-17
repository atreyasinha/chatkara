import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/orders";
import { sanitizeOrderItems } from "@/lib/sanitize-order-items";
import type { CartItem, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

function isAuthorizedTestRequest(request: Request): boolean {
  const secret = process.env.E2E_TEST_SECRET;
  if (!secret) return false;
  return request.headers.get("x-chatkara-test-key") === secret;
}

export async function GET() {
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

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
