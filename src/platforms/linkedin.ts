import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const linkedin: PlatformDefinition = {
  id: "linkedin",
  name: "LinkedIn",
  domains: ["linkedin.com"],
  allowedSubdomains: ["www", "m", "mobile"],
  canonicalDomain: "www.linkedin.com",
  profilePatterns: [
    {
      prefix: ["in"],
      handle: "plain",
      username: {
        pattern: /^(?!-)(?!.*-$)[A-Za-z0-9-]{3,100}$/,
        minLength: 3,
        maxLength: 100,
        description: "Letters, numbers and hyphens; no leading or trailing hyphen.",
      },
      description: "Personal profile path: /in/username",
    },
  ],
  reservedPaths: [
    "about",
    "ads",
    "company",
    "feed",
    "help",
    "jobs",
    "learning",
    "login",
    "logout",
    "m",
    "messaging",
    "my",
    "notifications",
    "pricing",
    "privacy",
    "products",
    "sales",
    "search",
    "settings",
    "signup",
    "solutions",
    "talent",
    "terms",
  ],
  icon: icon("linkedin", "#0A66C2"),
};
