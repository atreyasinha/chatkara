## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-23 - [CRITICAL] Webhook SSRF and JSON Parsing DoS
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) parsed the incoming JSON payload before verifying the authentication secret, allowing JSON parsing DoS. Furthermore, if unauthorized, it used the unverified `callback_query.id` from the payload to make an outbound API call to Telegram (`answerTelegramCallback`), creating an SSRF / API abuse vulnerability.
**Learning:** Never parse user-supplied payloads before verifying authentication, and never use unauthenticated user data to execute external API calls.
**Prevention:** Always verify cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) *before* parsing the request body, and strictly return HTTP error codes (like 401) on failure without executing further logic.
