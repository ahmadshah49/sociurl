import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const medium: PlatformDefinition = {
  id: "medium",
  name: "Medium",
  domains: ["medium.com"],
  allowedSubdomains: ["www"],
  canonicalDomain: "medium.com",
  profilePatterns: [
    {
      handle: "at",
      username: {
        pattern: /^[A-Za-z0-9](?:[A-Za-z0-9._-]{1,48}[A-Za-z0-9])?$/,
        minLength: 3,
        maxLength: 50,
        description: "Medium handle without the leading @.",
      },
      description: "Handle profile path: /@username",
    },
  ],
  reservedPaths: [
    "about",
    "account",
    "archive",
    "business",
    "creators",
    "download",
    "explore",
    "help",
    "jobs",
    "login",
    "logout",
    "me",
    "membership",
    "p",
    "plans",
    "policy",
    "privacy",
    "search",
    "settings",
    "signin",
    "signup",
    "terms",
    "topics",
    "trending",
  ],
  icon: icon("medium", "#000000"),
};
