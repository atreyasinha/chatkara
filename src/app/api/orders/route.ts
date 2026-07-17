import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/orders";
import type { CartItem, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ orders: await listOrders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tableNumber = Number(body.tableNumber);
    const items = body.items as CartItem[];
    const paymentMethod = body.paymentMethod as PaymentMethod;

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

    const sanitized: CartItem[] = items.map((i) => ({
      itemId: String(i.itemId),
      name: String(i.name),
      price: Number(i.price),
      quantity: Math.max(1, Math.min(20, Number(i.quantity) || 1)),
      veg: i.veg,
      notes: i.notes ? String(i.notes) : undefined,
    }));

    if (sanitized.some((i) => !i.itemId || !i.name || !Number.isFinite(i.price))) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const order = await createOrder({
      tableNumber,
      items: sanitized,
      paymentMethod,
      customerName: body.customerName ? String(body.customerName) : undefined,
      customerPhone: body.customerPhone ? String(body.customerPhone) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      parentOrderId: body.parentOrderId ? String(body.parentOrderId) : undefined,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
