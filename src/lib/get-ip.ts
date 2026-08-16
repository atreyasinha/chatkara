export function getClientIp(request: Request): string {
  // Prefer x-real-ip as it's often more difficult to spoof on Vercel
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // Fallback to x-forwarded-for. On Vercel, this is safely sanitized,
  // and the true client IP is the first (leftmost) IP in the list.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    if (ips.length > 0) {
      return ips[0].trim();
    }
  }

  return "unknown";
}
