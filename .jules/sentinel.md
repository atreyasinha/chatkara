## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-22 - [CRITICAL] Webhook Unauthenticated Payload Usage and JSON DoS
**Vulnerability:** The Telegram webhook verified the secret after parsing the JSON body. Furthermore, if authentication failed, it used the unverified `update.callback_query.id` from the payload to make an external API call (`answerTelegramCallback`), which is an API spoofing / SSRF vulnerability.
**Learning:** Always verify webhook secrets before parsing the request body to prevent JSON parsing DoS, and never use unauthenticated user-supplied data to execute external API calls.
**Prevention:** Ensure `verifyTelegramSecret` is the first check in the request handler, and do not fall back to inspecting user-supplied payloads prior to successful validation.
