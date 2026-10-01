## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-01 - [CRITICAL] DoS and SSRF via Unauthenticated Webhook Payload
**Vulnerability:** The Telegram webhook parsed the JSON payload before authenticating the request, and then used the unverified `update.callback_query.id` from the payload to make an external API call (`answerTelegramCallback`) if authentication failed.
**Learning:** Parsing JSON prior to authentication allows for Denial of Service (DoS) attacks. Furthermore, using user-supplied data to trigger external API calls before validating the request's origin creates Server-Side Request Forgery (SSRF) and API spoofing vulnerabilities.
**Prevention:** Always perform authentication strictly based on cryptographically secure headers (e.g., webhook secrets) *before* parsing the request body (e.g., `await request.json()`) or interacting with external services.
