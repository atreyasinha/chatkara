"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { VegBadge } from "@/components/VegBadge";
import { formatINR } from "@/lib/restaurant";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  preparing: "Cooking",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

const STATUS_STEP: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
];

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function subscribe() {
      try {
        const { getClientDb } = await import("@/lib/firebase-client");
        const { doc, onSnapshot } = await import("firebase/firestore");

        const db = await getClientDb();
        const docRef = doc(db, "orders", orderId);

        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Order;
            setOrder({
              ...data,
              id: data.id || docSnap.id,
              subtotal: data.subtotal || data.total || 0,
              gst: data.gst || 0,
              paymentMethod: data.paymentMethod || "cash",
              paymentStatus: data.paymentStatus || "pending",
            });
          } else {
            setError("Order not found");
          }
        }, (err) => {
          console.error("Firestore onSnapshot error:", err);
          setError("Failed to stream order updates");
        });
      } catch (e) {
        console.error("Failed to setup real-time order listener:", e);
        setError(e instanceof Error ? e.message : "Failed to load order");
      }
    }

    subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="text-nonveg">{error}</p>
        <Link href="/" className="mt-4 text-gold underline">
          Home
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center">
        <p className="animate-pulse-soft text-muted">Loading order…</p>
      </div>
    );
  }

  const stepIndex = STATUS_STEP.indexOf(
    order.status === "cancelled" ? "pending" : order.status,
  );

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 py-6">
      <BrandMark size="md" href="/" />

      <div className="mt-8 rounded-3xl border border-line bg-bg-elevated p-5 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Table {order.tableNumber}
        </p>
        <h1 className="font-display mt-1 text-3xl text-gold">
          {STATUS_LABEL[order.status]}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>

        {order.status !== "cancelled" && (
          <div className="mt-6 flex justify-between gap-1">
            {STATUS_STEP.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`h-2 w-full rounded-full ${
                    i <= stepIndex ? "flame-bg" : "bg-bg-soft"
                  }`}
                />
                <span className="text-[10px] text-muted">{STATUS_LABEL[s]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {order.items.map((item) => (
          <li
            key={item.itemId}
            className="flex items-center gap-3 rounded-2xl border border-line bg-bg-elevated/80 px-4 py-3"
          >
            <VegBadge veg={item.veg} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {item.quantity}× {item.name}
              </p>
            </div>
            <span className="text-sm text-gold">
              {formatINR(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl border border-line bg-bg-soft p-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-muted">
          <span>GST</span>
          <span>{formatINR(order.gst)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-gold">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
        <p className="mt-3 text-xs text-muted">
          Payment:{" "}
          {order.paymentMethod === "upi"
            ? order.paymentStatus === "paid"
              ? "UPI · Paid"
              : "UPI · Awaiting confirmation"
            : "Cash · Pay at table"}
        </p>
      </div>

      <Link
        href={`/table/${order.tableNumber}`}
        className="mt-6 block text-center text-sm text-gold underline"
      >
        Order more from this table
      </Link>
    </div>
  );
}
