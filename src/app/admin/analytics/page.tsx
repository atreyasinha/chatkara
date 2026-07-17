"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Smartphone,
  Banknote,
  Clock,
  Utensils,
  RefreshCw,
  Home,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { formatINR } from "@/lib/restaurant";

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
        <p className="mt-4 text-sm text-muted">Analyzing sales data...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-dvh bg-bg pb-12 text-ink">
      {/* Ambient backgrounds */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(212,175,55,0.12), transparent 45%), radial-gradient(circle at 90% 70%, rgba(185,28,28,0.15), transparent 45%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg-soft text-gold transition hover:border-gold hover:text-gold-soft"
            >
              <Home className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold text-gold md:text-xl">
                Analytics Dashboard
              </h1>
              <p className="hidden text-xs text-muted sm:block">
                ChatKara Operations Control Panel
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
              Sync
            </button>
            <Link
              href="/kitchen"
              className="flame-bg rounded-full px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              POS View
            </Link>
          </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="relative z-10 mx-auto mt-6 max-w-6xl px-4 md:mt-8 md:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-nonveg/30 bg-nonveg/10 p-4 text-sm text-nonveg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date Selector Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gold-soft">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              {todayDateStr}
            </span>
          </div>
          <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold ring-1 ring-gold/25">
            Today&apos;s Activity
          </span>
        </div>

        {data && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Revenue */}
              <div className="rounded-3xl border border-line bg-bg-elevated/45 p-6 backdrop-blur-sm shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Total Sales
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-display mt-4 text-3xl font-bold text-gold">
                  {formatINR(data.totalRevenue)}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  From {data.totalOrders} total orders today
                </p>
              </div>

              {/* UPI Split */}
              <div className="rounded-3xl border border-line bg-bg-elevated/45 p-6 backdrop-blur-sm shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    UPI Revenue
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <Smartphone className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-display mt-4 text-3xl font-bold text-blue-400">
                  {formatINR(data.upiRevenue)}
                </h3>
                <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-800">
                  <div
                    className="h-1.5 rounded-full bg-blue-400"
                    style={{
                      width: `${
                        data.totalRevenue > 0
                          ? (data.upiRevenue / data.totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted">
                  {data.totalRevenue > 0
                    ? Math.round((data.upiRevenue / data.totalRevenue) * 100)
                    : 0}
                  % of today&apos;s total revenue
                </p>
              </div>

              {/* Cash Split */}
              <div className="rounded-3xl border border-line bg-bg-elevated/45 p-6 backdrop-blur-sm shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Cash Revenue
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-veg/10 text-veg">
                    <Banknote className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-display mt-4 text-3xl font-bold text-veg">
                  {formatINR(data.cashRevenue)}
                </h3>
                <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-800">
                  <div
                    className="h-1.5 rounded-full bg-veg"
                    style={{
                      width: `${
                        data.totalRevenue > 0
                          ? (data.cashRevenue / data.totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted">
                  {data.totalRevenue > 0
                    ? Math.round((data.cashRevenue / data.totalRevenue) * 100)
                    : 0}
                  % collected in cash
                </p>
              </div>

              {/* Avg Prep Time */}
              <div className="rounded-3xl border border-line bg-bg-elevated/45 p-6 backdrop-blur-sm shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Avg Prep Time
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-display mt-4 text-3xl font-bold text-orange-400">
                  {data.avgPrepTimeMinutes !== null
                    ? `${data.avgPrepTimeMinutes}m`
                    : "N/A"}
                </h3>
                <p className="mt-1.5 text-xs text-muted">
                  Order creation to service completion
                </p>
              </div>
            </div>

            {/* Orders Status Sub-breakdown */}
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-3xl border border-line bg-bg-elevated/25 p-4 backdrop-blur-sm text-center">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted block">
                  Active
                </span>
                <span className="text-xl font-bold text-ink mt-1 block">
                  {data.activeOrders}
                </span>
              </div>
              <div className="border-x border-line">
                <span className="text-[10px] uppercase tracking-widest text-muted block">
                  Completed
                </span>
                <span className="text-xl font-bold text-veg mt-1 block">
                  {data.completedOrders}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted block">
                  Cancelled
                </span>
                <span className="text-xl font-bold text-nonveg mt-1 block">
                  {data.cancelledOrders}
                </span>
              </div>
            </div>

            {/* Detailed Charts Sections */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Left Box: Top Dishes */}
              <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-gold">
                  <Utensils className="h-5 w-5" />
                  <h3 className="font-display text-lg font-semibold">
                    Top Selling Dishes
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted">
                  The most frequently ordered menu items today.
                </p>

                {data.topItems.length === 0 ? (
                  <p className="mt-8 text-center text-sm text-muted py-12">
                    No items sold yet today.
                  </p>
                ) : (
                  <div className="mt-6 space-y-5">
                    {data.topItems.map((item, idx) => {
                      // Find max count to scale visual bars
                      const maxCount = Math.max(
                        ...data.topItems.map((ti) => ti.quantity),
                      );
                      const barPercent = (item.quantity / maxCount) * 100;

                      return (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-ink">
                              {idx + 1}. {item.name}
                            </span>
                            <span className="font-semibold text-gold">
                              {item.quantity} portions (
                              {formatINR(item.revenue)})
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-neutral-800">
                            <div
                              className="flame-bg h-2 rounded-full"
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Box: Sales by Table */}
              <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-gold">
                  <Layers className="h-5 w-5" />
                  <h3 className="font-display text-lg font-semibold">
                    Sales by Table
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Revenue contribution split by physical tables.
                </p>

                {data.tableBreakdown.length === 0 ? (
                  <p className="mt-8 text-center text-sm text-muted py-12">
                    No table sales logged today.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {/* Sort table breakdown sequentially by table number */}
                    {data.tableBreakdown
                      .sort((a, b) => a.tableNumber - b.tableNumber)
                      .map((tbl) => {
                        const isPickup = tbl.tableNumber === 0;
                        return (
                          <div
                            key={tbl.tableNumber}
                            className="flex items-center justify-between border-b border-line/35 pb-2.5 last:border-0 last:pb-0"
                          >
                            <span className="text-sm font-medium text-ink">
                              {isPickup
                                ? "🛍️ Online Pickup Orders"
                                : `🪑 Table #${tbl.tableNumber}`}
                            </span>
                            <span className="text-sm font-bold text-gold-soft">
                              {formatINR(tbl.revenue)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
