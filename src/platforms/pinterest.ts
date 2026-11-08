import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const pinterest: PlatformDefinition = {
  id: "pinterest",
  name: "Pinterest",
  domains: ["pinterest.com"],
  allowedSubdomains: ["www", "m"],
  canonicalDomain: "www.pinterest.com",
  profilePatterns: [
    {
      handle: "plain",
      username: {
        pattern: /^[A-Za-z0-9_]{3,30}$/,
        minLength: 3,
        maxLength: 30,
        description: "Letters, numbers and underscores.",
      },
      description: "Root profile path: /username",
    },
  ],
  reservedPaths: [
    "about",
    "business",
    "categories",
    "discover",
    "explore",
    "ideas",
    "login",
    "logout",
    "pin",
    "pinterest",
    "privacy",
    "resource",
    "search",
    "settings",
    "signup",
    "terms",
    "today",
    "topics",
  ],
  icon: icon("pinterest", "#BD081C"),
};
