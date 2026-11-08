## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-11-08 - Rate Limiting Bypass via IP Spoofing
**Vulnerability:** API routes extracted the first IP from `x-forwarded-for` for rate limiting. This can be easily spoofed by an attacker supplying their own `x-forwarded-for` header, allowing them to bypass rate limits.
**Learning:** In proxy environments (like Vercel), the first IP in `x-forwarded-for` is the client-provided IP which is untrustworthy. The proxy appends the real connecting IP to the end of the list.
**Prevention:** Always prioritize `x-real-ip` (if provided by the proxy/WAF) or extract the LAST IP (`.pop()`) from the `x-forwarded-for` header for rate limiting or security checks.
