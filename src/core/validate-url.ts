import { defaultRegistry } from "../registry/platform-registry";
import type {
  InvalidValidationResult,
  PlatformDefinition,
  ValidateSocialUrlOptions,
  ValidationError,
  ValidationMessages,
  ValidationResult,
} from "../types";
import { resolveProfile } from "../utils/profile";
import { parseInputUrl } from "../utils/url-parser";
import {
  invalidProfilePath,
  invalidUrl,
  invalidUsername,
  missingUsername,
  resolveValidationMessage,
  unsupportedPlatform,
} from "./errors";

function invalid(
  platform: PlatformDefinition | null,
  error: ValidationError,
  messages?: ValidationMessages,
): InvalidValidationResult {
  return {
    valid: false,
    platform: platform?.id ?? null,
    username: null,
    normalizedUrl: null,
    error: resolveValidationMessage(error, platform, messages),
  };
}

function errorForResolution(
  platform: PlatformDefinition,
  resolution: ReturnType<typeof resolveProfile>,
): ValidationError | null {
  switch (resolution.kind) {
    case "missing-username":
      return missingUsername(platform);
    case "invalid-username":
      return invalidUsername(platform);
    case "invalid-profile-path":
      return invalidProfilePath(platform);
    case "invalid-url":
      return invalidUrl(resolution.message);
    default:
      return null;
  }
}

/**
 * Structurally validates a social profile URL. This never checks whether the
 * account exists on the remote network.
 */
export function validateSocialUrl(
  url: string,
  options: ValidateSocialUrlOptions = {},
): ValidationResult {
  const messages = options.messages;
  const parsed = parseInputUrl(url);
  if (!parsed.ok) {
    return invalid(null, parsed.error, messages);
  }

  const registry = options.registry ?? defaultRegistry;
  const platform = registry.findByHostname(parsed.value.url.hostname);

  if (!platform) {
    return invalid(null, unsupportedPlatform(), messages);
  }

  if (options.platform !== undefined && options.platform !== platform.id) {
    const expected = registry.get(options.platform);

    if (!expected) {
      return invalid(
        platform,
        unsupportedPlatform(`Platform "${String(options.platform)}" is not registered`),
        messages,
      );
    }

    return invalid(
      platform,
      unsupportedPlatform(`Expected a profile URL for ${expected.name}`),
      messages,
    );
  }

  const resolution = resolveProfile(
    platform,
    parsed.value.url.pathname,
    parsed.value.url.searchParams,
  );

  const resolutionError = errorForResolution(platform, resolution);
  if (resolutionError) {
    return invalid(platform, resolutionError, messages);
  }

  if (resolution.kind !== "match") {
    return invalid(platform, invalidProfilePath(platform), messages);
  }

  const canonicalDomain = platform.canonicalDomain ?? platform.domains[0];
  if (!canonicalDomain) {
    return invalid(platform, invalidProfilePath(platform), messages);
  }

  return {
    valid: true,
    platform: platform.id,
    username: resolution.username,
    normalizedUrl: `https://${canonicalDomain}${resolution.normalizedPath}`,
    error: null,
  };
}
