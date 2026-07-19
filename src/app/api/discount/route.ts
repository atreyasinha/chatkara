import { NextResponse } from "next/server";
import { getPriorOrderCount } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone || phone.trim().length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      );
    }

    const count = await getPriorOrderCount(phone);
    let discountPercent = 0;
    let message = "";

    if (count === 0) {
      message = "First time ordering? Get 10% off your next order!";
    } else if (count === 1) {
      discountPercent = 10;
      message = "Welcome back! 10% discount applied automatically.";
    } else {
      message = "Welcome back to ChatKara!";
    }

    return NextResponse.json({
      phone: phone.trim(),
      orderCount: count,
      discountPercent,
      message,
    });
  } catch (error) {
    console.error("Error in discount check API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
