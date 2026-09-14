import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  adminPasswordConfigured,
  createAdminSessionToken,
} from "@/lib/admin-auth";

const loginRateMap = new Map<string, number[]>();
const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 60_000;

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (loginRateMap.get(ip) ?? []).filter(
    (t) => now - t < LOGIN_RATE_WINDOW_MS,
  );
  hits.push(now);
  loginRateMap.set(ip, hits);
  return hits.length > LOGIN_RATE_LIMIT;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (isLoginRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many attempts — try again in a minute" },
        { status: 429 },
      );
    }

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
    const correctPassword = process.env.ADMIN_PASSWORD!;

    let isPasswordValid = false;
    if (typeof password === "string") {
      const a = createHash("sha256").update(password).digest();
      const b = createHash("sha256").update(correctPassword).digest();
      isPasswordValid = timingSafeEqual(a, b);
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
