import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/orders";
import { MENU } from "@/lib/menu";
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

    const sanitized: CartItem[] = [];
    for (const item of items) {
      const dbItem = MENU.find((m) => m.id === item.itemId);
      if (!dbItem) {
        return NextResponse.json({ error: `Item not found: ${item.itemId}` }, { status: 400 });
      }
      sanitized.push({
        itemId: String(item.itemId),
        name: dbItem.name,
        price: dbItem.price,
        quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1)),
        veg: dbItem.veg,
        notes: item.notes ? String(item.notes) : undefined,
      });
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
