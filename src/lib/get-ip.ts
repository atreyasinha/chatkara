export function getClientIp(request: Request): string {
  // Extract the leftmost IP from the x-forwarded-for header, as Vercel safely sanitizes it.
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }
  return "unknown";
}
