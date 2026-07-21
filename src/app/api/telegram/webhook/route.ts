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
    // If no secret configured, reject in production-like setups; allow only when unset for local experiments
    // Prefer requiring secret whenever webhook is used.
    return false;
  }
  const got = request.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
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
  if (!verifyTelegramSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    await answerTelegramCallback(cb.id, "Unauthorized chat");
    return NextResponse.json({ ok: true });
  }

  const parsed = parseKitchenCallbackData(cb.data || "");
  if (!parsed) {
    await answerTelegramCallback(cb.id, "Unknown action");
    return NextResponse.json({ ok: true });
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
  } catch (err) {
    console.error("Telegram callback failed:", err);
    await answerTelegramCallback(cb.id, "Error — try kitchen POS");
  }

  return NextResponse.json({ ok: true });
}
