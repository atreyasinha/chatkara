export function getClientIp(request: Request): string {
  // Prefer x-forwarded-for, taking the leftmost IP as Vercel safely sanitizes it
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    if (ips.length > 0) {
      return ips[0].trim();
    }
  }

  // Fallback to x-real-ip
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}
