import { describe, expect, it } from "vitest";
import { extractUsername } from "../../src";

describe("extractUsername", () => {
  it.each([
    ["https://instagram.com/ahmad", "ahmad"],
    ["https://linkedin.com/in/ahmad", "ahmad"],
    ["https://youtube.com/@ahmad", "ahmad"],
    ["https://tiktok.com/@ahmad", "ahmad"],
    ["https://reddit.com/user/ahmad", "ahmad"],
    ["https://reddit.com/u/Ahmad_1", "Ahmad_1"],
    ["https://medium.com/@ahmad", "ahmad"],
    ["https://threads.net/%40ahmad", "ahmad"],
    ["https://facebook.com/profile.php?id=100012345678901", "100012345678901"],
    [`https://youtube.com/channel/UC${"a".repeat(22)}`, `UC${"a".repeat(22)}`],
  ])("extracts a username from %s", (url, username) => {
    expect(extractUsername(url)).toBe(username);
  });

  it.each([
    "https://instagram.com/",
    "https://instagram.com/ahmad!",
    "https://linkedin.com/ahmad",
    "https://instagram.com.fake.com/ahmad",
    "https://example.com/ahmad",
    "not a url",
  ])("returns null for %s", (url) => {
    expect(extractUsername(url)).toBeNull();
  });

  it("can restrict extraction to a platform", () => {
    expect(extractUsername("https://github.com/ahmad", { platform: "github" })).toBe("ahmad");
    expect(extractUsername("https://github.com/ahmad", { platform: "instagram" })).toBeNull();
  });
});
