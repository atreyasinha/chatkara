import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";
import { isActiveOrderStatus } from "@/lib/sanitize-order-items";
import { isAdminRequest, unauthorizedJson } from "@/lib/admin-auth";

/** Start of the current calendar day in Asia/Kolkata, as a UTC instant. */
function startOfTodayIST(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  // IST midnight = 18:30 UTC of the previous calendar day
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 0, 0, 0) - 5.5 * 60 * 60 * 1000);
}

/** Year/month in Asia/Kolkata for monthly breakdowns. */
function istYearMonth(date: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value) - 1,
  };
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedJson();
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "daily";

    const now = new Date();
    const todayStartIST = startOfTodayIST(now);
    let startLimit: Date;

    if (timeframe === "daily") {
      startLimit = todayStartIST;
    } else if (timeframe === "weekly") {
      startLimit = new Date(todayStartIST.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "monthly") {
      startLimit = new Date(todayStartIST.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "yearly") {
      startLimit = new Date(todayStartIST.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid timeframe parameter" },
        { status: 400 },
      );
    }

    // Determine query boundaries
    const currentYearIST = istYearMonth(now).year;
    const startOfCurrentYear = new Date(Date.UTC(currentYearIST, 0, 1, 0, 0, 0) - 5.5 * 60 * 60 * 1000);
    const querySince = new Date(Math.min(startLimit.getTime(), startOfCurrentYear.getTime()));
    const orders = await listOrders(querySince);

    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).getTime() >= startLimit.getTime(),
    );

    let totalRevenue = 0;
    let upiRevenue = 0;
    let cashRevenue = 0;
    let activeOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    const itemQuantities: Record<string, { count: number; revenue: number }> =
      {};
    const tableRevenue: Record<number, number> = {};

    let totalPrepTimeMs = 0;
    let prepTimeCount = 0;

    todayOrders.forEach((order) => {
      const orderTotal = order.total || 0;

      if (order.status === "cancelled") {
        cancelledOrders++;
        return; // Exclude cancelled orders from revenue and item sales
      }

      if (isActiveOrderStatus(order.status)) {
        activeOrders++;
      } else if (order.status === "served") {
        completedOrders++;
      }

      // Revenue aggregate
      totalRevenue += orderTotal;
      if (order.paymentMethod === "upi") {
        upiRevenue += orderTotal;
      } else if (order.paymentMethod === "cash") {
        cashRevenue += orderTotal;
      }

      // Table split
      tableRevenue[order.tableNumber] =
        (tableRevenue[order.tableNumber] || 0) + orderTotal;

      // Item counts
      (order.items || []).forEach((item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        if (!itemQuantities[item.name]) {
          itemQuantities[item.name] = { count: 0, revenue: 0 };
        }
        itemQuantities[item.name].count += item.quantity || 0;
        itemQuantities[item.name].revenue += itemTotal;
      });

      // Fulfillment speed calculation
      if (
        order.completedAt &&
        order.status === "served"
      ) {
        const start = new Date(order.createdAt).getTime();
        const end = new Date(order.completedAt).getTime();
        const duration = end - start;
        if (duration > 0) {
          totalPrepTimeMs += duration;
          prepTimeCount++;
        }
      }
    });

    // Format top items
    const topItems = Object.entries(itemQuantities)
      .map(([name, data]) => ({
        name,
        quantity: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Format table breakdown
    const tableBreakdown = Object.entries(tableRevenue).map(([tbl, rev]) => ({
      tableNumber: Number(tbl),
      revenue: rev,
    }));

    const avgPrepTimeMinutes =
      prepTimeCount > 0
        ? Math.round((totalPrepTimeMs / prepTimeCount / 60000) * 10) / 10
        : null;

    // Calculate monthly breakdown for the current IST year
    const currentYear = istYearMonth(now).year;
    const monthlyRevenue: Record<number, number> = {};
    for (let m = 0; m < 12; m++) {
      monthlyRevenue[m] = 0;
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const { year, month } = istYearMonth(d);
      if (year === currentYear && o.status !== "cancelled") {
        monthlyRevenue[month] += o.total || 0;
      }
    });

    const monthlyBreakdown = Object.entries(monthlyRevenue)
      .map(([m, rev]) => ({
        month: Number(m),
        revenue: rev,
      }))
      .sort((a, b) => a.month - b.month);

    const todayOrdersFormatted = todayOrders.map((o) => ({
      id: o.id,
      tableNumber: o.tableNumber,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      itemsSummary: (o.items || []).map((i) => `${i.name} (${i.quantity})`).join(", "),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        upiRevenue,
        cashRevenue,
        totalOrders: todayOrders.length,
        billableOrders: todayOrders.length - cancelledOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        topItems,
        tableBreakdown,
        avgPrepTimeMinutes,
        orders: todayOrdersFormatted,
        monthlyBreakdown,
      },
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate analytics data" },
      { status: 500 },
    );
  }
}
