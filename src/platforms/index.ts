import type { PlatformDefinition } from "../types";
import { behance } from "./behance";
import { dribbble } from "./dribbble";
import { facebook } from "./facebook";
import { github } from "./github";
import { instagram } from "./instagram";
import { linkedin } from "./linkedin";
import { medium } from "./medium";
import { pinterest } from "./pinterest";
import { reddit } from "./reddit";
import { telegram } from "./telegram";
import { threads } from "./threads";
import { tiktok } from "./tiktok";
import { twitch } from "./twitch";
import { x } from "./x";
import { youtube } from "./youtube";

function deepFreezePlatforms(
  platforms: readonly PlatformDefinition[],
): readonly PlatformDefinition[] {
  for (const platform of platforms) {
    for (const pattern of platform.profilePatterns) {
      Object.freeze(pattern.username.pattern);
      Object.freeze(pattern.username);

      if (pattern.kind !== "query") {
        if (pattern.prefix) {
          Object.freeze(pattern.prefix);
        }
        if (pattern.canonicalPrefix) {
          Object.freeze(pattern.canonicalPrefix);
        }
      }

      Object.freeze(pattern);
    }

    Object.freeze(platform.domains);
    if (platform.allowedSubdomains) {
      Object.freeze(platform.allowedSubdomains);
    }
    Object.freeze(platform.profilePatterns);
    if (platform.reservedPaths) {
      Object.freeze(platform.reservedPaths);
    }
    if (platform.icon) {
      Object.freeze(platform.icon.paths);
      Object.freeze(platform.icon);
    }
    Object.freeze(platform);
  }

  return Object.freeze([...platforms]);
}

/**
 * Built-in definitions, in documentation order. These objects are deep-frozen;
 * register custom platforms through a registry.
 */
export const builtInPlatforms: readonly PlatformDefinition[] = deepFreezePlatforms([
  instagram,
  facebook,
  linkedin,
  github,
  x,
  youtube,
  tiktok,
  pinterest,
  reddit,
  twitch,
  medium,
  dribbble,
  behance,
  telegram,
  threads,
]);

export {
  behance,
  dribbble,
  facebook,
  github,
  instagram,
  linkedin,
  medium,
  pinterest,
  reddit,
  telegram,
  threads,
  tiktok,
  twitch,
  x,
  youtube,
};
