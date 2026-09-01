## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2025-02-18 - [MEDIUM] Inconsistent and Vulnerable IP Extraction
**Vulnerability:** Multiple API routes extracted IP addresses by manually parsing the `x-forwarded-for` header inline (e.g., `request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"`). This repeated code pattern increases the risk of implementation bugs (like forgetting to `trim()`) or spoofing vulnerabilities if different endpoints start handling fallback headers like `x-real-ip` differently, leading to bypasses in the rate limiting mechanism.
**Learning:** IP extraction should be centralized. In Next.js/Vercel environments, `x-forwarded-for` is safely sanitized by the infrastructure.
**Prevention:** Use a centralized utility function (`getClientIp`) for IP extraction and rely on Vercel's sanitized `x-forwarded-for` header instead of `x-real-ip`.
