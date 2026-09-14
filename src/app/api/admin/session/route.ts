import { NextResponse } from "next/server";
import { getRoleFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getRoleFromCookies();
  if (!role) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, role });
}
