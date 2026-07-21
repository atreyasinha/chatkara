import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  answerTelegramCallback,
  buildKitchenInlineKeyboard,
  editTelegramMessage,
  formatKitchenTelegramMessage,
  isAllowedTelegramChat,
  parseKitchenCallbackData,
  STATUS_LABEL,
} from "@/lib/telegram";
import {
  clearKitchenAck,
  getOrder,
  markOrderPaid,
  updateOrderStatus,
} from "@/lib/orders";
import { nextKitchenStatus } from "@/lib/order-math";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";
export const preferredRegion = ["fra1"];
/** Retries to Telegram Bot API can take a while after the HTTP response. */
export const maxDuration = 60;

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    from?: { id: number; username?: string };
    message?: {
      message_id: number;
      chat: { id: number };
    };
  };
};

function verifyTelegramSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  }
  const got = request.headers.get("x-telegram-bot-api-secret-token");
  if (!got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function applyKitchenAction(
  action: "n" | "p" | "k" | "x",
  orderId: string,
): Promise<{ order?: Order; toast: string; ok: boolean }> {
  const existing = await getOrder(orderId);
  if (!existing) return { ok: false, toast: "Order not found" };

  if (action === "p") {
    const order = await markOrderPaid(orderId);
    return {
      ok: Boolean(order),
      order,
      toast: order ? "💰 Marked paid" : "Could not mark paid",
    };
  }

  if (action === "k") {
    const order = await clearKitchenAck(orderId);
    return {
      ok: Boolean(order),
      order,
      toast: order ? "👁 New items seen" : "Could not ack",
    };
  }

  if (action === "x") {
    if (existing.status === "served" || existing.status === "cancelled") {
      return { ok: false, order: existing, toast: "Already closed" };
    }
    const order = await updateOrderStatus(orderId, "cancelled");
    return {
      ok: Boolean(order),
      order,
      toast: order ? "✕ Cancelled" : "Could not cancel",
    };
  }

  // action === "n"
  const next = nextKitchenStatus(
    existing.status as Parameters<typeof nextKitchenStatus>[0],
  );
  if (!next) {
    return { ok: false, order: existing, toast: "No next status" };
  }
  const order = await updateOrderStatus(orderId, next);
  return {
    ok: Boolean(order),
    order,
    toast: order ? `→ ${STATUS_LABEL[next]}` : "Could not update status",
  };
}

export async function POST(request: Request) {
  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const cb = update.callback_query;
  if (!cb) {
    // Ignore plain messages — bot is notify/actions only
    return NextResponse.json({ ok: true });
  }

  const chatId = cb.message?.chat.id;
  const messageId = cb.message?.message_id;
  if (chatId === undefined || !isAllowedTelegramChat(chatId)) {
    console.warn("Telegram callback rejected: unauthorized chat", {
      chatId,
      configured: process.env.TELEGRAM_CHAT_ID,
    });
    await answerTelegramCallback(cb.id, "Unauthorized chat");
    return NextResponse.json({ ok: true, rejected: "unauthorized_chat" });
  }

  const parsed = parseKitchenCallbackData(cb.data || "");
  if (!parsed) {
    await answerTelegramCallback(cb.id, "Unknown action");
    return NextResponse.json({ ok: true, rejected: "unknown_action" });
  }

  try {
    const result = await applyKitchenAction(parsed.action, parsed.orderId);
    await answerTelegramCallback(cb.id, result.toast);

    if (result.order && messageId !== undefined) {
      await editTelegramMessage(
        chatId,
        messageId,
        formatKitchenTelegramMessage(result.order),
        buildKitchenInlineKeyboard(result.order),
      );
    }
    return NextResponse.json({
      ok: true,
      toast: result.toast,
      status: result.order?.status,
    });
  } catch (err) {
    console.error("Telegram callback failed:", err);
    await answerTelegramCallback(cb.id, "Error — try kitchen POS");
    return NextResponse.json({ ok: true, rejected: "error" });
  }
}
