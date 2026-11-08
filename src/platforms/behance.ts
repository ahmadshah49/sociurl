import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const behance: PlatformDefinition = {
  id: "behance",
  name: "Behance",
  domains: ["behance.net"],
  allowedSubdomains: ["www"],
  canonicalDomain: "www.behance.net",
  profilePatterns: [
    {
      handle: "plain",
      username: {
        pattern: /^(?!-)(?!.*-$)[A-Za-z0-9-]{1,50}$/,
        minLength: 1,
        maxLength: 50,
        description: "Letters, numbers and hyphens.",
      },
      description: "Root profile path: /username",
    },
  ],
  reservedPaths: [
    "about",
    "account",
    "adobe",
    "assets",
    "blog",
    "careers",
    "featured",
    "galleries",
    "gallery",
    "hire",
    "jobs",
    "login",
    "logout",
    "search",
    "settings",
    "signup",
    "terms",
  ],
  icon: icon("behance", "#1769FF"),
};
