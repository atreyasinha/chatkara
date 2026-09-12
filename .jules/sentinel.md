## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-12 - Prevent SSRF in Webhook Unauthorized Flow
**Vulnerability:** The Telegram webhook parsed the request body and used `callback_query.id` from an unauthenticated request to make a callback response via Telegram API, which exposed the server to JSON DoS and SSRF/API spoofing.
**Learning:** Using user-supplied unverified data in external API calls before verifying cryptographic secrets can turn authentication denial paths into SSRF vectors.
**Prevention:** Always verify headers (e.g., webhook secrets) before parsing payloads, and never use payload contents in error-handling logic for unverified requests.
