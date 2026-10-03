## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-03 - [CRITICAL] Webhook JSON DoS and API Spoofing
**Vulnerability:** The Telegram webhook processed the JSON body and extracted the `callback_query.id` before verifying the webhook secret. If authentication failed, it used the attacker-supplied ID to make an external call to the Telegram API (`answerTelegramCallback`). This allowed unauthenticated attackers to cause JSON parsing overhead (DoS) and trigger unauthorized backend API calls (SSRF/API spoofing).
**Learning:** Never parse request bodies or use attacker-controlled data to trigger side effects before cryptographic authentication is fully verified.
**Prevention:** Always verify the webhook secret in the request headers before parsing the JSON body or executing any external API calls based on the payload.
