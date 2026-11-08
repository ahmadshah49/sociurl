import { builtInPlatforms } from "../platforms";
import type {
  CreatePlatformRegistryOptions,
  PlatformDefinition,
  PlatformId,
  RegisterPlatformOptions,
} from "../types";

const DEFAULT_SUBDOMAINS = ["www"] as const;
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "");
}

function assertValidDefinition(definition: PlatformDefinition): void {
  if (!ID_PATTERN.test(definition.id)) {
    throw new Error(
      `Invalid platform id "${definition.id}". Use lowercase letters, numbers and hyphens.`,
    );
  }

  if (!definition.name.trim()) {
    throw new Error(`Platform "${definition.id}" must have a display name.`);
  }

  if (definition.domains.length === 0) {
    throw new Error(`Platform "${definition.id}" must declare at least one domain.`);
  }

  for (const domain of definition.domains) {
    if (domain !== normalizeHostname(domain) || domain.includes("/") || domain.includes(":")) {
      throw new Error(
        `Platform "${definition.id}" has an invalid domain "${domain}". Use a lowercase hostname.`,
      );
    }
  }

  if (definition.canonicalDomain) {
    const canonicalDomain = definition.canonicalDomain;
    const allowedSubdomains = definition.allowedSubdomains ?? DEFAULT_SUBDOMAINS;
    const canonicalAllowed = definition.domains.some((domain) => {
      if (canonicalDomain === domain) {
        return true;
      }

      const suffix = `.${domain}`;
      if (!canonicalDomain.endsWith(suffix)) {
        return false;
      }

      const prefix = canonicalDomain.slice(0, -suffix.length);
      return !prefix.includes(".") && allowedSubdomains.includes(prefix);
    });

    if (!canonicalAllowed) {
      throw new Error(
        `Platform "${definition.id}" canonicalDomain must be one of its declared domains or an allowed subdomain.`,
      );
    }
  }

  if (definition.profilePatterns.length === 0) {
    throw new Error(`Platform "${definition.id}" must declare at least one profile pattern.`);
  }

  for (const pattern of definition.profilePatterns) {
    if (!pattern.username || !(pattern.username.pattern instanceof RegExp)) {
      throw new Error(`Platform "${definition.id}" has a profile pattern without a username rule.`);
    }

    if (pattern.username.pattern.global || pattern.username.pattern.sticky) {
      throw new Error(
        `Platform "${definition.id}" username patterns must not use the global or sticky flag.`,
      );
    }

    if (pattern.kind === "query") {
      if (!pattern.pathname || !pattern.queryParam) {
        throw new Error(
          `Platform "${definition.id}" query patterns require both pathname and queryParam.`,
        );
      }
    }
  }
}

/**
 * Holds a set of platform definitions. Registries created with
 * `createPlatformRegistry()` include the built-ins, but registrations only
 * affect that instance.
 */
export class PlatformRegistry {
  private readonly platforms = new Map<PlatformId, PlatformDefinition>();

  constructor(platforms: readonly PlatformDefinition[] = []) {
    for (const platform of platforms) {
      this.register(platform);
    }
  }

  register(definition: PlatformDefinition, options: RegisterPlatformOptions = {}): this {
    assertValidDefinition(definition);

    if (this.platforms.has(definition.id) && !options.overwrite) {
      throw new Error(
        `Platform "${definition.id}" is already registered. Pass { overwrite: true } to replace it.`,
      );
    }

    this.platforms.set(definition.id, definition);
    return this;
  }

  unregister(id: PlatformId): boolean {
    return this.platforms.delete(id);
  }

  has(id: PlatformId): boolean {
    return this.platforms.has(id);
  }

  get(id: PlatformId): PlatformDefinition | null {
    return this.platforms.get(id) ?? null;
  }

  getAll(): readonly PlatformDefinition[] {
    return [...this.platforms.values()];
  }

  findByHostname(hostname: string): PlatformDefinition | null {
    const host = normalizeHostname(hostname);

    for (const platform of this.platforms.values()) {
      const allowedSubdomains = platform.allowedSubdomains ?? DEFAULT_SUBDOMAINS;

      for (const domain of platform.domains) {
        const base = normalizeHostname(domain);
        if (host === base) {
          return platform;
        }

        const suffix = `.${base}`;
        if (host.endsWith(suffix)) {
          const prefix = host.slice(0, -suffix.length);
          // Only one explicitly allowed label. This prevents
          // "foo.bar.instagram.com" from being treated as Instagram.
          if (!prefix.includes(".") && allowedSubdomains.includes(prefix)) {
            return platform;
          }
        }
      }
    }

    return null;
  }
}

export function createPlatformRegistry(
  options: CreatePlatformRegistryOptions = {},
): PlatformRegistry {
  const includeBuiltIns = options.includeBuiltIns ?? true;
  const initial = includeBuiltIns
    ? [...builtInPlatforms, ...(options.platforms ?? [])]
    : [...(options.platforms ?? [])];

  return new PlatformRegistry(initial);
}

/** Internal immutable default. Not exported, so callers cannot mutate it. */
export const defaultRegistry = createPlatformRegistry();
