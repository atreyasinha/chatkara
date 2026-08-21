## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2024-05-18 - Telegram Webhook Authentication Bypass Risk
**Vulnerability:** The Telegram webhook endpoint parsed the incoming JSON payload and conditionally invoked an external Telegram API (`answerTelegramCallback`) using data from that payload *before* validating the webhook secret.
**Learning:** Parsing user-supplied payloads and acting on them (like reaching out to external APIs) prior to authentication exposes the system to SSRF/abuse vectors and DoS attacks via malicious JSON.
**Prevention:** Always authenticate webhook requests using headers/secrets *before* parsing the request body or executing any downstream logic.
