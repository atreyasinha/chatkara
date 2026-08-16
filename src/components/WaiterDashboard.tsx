"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { AdminGuard, LogoutButton } from "@/components/AdminGuard";
import { VegBadge } from "@/components/VegBadge";
import { formatINR } from "@/lib/restaurant";
import { isOrderFromTodayIST, todayLabelIST } from "@/lib/waiter-day";
import type { Order, OrderStatus } from "@/lib/types";
import { Plus, RefreshCw } from "lucide-react";

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
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-safe-dock pt-safe">
      <header className="mb-6 flex items-center justify-between gap-3 border-b border-line/40 pb-4">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" href="/" />
          <div>
            <h1 className="font-display text-2xl font-bold text-gold">Waiter POS</h1>
            <p className="text-xs text-muted">
              Today · {todayLabelIST()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line bg-bg-soft px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold active:scale-95 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-gold" : ""}`} />
            Refresh
          </button>
          <LogoutButton />
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="text-muted text-xs font-medium">
          {todaysOrders.length} order{todaysOrders.length === 1 ? "" : "s"} logged today
          {activeCount > 0 ? (
            <span className="text-gold font-bold"> · {activeCount} active in kitchen</span>
          ) : null}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl border border-nonveg/40 bg-nonveg/10 px-4 py-3 text-sm text-nonveg font-semibold animate-fade-up">
          {error}
        </p>
      )}

      {loading && todaysOrders.length === 0 ? (
        <p className="py-20 text-center text-muted animate-pulse-soft text-sm">
          Loading today’s orders…
        </p>
      ) : todaysOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line/60 bg-bg-elevated/40 py-16 text-center animate-fade-up">
          <p className="font-display text-2xl font-bold text-gold">No orders yet today</p>
          <p className="mt-2 px-6 text-xs text-muted leading-relaxed">
            Tap “New Order” below to log a dine-in table or takeaway order.
          </p>
        </div>
      ) : (
        <ul className="space-y-3.5">
          {todaysOrders.map((order) => (
            <li
              key={order.id}
              className={`rounded-2xl border p-4 transition shadow-sm ${
                order.status === "ready"
                  ? "border-veg/50 bg-veg/5 shadow-veg/5"
                  : order.status === "preparing"
                    ? "border-gold/50 bg-gold/5"
                    : "border-line bg-bg-elevated/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-gold">
                    {order.tableNumber === 0
                      ? "🛍️ Pickup / Counter"
                      : `🪑 Table ${order.tableNumber}`}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
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
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    order.status === "ready"
                      ? "bg-veg/20 text-veg ring-1 ring-veg/40"
                      : order.status === "cancelled"
                        ? "bg-nonveg/20 text-nonveg ring-1 ring-nonveg/40"
                        : order.status === "served"
                          ? "border border-line bg-bg-soft text-muted"
                          : "bg-gold/20 text-gold ring-1 ring-gold/40"
                  }`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 border-t border-line/40 pt-3">
                {order.items.map((item, idx) => (
                  <li
                    key={`${order.id}-${item.itemId}-${idx}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <VegBadge veg={item.veg} />
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-3 text-sm">
                <span className="font-bold text-gold text-base">
                  {formatINR(order.total)}
                </span>
                <span className="text-xs font-medium text-muted">
                  {order.paymentMethod === "upi" ? "UPI Digital" : "Cash on Table"}
                  {order.paymentStatus === "paid" ? " · ✓ Paid" : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-safe pointer-events-none">
        <Link
          href="/admin/waiter/new"
          className="pointer-events-auto flame-bg flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-base font-bold text-white shadow-xl shadow-black/60 transition hover:brightness-110 active:scale-[0.98] animate-fade-up"
        >
          <Plus className="h-5 w-5" />
          New Order (+ Takeaway / Table)
        </Link>
      </div>
    </div>
  );
}
