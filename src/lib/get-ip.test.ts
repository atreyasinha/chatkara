import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getClientIp } from "./get-ip.ts";

describe("getClientIp", () => {
  it("returns unknown when no headers are present", () => {
    const req = new Request("http://localhost");
    assert.equal(getClientIp(req), "unknown");
  });

  it("prioritizes x-real-ip if present", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-real-ip": "1.2.3.4",
        "x-forwarded-for": "5.6.7.8, 9.10.11.12",
      },
    });
    assert.equal(getClientIp(req), "1.2.3.4");
  });

  it("trims x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-real-ip": "  1.2.3.4  ",
      },
    });
    assert.equal(getClientIp(req), "1.2.3.4");
  });

  it("extracts the rightmost IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "spoofed_ip, middle_proxy, 5.6.7.8",
      },
    });
    assert.equal(getClientIp(req), "5.6.7.8");
  });

  it("handles empty string x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "  ",
      },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("handles x-forwarded-for with trailing commas properly", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "1.2.3.4,  ",
      },
    });
    assert.equal(getClientIp(req), "1.2.3.4");
  });
});
