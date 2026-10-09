## 2025-02-18 - [CRITICAL] Telegram Webhook Authentication Bypass
**Vulnerability:** The Telegram webhook (`/api/telegram/webhook/route.ts`) verified requests by falling back to checking if the user-controlled JSON payload (`update?.callback_query?.message?.chat?.id`) matched an authorized `TELEGRAM_CHAT_ID` if the `TELEGRAM_WEBHOOK_SECRET` was missing or mismatched. Because webhooks are publicly accessible, an attacker could spoof this JSON payload to bypass authentication completely and update order states (e.g., mark as paid or cancelled).
**Learning:** Never use data from a user-supplied JSON payload as a fallback authentication mechanism for webhooks. Secrets should be enforced strictly.
**Prevention:** Always rely strictly on cryptographically secure tokens (like `x-telegram-bot-api-secret-token`) sent in headers and verified with a constant-time comparison (`timingSafeEqual`) to authenticate webhook calls.

## 2026-10-09 - [CRITICAL] Map Rate Limiter Bypass and CPU Exhaustion DoS
**Vulnerability:** In-memory rate limiters using `Map` had two critical flaws: 1) Admin login used `loginAttempts.clear()` when full, allowing attackers to spam the map to clear everyone's rate limit. 2) Orders and discounts used O(N) loops to prune expired entries when full. If the map filled up with valid *recent* entries, nothing was evicted, and the server entered an O(N) loop on *every single request*, causing CPU exhaustion Denial of Service.
**Learning:** `map.clear()` is a complete bypass in rate limiters. O(N) pruning strategies fail under load and cause CPU exhaustion DoS.
**Prevention:** Always enforce a strict maximum size upper bound by evicting the absolute oldest entry using O(1) operations (e.g., `map.delete(map.keys().next().value)`) when capacity is reached.

## 2026-10-09 - [CRITICAL] CI Integration Test Failures due to Dummy Secrets
**Vulnerability:** Integration test suites bypassed execution dynamically by checking if `FIREBASE_API_KEY` was populated. In GitHub Actions, secrets mapped as environment variables were populated with dummy strings like `***` during dry runs or public forks, causing the truthiness check to pass and the test suite to execute against unconfigured endpoints, resulting in false-positive `503 Service Unavailable` build failures across multiple PRs.
**Learning:** Simple truthiness checks for environment secrets are insufficient in CI/CD environments where dummy values may be injected.
**Prevention:** Verify the structure of the secret (e.g., checking `?.startsWith("AIza")` for Firebase keys) to correctly deduce whether a valid secret is actually configured and avoid triggering invalid execution paths in CI.
