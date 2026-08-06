import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  adminPasswordConfigured,
  createAdminSessionToken,
} from "@/lib/admin-auth";

/** In-memory per-IP login throttle. */
const loginAttempts = new Map<string, number[]>();

export async function POST(request: Request) {
  try {
    // Throttle brute-force attempts — 5 tries/min per IP.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const now = Date.now();
    const hits = (loginAttempts.get(ip) ?? []).filter((t) => now - t < 60_000);
    if (hits.length >= 5) {
      return NextResponse.json(
        { success: false, error: "Too many attempts — wait a minute" },
        { status: 429 },
      );
    }
    hits.push(now);
    loginAttempts.set(ip, hits);
    if (loginAttempts.size > 5000) loginAttempts.clear();

    if (!adminPasswordConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "ADMIN_PASSWORD is not configured on the server",
        },
        { status: 503 },
      );
    }

    const { password } = await request.json();
    const correctAdminPassword = process.env.ADMIN_PASSWORD;
    const correctWaiterPassword = process.env.WAITER_PASSWORD;

    let isPasswordValid = false;
    if (typeof password === "string") {
      if (correctAdminPassword) {
        const a = createHash("sha256").update(password).digest();
        const b = createHash("sha256").update(correctAdminPassword).digest();
        if (timingSafeEqual(a, b)) isPasswordValid = true;
      }
      if (!isPasswordValid && correctWaiterPassword) {
        const a = createHash("sha256").update(password).digest();
        const b = createHash("sha256").update(correctWaiterPassword).digest();
        if (timingSafeEqual(a, b)) isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Could not create session" },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminCookieOptions(0),
    maxAge: 0,
  });
  return res;
}
