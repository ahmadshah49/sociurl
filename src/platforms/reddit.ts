import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const reddit: PlatformDefinition = {
  id: "reddit",
  name: "Reddit",
  domains: ["reddit.com"],
  allowedSubdomains: ["www", "old", "new", "m"],
  canonicalDomain: "www.reddit.com",
  profilePatterns: [
    {
      prefix: ["user"],
      handle: "plain",
      username: {
        pattern: /^[A-Za-z0-9_-]{3,20}$/,
        minLength: 3,
        maxLength: 20,
        description: "Letters, numbers, underscores and hyphens.",
      },
      description: "Profile path: /user/username",
    },
    {
      prefix: ["u"],
      canonicalPrefix: ["user"],
      handle: "plain",
      username: {
        pattern: /^[A-Za-z0-9_-]{3,20}$/,
        minLength: 3,
        maxLength: 20,
        description: "Letters, numbers, underscores and hyphens.",
      },
      description: "Short profile path: /u/username (normalized to /user/)",
    },
  ],
  reservedPaths: [
    "about",
    "account",
    "advertising",
    "coins",
    "explore",
    "help",
    "login",
    "logout",
    "message",
    "messages",
    "premium",
    "privacy",
    "r",
    "search",
    "settings",
    "signup",
    "subreddits",
    "submit",
    "terms",
    "wiki",
  ],
  icon: icon("reddit", "#FF4500"),
};
