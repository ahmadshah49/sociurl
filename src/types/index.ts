import type { PlatformRegistry } from "../registry/platform-registry";

/**
 * IDs of the platforms shipped with Sociurl.
 *
 * `PlatformId` intentionally stays open so custom registries can introduce
 * their own IDs without declaration merging.
 */
export type BuiltInPlatformId =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "github"
  | "x"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "reddit"
  | "twitch"
  | "medium"
  | "dribbble"
  | "behance"
  | "telegram"
  | "threads";

export type PlatformId = BuiltInPlatformId | (string & {});

export type ValidationErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_PLATFORM"
  | "MISSING_USERNAME"
  | "INVALID_USERNAME"
  | "INVALID_PROFILE_PATH"
  | "INVALID_PROTOCOL";

export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
}

export interface ValidationMessageContext {
  code: ValidationErrorCode;
  /** The detected platform, or `null` when detection never succeeded. */
  platform: PlatformDefinition | null;
  /** The message Sociurl would use without an override. */
  defaultMessage: string;
}

/**
 * A replacement message. Strings may contain a `{platform}` token, which is
 * replaced with the platform's display name (or `"social platform"`).
 */
export type ValidationMessage = string | ((context: ValidationMessageContext) => string);

/** Per-error-code message overrides. Unlisted codes keep their defaults. */
export type ValidationMessages = Partial<Record<ValidationErrorCode, ValidationMessage>>;

export interface ValidValidationResult {
  valid: true;
  platform: PlatformId;
  username: string;
  normalizedUrl: string;
  error: null;
}

export interface InvalidValidationResult {
  valid: false;
  platform: PlatformId | null;
  username: null;
  normalizedUrl: null;
  error: ValidationError;
}

/**
 * A discriminated union: narrow with `result.valid`.
 */
export type ValidationResult = ValidValidationResult | InvalidValidationResult;

export interface UsernameRule {
  /** Anchored, non-global regular expression applied to the decoded username. */
  pattern: RegExp;
  minLength?: number;
  maxLength?: number;
  description?: string;
}

export interface PathProfilePattern {
  /** Defaults to `"path"`. */
  kind?: "path";
  /** Literal, case-insensitive path segments before the username. */
  prefix?: readonly string[];
  /** `"at"` accepts `/@username`; `"plain"` accepts `/username`. */
  handle?: "plain" | "at";
  /** Optional canonical prefix used when normalizing (for example `u` -> `user`). */
  canonicalPrefix?: readonly string[];
  username: UsernameRule;
  description?: string;
}

export interface QueryProfilePattern {
  kind: "query";
  /** Exact filename served from the root, for example `profile.php`. */
  pathname: string;
  /** Query parameter that carries the username or numeric ID. */
  queryParam: string;
  username: UsernameRule;
  description?: string;
}

export type ProfilePathPattern = PathProfilePattern | QueryProfilePattern;

export interface IconMetadata {
  viewBox: string;
  paths: readonly string[];
  /** Brand color intended as a hint; consumers may override it. */
  color?: string;
}

export interface PlatformDefinition {
  id: PlatformId;
  name: string;
  /** Base hostnames, without a scheme or path. */
  domains: readonly string[];
  /**
   * Explicitly permitted subdomain labels for every entry in `domains`.
   * Defaults to `["www"]`. `www.instagram.com` is accepted, while
   * `cdn.instagram.com` is rejected.
   */
  allowedSubdomains?: readonly string[];
  /** Hostname used in normalized URLs. Defaults to `domains[0]`. */
  canonicalDomain?: string;
  profilePatterns: readonly ProfilePathPattern[];
  /** Path or username values that are not profile handles. */
  reservedPaths?: readonly string[];
  icon?: IconMetadata;
}

export interface SocialUrlOptions {
  /** Registry to use. Defaults to the immutable built-in registry. */
  registry?: PlatformRegistry;
}

export interface ValidateSocialUrlOptions extends SocialUrlOptions {
  /**
   * Require the URL to belong to this platform. Useful for a platform-specific
   * input where a GitHub URL should not silently pass an Instagram field.
   */
  platform?: PlatformId;
  /** Override error messages per error code. */
  messages?: ValidationMessages;
}

export interface RegisterPlatformOptions {
  /** Replace an existing definition with the same ID. Defaults to `false`. */
  overwrite?: boolean;
}

export interface CreatePlatformRegistryOptions {
  /** Include the 15 built-in platforms. Defaults to `true`. */
  includeBuiltIns?: boolean;
  /** Additional platform definitions to register immediately. */
  platforms?: readonly PlatformDefinition[];
}
