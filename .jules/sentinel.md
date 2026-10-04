## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-04 - [CRITICAL] API Spoofing via Unverified callback_query.id
**Vulnerability:** The Telegram webhook used unverified user-supplied data (`update.callback_query.id`) from the JSON payload to call the Telegram API when the webhook secret verification failed.
**Learning:** Never use unauthenticated user-supplied data to make external API calls, as it allows attackers to trigger unauthorized actions or API spoofing.
**Prevention:** Return a 401 response directly upon authentication failure without making external API calls using unverified payload data.
