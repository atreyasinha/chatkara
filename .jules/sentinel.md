## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2024-08-05 - Fix unauthenticated JSON parsing and SSRF risk in Telegram webhook
**Vulnerability:** The Telegram webhook endpoint parsed the incoming request JSON body (`request.json()`) before verifying the cryptographically secure webhook secret (`verifyTelegramSecret`). Worse, if the secret was invalid, it used an unauthenticated ID from the parsed payload (`update.callback_query?.id`) to make a fallback API call to Telegram.
**Learning:** Never parse user-supplied JSON payloads before validating cryptographic authentication headers. Unauthenticated JSON parsing can be abused to cause Denial of Service (DoS) or trigger arbitrary API calls (SSRF) using malicious IDs in fallback logic.
**Prevention:** Always validate webhook secrets and authentication headers immediately at the start of the handler, before any body parsing or fallback logic executes.
