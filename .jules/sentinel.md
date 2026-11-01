## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-11-01 - [HIGH] IP Spoofing in Rate Limiting
**Vulnerability:** Rate limiting relied on the first IP in the `x-forwarded-for` header (`split(",")[0]`). An attacker could spoof this by sending a request with a fake `X-Forwarded-For: 1.2.3.4` header. The proxy would append the real IP, resulting in `1.2.3.4, real_ip`, allowing the attacker to bypass rate limiting by constantly changing the spoofed first IP.
**Learning:** The first IP in `x-forwarded-for` is user-controlled and easily spoofed. When deployed behind proxies like Vercel, the true client IP is often provided in `x-real-ip` or as the last IP appended to `x-forwarded-for`.
**Prevention:** Always prioritize `x-real-ip` and fallback to the last IP in `x-forwarded-for` (e.g., `split(",").pop()`) for reliable rate limiting and client IP extraction.
