export function getClientIp(request: Request): string {
  // Vercel injects the true client IP into x-vercel-forwarded-for
  // Fallbacks: x-real-ip, or the rightmost (trusted) IP from x-forwarded-for
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    // Trust the rightmost IP as it was appended by our immediate proxy
    return ips[ips.length - 1].trim();
  }

  return "unknown";
}
