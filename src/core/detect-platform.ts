import { defaultRegistry } from "../registry/platform-registry";
import type { PlatformId, SocialUrlOptions } from "../types";
import { parseInputUrl } from "../utils/url-parser";

/**
 * Detects a supported platform from a hostname. Path validity is deliberately
 * not checked here, so `www.instagram.com/` still reports `instagram`.
 */
export function detectPlatform(url: string, options: SocialUrlOptions = {}): PlatformId | null {
  const parsed = parseInputUrl(url);
  if (!parsed.ok) {
    return null;
  }

  const registry = options.registry ?? defaultRegistry;
  return registry.findByHostname(parsed.value.url.hostname)?.id ?? null;
}
