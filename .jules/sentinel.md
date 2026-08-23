## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2024-05-20 - Centralize client IP resolution
**Vulnerability:** Rate limiting implementation across API endpoints used `x-forwarded-for` directly without a centralized extraction function. While Vercel safely sanitizes `x-forwarded-for` to put the real client IP on the left (`[0]`), duplicating this logic increases the risk of inconsistent implementation in the future.
**Learning:** Consolidating client IP extraction logic into a single utility file (`src/lib/get-ip.ts`) ensures uniform handling across all rate limiters and makes future modifications safer. Use `x-forwarded-for` and take the leftmost IP in Vercel environments.
**Prevention:** Implement `getClientIp(request)` centrally and use it across all rate-limited endpoints.
