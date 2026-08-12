export function getClientIp(request: Request): string {
  // In Next.js on Vercel, x-real-ip is often provided and is the safest direct IP.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // If using X-Forwarded-For in Vercel, the first IP is indeed the client,
  // as Vercel overwrites/appends safely.
  // However, on some generic platforms, if we want to guard against spoofing,
  // we would need to trust specific proxies. Given Vercel guarantees the first IP
  // is safe when deployed there, we will stick to [0] but wrap it in this utility
  // to make it easily auditable and changeable if the hosting platform changes.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff.split(",");
    return ips[0].trim();
  }
  return "unknown";
}
