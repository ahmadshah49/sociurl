import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const telegram: PlatformDefinition = {
  id: "telegram",
  name: "Telegram",
  domains: ["t.me", "telegram.me"],
  allowedSubdomains: ["www"],
  canonicalDomain: "t.me",
  profilePatterns: [
    {
      handle: "plain",
      username: {
        pattern: /^[A-Za-z][A-Za-z0-9_]{4,31}$/,
        minLength: 5,
        maxLength: 32,
        description: "Starts with a letter; letters, numbers and underscores.",
      },
      description: "Profile path: /username",
    },
  ],
  reservedPaths: [
    "addemoji",
    "addstickers",
    "addtheme",
    "blog",
    "contact",
    "faq",
    "joinchat",
    "login",
    "privacy",
    "proxy",
    "s",
    "setlanguage",
    "share",
    "socks",
    "telegram",
    "terms",
    "tour",
  ],
  icon: icon("telegram", "#26A5E4"),
};
