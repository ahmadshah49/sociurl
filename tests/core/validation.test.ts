import { describe, expect, it } from "vitest";
import { validateSocialUrl } from "../../src";

function expectError(url: string, code: string) {
  const result = validateSocialUrl(url);
  expect(result.valid).toBe(false);
  if (!result.valid) {
    expect(result.error.code).toBe(code);
    expect(result.username).toBeNull();
    expect(result.normalizedUrl).toBeNull();
  }
}

describe("validateSocialUrl", () => {
  it("returns a discriminated valid result", () => {
    expect(validateSocialUrl("https://instagram.com/ahmad")).toEqual({
      valid: true,
      platform: "instagram",
      username: "ahmad",
      normalizedUrl: "https://www.instagram.com/ahmad",
      error: null,
    });
  });

  it.each([
    ["", "INVALID_URL"],
    ["   ", "INVALID_URL"],
    ["https://", "INVALID_URL"],
    ["https://instagram.com/%zz", "INVALID_URL"],
    ["https://instagram.com/%2F", "INVALID_URL"],
    ["https://instagram.com/%00", "INVALID_URL"],
    ["https://instagram.com:8443/ahmad", "INVALID_URL"],
    ["https://user:pass@instagram.com/ahmad", "INVALID_URL"],
    ["https://instagram.com\\ahmad", "INVALID_URL"],
    ["https:/instagram.com/ahmad", "INVALID_URL"],
    ["ftp://instagram.com/ahmad", "INVALID_PROTOCOL"],
    ["javascript:alert(1)", "INVALID_PROTOCOL"],
    ["data:text/html,<script>alert(1)</script>", "INVALID_PROTOCOL"],
    ["https://example.com/ahmad", "UNSUPPORTED_PLATFORM"],
    ["https://instagram.com.fake.com/ahmad", "UNSUPPORTED_PLATFORM"],
    ["https://www.instagram.com/", "MISSING_USERNAME"],
    ["https://instagram.com", "MISSING_USERNAME"],
    ["https://instagram.com/?hl=en", "MISSING_USERNAME"],
    ["https://instagram.com/ahmad!", "INVALID_USERNAME"],
    ["https://instagram.com/p/123", "INVALID_PROFILE_PATH"],
    ["https://instagram.com/ahmad/extra", "INVALID_PROFILE_PATH"],
  ])("rejects %s with %s", (url, code) => {
    expectError(url, code);
  });

  it("reports a friendly platform-specific missing username message", () => {
    const result = validateSocialUrl("https://linkedin.com/in/");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.platform).toBe("linkedin");
      expect(result.error).toEqual({
        code: "MISSING_USERNAME",
        message: "LinkedIn username is missing",
      });
    }
  });

  it("supports protocol-relative and port-bearing input", () => {
    expect(validateSocialUrl("//instagram.com/ahmad").valid).toBe(true);
    expect(validateSocialUrl("instagram.com:443/ahmad").valid).toBe(true);
    expect(validateSocialUrl("http://instagram.com:80/ahmad").valid).toBe(true);
  });

  it("accepts HTTP and upgrades it during normalization", () => {
    const result = validateSocialUrl("http://instagram.com/ahmad");
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.normalizedUrl).toBe("https://www.instagram.com/ahmad");
    }
  });

  it("enforces an expected platform", () => {
    const result = validateSocialUrl("https://github.com/ahmad", {
      platform: "instagram",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.platform).toBe("github");
      expect(result.error.code).toBe("UNSUPPORTED_PLATFORM");
      expect(result.error.message).toBe("Expected a profile URL for Instagram");
    }
  });

  it("rejects an unregistered expected platform", () => {
    const result = validateSocialUrl("https://github.com/ahmad", {
      platform: "not-registered",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.code).toBe("UNSUPPORTED_PLATFORM");
      expect(result.error.message).toContain("not registered");
    }
  });
});
