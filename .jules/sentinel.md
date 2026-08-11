## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2025-02-18 - [HIGH] Rate Limit Bypass via IP Spoofing
**Vulnerability:** Rate limiting middlewares parsing `x-forwarded-for` were taking the leftmost IP (`split(",")[0]`). Because HTTP clients can append arbitrary headers, an attacker could spoof the leftmost IP in `x-forwarded-for` and bypass rate limits completely.
**Learning:** In proxy environments like Vercel, the true client IP is appended to the right side of `x-forwarded-for` or exposed securely via `x-real-ip`.
**Prevention:** Use a centralized helper like `getClientIp` that reads `x-real-ip` first, then falls back to extracting the *rightmost* non-empty IP from `x-forwarded-for` to securely identify clients.
