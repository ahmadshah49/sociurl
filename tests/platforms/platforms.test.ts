import { describe, expect, it } from "vitest";
import {
  createPlatformRegistry,
  extractUsername,
  getPlatformInfo,
  getSupportedPlatforms,
  normalizeSocialUrl,
  validateSocialUrl,
} from "../../src";
import type { BuiltInPlatformId, PlatformDefinition } from "../../src";

interface PlatformCase {
  id: BuiltInPlatformId;
  valid: Array<[input: string, username: string, normalized: string]>;
  missing: string[];
  invalidUsername: string[];
  invalidPath: string[];
}

const cases: PlatformCase[] = [
  {
    id: "instagram",
    valid: [
      ["https://instagram.com/ahmad", "ahmad", "https://www.instagram.com/ahmad"],
      ["https://www.instagram.com/ahmad/", "ahmad", "https://www.instagram.com/ahmad"],
      ["https://m.instagram.com/Ahmad", "Ahmad", "https://www.instagram.com/Ahmad"],
      ["instagram.com/ahmad?hl=en", "ahmad", "https://www.instagram.com/ahmad"],
    ],
    missing: ["https://instagram.com/", "https://instagram.com"],
    invalidUsername: ["https://instagram.com/ahmad!", "https://instagram.com/.ahmad"],
    invalidPath: ["https://instagram.com/p/123", "https://instagram.com/ahmad/extra"],
  },
  {
    id: "facebook",
    valid: [
      ["https://facebook.com/ahmad.khan", "ahmad.khan", "https://www.facebook.com/ahmad.khan"],
      ["https://fb.com/ahmad.khan/", "ahmad.khan", "https://www.facebook.com/ahmad.khan"],
      [
        "https://facebook.com/profile.php?ref=bookmarks&id=100012345678901",
        "100012345678901",
        "https://www.facebook.com/profile.php?id=100012345678901",
      ],
    ],
    missing: ["https://facebook.com/", "https://facebook.com/profile.php"],
    invalidUsername: [
      "https://facebook.com/profile.php?id=abc",
      "https://facebook.com/ahmad..khan",
    ],
    invalidPath: ["https://facebook.com/groups/programming", "https://facebook.com/ahmad/photos"],
  },
  {
    id: "linkedin",
    valid: [
      [
        "https://linkedin.com/in/ahmad-khan",
        "ahmad-khan",
        "https://www.linkedin.com/in/ahmad-khan",
      ],
      [
        "https://www.linkedin.com/in/ahmad-khan/",
        "ahmad-khan",
        "https://www.linkedin.com/in/ahmad-khan",
      ],
      ["https://m.linkedin.com/in/Ahmad", "Ahmad", "https://www.linkedin.com/in/Ahmad"],
    ],
    missing: ["https://linkedin.com/in/", "https://linkedin.com/in"],
    invalidUsername: ["https://linkedin.com/in/ab", "https://linkedin.com/in/-ahmad"],
    invalidPath: [
      "https://linkedin.com/ahmad",
      "https://linkedin.com/company/acme",
      "https://linkedin.com/in/ahmad/extra",
    ],
  },
  {
    id: "github",
    valid: [
      ["https://github.com/ahmad", "ahmad", "https://github.com/ahmad"],
      ["https://www.github.com/Ahmad-Dev/", "Ahmad-Dev", "https://github.com/Ahmad-Dev"],
    ],
    missing: ["https://github.com/"],
    invalidUsername: ["https://github.com/ahmad!", "https://github.com/--"],
    invalidPath: ["https://github.com/ahmad/repository", "https://github.com/settings/profile"],
  },
  {
    id: "x",
    valid: [
      ["https://x.com/ahmad_1", "ahmad_1", "https://x.com/ahmad_1"],
      ["https://twitter.com/ahmad", "ahmad", "https://x.com/ahmad"],
      ["https://mobile.twitter.com/ahmad/", "ahmad", "https://x.com/ahmad"],
    ],
    missing: ["https://x.com/", "https://twitter.com"],
    invalidUsername: ["https://x.com/this_username_is_way_too_long", "https://x.com/ahmad!"],
    invalidPath: ["https://x.com/i/status/123", "https://x.com/ahmad/status/123"],
  },
  {
    id: "youtube",
    valid: [
      ["https://youtube.com/@ahmad", "ahmad", "https://www.youtube.com/@ahmad"],
      ["https://www.youtube.com/@ahmad/", "ahmad", "https://www.youtube.com/@ahmad"],
      [
        "https://youtube.com/c/ahmad-channel",
        "ahmad-channel",
        "https://www.youtube.com/c/ahmad-channel",
      ],
      ["https://youtube.com/user/ahmad", "ahmad", "https://www.youtube.com/user/ahmad"],
      [
        `https://youtube.com/channel/UC${"a".repeat(22)}`,
        `UC${"a".repeat(22)}`,
        `https://www.youtube.com/channel/UC${"a".repeat(22)}`,
      ],
    ],
    missing: ["https://youtube.com/", "https://youtube.com/@", "https://youtube.com/c/"],
    invalidUsername: ["https://youtube.com/@ab", "https://youtube.com/channel/abc"],
    invalidPath: ["https://youtube.com/watch?v=123", "https://youtube.com/@ahmad/videos"],
  },
  {
    id: "tiktok",
    valid: [
      ["https://tiktok.com/@ahmad", "ahmad", "https://www.tiktok.com/@ahmad"],
      ["https://www.tiktok.com/@ahmad_1/", "ahmad_1", "https://www.tiktok.com/@ahmad_1"],
    ],
    missing: ["https://tiktok.com/", "https://tiktok.com/@"],
    invalidUsername: ["https://tiktok.com/@a", "https://tiktok.com/@ahmad!"],
    invalidPath: ["https://tiktok.com/ahmad", "https://tiktok.com/discover"],
  },
  {
    id: "pinterest",
    valid: [
      ["https://pinterest.com/ahmad", "ahmad", "https://www.pinterest.com/ahmad"],
      ["https://www.pinterest.com/ahmad_1/", "ahmad_1", "https://www.pinterest.com/ahmad_1"],
    ],
    missing: ["https://pinterest.com/"],
    invalidUsername: ["https://pinterest.com/ab", "https://pinterest.com/ahmad!"],
    invalidPath: ["https://pinterest.com/pin/123", "https://pinterest.com/ahmad/pins"],
  },
  {
    id: "reddit",
    valid: [
      ["https://reddit.com/user/ahmad", "ahmad", "https://www.reddit.com/user/ahmad"],
      ["https://reddit.com/u/ahmad", "ahmad", "https://www.reddit.com/user/ahmad"],
      ["https://old.reddit.com/user/ahmad_1/", "ahmad_1", "https://www.reddit.com/user/ahmad_1"],
    ],
    missing: ["https://reddit.com/user/", "https://reddit.com/u"],
    invalidUsername: ["https://reddit.com/user/ab", "https://reddit.com/user/ahmad!"],
    invalidPath: ["https://reddit.com/r/programming", "https://reddit.com/ahmad"],
  },
  {
    id: "twitch",
    valid: [
      ["https://twitch.tv/ahmad", "ahmad", "https://www.twitch.tv/ahmad"],
      ["https://www.twitch.tv/ahmad_1/", "ahmad_1", "https://www.twitch.tv/ahmad_1"],
    ],
    missing: ["https://twitch.tv/"],
    invalidUsername: ["https://twitch.tv/abc", "https://twitch.tv/ahmad!"],
    invalidPath: ["https://twitch.tv/directory/game", "https://twitch.tv/ahmad/videos"],
  },
  {
    id: "medium",
    valid: [
      ["https://medium.com/@ahmad", "ahmad", "https://medium.com/@ahmad"],
      ["https://www.medium.com/@ahmad/", "ahmad", "https://medium.com/@ahmad"],
    ],
    missing: ["https://medium.com/", "https://medium.com/@"],
    invalidUsername: ["https://medium.com/@ab", "https://medium.com/@ahmad!"],
    invalidPath: [
      "https://medium.com/ahmad",
      "https://medium.com/me",
      "https://medium.com/@ahmad/about",
    ],
  },
  {
    id: "dribbble",
    valid: [
      ["https://dribbble.com/ahmad", "ahmad", "https://dribbble.com/ahmad"],
      [
        "https://www.dribbble.com/ahmad-design/",
        "ahmad-design",
        "https://dribbble.com/ahmad-design",
      ],
    ],
    missing: ["https://dribbble.com/"],
    invalidUsername: ["https://dribbble.com/-ahmad", "https://dribbble.com/ahmad!"],
    invalidPath: ["https://dribbble.com/shots/123", "https://dribbble.com/ahmad/extra"],
  },
  {
    id: "behance",
    valid: [
      ["https://behance.net/ahmad", "ahmad", "https://www.behance.net/ahmad"],
      [
        "https://www.behance.net/ahmad-design/",
        "ahmad-design",
        "https://www.behance.net/ahmad-design",
      ],
    ],
    missing: ["https://behance.net/"],
    invalidUsername: ["https://behance.net/-ahmad", `https://behance.net/${"a".repeat(51)}`],
    invalidPath: ["https://behance.net/gallery/123", "https://behance.net/ahmad/extra"],
  },
  {
    id: "telegram",
    valid: [
      ["https://t.me/ahmad", "ahmad", "https://t.me/ahmad"],
      ["https://telegram.me/ahmad_1/", "ahmad_1", "https://t.me/ahmad_1"],
      ["https://t.me/ahmad?start=hello", "ahmad", "https://t.me/ahmad"],
    ],
    missing: ["https://t.me/"],
    invalidUsername: ["https://t.me/abcd", "https://t.me/1ahmad", "https://t.me/ahmad!"],
    invalidPath: ["https://t.me/joinchat/abc", "https://t.me/ahmad/extra"],
  },
  {
    id: "threads",
    valid: [
      ["https://threads.net/@ahmad", "ahmad", "https://www.threads.net/@ahmad"],
      ["https://threads.com/@ahmad/", "ahmad", "https://www.threads.net/@ahmad"],
      ["https://threads.net/%40ahmad", "ahmad", "https://www.threads.net/@ahmad"],
    ],
    missing: ["https://threads.net/", "https://threads.net/@"],
    invalidUsername: ["https://threads.net/@ahmad!"],
    invalidPath: [
      "https://threads.net/ahmad",
      "https://threads.net/search",
      "https://threads.net/@ahmad/post/123",
    ],
  },
];

