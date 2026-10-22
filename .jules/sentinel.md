## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-10-22 - Fix In-memory Rate Limiter Memory Exhaustion Vulnerability (DoS)
**Vulnerability:** Using `.clear()` on rate limiting maps when at capacity allows attackers to bypass limits by filling the map with spoofed requests, causing the map to clear and resetting limits for all users.
**Learning:** Attackers can easily exhaust the 5000 item capacity to wipe limits for all IPs, completely neutralizing brute-force protection.
**Prevention:** Enforce size limits by selectively pruning expired keys and forcefully evicting the oldest entry using `map.keys().next().value` instead of clearing the whole map.
