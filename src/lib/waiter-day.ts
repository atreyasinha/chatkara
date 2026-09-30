// ⚡ Bolt: Cache Intl.DateTimeFormat instances outside functions to avoid expensive repeated instantiations
// during array operations (like filtering today's orders)
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const labelFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Calendar day in Asia/Kolkata (Bokaro restaurant local time). */
export function isOrderFromTodayIST(
  createdAt: string,
  now = new Date(),
): boolean {
  return dateFormatter.format(new Date(createdAt)) === dateFormatter.format(now);
}

export function todayLabelIST(now = new Date()): string {
  return labelFormatter.format(now);
}
