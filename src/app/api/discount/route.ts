import { NextResponse } from "next/server";
import { getPriorOrderCount } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** Simple in-memory sliding-window rate limiter — 10 req/min per IP. */
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rateMap.set(ip, hits);
  // Prune oldest entry to avoid unbounded memory growth and O(N) CPU exhaustion
  if (rateMap.size > 5000) {
    const oldestKey = rateMap.keys().next().value;
    if (oldestKey !== undefined) rateMap.delete(oldestKey);
  }
  return hits.length > RATE_LIMIT;
}

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests — please slow down" },
        { status: 429 },
      );
    }

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
