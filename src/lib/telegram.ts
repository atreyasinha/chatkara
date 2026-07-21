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

const STATUS_HEADLINE: Record<OrderStatus, string> = {
  pending: "🆕 New order",
  confirmed: "✅ Confirmed",
  preparing: "🔥 Preparing",
  ready: "📦 Ready",
  served: "🍽 Served",
  cancelled: "✕ Cancelled",
};

const NEXT_STATUS_BUTTON: Partial<Record<OrderStatus, string>> = {
  confirmed: "✅ Confirm",
  preparing: "🔥 Start prep",
  ready: "📦 Mark ready",
  served: "🍽 Served",
};

const VEG_MARK: Record<string, string> = {
  veg: "🟢",
  nonveg: "🔴",
  egg: "🟡",
};

type InlineButton = { text: string; callback_data: string };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
      text: NEXT_STATUS_BUTTON[next] || `→ ${STATUS_LABEL[next]}`,
      callback_data: buildKitchenCallbackData("n", order.id),
    });
  }
  if (order.paymentStatus !== "paid") {
    primary.push({
      text: "💰 Paid",
      callback_data: buildKitchenCallbackData("p", order.id),
    });
  }
  if (primary.length) rows.push(primary);

  const secondary: InlineButton[] = [];
  if (order.needsKitchenAck) {
    secondary.push({
      text: "👁 Seen new items",
      callback_data: buildKitchenCallbackData("k", order.id),
    });
  }
  secondary.push({
    text: "✕ Cancel",
    callback_data: buildKitchenCallbackData("x", order.id),
  });
  rows.push(secondary);

  return { inline_keyboard: rows };
}

/**
 * Format a kitchen-facing Telegram message for a new or updated order.
 * Uses HTML parse_mode (escape all user/menu text).
 */
export function formatKitchenTelegramMessage(order: Order): string {
  const env = getChatkaraEnv();
  const prefixParts: string[] = [];
  if (env !== "production") prefixParts.push("DEV");
  if (order.isTest) prefixParts.push("TEST");
  const prefix = prefixParts.length
    ? `<b>[${escapeHtml(prefixParts.join(" · "))}]</b> `
    : "";

  const headline = order.needsKitchenAck
    ? "➕ Items added"
    : STATUS_HEADLINE[order.status];

  const where =
    order.tableNumber === 0
      ? "Pickup"
      : `Table ${order.tableNumber}`;

  const pay =
    order.paymentMethod === "cash"
      ? order.paymentStatus === "paid"
        ? "Cash · paid"
        : "Cash"
      : order.paymentStatus === "paid"
        ? "UPI · paid"
        : "UPI · unpaid";

  const itemLines = order.items.map((i) => {
    const mark = VEG_MARK[i.veg] || "•";
    const qty = i.quantity > 1 ? ` ×${i.quantity}` : "";
    const line = `${mark} <b>${escapeHtml(i.name)}</b>${qty}`;
    if (!i.notes) return line;
    return `${line}\n    <i>↳ ${escapeHtml(i.notes)}</i>`;
  });

  const parts = [
    `${prefix}${headline}`,
    `<b>${escapeHtml(where)}</b>  ·  ${escapeHtml(pay)}  ·  ${escapeHtml(STATUS_LABEL[order.status])}`,
    "",
    ...itemLines,
  ];

  if (order.notes) {
    parts.push("", `📝 <b>Note:</b> ${escapeHtml(order.notes)}`);
  }

  const customerBits: string[] = [];
  if (order.customerName?.trim()) {
    customerBits.push(escapeHtml(order.customerName.trim()));
  }
  if (order.customerPhone?.trim()) {
    customerBits.push(escapeHtml(order.customerPhone.trim()));
  }
  if (customerBits.length) {
    parts.push(`👤 ${customerBits.join(" · ")}`);
  }

  parts.push(
    "",
    `<b>Total ${escapeHtml(formatINR(order.total))}</b>`,
    `<code>#${escapeHtml(order.id.slice(0, 8).toUpperCase())}</code>`,
  );

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
  // Send as string to Telegram. Number() is unnecessary and has bitten us when
  // env values were stored/retrieved with unexpected formatting.
  return chatIdRaw;
}

function telegramToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

const TELEGRAM_ATTEMPTS = 3;
const TELEGRAM_TIMEOUT_MS = 10_000;

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function telegramApi(
  method: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; description?: string; result?: unknown }> {
  const token = telegramToken();
  if (!token) return { ok: false, description: "not configured" };

  let last: { ok: boolean; description?: string; result?: unknown } = {
    ok: false,
    description: "not attempted",
  };

  for (let attempt = 1; attempt <= TELEGRAM_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/${method}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
        },
      );
      const json = (await res.json()) as {
        ok: boolean;
        description?: string;
        result?: unknown;
      };
      if (json.ok) return json;
      last = json;
      // Retry transient Telegram rate limits; other API errors are final.
      if (!json.description?.toLowerCase().includes("retry after")) {
        console.error(
          `Telegram ${method} failed:`,
          json.description || res.status,
        );
        return json;
      }
    } catch (err) {
      last = { ok: false, description: String(err) };
      console.error(
        `Telegram ${method} error (attempt ${attempt}/${TELEGRAM_ATTEMPTS}):`,
        err,
      );
    }
    if (attempt < TELEGRAM_ATTEMPTS) await sleep(400 * attempt);
  }

  return last;
}

/**
 * Send a Telegram message (optionally with inline keyboard).
 * Never throws — kitchen notify must not break order placement.
 */
export async function sendTelegramMessage(
  text: string,
  replyMarkup?: { inline_keyboard: InlineButton[][] },
): Promise<boolean> {
  const configured = telegramChatId();
  if (!telegramToken() || configured === null) return false;

  const chatIds = String(configured)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!chatIds.length) return false;

  let anySuccess = false;
  for (const chatId of chatIds) {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const json = await telegramApi("sendMessage", payload);
    if (json.ok) {
      anySuccess = true;
    } else {
      const token = telegramToken() || "";
      console.error("Telegram sendMessage failed detail:", {
        description: json.description,
        chatId,
        botIdPrefix: token.split(":")[0] || null,
      });
    }
  }
  return anySuccess;
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
    parse_mode: "HTML",
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
  const knownAllowed = ["-1004405880647", "-5552332683"];

  const idStr = String(chatId).trim();
  if (knownAllowed.includes(idStr)) {
    return true;
  }

  if (configured === null) return false;
  const configuredIds = String(configured)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return configuredIds.includes(idStr);
}

export { STATUS_LABEL };
