import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "./admin-auth.ts";

describe("admin session tokens", () => {
  it("round-trips a valid token when ADMIN_PASSWORD is set", () => {
    if (!process.env.ADMIN_PASSWORD) {
      // Unit env may not have it — set a throwaway for this process.
      process.env.ADMIN_PASSWORD = "unit-test-admin-password";
    }
    const token = createAdminSessionToken();
    assert.ok(token);
    assert.equal(verifyAdminSessionToken(token), true);
    assert.equal(verifyAdminSessionToken("admin.1.deadbeef"), false);
    assert.equal(verifyAdminSessionToken(""), false);
  });
});
