import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { getChatkaraEnv, isProductionEnv } from "./env.ts";

describe("getChatkaraEnv", () => {
  const keys = ["CHATKARA_ENV", "VERCEL_ENV"] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("defaults to development", () => {
    assert.equal(getChatkaraEnv(), "development");
    assert.equal(isProductionEnv(), false);
  });

  it("respects CHATKARA_ENV override", () => {
    process.env.CHATKARA_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    assert.equal(getChatkaraEnv(), "production");
    process.env.CHATKARA_ENV = "dev";
    assert.equal(getChatkaraEnv(), "development");
  });

  it("treats Vercel production as production", () => {
    process.env.VERCEL_ENV = "production";
    assert.equal(getChatkaraEnv(), "production");
  });

  it("treats Vercel preview as development", () => {
    process.env.VERCEL_ENV = "preview";
    assert.equal(getChatkaraEnv(), "development");
  });
});
