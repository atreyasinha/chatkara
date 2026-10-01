## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-01 - Avoid Returning Empty Object on Missing Payload
**Learning:** During tests, mocking `request.json()` incorrectly resulted in exceptions being thrown inside test runners. If `request.json()` is not surrounded by try-catch properly, it might fail. Ensure tests and application logic gracefully handle missing payloads without unhandled rejections.
**Action:** When working with API webhooks, explicitly wrap `request.json()` calls within a `try-catch` block, even when authentication correctly rejects invalid tokens.
