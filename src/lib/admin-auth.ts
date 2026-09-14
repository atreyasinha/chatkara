import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "chatkara_admin_session";
const SESSION_TTL_MS = 18 * 60 * 60 * 1000; // 18 hours — covers a full service day

export type AdminRole = "admin" | "waiter";

function sessionSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD || process.env.WAITER_PASSWORD;
  if (!password) return null;
  return process.env.ADMIN_SESSION_SECRET || password;
}

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD || process.env.WAITER_PASSWORD);
}

export function createAdminSessionToken(role: AdminRole = "admin"): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${role}.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function getAdminRoleFromToken(token: string | undefined | null): AdminRole | null {
  if (!token) return null;
  const secret = sessionSecret();
  if (!secret) return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const [role, expStr] = payload.split(".");
  if ((role !== "admin" && role !== "waiter") || !expStr) return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return role as AdminRole;
  } catch {
    return null;
  }
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
  requiredRole: AdminRole = "admin",
): boolean {
  const role = getAdminRoleFromToken(token);
  if (!role) return false;
  if (requiredRole === "admin") return role === "admin";
  return role === "admin" || role === "waiter";
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
export function isAdminRequest(
  request: Request,
  requiredRole: AdminRole = "admin",
): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!match) return false;
  try {
    const value = decodeURIComponent(
      match.slice(ADMIN_SESSION_COOKIE.length + 1),
    );
    return verifyAdminSessionToken(value, requiredRole);
  } catch {
    return false;
  }
}

export async function getRoleFromCookies(): Promise<AdminRole | null> {
  const jar = await cookies();
  return getAdminRoleFromToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function isAdminFromCookies(
  requiredRole: AdminRole = "admin",
): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(
    jar.get(ADMIN_SESSION_COOKIE)?.value,
    requiredRole,
  );
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
