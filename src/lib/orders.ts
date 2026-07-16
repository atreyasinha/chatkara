import { randomUUID } from "crypto";
import { RESTAURANT } from "./restaurant";
import type { CartItem, Order, OrderStatus, PaymentMethod } from "./types";

declare global {
  // Persist across hot reloads in development
  // eslint-disable-next-line no-var
  var __chatkaraOrders: Order[] | undefined;
}

const orders: Order[] = globalThis.__chatkaraOrders ?? [];
globalThis.__chatkaraOrders = orders;

export function listOrders(): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(input: {
  tableNumber: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}): Order {
  const subtotal = input.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const gst = Math.round((subtotal * RESTAURANT.gstPercent) / 100);
  const total = subtotal + gst;
  const now = new Date().toISOString();

  const order: Order = {
    id: randomUUID(),
    tableNumber: input.tableNumber,
    items: input.items,
    subtotal,
    gst,
    total,
    paymentMethod: input.paymentMethod,
    paymentStatus:
      input.paymentMethod === "cash" ? "cash_on_delivery" : "pending",
    status: "pending",
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };

  orders.unshift(order);
  return order;
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Order | undefined {
  const order = orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return order;
}

export function markOrderPaid(id: string): Order | undefined {
  const order = orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.paymentStatus = "paid";
  if (order.status === "pending") order.status = "confirmed";
  order.updatedAt = new Date().toISOString();
  return order;
}
