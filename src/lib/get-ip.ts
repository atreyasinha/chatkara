export function getClientIp(request: Request): string {
  // On Vercel, x-real-ip is generally provided and trustworthy.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // If relying on x-forwarded-for, the leftmost IP can be trivially spoofed
  // by the client sending their own X-Forwarded-For header. The rightmost IP
  // is appended by the proxy (Vercel) and is more trustworthy in serverless environments.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const rightmostIp = ips[ips.length - 1]?.trim();
    if (rightmostIp) return rightmostIp;
  }

  return "unknown";
}
