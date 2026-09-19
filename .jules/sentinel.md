## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-19 - [CRITICAL] Webhook DoS and SSRF via Early JSON Parsing
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) parsed the incoming JSON payload (`await request.json()`) before validating the `TELEGRAM_WEBHOOK_SECRET` header. Furthermore, on validation failure, it used the unauthenticated, user-supplied `callback_query.id` from the payload to make an outbound API call (`answerTelegramCallback`).
**Learning:** Parsing JSON before authentication opens the server to DoS attacks via large payloads. Using unverified data from rejected requests for outbound calls creates an SSRF and spoofing risk.
**Prevention:** Always verify cryptographically secure tokens in headers *before* parsing the request body. Never use unauthenticated user-supplied data to execute backend logic or make external API calls.
