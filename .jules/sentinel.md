## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-10-31 - Fix IP Spoofing in Rate Limiting
**Vulnerability:** Rate limiting bypass via IP spoofing (using first IP from x-forwarded-for).
**Learning:** In Next.js (especially on Vercel), the first IP in x-forwarded-for can be easily spoofed by the client, allowing attackers to bypass rate limiting for login, discount, and ordering endpoints.
**Prevention:** Prioritize `x-real-ip` or use the last IP in the `x-forwarded-for` header to get the actual client IP connecting to the load balancer.
