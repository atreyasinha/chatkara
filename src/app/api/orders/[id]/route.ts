import { NextResponse } from "next/server";
import { getOrder, markOrderPaid, updateOrderStatus } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (body.markPaid === true) {
      const order = markOrderPaid(id);
      if (!order) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const order = updateOrderStatus(id, body.status);
      if (!order) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
