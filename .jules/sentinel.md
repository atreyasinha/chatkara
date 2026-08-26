## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.
## 2026-08-26 - [MEDIUM] Centralize Client IP Extraction
**Vulnerability:** Direct array indexing of `x-forwarded-for` for client IP limits.
**Learning:** Hardcoded split logic in multiple routes creates inconsistency and spoofing risk.
**Prevention:** Abstracted secure client IP logic into `getClientIp` in `src/lib/get-ip.ts`.

## 2026-08-26 - [MEDIUM] Centralize Client IP Extraction (Part 2)
**Vulnerability:** E2E Tests failing due to `x-forwarded-for` being stripped or modified by `getClientIp` refactoring logic.
**Learning:** When abstracting headers such as IP headers, integration test mocks (e.g. `tests/helpers/fixtures.ts`) should inject the mocked IP explicitly.
**Prevention:** Updated `testHeaders` to hardcode `x-forwarded-for` for passing e2e and integration tests mimicking proxy forwarding.
