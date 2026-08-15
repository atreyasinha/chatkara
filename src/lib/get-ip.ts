export function getClientIp(request: Request): string {
  // Prefer x-real-ip if available
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // On Vercel, x-forwarded-for contains a comma-separated list of IPs.
  // The first (leftmost) IP is the original client IP.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    if (ips[0]) return ips[0].trim();
  }

  return "unknown";
}
