## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-11-06 - Prevent IP Spoofing in Rate Limiters
**Vulnerability:** Extracted the first IP from the `x-forwarded-for` header (`split(",")[0]`) in Next.js API routes (`orders`, `discount`, `admin/login`), which is vulnerable to client spoofing.
**Learning:** In proxy environments (like Vercel), clients can supply a fake `x-forwarded-for` header, leading to spoofed IPs at the start of the list. Next.js does not sanitize this for us automatically in raw edge API routes unless using standard middleware or framework features.
**Prevention:** Prioritize extracting `x-real-ip` (set by proxies/Vercel) and fallback to the last IP in `x-forwarded-for` (`split(",").pop()`), which is the most reliable one appended by the direct proxy.
