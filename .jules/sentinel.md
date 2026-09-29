## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-29 - [CRITICAL] Webhook SSRF & JSON Parsing DoS
**Vulnerability:** The Telegram webhook processed user-supplied JSON data and invoked `answerTelegramCallback` using unverified `callback_query.id` before properly authenticating the request header. This exposed an unauthenticated JSON parsing vector (DoS) and allowed Server-Side Request Forgery (SSRF) / API spoofing by executing a backend API call on behalf of an unverified caller.
**Learning:** Webhook authentication must strictly occur before any JSON payload parsing or external API interactions based on user input.
**Prevention:** Always verify the cryptographic token (`x-telegram-bot-api-secret-token`) first. Never fall back to inspecting or using user-supplied payloads (like `callback_query.id`) prior to validation.
