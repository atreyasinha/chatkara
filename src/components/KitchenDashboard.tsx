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

function playChime() {
  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
        .webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
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
        const res = await fetch("/api/orders", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as { orders?: Order[] };
          if (data.orders && isMounted) {
            const newOrders = data.orders;

            if (seenOrderIds.current.size > 0) {
              for (const order of newOrders) {
                if (
                  !seenOrderIds.current.has(order.id) &&
                  order.status === "pending"
                ) {
                  playChime();
                  break;
                }
                if (
                  order.needsKitchenAck &&
                  !seenAckIds.current.has(`${order.id}:${order.updatedAt}`)
                ) {
                  playChime();
                  seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
                }
              }
            }

            for (const order of newOrders) {
              seenOrderIds.current.add(order.id);
              if (order.needsKitchenAck) {
                seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
              }
            }

            setOrders(newOrders);
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn("HTTP kitchen orders fetch failed:", err);
      }
    }

    async function subscribe() {
      await fetchKitchenOrdersApi();

      try {
        const { getClientDb } = await import("@/lib/firebase-client");
        const { collection, onSnapshot, query, orderBy } = await import(
          "firebase/firestore"
        );

        const db = await getClientDb();
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

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
              for (const order of newOrders) {
                if (
                  !seenOrderIds.current.has(order.id) &&
                  order.status === "pending"
                ) {
                  playChime();
                  break;
                }
                if (
                  order.needsKitchenAck &&
                  !seenAckIds.current.has(`${order.id}:${order.updatedAt}`)
                ) {
                  playChime();
                  seenAckIds.current.add(`${order.id}:${order.updatedAt}`);
                }
              }
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

    const interval = setInterval(fetchKitchenOrdersApi, 5000);

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
    <div className="mx-auto min-h-dvh max-w-6xl px-4 py-6">
      {/* WhatsApp phone modal */}
      {whatsappOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-bg-elevated p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-gold">Send Bill via WhatsApp</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setWhatsappOrder(null)}
                className="rounded-full p-1.5 text-muted hover:bg-bg-soft"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label htmlFor="whatsapp-phone" className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
              Customer phone number
            </label>
            <input
              id="whatsapp-phone"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-gold"
              autoFocus
            />
            <button
              type="button"
              disabled={whatsappPhone.replace(/\D/g, "").length < 10}
              onClick={submitWhatsApp}
              className="mt-3 w-full rounded-xl border border-green-600/30 bg-green-500/10 py-2.5 text-sm font-semibold text-green-400 hover:bg-green-500/20 disabled:opacity-40"
            >
              Send on WhatsApp
            </button>
          </div>
        </div>
      )}
      {!online && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-flame-from/40 bg-flame-from/10 px-3 py-2 text-sm text-flame-from">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            You&apos;re offline. Status updates are queued
            {queued > 0 ? ` (${queued} waiting)` : ""} and will sync when
            reconnecting.
          </span>
        </div>
      )}

      {online && queued > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/40 bg-gold-dim px-3 py-2 text-sm text-gold">
          <span>{queued} queued update{queued === 1 ? "" : "s"} waiting to sync</span>
          <button
            type="button"
            className="rounded-full border border-gold/50 px-3 py-1 text-xs font-semibold"
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
            Sync now
          </button>
        </div>
      )}

      {toast && (
        <div className="mb-4 rounded-xl border border-line bg-bg-elevated px-3 py-2 text-sm text-muted">
          {toast}
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandMark size="md" href="/" />
          <div>
            <h1 className="font-display text-2xl text-gold">Kitchen POS</h1>
            <p className="text-sm text-muted">Live orders · auto-refreshes</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {newCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full flame-bg px-3 py-1 text-xs font-semibold text-white animate-pulse-soft">
              <Bell className="h-3.5 w-3.5" />
              {newCount} need attention
            </span>
          )}
          {!audioUnlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-[11px] font-medium text-yellow-500 animate-pulse-soft">
              Click screen to enable alert sound
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-400">
              Audio alerts active
            </span>
          )}
          <Link
            href="/admin/qr"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Table QR codes
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-gold hover:text-gold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        {(["active", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === f
                ? "bg-gold text-bg font-semibold"
                : "border border-line text-muted"
            }`}
          >
            {f === "active" ? "Active" : "All orders"}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <p className="py-20 text-center text-muted animate-pulse-soft">
          Loading orders…
        </p>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-20 text-center">
          <p className="font-display text-2xl text-gold">No active orders</p>
          <p className="mt-2 text-sm text-muted">
            New orders from table QR scans will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((order) => {
            const next = NEXT[order.status];
            return (
              <article
                key={order.id}
                className={`rounded-2xl border bg-bg-elevated p-4 ${
                  order.status === "pending" || order.needsKitchenAck
                    ? "border-flame-from/60 shadow-lg shadow-flame-from/10"
                    : "border-line"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl text-gold">
                      {order.tableNumber === 0
                        ? "Pickup"
                        : `Table ${order.tableNumber}`}
                    </p>
                    <p className="text-xs text-muted">
                      #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {order.customerName && (
                      <p className="text-xs text-muted">{order.customerName}</p>
                    )}
                    {order.needsKitchenAck && (
                      <p className="mt-1 text-xs font-semibold text-flame-from">
                        New items added — review ticket
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      order.status === "pending"
                        ? "flame-bg text-white"
                        : order.status === "ready"
                          ? "bg-veg/20 text-veg"
                          : "bg-gold-dim text-gold"
                    }`}
                  >
                    {LABEL[order.status]}
                  </span>
                </div>

                <ul className="mb-3 space-y-1.5 border-b border-line pb-3">
                  {order.items.map((item) => (
                    <li
                      key={`${item.itemId}-${item.notes || ""}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <VegBadge veg={item.veg} />
                      <span className="font-semibold text-gold">
                        {item.quantity}×
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="mb-2 rounded-lg bg-bg-soft px-2 py-1.5 text-xs text-muted">
                    Note: {order.notes}
                  </p>
                )}

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {order.paymentMethod === "upi" ? "UPI" : "Cash"} ·{" "}
                    {order.paymentStatus === "paid"
                      ? "Paid"
                      : order.paymentStatus === "cash_on_delivery"
                        ? "Collect cash"
                        : "Awaiting UPI confirm"}
                  </span>
                  <span className="font-semibold text-gold">
                    {formatINR(order.total)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openWhatsAppModal(order)}
                    className="flex items-center gap-1 rounded-lg border border-green-600/30 bg-green-500/10 px-2.5 py-1.5 text-xs text-green-400 hover:border-green-500 hover:bg-green-500/20"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp Bill
                  </button>
                  {order.needsKitchenAck && (
                    <button
                      type="button"
                      onClick={() =>
                        runMutation(order.id, { clearKitchenAck: true })
                      }
                      className="rounded-lg border border-flame-from/50 px-3 py-1.5 text-xs text-flame-from hover:bg-flame-from/10"
                    >
                      Ack new items
                    </button>
                  )}
                  {order.paymentStatus !== "paid" && (
                    <button
                      type="button"
                      onClick={() => runMutation(order.id, { markPaid: true })}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-veg hover:text-veg"
                    >
                      Mark paid
                    </button>
                  )}
                  {next && (
                    <button
                      type="button"
                      onClick={() => runMutation(order.id, { status: next })}
                      className="flame-bg flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Mark {LABEL[next].toLowerCase()}
                    </button>
                  )}
                  {order.status !== "cancelled" &&
                    order.status !== "served" && (
                      <button
                        type="button"
                        onClick={() =>
                          runMutation(order.id, { status: "cancelled" })
                        }
                        className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-nonveg hover:text-nonveg"
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
