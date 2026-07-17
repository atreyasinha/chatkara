"use client";

import { useEffect, useState } from "react";
import {
  Smartphone,
  Banknote,
  RefreshCw,
  Home,
  AlertCircle,
  Calendar,
  Layers,
  BookOpen,
  DollarSign,
  FileText,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { formatINR } from "@/lib/restaurant";

interface LedgerOrder {
  id: string;
  tableNumber: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  createdAt: string;
  itemsSummary: string;
}

interface AnalyticsData {
  totalRevenue: number;
  upiRevenue: number;
  cashRevenue: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  tableBreakdown: Array<{ tableNumber: number; revenue: number }>;
  avgPrepTimeMinutes: number | null;
  orders: LedgerOrder[];
}

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsDashboard />
    </AdminGuard>
  );
}

function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAnalytics(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load analytics data.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, []);

  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg">
        <RefreshCw className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted">Compiling business ledger...</p>
      </div>
    );
  }

  // Pre-tax calculations (5% GST inclusive pricing)
  const gstPercent = 5;
  const grossSales = data?.totalRevenue || 0;
  const netSales = grossSales / (1 + gstPercent / 100);
  const estimatedGst = grossSales - netSales;
  const avgTicket =
    data && data.totalOrders > 0 ? grossSales / data.totalOrders : 0;

  return (
    <main className="relative min-h-dvh bg-bg pb-16 text-ink">
      {/* Ambient premium lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% -10%, rgba(212,175,55,0.15), transparent 50%), radial-gradient(circle at 10% 80%, rgba(185,28,28,0.06), transparent 45%)",
        }}
      />

      {/* Corporate Ledger Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg-soft text-gold transition hover:border-gold hover:text-gold-soft"
            >
              <Home className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wide text-gold md:text-xl">
                Business Ledger
              </h1>
              <p className="hidden text-xs uppercase tracking-widest text-muted/70 sm:block">
                ChatKara Owner&apos;s Review Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-full border border-line bg-bg-elevated px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-gold hover:text-gold active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh Reports
            </button>
            <Link
              href="/kitchen"
              className="rounded-full border border-line bg-bg-soft px-4 py-1.5 text-xs font-semibold text-gold-soft transition hover:border-gold hover:text-gold active:scale-[0.98]"
            >
              POS Screen
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="relative z-10 mx-auto mt-6 max-w-6xl px-4 md:mt-8 md:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-nonveg/30 bg-nonveg/10 p-4 text-sm text-nonveg animate-fade-up">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date / Report Description */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gold-soft">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              {todayDateStr}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <BookOpen className="h-4 w-4" />
            <span>Ledger generated in real-time</span>
          </div>
        </div>

        {data && (
          <div className="space-y-8">
            {/* Financial Statement Sheet (Gross / Net / Tax / Ticket) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up">
              {/* Gross Sales */}
              <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted block">
                  Gross Billings (Est)
                </span>
                <h3 className="font-display mt-3 text-3xl font-bold text-gold">
                  {formatINR(grossSales)}
                </h3>
                <p className="mt-2 text-xs text-muted border-t border-line/35 pt-2">
                  Total receipts inclusive of taxes.
                </p>
              </div>

              {/* Net Sales */}
              <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted block">
                  Net Earnings (Pre-Tax)
                </span>
                <h3 className="font-display mt-3 text-3xl font-bold text-ink">
                  {formatINR(netSales)}
                </h3>
                <p className="mt-2 text-xs text-muted border-t border-line/35 pt-2">
                  Base collections excluding tax.
                </p>
              </div>

              {/* Estimated GST */}
              <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted block">
                  Tax Liability (5% GST)
                </span>
                <h3 className="font-display mt-3 text-3xl font-bold text-neutral-300">
                  {formatINR(estimatedGst)}
                </h3>
                <p className="mt-2 text-xs text-muted border-t border-line/35 pt-2">
                  Estimated tax value to be parsed.
                </p>
              </div>

              {/* Average Ticket Size */}
              <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted block">
                  Avg Ticket Size
                </span>
                <h3 className="font-display mt-3 text-3xl font-bold text-orange-400">
                  {formatINR(avgTicket)}
                </h3>
                <p className="mt-2 text-xs text-muted border-t border-line/35 pt-2">
                  Average spend per customer invoice.
                </p>
              </div>
            </div>

            {/* Financial Performance Split & Table Summary Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Payment Methods Breakdown */}
              <div className="rounded-3xl border border-line bg-bg-elevated/30 p-6 backdrop-blur-sm lg:col-span-1">
                <div className="flex items-center gap-2 border-b border-line/45 pb-3 text-gold">
                  <DollarSign className="h-5 w-5" />
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                    Payment Ledgers
                  </h3>
                </div>
                <div className="mt-5 space-y-6">
                  {/* UPI */}
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted">
                        <Smartphone className="h-4 w-4 text-blue-400" />
                        UPI Digital
                      </span>
                      <span className="font-bold text-ink">
                        {formatINR(data.upiRevenue)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-blue-400"
                        style={{
                          width: `${
                            grossSales > 0
                              ? (data.upiRevenue / grossSales) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cash */}
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted">
                        <Banknote className="h-4 w-4 text-veg" />
                        Cash on Counter
                      </span>
                      <span className="font-bold text-ink">
                        {formatINR(data.cashRevenue)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-veg"
                        style={{
                          width: `${
                            grossSales > 0
                              ? (data.cashRevenue / grossSales) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-line/35 pt-4 text-center">
                    <span className="text-[10px] uppercase tracking-widest text-muted block">
                      Total Orders Logged
                    </span>
                    <span className="text-2xl font-semibold text-gold mt-1 block">
                      {data.totalOrders}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Revenue Splits */}
              <div className="rounded-3xl border border-line bg-bg-elevated/30 p-6 backdrop-blur-sm lg:col-span-2">
                <div className="flex items-center gap-2 border-b border-line/45 pb-3 text-gold">
                  <Layers className="h-5 w-5" />
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                    Sales Distribution by Source
                  </h3>
                </div>
                {data.tableBreakdown.length === 0 ? (
                  <p className="mt-8 text-center text-sm text-muted py-8">
                    No sales recorded across tables today.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {data.tableBreakdown
                      .sort((a, b) => a.tableNumber - b.tableNumber)
                      .map((tbl) => {
                        const isPickup = tbl.tableNumber === 0;
                        const percent =
                          grossSales > 0 ? (tbl.revenue / grossSales) * 100 : 0;
                        return (
                          <div
                            key={tbl.tableNumber}
                            className="rounded-2xl border border-line/45 bg-bg-soft/40 p-4 transition hover:border-gold/30"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-ink">
                                {isPickup
                                  ? "🛍️ Online Pickup"
                                  : `🪑 Table #${tbl.tableNumber}`}
                              </span>
                              <span className="text-xs text-muted">
                                {Math.round(percent)}% split
                              </span>
                            </div>
                            <h4 className="font-display mt-2 text-xl font-bold text-gold-soft">
                              {formatINR(tbl.revenue)}
                            </h4>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Product Movement Inventory List (Sorted Menu Items Sales) */}
            <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-line/45 pb-3 text-gold">
                <Utensils className="h-5 w-5" />
                <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                  Cuisine Movement Ledger
                </h3>
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Quantity of dishes sold and billing values generated.
              </p>

              {data.topItems.length === 0 ? (
                <p className="mt-8 text-center text-sm text-muted py-8">
                  No items sold yet today.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line/45 text-[10px] uppercase tracking-widest text-muted">
                        <th className="pb-3 font-semibold">Cuisine Item</th>
                        <th className="pb-3 text-center font-semibold">
                          Portions Sold
                        </th>
                        <th className="pb-3 text-right font-semibold">
                          Gross Billings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/35">
                      {data.topItems.map((item) => (
                        <tr key={item.name} className="hover:bg-bg-soft/20">
                          <td className="py-3.5 font-medium text-ink">
                            {item.name}
                          </td>
                          <td className="py-3.5 text-center font-semibold text-gold">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 text-right font-bold text-gold-soft">
                            {formatINR(item.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Daily Order Audit Ledger Table */}
            <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-line/45 pb-3 text-gold">
                <FileText className="h-5 w-5" />
                <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                  Today&apos;s Receipts Audit Ledger
                </h3>
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Daily list of guest checkouts for audit logs.
              </p>

              {data.orders.length === 0 ? (
                <p className="mt-8 text-center text-sm text-muted py-8">
                  No receipts recorded today.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-line/45 text-[10px] uppercase tracking-widest text-muted">
                        <th className="pb-3 font-semibold">Receipt Time</th>
                        <th className="pb-3 font-semibold">Source</th>
                        <th className="pb-3 font-semibold">Items Ledger</th>
                        <th className="pb-3 text-center font-semibold">
                          Method
                        </th>
                        <th className="pb-3 text-center font-semibold">
                          Fulfillment
                        </th>
                        <th className="pb-3 text-right font-semibold">
                          Bill Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/35">
                      {data.orders
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .map((order) => {
                          const timeStr = new Date(
                            order.createdAt,
                          ).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-bg-soft/20 text-xs transition"
                            >
                              <td className="py-3.5 text-muted font-medium">
                                {timeStr}
                              </td>
                              <td className="py-3.5 font-semibold text-ink">
                                {order.tableNumber === 0
                                  ? "🛍️ Pickup"
                                  : `🪑 Table #${order.tableNumber}`}
                              </td>
                              <td className="py-3.5 max-w-[280px] truncate text-muted text-[11px]">
                                {order.itemsSummary}
                              </td>
                              <td className="py-3.5 text-center">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                                    order.paymentMethod === "upi"
                                      ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                                      : "bg-veg/10 text-veg ring-1 ring-veg/20"
                                  }`}
                                >
                                  {order.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                                    order.status === "served" ||
                                    order.status === "ready"
                                      ? "bg-gold/10 text-gold ring-1 ring-gold/20"
                                      : order.status === "cancelled"
                                        ? "bg-nonveg/10 text-nonveg ring-1 ring-nonveg/20"
                                        : "bg-neutral-800 text-neutral-400"
                                  }`}
                                >
                                  {order.status === "served"
                                    ? order.tableNumber === 0
                                      ? "picked up"
                                      : "served"
                                    : order.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right font-bold text-gold-soft text-sm">
                                {formatINR(order.total)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
