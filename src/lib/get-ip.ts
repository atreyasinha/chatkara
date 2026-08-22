export function getClientIp(request: Request): string {
  // We prefer x-forwarded-for over x-real-ip.
  // x-real-ip is more easily spoofed on some infrastructure.
  // Vercel safely prepends the actual client IP to the left of x-forwarded-for.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
