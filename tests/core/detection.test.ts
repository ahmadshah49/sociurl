import { describe, expect, it } from "vitest";
import { detectPlatform } from "../../src";

describe("detectPlatform", () => {
  it.each([
    ["https://www.instagram.com/ahmad", "instagram"],
    ["instagram.com/ahmad", "instagram"],
    ["www.instagram.com/", "instagram"],
    ["https://m.instagram.com/ahmad", "instagram"],
    ["https://github.com/ahmad", "github"],
    ["https://twitter.com/ahmad", "x"],
    ["https://x.com/ahmad", "x"],
    ["https://fb.com/ahmad", "facebook"],
    ["https://telegram.me/ahmad", "telegram"],
    ["https://threads.com/@ahmad", "threads"],
    ["https://www.instagram.com./ahmad", "instagram"],
  ])("detects %s as %s", (url, expected) => {
    expect(detectPlatform(url)).toBe(expected);
  });

  it.each([
    "https://instagram.com.fake.com/ahmad",
    "https://fakeinstagram.com/ahmad",
    "https://instagram.com.evil.com/ahmad",
    "https://evil.com/instagram.com/ahmad",
    "https://cdn.instagram.com/ahmad",
    "https://a.b.instagram.com/ahmad",
    "https://youtu.be/abc123",
    "https://example.com/ahmad",
    "https://instagram.com:8080/ahmad",
    "https://user:pass@instagram.com/ahmad",
    "https://instagram.com@evil.com/ahmad",
    "javascript:alert(1)",
    "ftp://instagram.com/ahmad",
    "",
  ])("returns null for %s", (url) => {
    expect(detectPlatform(url)).toBeNull();
  });

  it("rejects a Cyrillic lookalike hostname", () => {
    expect(detectPlatform("https://іnstagram.com/ahmad")).toBeNull();
  });
});
