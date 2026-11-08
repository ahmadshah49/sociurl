import { describe, expect, it } from "vitest";
import { normalizeSocialUrl, validateSocialUrl } from "../../src";

describe("URL security", () => {
  it.each([
    "https://instagram.com.fake.com/ahmad",
    "https://fakeinstagram.com/ahmad",
    "https://instagram.com.evil.com/ahmad",
    "https://evil.com/?next=https://instagram.com/ahmad",
    "https://cdn.instagram.com/ahmad",
    "https://a.b.instagram.com/ahmad",
    "https://instagram.co/ahmad",
  ])("does not accept lookalike or unrelated hostname %s", (url) => {
    expect(validateSocialUrl(url).valid).toBe(false);
  });

  it("rejects credentials embedded in the authority", () => {
    expect(validateSocialUrl("https://user:pass@instagram.com/ahmad").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com@evil.com/ahmad").valid).toBe(false);
  });

  it("rejects non-standard ports", () => {
    expect(validateSocialUrl("https://instagram.com:8443/ahmad").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com:80/ahmad").valid).toBe(false);
    expect(validateSocialUrl("http://instagram.com:80/ahmad").valid).toBe(true);
  });

  it("rejects encoded path separators and null bytes", () => {
    expect(validateSocialUrl("https://instagram.com/ahmad%2Fextra").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com/ahmad%5Cextra").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com/ahmad%00").valid).toBe(false);
  });

  it("rejects raw backslashes and whitespace", () => {
    expect(validateSocialUrl("https://instagram.com\\@evil.com/ahmad").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com/a b").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com/ah\nmad").valid).toBe(false);
  });

  it("drops fragments and irrelevant query parameters", () => {
    expect(normalizeSocialUrl("https://instagram.com/ahmad#bio")).toBe(
      "https://www.instagram.com/ahmad",
    );
    expect(normalizeSocialUrl("https://instagram.com/ahmad?utm_source=test")).toBe(
      "https://www.instagram.com/ahmad",
    );
  });

  it("does not treat content URLs as profile URLs", () => {
    expect(validateSocialUrl("https://instagram.com/p/abc").valid).toBe(false);
    expect(validateSocialUrl("https://instagram.com/reel/abc").valid).toBe(false);
    expect(validateSocialUrl("https://youtube.com/watch?v=abc").valid).toBe(false);
    expect(validateSocialUrl("https://reddit.com/r/programming").valid).toBe(false);
    expect(validateSocialUrl("https://github.com/ahmad/repository").valid).toBe(false);
    expect(normalizeSocialUrl("https://twitch.tv/directory/game")).toBeNull();
  });
});
