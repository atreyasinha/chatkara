## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-13 - [CRITICAL] Webhook SSRF and JSON Parsing DoS
**Vulnerability:** The webhook parsed the JSON body and extracted unauthenticated user data before verifying the authentication secret, using that unverified data to make an external API call (`answerTelegramCallback`).
**Learning:** Parsing JSON before validation opens up DoS risks, and trusting unvalidated payload data for external API calls leads to SSRF and API abuse.
**Prevention:** Always verify cryptographic webhook signatures from headers before reading or parsing the request body, and never use unauthenticated payload data.
