## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-02 - Prevent JSON Parsing DoS on Telegram Webhook
**Vulnerability:** The Telegram webhook `/api/telegram/webhook/route.ts` parsed the incoming request body as JSON (`await request.json()`) before verifying the secret authentication header. An attacker could exploit this by sending a massive, deeply nested, or malformed JSON payload to consume server CPU and memory (Denial of Service), bypassing the secret check entirely.
**Learning:** Always validate authentication headers or tokens before processing or parsing the request payload, particularly when parsing JSON or handling file uploads, as these operations are computationally expensive and vulnerable to DoS.
**Prevention:** Placed `verifyTelegramSecret(request)` at the very beginning of the `POST` handler, ensuring unauthorized requests are rejected immediately without triggering a JSON parse.
