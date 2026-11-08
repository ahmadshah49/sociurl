import { describe, expect, it } from "vitest";
import { normalizeSocialUrl } from "../../src";

describe("normalizeSocialUrl", () => {
  it.each([
    ["https://instagram.com/ahmad", "https://www.instagram.com/ahmad"],
    ["instagram.com/ahmad", "https://www.instagram.com/ahmad"],
    ["HTTP://instagram.com/ahmad/", "https://www.instagram.com/ahmad"],
    ["www.instagram.com/Ahmad/", "https://www.instagram.com/Ahmad"],
    ["https://m.instagram.com/ahmad?hl=en#top", "https://www.instagram.com/ahmad"],
    ["https://instagram.com/ahmad//", "https://www.instagram.com/ahmad"],
    ["https://instagram.com/%61hmad", "https://www.instagram.com/ahmad"],
    ["https://linkedin.com/in/ahmad-khan/", "https://www.linkedin.com/in/ahmad-khan"],
    ["https://reddit.com/u/ahmad", "https://www.reddit.com/user/ahmad"],
    ["https://twitter.com/ahmad", "https://x.com/ahmad"],
    ["https://telegram.me/ahmad_1", "https://t.me/ahmad_1"],
    ["https://threads.com/@ahmad/", "https://www.threads.net/@ahmad"],
    ["https://threads.net/%40ahmad", "https://www.threads.net/@ahmad"],
    ["https://youtube.com/@ahmad", "https://www.youtube.com/@ahmad"],
    ["https://youtube.com/c/ahmad", "https://www.youtube.com/c/ahmad"],
    ["https://youtube.com/user/ahmad", "https://www.youtube.com/user/ahmad"],
    [
      `https://youtube.com/channel/UC${"a".repeat(22)}`,
      `https://www.youtube.com/channel/UC${"a".repeat(22)}`,
    ],
    [
      "https://facebook.com/profile.php?ref=bookmarks&id=100012345678901",
      "https://www.facebook.com/profile.php?id=100012345678901",
    ],
    ["https://facebook.com/ahmad.khan?ref=profile", "https://www.facebook.com/ahmad.khan"],
    ["https://t.me/ahmad?start=hello", "https://t.me/ahmad"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeSocialUrl(input)).toBe(expected);
  });

  it.each([
    "https://instagram.com/",
    "https://linkedin.com/in/",
    "https://github.com/ahmad/repo",
    "https://instagram.com.fake.com/ahmad",
    "mailto:ahmad@example.com",
    "",
  ])("returns null for %s", (input) => {
    expect(normalizeSocialUrl(input)).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeSocialUrl("  https://instagram.com/ahmad  ")).toBe(
      "https://www.instagram.com/ahmad",
    );
  });
});
