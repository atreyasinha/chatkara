import type { Order } from "./types";
import { formatINR } from "./restaurant";
import { getChatkaraEnv } from "./env";

/**
 * Format a kitchen-facing Telegram message for a new or updated order.
 */
export function formatKitchenTelegramMessage(order: Order): string {
  const env = getChatkaraEnv();
  const prefixParts: string[] = [];
  if (env !== "production") prefixParts.push("DEV");
  if (order.isTest) prefixParts.push("TEST");
  const prefix = prefixParts.length ? `[${prefixParts.join(" · ")}] ` : "";

  const isAppend = Boolean(order.needsKitchenAck);
  const headline = isAppend ? "➕ Items added" : "🆕 New order";

  const where =
    order.tableNumber === 0 ? "Pickup" : `Table ${order.tableNumber}`;
  const pay =
    order.paymentMethod === "cash"
      ? "Cash"
      : order.paymentStatus === "paid"
        ? "UPI (paid)"
        : "UPI (awaiting pay)";

  const lines = order.items.map(
    (i) => `• ${i.name} ×${i.quantity}${i.notes ? ` (${i.notes})` : ""}`,
  );

  const parts = [
    `${prefix}${headline}`,
    `${where} · ${pay}`,
    "",
    ...lines,
    "",
    `Total ${formatINR(order.total)}`,
  ];

  if (order.notes) {
    parts.push(`Note: ${order.notes}`);
  }

  parts.push(`#${order.id.slice(0, 8).toUpperCase()}`);
  return parts.join("\n");
}

export function isTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
      process.env.TELEGRAM_CHAT_ID?.trim(),
  );
}

/**
 * Send a Telegram message. Returns false if not configured or the API fails.
 * Never throws — kitchen notify must not break order placement.
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIdRaw = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatIdRaw) return false;

  // Telegram accepts string or number; prefer number for private chats
  const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Telegram send failed:", res.status, body.slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Telegram send error:", err);
    return false;
  }
}

/** Notify kitchen chat about a placed/updated order. */
export async function notifyKitchenTelegram(order: Order): Promise<boolean> {
  if (!isTelegramConfigured()) return false;
  return sendTelegramMessage(formatKitchenTelegramMessage(order));
}
