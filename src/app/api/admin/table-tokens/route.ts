import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedJson } from "@/lib/admin-auth";
import { getTableTokens } from "@/lib/table-tokens";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedJson();
  return NextResponse.json(
    { tableTokens: getTableTokens() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
