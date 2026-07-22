import { NextResponse } from "next/server";
import { getOrder, markOrderPaid, updateOrderStatus } from "@/lib/orders";
import { isAdminRequest, unauthorizedJson } from "@/lib/admin-auth";
import type { Order, OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

/** Fields safe to expose publicly — omits PII like customerPhone. */
function publicOrderView(order: Order): Omit<Order, "customerPhone"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { customerPhone: _stripped, ...pub } = order;
  return pub;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Admin gets full record; customers get a PII-scrubbed view
  const body = isAdminRequest(request) ? order : publicOrderView(order);
  return NextResponse.json({ order: body });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return unauthorizedJson();

  const { id } = await params;
  try {
    const body = await request.json();

    if (body.markPaid === true) {
      const order = await markOrderPaid(id);
      if (!order) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (body.clearKitchenAck === true) {
      const { clearKitchenAck } = await import("@/lib/orders");
      const order = await clearKitchenAck(id);
      if (!order) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const order = await updateOrderStatus(id, body.status);
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
