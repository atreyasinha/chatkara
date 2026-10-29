## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-29 - Fix IP Spoofing in Rate Limiting
**Vulnerability:** Extracted the first IP from `x-forwarded-for` header for rate limiting (`split(",")[0]`), which is vulnerable to client spoofing, especially on platforms like Vercel.
**Learning:** `x-forwarded-for` allows attackers to easily inject a fake IP to bypass rate limiting controls.
**Prevention:** Use `x-real-ip` when available, and fallback to the LAST IP in `x-forwarded-for` (e.g., `split(",").pop()`) as it is typically appended by the last trusted proxy in the chain.
