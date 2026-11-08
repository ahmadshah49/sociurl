import { describe, expect, it, vi } from "vitest";
import { validateSocialUrl } from "../../src";

describe("validation message overrides", () => {
  it("replaces the default message for a single error code", () => {
    const result = validateSocialUrl("https://instagram.com/", {
      messages: { MISSING_USERNAME: "Please add your handle" },
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.code).toBe("MISSING_USERNAME");
      expect(result.error.message).toBe("Please add your handle");
    }
  });

  it("keeps the default message for codes that are not overridden", () => {
    const result = validateSocialUrl("https://example.com/ahmad", {
      messages: { MISSING_USERNAME: "Please add your handle" },
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.code).toBe("UNSUPPORTED_PLATFORM");
      expect(result.error.message).toBe("Unsupported social platform");
    }
  });

  it("replaces the {platform} token with the display name", () => {
    const result = validateSocialUrl("https://github.com/", {
      messages: { MISSING_USERNAME: "Enter your {platform} username" },
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe("Enter your GitHub username");
    }
  });

  it("falls back to a generic name when no platform was detected", () => {
    const result = validateSocialUrl("not a url", {
      messages: { INVALID_URL: "Check your {platform} link" },
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe("Check your social platform link");
    }
  });

  it("supports a function override with the full context", () => {
    const formatter = vi.fn(({ code, platform, defaultMessage }) => {
      return `${code}:${platform?.id ?? "none"}:${defaultMessage.length}`;
    });

    const result = validateSocialUrl("https://instagram.com/", {
      messages: { MISSING_USERNAME: formatter },
    });

    expect(formatter).toHaveBeenCalledWith({
      code: "MISSING_USERNAME",
      platform: expect.objectContaining({ id: "instagram" }),
      defaultMessage: "Instagram username is missing",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe("MISSING_USERNAME:instagram:29");
    }
  });

  it("overrides protocol errors", () => {
    const result = validateSocialUrl("ftp://instagram.com/ahmad", {
      messages: { INVALID_PROTOCOL: "Use https://" },
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe("Use https://");
    }
  });

  it("does not alter valid results", () => {
    const result = validateSocialUrl("https://instagram.com/ahmad", {
      messages: { MISSING_USERNAME: "nope" },
    });

    expect(result).toEqual({
      valid: true,
      platform: "instagram",
      username: "ahmad",
      normalizedUrl: "https://www.instagram.com/ahmad",
      error: null,
    });
  });
});
