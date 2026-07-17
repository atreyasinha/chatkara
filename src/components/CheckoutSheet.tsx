"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Banknote, CheckCircle2, Smartphone, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { buildUpiLink, formatINR, RESTAURANT } from "@/lib/restaurant";
import type { Order, PaymentMethod } from "@/lib/types";

export function CheckoutSheet({
  tableNumber,
  parentOrderId,
  onClose,
}: {
  tableNumber: number;
  parentOrderId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("upi");

  useEffect(() => {
    if (tableNumber === 0 && method !== "upi") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMethod("upi");
    }
  }, [tableNumber, method]);
  const [phone, setPhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatkara_customer_phone") || "";
    }
    return "";
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const gst = Math.round((subtotal() * RESTAURANT.gstPercent) / 100);
  const total = subtotal() + gst;

  const upiLink = useMemo(() => {
    if (!order) return "";
    return buildUpiLink(order.total, order.id);
  }, [order]);

  async function placeOrder() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items,
          paymentMethod: method,
          customerPhone: phone || undefined,
          notes: notes || undefined,
          parentOrderId: parentOrderId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (typeof window !== "undefined") {
        if (phone) localStorage.setItem("chatkara_customer_phone", phone);
      }

      setOrder(data.order);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function confirmUpiPaid() {
    if (!order) return;
    setLoading(true);
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markPaid: true }),
      });
      router.push(`/order/${order.id}`);
    } catch {
      setError("Could not confirm payment");
    } finally {
      setLoading(false);
    }
  }

  if (order && method === "upi") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
        <div className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-line bg-bg-elevated p-5 sm:rounded-3xl animate-fade-up">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-display text-2xl text-gold">Pay with UPI</h3>
              <p className="text-sm text-muted">
                Order #{order.id.slice(0, 8).toUpperCase()} · {formatINR(order.total)}
              </p>
            </div>
            <button type="button" onClick={() => router.push(`/order/${order.id}`)}>
              <X className="h-5 w-5 text-muted" />
            </button>
          </div>

          <div className="mx-auto mb-4 flex w-fit justify-center rounded-2xl bg-white p-4">
            <QRCodeSVG value={upiLink} size={200} level="M" />
          </div>

          <p className="mb-1 text-center text-sm text-muted">
            Scan with GPay, PhonePe, Paytm, or BHIM
          </p>
          <p className="mb-4 text-center text-xs text-muted">
            UPI ID: {RESTAURANT.upiId}
          </p>

          <a
            href={upiLink}
            className="flame-bg mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
          >
            <Smartphone className="h-4 w-4" />
            Open UPI app
          </a>

          <button
            type="button"
            disabled={loading}
            onClick={confirmUpiPaid}
            className="w-full rounded-xl border border-gold/50 py-3 font-semibold text-gold hover:bg-gold-dim disabled:opacity-50"
          >
            I&apos;ve paid — confirm
          </button>
        </div>
      </div>
    );
  }

  if (order && method === "cash") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
        <div className="w-full max-w-lg rounded-t-3xl border border-line bg-bg-elevated p-6 text-center sm:rounded-3xl animate-fade-up">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-veg" />
          <h3 className="font-display text-2xl text-gold">Order placed!</h3>
          <p className="mt-2 text-sm text-muted">
            Pay {formatINR(order.total)} in cash when your food arrives.
          </p>
          <p className="mt-1 text-xs text-muted">
            Order #{order.id.slice(0, 8).toUpperCase()} · {order.tableNumber === 0 ? "Pickup" : `Table ${order.tableNumber}`}
          </p>
          <button
            type="button"
            onClick={() => router.push(`/order/${order.id}`)}
            className="flame-bg mt-6 w-full rounded-xl py-3 font-semibold text-white"
          >
            Track order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-bg-elevated scrollbar-thin animate-fade-up">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-bg-elevated px-4 py-3">
          <h3 className="font-display text-xl text-gold">Checkout</h3>
          <button type="button" onClick={onClose} className="p-2 text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
              Phone number (10-digit)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="tel"
              className="w-full rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="Enter 10-digit mobile number"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
              Special notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="Less spicy, no onion…"
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-muted">
              Payment method
            </p>
            {tableNumber === 0 ? (
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-center">
                <Smartphone className="mx-auto h-6 w-6 text-gold mb-1" />
                <span className="block text-sm font-semibold text-gold">UPI Payment Required</span>
                <span className="block text-[11px] text-muted mt-0.5">Cash payment is not available for online pickup orders.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("upi")}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                    method === "upi"
                      ? "border-gold bg-gold-dim"
                      : "border-line bg-bg-soft"
                  }`}
                >
                  <Smartphone className="h-6 w-6 text-gold" />
                  <span className="text-sm font-semibold">UPI</span>
                  <span className="text-[10px] text-muted">GPay · PhonePe · Paytm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("cash")}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                    method === "cash"
                      ? "border-gold bg-gold-dim"
                      : "border-line bg-bg-soft"
                  }`}
                >
                  <Banknote className="h-6 w-6 text-gold" />
                  <span className="text-sm font-semibold">Cash</span>
                  <span className="text-[10px] text-muted">Pay at table</span>
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-bg-soft p-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatINR(subtotal())}</span>
            </div>
            <div className="mt-1 flex justify-between text-muted">
              <span>GST ({RESTAURANT.gstPercent}%)</span>
              <span>{formatINR(gst)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-gold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-nonveg">{error}</p>}

          <button
            type="button"
            disabled={loading || items.length === 0 || phone.trim().length !== 10}
            onClick={placeOrder}
            className="flame-bg w-full rounded-xl py-3.5 font-semibold text-white disabled:opacity-50"
          >
            {loading
              ? "Placing order…"
              : phone.trim().length !== 10
                ? "Enter 10-digit Phone"
                : method === "upi"
                  ? `Place order · Pay ${formatINR(total)}`
                  : `Place order · Pay cash ${formatINR(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
