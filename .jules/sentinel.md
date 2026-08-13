## 2025-02-14 - Fix Telegram Webhook SSRF & Authentication Sequence
**Vulnerability:** The Telegram webhook handler in `src/app/api/telegram/webhook/route.ts` was parsing the untrusted JSON body and potentially invoking `answerTelegramCallback(update.callback_query.id)` *before* verifying the `x-telegram-bot-api-secret-token` secret header. This exposed the bot to SSRF, allowing unauthenticated attackers to trigger bot callback requests using arbitrary payload strings.
**Learning:** Always validate authentication markers (e.g. secret tokens) before parsing or processing user-supplied payloads to prevent unauthenticated injection and SSRF vectors.
**Prevention:** Move authentication checks to the absolute beginning of webhook route handlers before accessing request bodies.
