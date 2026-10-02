## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-02 - [CRITICAL] Fix API spoofing and JSON parsing DoS in Webhook
**Vulnerability:** The Telegram webhook `/api/telegram/webhook/route.ts` used unauthenticated payload data (`update.callback_query.id`) to attempt to send an unauthorized message via `answerTelegramCallback` before validating the webhook secret token. It also attempted to parse the incoming JSON body prior to ensuring the payload originated from a trusted source. This could lead to JSON Parsing DoS and allow an attacker to spoof the backend by triggering unauthenticated backend API calls.
**Learning:** Never parse request payload or fall back to payload data before securely validating the caller.
**Prevention:** Webhooks must execute the secret authentication strictly at the top of the request lifecycle, using a constant-time comparison on the correct incoming header, before running `await request.json()` or any other actions.
## 2026-10-02 - [TESTING] CI tests failing on invalid Firebase secrets
**Learning:** GitHub CI injects `***` for missing secrets on fork PRs, meaning that checking for `process.env.FIREBASE_API_KEY` incorrectly passes on CI and proceeds to execute tests that expect a valid DB connection, resulting in 503 errors.
**Prevention:** Check that the API key actually resembles a Google API key, e.g. `FIREBASE_API_KEY?.startsWith('AIza')`, to ensure the suite skips gracefully when run in a PR from a fork without configured secrets.
