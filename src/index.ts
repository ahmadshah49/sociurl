export { detectPlatform } from "./core/detect-platform";
export { validateSocialUrl } from "./core/validate-url";
export { extractUsername } from "./core/extract-username";
export { normalizeSocialUrl } from "./core/normalize-url";
export { getSupportedPlatforms, getPlatformInfo } from "./core/platform-info";
export {
  createValidationError,
  invalidUrl,
  unsupportedPlatform,
  missingUsername,
  invalidUsername,
  invalidProfilePath,
  invalidProtocol,
} from "./core/errors";

export { PlatformRegistry, createPlatformRegistry } from "./registry/platform-registry";
export { builtInPlatforms } from "./platforms";

export type {
  BuiltInPlatformId,
  CreatePlatformRegistryOptions,
  IconMetadata,
  InvalidValidationResult,
  PathProfilePattern,
  PlatformDefinition,
  PlatformId,
  ProfilePathPattern,
  QueryProfilePattern,
  RegisterPlatformOptions,
  SocialUrlOptions,
  UsernameRule,
  ValidateSocialUrlOptions,
  ValidValidationResult,
  ValidationError,
  ValidationErrorCode,
  ValidationMessage,
  ValidationMessageContext,
  ValidationMessages,
  ValidationResult,
} from "./types";
