## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-10-20 - In-Memory Map Rate Limiter Bypass and DoS
**Vulnerability:** In-memory rate limiters using a Map were vulnerable to either bypass (via `.clear()`) or CPU exhaustion DoS (if the map remains > 5000 items, causing O(N) pruning on every request).
**Learning:** Never use `.clear()` when a rate limit map reaches capacity, as it resets limits for everyone. Unbounded map growth without forceful eviction allows CPU exhaustion DoS.
**Prevention:** Selectively prune expired entries and strictly enforce a maximum size upper bound (e.g., by forcefully evicting the oldest entries using `map.keys()`) to prevent O(N) CPU exhaustion DoS.
