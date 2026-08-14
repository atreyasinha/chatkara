export function getClientIp(request: Request): string {
  // Prefer x-real-ip if available
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to x-forwarded-for, taking the leftmost IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const firstIp = ips[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return "unknown";
}
