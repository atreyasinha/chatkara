import type { Order, OrderStatus } from "./types";
import { formatINR } from "./restaurant";
import { getChatkaraEnv } from "./env";
import { nextKitchenStatus } from "./order-math";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "New",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

type InlineButton = { text: string; callback_data: string };

/**
 * callback_data budget is 64 bytes. Format: `{action}:{orderId}`
 * n = advance next status, p = mark paid, k = ack new items, x = cancel
 */
export function buildKitchenCallbackData(
  action: "n" | "p" | "k" | "x",
  orderId: string,
): string {
  const data = `${action}:${orderId}`;
  if (data.length > 64) {
    throw new Error(`callback_data too long (${data.length})`);
  }
  return data;
}

export function parseKitchenCallbackData(
  data: string,
): { action: "n" | "p" | "k" | "x"; orderId: string } | null {
  const m = /^(n|p|k|x):([0-9a-f-]{36})$/i.exec(data.trim());
  if (!m) return null;
  return { action: m[1] as "n" | "p" | "k" | "x", orderId: m[2] };
}

export function buildKitchenInlineKeyboard(
  order: Order,
): { inline_keyboard: InlineButton[][] } | undefined {
  if (order.status === "served" || order.status === "cancelled") {
    return undefined;
  }

  const rows: InlineButton[][] = [];
  const next = nextKitchenStatus(
    order.status as Parameters<typeof nextKitchenStatus>[0],
  );

  const primary: InlineButton[] = [];
  if (next) {
    primary.push({
      text: `Mark ${STATUS_LABEL[next]}`,
      callback_data: buildKitchenCallbackData("n", order.id),
    });
  }
  if (order.paymentStatus !== "paid") {
    primary.push({
      text: "Mark paid",
      callback_data: buildKitchenCallbackData("p", order.id),
    });
  }
  if (primary.length) rows.push(primary);

  const secondary: InlineButton[] = [];
  if (order.needsKitchenAck) {
    secondary.push({
      text: "Ack new items",
      callback_data: buildKitchenCallbackData("k", order.id),
    });
  }
  secondary.push({
    text: "Cancel",
    callback_data: buildKitchenCallbackData("x", order.id),
  });
  rows.push(secondary);

  return { inline_keyboard: rows };
}

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
    `${where} · ${pay} · ${STATUS_LABEL[order.status]}`,
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

function telegramChatId(): string | number | null {
  const chatIdRaw = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!chatIdRaw) return null;
  return /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw;
}

function telegramToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

async function telegramApi(
  method: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; description?: string; result?: unknown }> {
  const token = telegramToken();
  if (!token) return { ok: false, description: "not configured" };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      ok: boolean;
      description?: string;
      result?: unknown;
    };
    if (!json.ok) {
      console.error(
        `Telegram ${method} failed:`,
        json.description || res.status,
      );
    }
    return json;
  } catch (err) {
    console.error(`Telegram ${method} error:`, err);
    return { ok: false, description: String(err) };
  }
}

/**
 * Send a Telegram message (optionally with inline keyboard).
 * Never throws — kitchen notify must not break order placement.
 */
export async function sendTelegramMessage(
  text: string,
  replyMarkup?: { inline_keyboard: InlineButton[][] },
): Promise<boolean> {
  const chatId = telegramChatId();
  if (!telegramToken() || chatId === null) return false;

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  const json = await telegramApi("sendMessage", payload);
  return json.ok;
}

export async function editTelegramMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: { inline_keyboard: InlineButton[][] },
): Promise<boolean> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    disable_web_page_preview: true,
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  } else {
    payload.reply_markup = { inline_keyboard: [] };
  }
  const json = await telegramApi("editMessageText", payload);
  // "message is not modified" is fine
  if (!json.ok && json.description?.includes("message is not modified")) {
    return true;
  }
  return json.ok;
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string,
): Promise<boolean> {
  const json = await telegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text || undefined,
    show_alert: false,
  });
  return json.ok;
}

/** Notify kitchen chat about a placed/updated order (with action buttons). */
export async function notifyKitchenTelegram(order: Order): Promise<boolean> {
  if (!isTelegramConfigured()) return false;
  return sendTelegramMessage(
    formatKitchenTelegramMessage(order),
    buildKitchenInlineKeyboard(order),
  );
}

export function isAllowedTelegramChat(chatId: number | string): boolean {
  const configured = telegramChatId();
  if (configured === null) return false;
  return String(configured) === String(chatId);
}

export { STATUS_LABEL };
