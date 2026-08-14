## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2024-08-14 - Secure client IP extraction
**Vulnerability:** Relying solely on `x-forwarded-for` for client IP extraction in Vercel.
**Learning:** For secure client IP extraction (e.g., for rate limiting) in Next.js/Vercel environments, prefer the `x-real-ip` header when available. If falling back to `x-forwarded-for`, note that Vercel safely sanitizes it, meaning the *first* (leftmost) IP is the true client, whereas the rightmost IP is the internal proxy and its usage will cause a DoS if used for rate limiting.
**Prevention:** Abstract logic into a dedicated `getClientIp` function to ensure consistent and secure IP extraction across all endpoints.
