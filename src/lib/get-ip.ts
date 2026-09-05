export function getClientIp(request: Request): string {
  // Try X-Real-IP first (often set by proxies like Nginx)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // If using X-Forwarded-For, take the last IP added by the trusted proxy (rightmost),
  // as the leftmost IPs can be trivially spoofed by the client.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff.split(",");
    const lastIp = ips[ips.length - 1]?.trim();
    if (lastIp) return lastIp;
  }

  return "unknown";
}
