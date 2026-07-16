"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { VegBadge } from "@/components/VegBadge";
import { formatINR } from "@/lib/restaurant";
import type { Order, OrderStatus } from "@/lib/types";
import { Bell, RefreshCw } from "lucide-react";

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

export function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  async function setStatus(id: string, status: OrderStatus) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function markPaid(id: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markPaid: true }),
    });
    load();
  }

  const visible = orders.filter((o) =>
    filter === "all" ? true : !["served", "cancelled"].includes(o.status),
  );

  const newCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 py-6">
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
              {newCount} new
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
            onClick={load}
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
              filter === f ? "bg-gold text-bg font-semibold" : "border border-line text-muted"
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
                  order.status === "pending"
                    ? "border-flame-from/60 shadow-lg shadow-flame-from/10"
                    : "border-line"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl text-gold">
                      Table {order.tableNumber}
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
                      key={item.itemId}
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
                        : "Unpaid"}
                  </span>
                  <span className="font-semibold text-gold">
                    {formatINR(order.total)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.paymentStatus !== "paid" && (
                    <button
                      type="button"
                      onClick={() => markPaid(order.id)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-veg hover:text-veg"
                    >
                      Mark paid
                    </button>
                  )}
                  {next && (
                    <button
                      type="button"
                      onClick={() => setStatus(order.id, next)}
                      className="flame-bg flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Mark {LABEL[next].toLowerCase()}
                    </button>
                  )}
                  {order.status !== "cancelled" &&
                    order.status !== "served" && (
                      <button
                        type="button"
                        onClick={() => setStatus(order.id, "cancelled")}
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
