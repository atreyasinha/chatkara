import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "chatkara_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sessionSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return process.env.ADMIN_SESSION_SECRET || password;
}

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function createAdminSessionToken(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = sessionSecret();
  if (!secret) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const [role, expStr] = payload.split(".");
  if (role !== "admin" || !expStr) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Read session cookie from an incoming Request (Route Handlers). */
export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!match) return false;
  const value = decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1));
  return verifyAdminSessionToken(value);
}

export async function isAdminFromCookies(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
