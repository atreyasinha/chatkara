/** Calendar day in Asia/Kolkata (Bokaro restaurant local time). */
export function isOrderFromTodayIST(
  createdAt: string,
  now = new Date(),
): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date(createdAt)) === fmt.format(now);
}

export function todayLabelIST(now = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(now);
}
