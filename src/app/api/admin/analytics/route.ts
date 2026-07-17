import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";
import { isActiveOrderStatus } from "@/lib/sanitize-order-items";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "daily";

    const orders = await listOrders();

    const now = new Date();
    const startLimit = new Date();

    if (timeframe === "daily") {
      startLimit.setHours(0, 0, 0, 0);
    } else if (timeframe === "weekly") {
      startLimit.setDate(now.getDate() - 7);
      startLimit.setHours(0, 0, 0, 0);
    } else if (timeframe === "monthly") {
      startLimit.setDate(now.getDate() - 30);
      startLimit.setHours(0, 0, 0, 0);
    } else if (timeframe === "yearly") {
      startLimit.setDate(now.getDate() - 365);
      startLimit.setHours(0, 0, 0, 0);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid timeframe parameter" },
        { status: 400 },
      );
    }

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

    // Calculate monthly breakdown for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue: Record<number, number> = {};
    for (let m = 0; m < 12; m++) {
      monthlyRevenue[m] = 0;
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === currentYear && o.status !== "cancelled") {
        const m = d.getMonth();
        monthlyRevenue[m] += o.total || 0;
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
