export function getClientIp(request: Request): string {
  // Try Vercel's specific header first which is trustworthy
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.trim();

  // Next try X-Real-IP (often set by reverse proxies like Nginx)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback to X-Forwarded-For
  // Note: Attackers can easily spoof the leftmost IP in X-Forwarded-For.
  // The rightmost IP is typically the most trustworthy as it's appended
  // by the last trusted proxy in the chain before reaching the server.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    // Pick the rightmost IP that isn't empty
    for (let i = ips.length - 1; i >= 0; i--) {
      const ip = ips[i].trim();
      if (ip) return ip;
    }
  }

  return "unknown";
}
