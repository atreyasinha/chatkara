## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-11-02 - Secure IP Extraction for Rate Limiting
**Vulnerability:** IP extraction for rate limiting used `split(",")[0]` on `x-forwarded-for`, which extracts the first IP. This is vulnerable to spoofing, allowing users to bypass rate limits by sending a forged `x-forwarded-for` header.
**Learning:** `x-forwarded-for` can be easily spoofed by the client. In proxy/Vercel environments, the real IP is often appended to the end or provided via `x-real-ip`.
**Prevention:** Always prioritize `x-real-ip` and fallback to the last IP in `x-forwarded-for` (e.g., `split(",").pop()`) when implementing rate limiting or extracting client IPs.
