"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LogoutButton } from "@/components/AdminGuard";
import { usePrintSlip } from "@/components/PrintSlip";
import { VegBadge } from "@/components/VegBadge";
import { formatINR } from "@/lib/restaurant";
import { isOrderFromTodayIST, todayLabelIST } from "@/lib/waiter-day";
import type { Order, OrderStatus } from "@/lib/types";
import { ChefHat, Plus, Printer, RefreshCw } from "lucide-react";

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
  const { print, slip } = usePrintSlip();

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

  const { takings, dueCount } = useMemo(() => {
    let takings = 0;
    let dueCount = 0;
    for (const o of todaysOrders) {
      if (o.status === "cancelled") continue;
      takings += o.total;
      if (o.paymentStatus !== "paid") dueCount++;
    }
    return { takings, dueCount };
  }, [todaysOrders]);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-4 lg:max-w-7xl lg:px-6 lg:pb-10 lg:pt-6">
      {slip}
      <header className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" href="/" />
          <div>
            <h1 className="font-display text-2xl text-gold">Waiter</h1>
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
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-gold hover:text-gold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/admin/waiter/new"
            className="flame-bg hidden items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 lg:inline-flex"
          >
            <Plus className="h-4 w-4" />
            New order
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between text-sm lg:hidden">
        <p className="text-muted">
          {todaysOrders.length} order{todaysOrders.length === 1 ? "" : "s"} today
          {activeCount > 0 ? (
            <span className="text-gold font-semibold"> · {activeCount} active</span>
          ) : null}
        </p>
      </div>

      <dl className="mb-6 hidden grid-cols-4 gap-3 lg:grid">
        <Stat label="Orders today" value={String(todaysOrders.length)} />
        <Stat label="Active" value={String(activeCount)} />
        <Stat label="Payment due" value={String(dueCount)} />
        <Stat label="Takings" value={formatINR(takings)} />
      </dl>

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
            Tap New order to log a table or pickup order.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0 xl:grid-cols-3">
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

              <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-3 text-sm">
                <span className="font-semibold text-gold">
                  {formatINR(order.total)}
                </span>
                <span className="text-xs text-muted">
                  {order.paymentMethod === "upi" ? "UPI" : "Cash"}
                  {order.paymentStatus === "paid" ? " · Paid" : ""}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => print(order, "bill")}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:border-gold hover:text-gold"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print bill
                </button>
                <button
                  type="button"
                  onClick={() => print(order, "kot")}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:border-gold hover:text-gold"
                >
                  <ChefHat className="h-3.5 w-3.5" />
                  Print KOT
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-4 lg:hidden">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-elevated/80 px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl text-gold">{value}</dd>
    </div>
  );
}
