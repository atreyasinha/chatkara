## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2025-02-18 - [HIGH] Insecure Client IP Extraction
**Vulnerability:** Multiple API endpoints (`/api/orders/route.ts`, `/api/admin/login/route.ts`, `/api/discount/route.ts`) manually parsed the `x-forwarded-for` header to extract the client IP.
**Learning:** Parsing IPs manually across multiple files leads to inconsistent handling and potential security risks (like IP spoofing) if not done carefully, especially in serverless environments.
**Prevention:** Centralize secure IP extraction logic into a single utility function (`getClientIp` in `src/lib/get-ip.ts`) that correctly extracts the leftmost IP from `x-forwarded-for` (which Vercel sanitizes) and apply it consistently across all rate-limited endpoints.
