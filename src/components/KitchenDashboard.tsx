"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { VegBadge } from "@/components/VegBadge";
import { formatINR } from "@/lib/restaurant";
import { shareReceiptOnWhatsApp } from "@/lib/receipt";
import {
  flushKitchenQueue,
  kitchenPatch,
  queueLength,
} from "@/lib/kitchen-queue";
import type { Order, OrderStatus } from "@/lib/types";
import { Bell, RefreshCw, MessageSquare, WifiOff, X } from "lucide-react";


const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
};

const LABEL: Record<OrderStatus, string> = {
  pending: "New",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

// Reuse one AudioContext for the whole session — Chrome caps live contexts (~6),
// so creating one per chime silently kills the alert sound mid-shift.
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new Ctor();
    }
    if (sharedAudioCtx.state === "suspended") {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.08, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.52);
  } catch (e) {
    console.warn("Audio chime blocked:", e);
  }
}

export function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [toast, setToast] = useState("");

  const seenOrderIds = useRef<Set<string>>(new Set());
  const seenAckIds = useRef<Set<string>>(new Set());
  /** Order awaiting WhatsApp phone entry via modal */
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const refreshQueueCount = useCallback(() => {
    setQueued(queueLength());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    refreshQueueCount();

    function onOnline() {
      setOnline(true);
      flushKitchenQueue().then((r) => {
        refreshQueueCount();
        if (r.sent > 0) {
          setToast(`Synced ${r.sent} queued update${r.sent === 1 ? "" : "s"}`);
        }
      });
    }
    function onOffline() {
      setOnline(false);
      refreshQueueCount();
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshQueueCount]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    async function fetchKitchenOrdersApi() {
      try {
        const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const res = await fetch(`/api/orders?since=${encodeURIComponent(since)}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (res.status === 401) {
          // Session expired mid-shift — bounce to the AdminGuard login.
          window.location.reload();
          return;
        }
        if (res.ok) {
          const data = (await res.json()) as { orders?: Order[] };
          if (data.orders && isMounted) {
            const newOrders = data.orders;

            if (seenOrderIds.current.size > 0) {
              let shouldChime = false;
              for (const order of newOrders) {
                if (
                  !seenOrderIds.current.has(order.id) &&
                  order.status === "pending"
                ) {
                  shouldChime = true;
                }
                if (
                  order.needsKitchenAck &&
                  !seenAckIds.current.has(`${order.id}:${order.updatedAt}`)
                ) {
                  shouldChime = true;
                  seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
                }
              }
              if (shouldChime) playChime();
            }

            for (const order of newOrders) {
              seenOrderIds.current.add(order.id);
              if (order.needsKitchenAck) {
                seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
              }
            }

            setOrders(newOrders);
          }
        }
      } catch (err) {
        console.warn("HTTP kitchen orders fetch failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function subscribe() {
      await fetchKitchenOrdersApi();

      try {
        const { getClientDb } = await import("@/lib/firebase-client");
        const { collection, onSnapshot, query, orderBy, where } = await import(
          "firebase/firestore"
        );

        const db = await getClientDb();
        const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const q = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc"),
          where("createdAt", ">=", since)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return;
            const newOrders: Order[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Order;
              newOrders.push({
                ...data,
                id: data.id || d.id,
                subtotal: data.subtotal || data.total || 0,
                gst: data.gst || 0,
                paymentMethod: data.paymentMethod || "cash",
                paymentStatus: data.paymentStatus || "pending",
              });
            });

            if (seenOrderIds.current.size > 0) {
              let shouldChime = false;
              for (const order of newOrders) {
                if (
                  !seenOrderIds.current.has(order.id) &&
                  order.status === "pending"
                ) {
                  shouldChime = true;
                }
                if (
                  order.needsKitchenAck &&
                  !seenAckIds.current.has(`${order.id}:${order.updatedAt}`)
                ) {
                  shouldChime = true;
                  seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
                }
              }
              if (shouldChime) playChime();
            }

            for (const order of newOrders) {
              seenOrderIds.current.add(order.id);
              if (order.needsKitchenAck) {
                seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
              }
            }

            setOrders(newOrders);
            setLoading(false);
          },
          (err) => {
            console.warn("Kitchen Firestore stream warning (using HTTP polling):", err);
          },
        );
      } catch (err) {
        console.warn("Kitchen live subscription failed (using HTTP polling):", err);
        setLoading(false);
      }
    }

    subscribe();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchKitchenOrdersApi();
      }
    }, 5000);

    function handleSync() {
      if (document.visibilityState === "visible" || navigator.onLine) {
        fetchKitchenOrdersApi();
      }
    }

    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("online", handleSync);

    return () => {
      isMounted = false;
      unsubscribe?.();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("online", handleSync);
    };
  }, []);

  useEffect(() => {
    function unlock() {
      setAudioUnlocked(true);
      playChime();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    }
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  async function runMutation(id: string, body: Record<string, unknown>) {
    const result = await kitchenPatch(id, body);
    refreshQueueCount();
    if (result === "queued") {
      setToast("Offline — update queued; will sync when back online");
    } else if (result === "unauthorized") {
      setToast("Session expired — log in again");
      window.location.reload();
    } else if (result === "error") {
      setToast("Could not update order — try again");
    }
  }

  function openWhatsAppModal(order: Order) {
    setWhatsappOrder(order);
    setWhatsappPhone("");
  }

  function submitWhatsApp() {
    if (!whatsappOrder) return;
    const digits = whatsappPhone.replace(/\D/g, "");
    if (digits.length < 10) return;
    const finalPhone = digits.startsWith("91") ? digits : `91${digits}`;
    shareReceiptOnWhatsApp(whatsappOrder, finalPhone);
    setWhatsappOrder(null);
  }


  const visible = orders.filter((o) =>
    filter === "all" ? true : !["served", "cancelled"].includes(o.status),
  );

  const newCount = orders.filter(
    (o) => o.status === "pending" || o.needsKitchenAck,
  ).length;

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 py-6 pt-safe pb-safe">
      {/* WhatsApp phone modal */}
      {whatsappOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-bg-elevated p-6 shadow-2xl animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-gold">Send Bill via WhatsApp</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setWhatsappOrder(null)}
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-1.5 text-muted hover:bg-bg-soft active:scale-90 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label htmlFor="whatsapp-phone" className="mb-2 block text-xs uppercase tracking-wider font-semibold text-muted">
              Customer mobile number
            </label>
            <input
              id="whatsapp-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full rounded-2xl border border-line bg-bg-soft px-4 py-3 text-base text-ink outline-none focus:border-gold"
              autoFocus
            />
            <button
              type="button"
              disabled={whatsappPhone.replace(/\D/g, "").length < 10}
              onClick={submitWhatsApp}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-green-600/40 bg-green-500/15 py-3 text-sm font-bold text-green-400 hover:bg-green-500/25 active:scale-[0.98] transition disabled:opacity-40"
            >
              Send on WhatsApp →
            </button>
          </div>
        </div>
      )}
      {!online && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-flame-from/40 bg-flame-from/10 px-4 py-3 text-sm text-flame-from">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            You&apos;re offline. Status updates are queued
            {queued > 0 ? ` (${queued} waiting)` : ""} and will sync when reconnecting.
          </span>
        </div>
      )}

      {online && queued > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold/40 bg-gold-dim px-4 py-3 text-sm text-gold">
          <span>{queued} queued update{queued === 1 ? "" : "s"} waiting to sync</span>
          <button
            type="button"
            className="min-h-[36px] rounded-full border border-gold/50 px-4 py-1.5 text-xs font-bold active:scale-95 transition"
            onClick={() =>
              flushKitchenQueue().then((r) => {
                refreshQueueCount();
                setToast(
                  r.sent > 0
                    ? `Synced ${r.sent}`
                    : "Nothing synced — check connection",
                );
              })
            }
          >
            Sync Now
          </button>
        </div>
      )}

      {toast && (
        <div className="mb-4 rounded-2xl border border-line bg-bg-elevated px-4 py-3 text-sm text-muted animate-fade-up">
          {toast}
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line/40 pb-4">
        <div className="flex items-center gap-4">
          <BrandMark size="md" href="/" />
          <div>
            <h1 className="font-display text-2xl font-bold text-gold">Kitchen POS</h1>
            <p className="text-xs text-muted">Live orders · auto-refreshes every 5s</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {newCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full flame-bg px-3.5 py-1.5 text-xs font-bold text-white animate-pulse-soft shadow-md">
              <Bell className="h-4 w-4" />
              {newCount} Attention
            </span>
          )}
          {!audioUnlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-[11px] font-semibold text-yellow-500 animate-pulse-soft">
              Tap screen to enable alert chime
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[11px] font-semibold text-green-400">
              Chimes Active
            </span>
          )}
          <Link
            href="/admin/qr"
            className="flex min-h-[36px] items-center rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold active:scale-95 transition"
          >
            Table QR Codes
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold active:scale-95 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <div className="mb-5 flex gap-2">
        {(["active", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-95 ${
              filter === f
                ? "bg-gold text-bg font-bold shadow-sm"
                : "border border-line bg-bg-soft text-muted hover:text-ink"
            }`}
          >
            {f === "active" ? "Active Tickets" : "All Orders"}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <p className="py-20 text-center text-muted animate-pulse-soft text-sm">
          Loading active kitchen tickets…
        </p>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line/60 bg-bg-elevated/40 py-20 text-center animate-fade-up">
          <p className="font-display text-2xl font-bold text-gold">No active orders</p>
          <p className="mt-2 text-xs text-muted">
            New orders from table QR scans or wait-staff will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((order) => {
            const next = NEXT[order.status];
            return (
              <article
                key={order.id}
                className={`rounded-3xl border bg-bg-elevated/90 p-4.5 transition shadow-sm ${
                  order.status === "pending" || order.needsKitchenAck
                    ? "border-flame-from/70 shadow-lg shadow-flame-from/15 ring-1 ring-flame-from/40"
                    : "border-line"
                }`}
              >
                <div className="mb-3.5 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl font-bold text-gold">
                      {order.tableNumber === 0
                        ? "🛍️ Pickup"
                        : `🪑 Table ${order.tableNumber}`}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    {order.customerName && (
                      <p className="text-xs font-semibold text-ink mt-0.5">{order.customerName}</p>
                    )}
                    {order.needsKitchenAck && (
                      <p className="mt-1 text-xs font-bold text-flame-from animate-pulse-soft">
                        ⚡ New items added — review ticket
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "pending"
                        ? "flame-bg text-white shadow-sm"
                        : order.status === "ready"
                          ? "bg-veg/20 text-veg ring-1 ring-veg/40"
                          : "bg-gold-dim text-gold ring-1 ring-gold/30"
                    }`}
                  >
                    {LABEL[order.status]}
                  </span>
                </div>

                <ul className="mb-3.5 space-y-2 border-b border-line/40 pb-3.5">
                  {order.items.map((item) => (
                    <li
                      key={`${item.itemId}-${item.notes || ""}`}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <VegBadge veg={item.veg} />
                      <span className="font-bold text-gold text-base">
                        {item.quantity}×
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.name}</span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="mb-3 rounded-xl bg-bg-soft px-3 py-2 text-xs text-muted border border-line/30">
                    <strong className="text-gold">Note:</strong> {order.notes}
                  </p>
                )}

                <div className="mb-3.5 flex items-center justify-between text-sm">
                  <span className="text-xs text-muted">
                    {order.paymentMethod === "upi" ? "UPI Digital" : "Cash"} ·{" "}
                    {order.paymentStatus === "paid"
                      ? "✓ Paid"
                      : order.paymentStatus === "cash_on_delivery"
                        ? "Collect Cash"
                        : "Awaiting UPI Confirm"}
                  </span>
                  <span className="font-bold text-gold text-base">
                    {formatINR(order.total)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openWhatsAppModal(order)}
                    className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-green-600/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 hover:border-green-500 hover:bg-green-500/20 active:scale-95 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                  {order.needsKitchenAck && (
                    <button
                      type="button"
                      onClick={() =>
                        runMutation(order.id, { clearKitchenAck: true })
                      }
                      className="flex min-h-[38px] items-center rounded-xl border border-flame-from/60 bg-flame-from/15 px-3 py-2 text-xs font-bold text-flame-from hover:bg-flame-from/25 active:scale-95 transition"
                    >
                      Ack New Items
                    </button>
                  )}
                  {order.paymentStatus !== "paid" && (
                    <button
                      type="button"
                      onClick={() => runMutation(order.id, { markPaid: true })}
                      className="flex min-h-[38px] items-center rounded-xl border border-line bg-bg-soft px-3 py-2 text-xs font-semibold text-muted hover:border-veg hover:text-veg active:scale-95 transition"
                    >
                      Mark Paid
                    </button>
                  )}
                  {next && (
                    <button
                      type="button"
                      onClick={() => runMutation(order.id, { status: next })}
                      className="flame-bg flex min-h-[38px] flex-1 items-center justify-center rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition hover:brightness-110"
                    >
                      Mark {LABEL[next]} →
                    </button>
                  )}
                  {order.status !== "cancelled" &&
                    order.status !== "served" && (
                      <button
                        type="button"
                        onClick={() =>
                          runMutation(order.id, { status: "cancelled" })
                        }
                        className="flex min-h-[38px] items-center rounded-xl border border-line bg-bg-soft px-3 py-2 text-xs font-medium text-muted hover:border-nonveg hover:text-nonveg active:scale-95 transition"
                      >
                        Cancel
                      </button>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
