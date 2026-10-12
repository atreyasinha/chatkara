## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-10-12 - In-Memory Rate Limiter Bypass and DoS
**Vulnerability:** In-memory rate limiters using Maps were vulnerable to bypass via `.clear()` when reaching capacity, and O(N) CPU exhaustion DoS via iteration.
**Learning:** Attackers can intentionally fill the map to trigger `.clear()`, resetting all limits. Iterating over a full map on every request causes high CPU usage.
**Prevention:** Strictly enforce a maximum size by forcefully evicting the oldest entries (e.g., using `map.keys().next().value` and `.delete()`) instead of clearing the map or iterating over all entries.
