export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",");
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]?.trim();
      if (p) return p;
    }
  }

  return "unknown";
}
