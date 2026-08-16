"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Banknote, Smartphone, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { buildUpiLink, formatINR, RESTAURANT } from "@/lib/restaurant";
import type { Order, PaymentMethod } from "@/lib/types";

export function CheckoutSheet({
  tableNumber,
  tableToken,
  parentOrderId,
  onClose,
}: {
  tableNumber: number;
  tableToken?: string;
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
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatkara_customer_name") || "";
    }
    return "";
  });
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
  // Idempotency key: a retry after a client-side timeout returns the same order
  // instead of creating a duplicate on the kitchen board.
  const [requestId] = useState(() => crypto.randomUUID());

  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [parentOrderDiscount, setParentOrderDiscount] = useState<number | null>(null);

  useEffect(() => {
    if (parentOrderId) {
      fetch(`/api/orders/${parentOrderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.order) {
            setParentOrderDiscount(data.order.discountPercent || 0);
          }
        })
        .catch((err) => console.error("Error fetching parent order:", err));
    }
  }, [parentOrderId]);

  useEffect(() => {
    if (phone.length === 10 && !parentOrderId) {
      let active = true;
      fetch(`/api/discount?phone=${phone}`)
        .then((res) => res.json())
        .then((data) => {
          if (active && data) {
            setDiscountPercent(data.discountPercent || 0);
            setDiscountMessage(data.message || "");
          }
        })
        .catch((err) => {
          console.error("Failed to check discount:", err);
        });
      return () => {
        active = false;
      };
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiscountPercent(0);
      setDiscountMessage("");
    }
  }, [phone, parentOrderId]);

  const activeDiscountPercent = parentOrderId
    ? (parentOrderDiscount || 0)
    : discountPercent;

  const currentSubtotal = subtotal();
  const discountAmount = Math.round((currentSubtotal * activeDiscountPercent) / 100);
  const taxableSubtotal = currentSubtotal - discountAmount;
  const gst = Math.round((taxableSubtotal * RESTAURANT.gstPercent) / 100);
  const total = taxableSubtotal + gst;

  const upiLinks = useMemo(() => {
    if (!order) return { generic: "", gpay: "", phonepe: "", paytm: "", bhim: "" };
    const isIOS =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent);
    return {
      generic: buildUpiLink(order.total, order.id, "generic"),
      // gpay:// is Android-only; Google Pay on iOS registers tez://
      gpay: isIOS
        ? buildUpiLink(order.total, order.id, "generic").replace(
            "upi://pay",
            "tez://upi/pay",
          )
        : buildUpiLink(order.total, order.id, "gpay"),
      phonepe: buildUpiLink(order.total, order.id, "phonepe"),
      paytm: buildUpiLink(order.total, order.id, "paytm"),
      bhim: buildUpiLink(order.total, order.id, "bhim"),
    };
  }, [order]);

  async function placeOrder() {
    setLoading(true);
    setError("");
    try {
      // AbortSignal.timeout is missing on iOS < 16 / Chrome < 103 — hand-roll it.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25_000);
      let res: Response;
      try {
        res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber,
            tableToken,
            items,
            paymentMethod: method,
            customerName: tableNumber === 0 ? name || undefined : undefined,
            customerPhone: phone || undefined,
            notes: notes || undefined,
            parentOrderId: parentOrderId || undefined,
            requestId,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      const data = (await res.json().catch(() => ({}))) as {
        order?: Order;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || `Failed to place order (${res.status})`);
      }
      if (!data.order) throw new Error("Failed to place order");

      if (typeof window !== "undefined") {
        if (tableNumber === 0 && name) {
          localStorage.setItem("chatkara_customer_name", name);
        }
        if (phone) localStorage.setItem("chatkara_customer_phone", phone);
      }

      setOrder(data.order);
      clear();
      if (method === "cash") {
        router.push(`/order/${data.order.id}`);
      }
    } catch (e) {
      const message =
        e instanceof DOMException &&
        (e.name === "TimeoutError" || e.name === "AbortError")
          ? "Order timed out — check kitchen board or try again"
          : e instanceof Error
            ? e.message
            : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const [copiedUpi, setCopiedUpi] = useState(false);

  async function handleCopyUpi() {
    try {
      await navigator.clipboard.writeText(RESTAURANT.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  async function confirmUpiPaid() {
    if (!order) return;
    // Payment is confirmed by kitchen staff after UPI settles — customers only track.
    router.push(`/order/${order.id}`);
  }

  if (order && method === "upi") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center">
        <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-bg-elevated p-5 sm:rounded-3xl animate-fade-up pb-safe">
          <div className="drag-handle sm:hidden" />
          <div className="mb-4 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                Payment Verification
              </span>
              <h3 className="font-display text-2xl font-bold text-gold">Pay with UPI</h3>
              <p className="text-xs text-muted mt-0.5">
                Order #{order.id.slice(0, 8).toUpperCase()} · <strong className="text-gold font-semibold">{formatINR(order.total)}</strong>
              </p>
            </div>
            <button
              type="button"
              aria-label="Close UPI payment"
              onClick={() => router.push(`/order/${order.id}`)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted hover:bg-bg-soft hover:text-ink focus-visible:ring-2 active:scale-90 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-auto mb-4 flex w-fit justify-center rounded-2xl bg-white p-3.5 shadow-lg">
            <QRCodeSVG value={upiLinks.generic} size={190} level="M" />
          </div>

          <p className="mb-1 text-center text-xs text-muted">
            Scan QR code or select your preferred payment app below
          </p>

          {/* Copy UPI ID button */}
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-3 py-1.5 text-xs text-muted hover:border-gold hover:text-gold active:scale-95 transition"
            >
              <span>UPI ID: <strong className="text-ink font-mono">{RESTAURANT.upiId}</strong></span>
              <span className="ml-1 text-[10px] text-gold font-bold">
                {copiedUpi ? "✓ Copied!" : "📋 Copy"}
              </span>
            </button>
          </div>

          <p className="mb-4 text-center text-xs text-gold/90 bg-gold/5 border border-gold/20 rounded-xl p-2.5">
            After you pay, staff will confirm it on the kitchen board. Your order is already being sent to the kitchen.
          </p>
          {parentOrderId && (
            <p className="mb-4 -mt-2 text-center text-xs text-muted">
              This is your combined bill — it includes your earlier order at this table.
            </p>
          )}

          <div className="mb-4 space-y-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-gold">
              Open directly in your app:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={upiLinks.gpay}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-bg-soft py-2.5 text-xs font-bold text-ink hover:border-gold hover:text-gold active:scale-95 transition-all shadow-sm"
              >
                Google Pay
              </a>
              <a
                href={upiLinks.phonepe}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-bg-soft py-2.5 text-xs font-bold text-ink hover:border-gold hover:text-gold active:scale-95 transition-all shadow-sm"
              >
                PhonePe
              </a>
              <a
                href={upiLinks.paytm}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-bg-soft py-2.5 text-xs font-bold text-ink hover:border-gold hover:text-gold active:scale-95 transition-all shadow-sm"
              >
                Paytm
              </a>
              <a
                href={upiLinks.bhim}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-bg-soft py-2.5 text-xs font-bold text-ink hover:border-gold hover:text-gold active:scale-95 transition-all shadow-sm"
              >
                BHIM
              </a>
            </div>
            <a
              href={upiLinks.generic}
              className="flame-bg flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white mt-2 shadow-md active:scale-95 transition"
            >
              <Smartphone className="h-4 w-4" />
              Other / Default UPI App
            </a>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={confirmUpiPaid}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-gold/60 bg-gold/10 py-3 text-sm font-bold text-gold hover:bg-gold hover:text-bg active:scale-[0.98] transition disabled:opacity-50"
          >
            I&apos;ve paid — Track Order →
          </button>
        </div>
      </div>
    );
  }

  if (order && method === "cash") {
    return null;
  }

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-bg-elevated scrollbar-thin animate-fade-up pb-safe flex flex-col">
        <div className="drag-handle sm:hidden" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg-elevated px-5 py-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
              Step 2 of 2
            </span>
            <h3 className="font-display text-xl font-bold text-gold">Checkout</h3>
          </div>
          <button
            type="button"
            aria-label="Close checkout"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted hover:bg-bg-soft hover:text-ink focus-visible:ring-2 active:scale-90 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {tableNumber === 0 && (
            <div>
              <label htmlFor="customer-name" className="mb-1.5 block text-xs uppercase tracking-wider font-semibold text-muted">
                Your Name <span className="text-flame-from">*</span>
              </label>
              <input
                id="customer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-line bg-bg-soft px-4 py-3 text-base text-ink outline-none focus:border-gold transition-colors"
                placeholder="Enter name for pickup"
              />
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="customer-phone" className="text-xs uppercase tracking-wider font-semibold text-muted">
                Phone Number (10-digit) <span className="text-flame-from">*</span>
              </label>
              {phoneValid ? (
                <span className="text-[11px] font-semibold text-veg">✓ Valid 10-digit number</span>
              ) : phone.length > 0 ? (
                <span className="text-[11px] text-muted">{10 - phone.length} more digit{10 - phone.length === 1 ? "" : "s"}</span>
              ) : null}
            </div>
            <input
              id="customer-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={`w-full rounded-2xl border bg-bg-soft px-4 py-3 text-base text-ink outline-none transition-colors ${
                phoneValid ? "border-veg/60 focus:border-veg" : "border-line focus:border-gold"
              }`}
              placeholder="Enter 10-digit mobile number"
            />
          </div>

          <div>
            <label htmlFor="special-notes" className="mb-1.5 block text-xs uppercase tracking-wider font-semibold text-muted">
              Special Notes (Optional)
            </label>
            <textarea
              id="special-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-2xl border border-line bg-bg-soft px-4 py-2.5 text-base text-ink outline-none focus:border-gold transition-colors"
              placeholder="e.g. Less spicy, Extra gravy, No onion…"
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider font-semibold text-muted">
              Payment Method
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
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition active:scale-95 ${
                    method === "upi"
                      ? "border-gold bg-gold/15 shadow-sm ring-1 ring-gold/40"
                      : "border-line bg-bg-soft hover:border-gold/40"
                  }`}
                >
                  <Smartphone className="h-6 w-6 text-gold" />
                  <span className="text-sm font-bold text-ink">UPI</span>
                  <span className="text-[10px] text-muted">GPay · PhonePe · Paytm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("cash")}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition active:scale-95 ${
                    method === "cash"
                      ? "border-gold bg-gold/15 shadow-sm ring-1 ring-gold/40"
                      : "border-line bg-bg-soft hover:border-gold/40"
                  }`}
                >
                  <Banknote className="h-6 w-6 text-gold" />
                  <span className="text-sm font-bold text-ink">Cash</span>
                  <span className="text-[10px] text-muted">Pay at table</span>
                </button>
              </div>
            )}
          </div>
          {discountMessage && (
            <div className="rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 text-center text-xs font-medium text-gold animate-fade-up">
              {discountMessage}
            </div>
          )}

          <div className="rounded-2xl border border-line bg-bg-soft p-4 text-sm space-y-1.5">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-ink">{formatINR(currentSubtotal)}</span>
            </div>
            {activeDiscountPercent > 0 && (
              <div className="flex justify-between text-veg">
                <span>Discount ({activeDiscountPercent}%)</span>
                <span className="font-medium">-{formatINR(discountAmount)}</span>
              </div>
            )}
            {RESTAURANT.gstPercent > 0 && (
              <div className="flex justify-between text-muted">
                <span>GST ({RESTAURANT.gstPercent}%)</span>
                <span>{formatINR(gst)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line/60 pt-2 font-bold text-gold text-base">
              <span>Total Bill</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-nonveg">{error}</p>}

          <button
            type="button"
            disabled={loading || items.length === 0 || !phoneValid || (tableNumber === 0 && name.trim().length === 0)}
            onClick={placeOrder}
            className="flame-bg flex min-h-[54px] w-full items-center justify-center rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
          >
            {loading
              ? "Placing order…"
              : !phoneValid
                ? "Enter 10-digit Phone"
                : (tableNumber === 0 && name.trim().length === 0)
                  ? "Enter Your Name"
                  : parentOrderId
                    ? method === "upi"
                      ? `Add to Order · Pay ${formatINR(total)}`
                      : `Add to Order · Cash ${formatINR(total)}`
                    : method === "upi"
                      ? `Place Order · Pay ${formatINR(total)}`
                      : `Place Order · Pay Cash ${formatINR(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
