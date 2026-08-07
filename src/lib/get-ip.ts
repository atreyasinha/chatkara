export function getClientIp(request: Request): string {
  // Vercel provides these headers which cannot be spoofed by the client
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to x-forwarded-for if not on Vercel
  // Note: taking the rightmost IP is safer against spoofing in many proxy setups,
  // but if we don't know the proxy chain length, any x-forwarded-for can be spoofed.
  // We use rightmost as it's the one appended by the nearest proxy.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff.split(",");
    return ips[ips.length - 1].trim();
  }

  return "unknown";
}
