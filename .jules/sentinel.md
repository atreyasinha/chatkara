## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-10-24 - Rate Limiter Capacity Bypass
**Vulnerability:** In-memory rate limiter using Map `.clear()` when reaching capacity allowed attackers to reset all limits and bypass protections by exhausting memory.
**Learning:** Using `.clear()` on rate limiters fails open and gives attackers a way to evade blocks.
**Prevention:** Strictly enforce a maximum size by forcefully evicting the oldest entries using `map.keys()` to prevent bypass while avoiding memory exhaustion.
