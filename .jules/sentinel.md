## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-24 - [CRITICAL] API Spoofing / SSRF and JSON DoS in Telegram Webhook
**Vulnerability:** The webhook parsed the incoming JSON request body and used user-supplied data (`update.callback_query.id`) to make external API calls (`answerTelegramCallback`) before successfully authenticating the webhook secret.
**Learning:** Parsing JSON before authentication opens the endpoint to DoS attacks. Moreover, using unverified payload data to make external API calls enables Server-Side Request Forgery (SSRF) and API spoofing.
**Prevention:** Always verify authentication secrets (e.g., headers) *before* parsing the request body or executing any logic, and never use unauthenticated data for API calls.
