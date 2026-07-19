"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { VegBadge } from "@/components/VegBadge";
import { formatINR, RESTAURANT } from "@/lib/restaurant";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  preparing: "Cooking",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

const PICKUP_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  preparing: "Cooking",
  ready: "Ready for Pickup",
  served: "Picked Up",
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
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-gold/20 blur-xl animate-pulse" />
          <div className="h-16 w-16 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <div className="absolute h-10 w-10 overflow-hidden rounded-full border border-line bg-bg shadow-md animate-pulse-soft">
            <Image
              src="/logo.png"
              alt="ChatKara Emblem"
              width={40}
              height={40}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  const stepIndex = STATUS_STEP.indexOf(
    order.status === "cancelled" ? "pending" : order.status,
  );

  const labels = order.tableNumber === 0 ? PICKUP_STATUS_LABEL : STATUS_LABEL;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 py-6">
      <BrandMark size="md" href="/" />

      <div className="mt-8 rounded-3xl border border-line bg-bg-elevated p-5 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {order.tableNumber === 0 ? "Pickup Order" : `Table ${order.tableNumber}`}
        </p>
        <h1 className="font-display mt-1 text-3xl text-gold">
          {labels[order.status]}
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
                <span className="text-[10px] text-muted">{labels[s]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {order.tableNumber !== 0 && (
        <Link
          href={`/table/${order.tableNumber}?parentOrderId=${order.id}&token=${RESTAURANT.tableTokens[order.tableNumber]}`}
          className="flame-bg mt-4 block w-full rounded-xl py-3.5 text-center font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Order more from this table
        </Link>
      )}

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
        {order.discountAmount ? (
          <div className="mt-1 flex justify-between text-veg">
            <span>Discount ({order.discountPercent}%)</span>
            <span>-{formatINR(order.discountAmount)}</span>
          </div>
        ) : null}
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
              : "UPI · Waiting for staff to confirm payment"
            : "Cash · Pay at table"}
        </p>
      </div>

      {/* Google Review Prompt */}
      {(order.status === "ready" || order.status === "served") && (
        <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center animate-fade-up">
          <h3 className="font-display text-lg text-gold">Enjoyed your food?</h3>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            Please take a moment to leave us a review on Google. It helps us grow and keep bringing you the best flavours of India!
          </p>
          <a
            href={RESTAURANT.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flame-bg mt-3.5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            Leave a Google Review
          </a>
        </div>
      )}

      <button
        onClick={() => {
          const itemsText = order.items
            .map((item) => `• ${item.name} (x${item.quantity}) — ₹${item.price * item.quantity}`)
            .join("\n");
          const orderType = order.tableNumber === 0 ? "Online Pickup" : `Table ${order.tableNumber}`;
          const formattedId = order.id.slice(0, 8).toUpperCase();
          let discountLines = "";
          if (order.discountAmount) {
            discountLines = `*Discount (${order.discountPercent}%):* -₹${Math.round(order.discountAmount)}\n`;
          }
          const receiptText = `🌟 *CHATKARA BILL RECEIPT* 🌟\n\n` +
            `*Order Reference:* #${formattedId}\n` +
            `*Type:* ${orderType}\n` +
            `*Time:* ${new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n` +
            `----------------------------\n` +
            `${itemsText}\n` +
            `----------------------------\n` +
            `*Subtotal:* ₹${Math.round(order.subtotal || order.total || 0)}\n` +
            discountLines +
            `*GST (5%):* ₹${Math.round(order.gst || 0)}\n` +
            `*Total Amount:* ₹${Math.round(order.total)}\n\n` +
            `*Payment Method:* ${order.paymentMethod.toUpperCase()}\n` +
            `*Payment Status:* ${order.paymentStatus === "paid" ? "PAID" : "DUE"}\n\n` +
            `*Thank you for ordering with us at ChatKara!*`;
          
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(receiptText)}`;
          window.open(url, "_blank");
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-600/30 bg-green-500/10 py-3 text-center text-sm font-semibold text-green-400 transition hover:border-green-500 hover:bg-green-500/20 active:scale-[0.98]"
      >
        <svg
          className="h-4 w-4 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Share Bill on WhatsApp
      </button>
    </div>
  );
}
