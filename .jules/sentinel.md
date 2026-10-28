## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-28 - [HIGH] IP Spoofing in Rate Limiting
**Vulnerability:** API routes extracted the client IP using `request.headers.get("x-forwarded-for")?.split(",")[0]`. An attacker could easily spoof their IP address by supplying a custom `X-Forwarded-For` header with a fake IP at the beginning, bypassing IP-based rate limiting.
**Learning:** The first IP in the `X-Forwarded-For` header is untrusted because it can be client-supplied. In Next.js/Vercel environments, `x-real-ip` is typically set by the platform, or the last IP in the `X-Forwarded-For` list should be used as it is appended by the nearest trusted proxy.
**Prevention:** Always prioritize the `x-real-ip` header, and fallback to extracting the last IP from `x-forwarded-for` (`split(",").pop()`) when identifying clients for rate limiting or security controls.
