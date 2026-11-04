## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-11-04 - [HIGH] IP Spoofing in Rate Limiting
**Vulnerability:** Extracting the first IP from the `x-forwarded-for` header (`split(",")[0]`) allows clients to easily spoof their IP address by prepending an arbitrary IP to the header, bypassing rate limiting.
**Learning:** The first IP in `x-forwarded-for` is untrusted client input.
**Prevention:** Always prioritize `x-real-ip` (often set by the immediate reverse proxy) and fall back to the last IP in `x-forwarded-for` (`split(",").pop()`), which is the most reliable IP added by the trusted infrastructure.
