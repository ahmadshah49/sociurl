import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const dribbble: PlatformDefinition = {
  id: "dribbble",
  name: "Dribbble",
  domains: ["dribbble.com"],
  allowedSubdomains: ["www"],
  canonicalDomain: "dribbble.com",
  profilePatterns: [
    {
      handle: "plain",
      username: {
        pattern: /^(?!-)(?!.*-$)[A-Za-z0-9-]{1,30}$/,
        minLength: 1,
        maxLength: 30,
        description: "Letters, numbers and hyphens.",
      },
      description: "Root profile path: /username",
    },
  ],
  reservedPaths: [
    "about",
    "account",
    "blog",
    "designers",
    "explore",
    "jobs",
    "login",
    "logout",
    "pro",
    "resources",
    "search",
    "settings",
    "shots",
    "signup",
    "stories",
    "tags",
    "terms",
  ],
  icon: icon("dribbble", "#EA4C89"),
};
