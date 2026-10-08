## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-08 - [CRITICAL] DoS via Map Rate Limiter Clear
**Vulnerability:** The in-memory rate limiter in `src/app/api/admin/login/route.ts` used `loginAttempts.clear()` when the Map reached its capacity (5000). An attacker could exhaust this capacity to clear the map, effectively wiping all rate limits and bypassing brute-force protections (DoS).
**Learning:** Using `.clear()` on rate limiting Maps creates a Denial of Service vulnerability because it completely resets all active protections when triggered by an attacker.
**Prevention:** Selectively prune expired entries and strictly enforce a maximum size upper bound by forcefully evicting the oldest entries (using `map.keys().next().value`) instead of calling `.clear()`.
