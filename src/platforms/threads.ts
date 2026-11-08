import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const threads: PlatformDefinition = {
  id: "threads",
  name: "Threads",
  domains: ["threads.net", "threads.com"],
  allowedSubdomains: ["www"],
  canonicalDomain: "www.threads.net",
  profilePatterns: [
    {
      handle: "at",
      username: {
        pattern: /^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/,
        minLength: 1,
        maxLength: 30,
        description: "Letters, numbers, periods and underscores.",
      },
      description: "Handle profile path: /@username",
    },
  ],
  reservedPaths: [
    "about",
    "accounts",
    "activity",
    "explore",
    "help",
    "login",
    "logout",
    "privacy",
    "search",
    "settings",
    "t",
    "terms",
    "topics",
  ],
  icon: icon("threads", "#000000"),
};
