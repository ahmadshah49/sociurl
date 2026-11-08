import { defaultRegistry } from "../registry/platform-registry";
import type { PlatformDefinition, PlatformId, SocialUrlOptions } from "../types";

/** Returns metadata for every platform in the registry (built-ins by default). */
export function getSupportedPlatforms(
  options: SocialUrlOptions = {},
): readonly PlatformDefinition[] {
  const registry = options.registry ?? defaultRegistry;
  return registry.getAll();
}

/** Returns one platform definition, or `null` when it is not registered. */
export function getPlatformInfo(
  platform: PlatformId,
  options: SocialUrlOptions = {},
): PlatformDefinition | null {
  const registry = options.registry ?? defaultRegistry;
  return registry.get(platform);
}
