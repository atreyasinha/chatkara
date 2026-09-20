## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-09-20 - [HIGH] Unauthenticated API Calls in Webhook
**Vulnerability:** The Telegram webhook processed the request body and triggered an outbound API call (`answerTelegramCallback`) using unauthenticated, user-supplied data (`update.callback_query.id`) when the webhook secret check failed.
**Learning:** Never use unauthenticated user-supplied data to execute backend logic or external API calls prior to validation, as this creates SSRF and API spoofing vulnerabilities.
**Prevention:** Always verify cryptographically secure tokens in headers *before* parsing the request body and never fall back to inspecting user-supplied payloads prior to validation.

## 2026-09-20 - [MEDIUM] Integration test credentials bypass
**Vulnerability:** The integration tests bypassed the Firebase API Key check with a simple string length/truthiness validation, causing GitHub Action runs from forks to fail with 503 errors (Firestore not accessible) because they received the dummy redacted value `***`.
**Learning:** Checking for truthiness of a credentials value does not ensure it's a valid key, which can cause downstream tests to fail inexplicably in environments (like fork CI) that redact or inject dummy values instead of empty strings.
**Prevention:** Robustly verify real credentials in tests by checking for a known valid prefix (like `AIza` for Firebase API keys) to gracefully skip tests instead of failing.
