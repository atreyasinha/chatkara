import { NextResponse } from "next/server";
import { RESTAURANT } from "@/lib/restaurant";
import { tableTokenValid } from "@/lib/table-tokens";

export const dynamic = "force-dynamic";

const verificationRateMap = new Map<string, number[]>();
const VERIFY_RATE_LIMIT = 20;
const VERIFY_RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = (verificationRateMap.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < VERIFY_RATE_WINDOW_MS,
  );
  attempts.push(now);
  verificationRateMap.set(ip, attempts);
  return attempts.length > VERIFY_RATE_LIMIT;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { valid: false, error: "Too many attempts — wait a moment and try again" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const tableNumber = Number(body?.tableNumber);
  if (
    !Number.isInteger(tableNumber) ||
    tableNumber < 1 ||
    tableNumber > RESTAURANT.tableCount ||
    typeof body?.token !== "string"
  ) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const valid = tableTokenValid(tableNumber, body.token);
  return NextResponse.json(
    { valid },
    {
      status: valid ? 200 : 403,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
