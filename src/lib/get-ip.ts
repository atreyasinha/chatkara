export function getClientIp(request: Request): string {
  // Prefer x-real-ip as it's the direct client IP set by Vercel
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback to x-forwarded-for (Vercel sanitizes this, first IP is the true client)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}
