"use client";

type QueuedMutation = {
  id: string;
  url: string;
  body: Record<string, unknown>;
  createdAt: string;
};

const QUEUE_KEY = "chatkara_kitchen_mutation_queue";
/** Mutations older than 24 hours are considered stale and discarded on next read. */
const MAX_QUEUE_AGE_MS = 24 * 60 * 60 * 1000;

function readQueue(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMutation[];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    // Prune stale mutations so they never retry indefinitely
    const pruned = parsed.filter(
      (m) => now - new Date(m.createdAt).getTime() < MAX_QUEUE_AGE_MS,
    );
    if (pruned.length !== parsed.length) {
      try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(pruned));
      } catch {
        // ignore — read-only contexts
      }
    }
    return pruned;
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMutation[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Private browsing / quota exceeded — the caller treats this as "error".
    throw new Error("Could not persist offline queue");
  }
}

export function queueLength(): number {
  return readQueue().length;
}

/** PATCH with credentials; if offline or network fails, queue for later. */
export async function kitchenPatch(
  orderId: string,
  body: Record<string, unknown>,
): Promise<"ok" | "queued" | "unauthorized" | "error"> {
  const url = `/api/orders/${orderId}`;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const queue = readQueue();
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      body,
      createdAt: new Date().toISOString(),
    });
    try {
      writeQueue(queue);
      return "queued";
    } catch {
      return "error";
    }
  }

  try {
    const res = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) return "unauthorized";
    if (!res.ok) return "error";
    return "ok";
  } catch {
    const queue = readQueue();
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      body,
      createdAt: new Date().toISOString(),
    });
    try {
      writeQueue(queue);
      return "queued";
    } catch {
      return "error";
    }
  }
}

export async function flushKitchenQueue(): Promise<{
  sent: number;
  remaining: number;
}> {
  const queue = readQueue();
  if (queue.length === 0) return { sent: 0, remaining: 0 };

  const remaining: QueuedMutation[] = [];
  let sent = 0;

  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.body),
      });
      if (res.ok) {
        sent++;
      } else if (res.status === 401) {
        remaining.push(item);
        remaining.push(...queue.slice(queue.indexOf(item) + 1));
        break;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
      remaining.push(...queue.slice(queue.indexOf(item) + 1));
      break;
    }
  }

  writeQueue(remaining);
  return { sent, remaining: remaining.length };
}
