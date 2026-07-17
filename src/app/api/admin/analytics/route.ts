import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";

export async function GET() {
  try {
    const orders = await listOrders();

    // Filter for orders created today (local system date)
    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === todayStr,
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

      if (["pending", "confirmed", "cooking", "ready"].includes(order.status)) {
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
