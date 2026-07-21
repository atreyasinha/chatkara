import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const preferredRegion = ["fra1"];
export const maxDuration = 30;

function verifySecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!expected) return false;
  const got = request.headers.get("x-telegram-bot-api-secret-token");
  if (!got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Production diagnostics: POST with the Telegram webhook secret to send a
 * smoke message using the same env/runtime as order notify.
 */
export async function POST(request: Request) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() || null;
  const botPrefix = process.env.TELEGRAM_BOT_TOKEN?.split(":")[0] || null;
  const ok = await sendTelegramMessage(
    `ChatKara ping (${process.env.VERCEL_ENV || "local"})`,
  );

  return NextResponse.json({
    ok,
    botPrefix,
    chatId,
    chatIdLength: chatId?.length ?? 0,
    chatIdStartsWithMinus: Boolean(chatId?.startsWith("-")),
  });
}
