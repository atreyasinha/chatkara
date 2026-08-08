## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-08-08 - [HIGH] IP Spoofing in Rate Limiting
**Vulnerability:** Rate limiting implementation across multiple routes (`/api/orders`, `/api/discount`, `/api/admin/login`) used the leftmost IP from the `x-forwarded-for` header. Since clients can arbitrarily set this header, attackers could trivially bypass the rate limit by rotating spoofed IP addresses.
**Learning:** In proxy environments like Vercel, the leftmost IP in `x-forwarded-for` is completely untrustworthy for security or rate limiting purposes.
**Prevention:** Always use a secure helper to extract the client IP. Rely on trustworthy headers provided by the infrastructure (like `x-real-ip` on Vercel) or extract the rightmost (infrastructure-appended) IP from `x-forwarded-for`.
