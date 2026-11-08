import type { PlatformDefinition } from "../types";
import { icon } from "./icon";

export const twitch: PlatformDefinition = {
  id: "twitch",
  name: "Twitch",
  domains: ["twitch.tv"],
  allowedSubdomains: ["www", "m"],
  canonicalDomain: "www.twitch.tv",
  profilePatterns: [
    {
      handle: "plain",
      username: {
        pattern: /^[A-Za-z0-9_]{4,25}$/,
        minLength: 4,
        maxLength: 25,
        description: "Letters, numbers and underscores.",
      },
      description: "Root profile path: /username",
    },
  ],
  reservedPaths: [
    "about",
    "account",
    "directory",
    "downloads",
    "events",
    "friends",
    "inventory",
    "jobs",
    "login",
    "logout",
    "messages",
    "p",
    "privacy",
    "products",
    "search",
    "settings",
    "signup",
    "subscriptions",
    "terms",
    "turbo",
    "videos",
    "wallet",
  ],
  icon: icon("twitch", "#9146FF"),
};
