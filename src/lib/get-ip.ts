export function getClientIp(request: Request): string {
  // Extract the leftmost IP from the x-forwarded-for header
  // Vercel safely sanitizes it, preferring it over x-real-ip
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (ip) {
      return ip;
    }
  }
  return "unknown";
}