describe.each(cases)("$id platform", (platformCase) => {
  it.each(platformCase.valid)("accepts %s", (input, username, normalized) => {
    const result = validateSocialUrl(input);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.platform).toBe(platformCase.id);
      expect(result.username).toBe(username);
      expect(result.normalizedUrl).toBe(normalized);
      expect(result.error).toBeNull();
    }

    expect(extractUsername(input)).toBe(username);
    expect(normalizeSocialUrl(input)).toBe(normalized);
  });

  it.each(platformCase.missing)("reports a missing username for %s", (input) => {
    const result = validateSocialUrl(input);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.platform).toBe(platformCase.id);
      expect(result.error.code).toBe("MISSING_USERNAME");
    }
  });

  it.each(platformCase.invalidUsername)("reports an invalid username for %s", (input) => {
    const result = validateSocialUrl(input);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.code).toBe("INVALID_USERNAME");
    }
  });

  it.each(platformCase.invalidPath)("reports an invalid profile path for %s", (input) => {
    const result = validateSocialUrl(input);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.code).toBe("INVALID_PROFILE_PATH");
    }
  });
});

describe("brand colors", () => {
  it("defines a brand color for every built-in platform", () => {
    for (const platform of getSupportedPlatforms()) {
      expect(platform.icon?.color, `${platform.id} should define a brand color`).toMatch(
        /^#[0-9A-Fa-f]{6}$/,
      );
    }
  });

  it("keeps custom platform colors intact", () => {
    const custom: PlatformDefinition = {
      id: "branded",
      name: "Branded",
      domains: ["branded.example"],
      profilePatterns: [{ handle: "plain", username: { pattern: /^[a-z]+$/ } }],
      icon: { viewBox: "0 0 10 10", paths: ["M0 0h10v10H0z"], color: "#0f0f0f" },
    };
    const registry = createPlatformRegistry({ platforms: [custom] });

    expect(getPlatformInfo("branded", { registry })?.icon?.color).toBe("#0f0f0f");
  });
});
