export function getClientIp(request: Request): string {
  // Extract leftmost IP from x-forwarded-for header safely
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) {
      return ip;
    }
  }
  return "unknown";
}
