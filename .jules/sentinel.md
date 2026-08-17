## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2025-02-18 - [MEDIUM] Secure IP Extraction for Rate Limiting
**Vulnerability:** API routes were manually parsing the `x-forwarded-for` header for rate limiting without first checking `x-real-ip`. While Vercel sanitizes `x-forwarded-for`, relying on manual header parsing scattered across multiple routes increases the risk of IP spoofing vulnerabilities if the proxy environment changes or if developers misuse the rightmost IPs instead of the leftmost IP.
**Learning:** For secure client IP extraction (e.g., for rate limiting) in Next.js/Vercel environments, logic should be centralized. The `x-real-ip` header should be preferred when available.
**Prevention:** Always abstract IP extraction logic into a centralized `getClientIp` function (e.g., `src/lib/get-ip.ts`) that correctly handles `x-real-ip` and the leftmost IP of `x-forwarded-for`.
