import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const tiktok: PlatformDefinition = {
  id: "tiktok",
  name: "TikTok",
  domains: ["tiktok.com"],
  allowedSubdomains: ["www", "m"],
  canonicalDomain: "www.tiktok.com",
  profilePatterns: [
    {
      handle: "at",
      username: {
        pattern: /^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{2,24}$/,
        minLength: 2,
        maxLength: 24,
        description: "Letters, numbers, periods and underscores.",
      },
      description: "Handle profile path: /@username",
    },
  ],
  reservedPaths: [
    "about",
    "business",
    "discover",
    "download",
    "explore",
    "following",
    "foryou",
    "legal",
    "live",
    "login",
    "logout",
    "music",
    "privacy",
    "search",
    "settings",
    "signup",
    "tag",
    "terms",
    "trending",
    "upload",
    "video",
  ],
  icon: icon("tiktok", "#000000"),
};
