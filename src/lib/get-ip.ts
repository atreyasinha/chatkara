import { NextRequest } from "next/server";

export function getClientIp(request: NextRequest | Request): string {
  // In Vercel environments, x-forwarded-for is sanitized and the leftmost IP is the true client IP.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
