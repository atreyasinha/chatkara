import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  adminPasswordConfigured,
  createAdminSessionToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
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
      const a = Buffer.from(password, "utf8");
      const b = Buffer.from(correctPassword, "utf8");
      if (a.length === b.length) {
        isPasswordValid = timingSafeEqual(a, b);
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
