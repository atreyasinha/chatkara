"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { VegBadge } from "@/components/VegBadge";
import { formatINR } from "@/lib/restaurant";
import { shareReceiptOnWhatsApp } from "@/lib/receipt";
import { isOrderFromTodayIST, todayLabelIST } from "@/lib/waiter-day";
import type { Order, OrderStatus } from "@/lib/types";
import { HelpCircle, MessageSquare, Plus, RefreshCw } from "lucide-react";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  preparing: "Cooking",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

export function WaiterDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`/api/orders?since=${encodeURIComponent(since)}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        // Session expired mid-shift — bounce to the AdminGuard login.
        window.location.reload();
        return;
      }
      if (!res.ok) throw new Error("Could not load orders");
      const data = (await res.json()) as { orders?: Order[] };
      setOrders(data.orders ?? []);
      setError("");
    } catch {
      setError("Failed to load today’s orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 15_000);

    function handleSync() {
      if (document.visibilityState === "visible" || navigator.onLine) {
        void load();
      }
    }

    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("online", handleSync);

    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("online", handleSync);
    };
  }, [load]);

  const todaysOrders = useMemo(
    () => orders.filter((o) => isOrderFromTodayIST(o.createdAt)),
    [orders],
  );

  const activeCount = todaysOrders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled",
  ).length;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-4">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" href="/" />
          <div>
            <h1 className="font-display text-2xl text-gold">Waiter</h1>
            <p className="text-xs text-muted">
              Today · {todayLabelIST()} · place orders until table QR codes are ready
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-gold hover:text-gold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {/* Beginner-friendly quick guide banner */}
      <div className="mb-5 rounded-2xl border border-gold/30 bg-gold/5 p-3.5 text-xs">
        <div className="flex items-center justify-between text-gold font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" /> Quick Waiter Guide
          </span>
          <span className="text-[10px] text-gold/70 uppercase tracking-wider font-mono">Simple Steps</span>
        </div>
        <p className="text-muted leading-relaxed">
          1. Tap <strong className="text-ink">+ New order</strong> below &nbsp;→&nbsp; 
          2. Choose <strong className="text-ink">Table #</strong> &nbsp;→&nbsp; 
          3. Tap dishes &nbsp;→&nbsp; 
          4. Submit Order!
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="text-muted">
          {todaysOrders.length} order{todaysOrders.length === 1 ? "" : "s"} today
          {activeCount > 0 ? (
            <span className="text-gold font-semibold"> · {activeCount} active</span>
          ) : null}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-nonveg/40 bg-nonveg/10 px-3 py-2 text-sm text-nonveg">
          {error}
        </p>
      )}

      {loading && todaysOrders.length === 0 ? (
        <p className="py-20 text-center text-muted animate-pulse-soft">
          Loading today’s orders…
        </p>
      ) : todaysOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-16 text-center">
          <p className="font-display text-2xl text-gold">No orders yet today</p>
          <p className="mt-2 px-6 text-sm text-muted">
            Tap New order to take a table or pickup order for the kitchen.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todaysOrders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-line bg-bg-elevated/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-gold">
                    {order.tableNumber === 0
                      ? "Pickup"
                      : `Table ${order.tableNumber}`}
                  </p>
                  <p className="text-xs text-muted">
                    #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {order.customerName ? ` · ${order.customerName}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    order.status === "ready"
                      ? "bg-veg/15 text-veg"
                      : order.status === "cancelled"
                        ? "bg-nonveg/15 text-nonveg"
                        : order.status === "served"
                          ? "border border-line text-muted"
                          : "bg-gold/15 text-gold"
                  }`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 border-t border-line/50 pt-3">
                {order.items.map((item, idx) => (
                  <li
                    key={`${order.id}-${item.itemId}-${idx}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <VegBadge veg={item.veg} />
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-muted">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-3">
                <div className="text-sm">
                  <span className="font-semibold text-gold">
                    {formatINR(order.total)}
                  </span>
                  <span className="ml-2 text-xs text-muted">
                    {order.paymentMethod === "upi" ? "UPI" : "Cash"}
                    {order.paymentStatus === "paid"
                      ? " · Paid"
                      : order.paymentStatus === "cash_on_delivery"
                        ? " · Due"
                        : " · Pending"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    shareReceiptOnWhatsApp(order, order.customerPhone)
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted hover:border-gold hover:text-gold"
                >
                  <MessageSquare className="h-3 w-3" />
                  Bill
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-4">
        <Link
          href="/admin/waiter/new"
          className="flame-bg flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-white shadow-lg shadow-black/40 transition hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
          New order
        </Link>
      </div>
    </div>
  );
}
