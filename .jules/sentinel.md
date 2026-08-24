## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2025-02-24 - [HIGH] Insecure Client IP Extraction
**Vulnerability:** IP extraction logic for rate limiting (`x-forwarded-for` fallback) was duplicated and relied on potentially spoofable ad-hoc parsing across multiple files.
**Learning:** Extracting client IPs via proxy headers like `x-forwarded-for` requires careful handling (using the leftmost IP provided by trusted proxies like Vercel). Duplicated ad-hoc logic can easily miss edge cases or fallback incorrectly to `x-real-ip`.
**Prevention:** Centralize IP extraction in a dedicated utility (e.g., `getClientIp` in `src/lib/get-ip.ts`) and use it uniformly across all rate-limited or IP-sensitive routes.
