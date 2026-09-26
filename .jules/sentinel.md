## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-26 - [CRITICAL] Webhook SSRF and JSON Parsing DoS
**Vulnerability:** The Telegram webhook parsed the JSON body (`request.json()`) and extracted user-supplied data (`update.callback_query?.id`) before validating the cryptographic webhook secret. It then used this unverified ID to call an external API (`answerTelegramCallback`) upon authentication failure.
**Learning:** Parsing the request body before authentication exposes the server to JSON parsing DoS. Worse, using unauthenticated user data to execute backend logic or make external API calls creates Server-Side Request Forgery (SSRF) and API spoofing vulnerabilities.
**Prevention:** Always verify cryptographic secrets (e.g., webhook tokens) from headers *before* parsing the request body and strictly avoid using unverified user payloads in fallback error handling.
