import type {
  PlatformDefinition,
  ValidationError,
  ValidationErrorCode,
  ValidationMessage,
  ValidationMessages,
} from "../types";

export function createValidationError(code: ValidationErrorCode, message: string): ValidationError {
  return { code, message };
}

const PLATFORM_TOKEN = /\{platform\}/g;

/**
 * Applies a caller-supplied message override. Unknown codes and missing
 * overrides fall back to the message Sociurl generated.
 */
export function resolveValidationMessage(
  error: ValidationError,
  platform: PlatformDefinition | null,
  messages?: ValidationMessages,
): ValidationError {
  const override = messages?.[error.code];
  if (override === undefined) {
    return error;
  }

  const resolve = (message: ValidationMessage): string => {
    if (typeof message === "function") {
      return message({
        code: error.code,
        platform,
        defaultMessage: error.message,
      });
    }

    return message.replace(PLATFORM_TOKEN, platform?.name ?? "social platform");
  };

  return createValidationError(error.code, resolve(override));
}

export function invalidUrl(message = "The URL is malformed"): ValidationError {
  return createValidationError("INVALID_URL", message);
}

export function unsupportedPlatform(message = "Unsupported social platform"): ValidationError {
  return createValidationError("UNSUPPORTED_PLATFORM", message);
}

export function missingUsername(platform: PlatformDefinition): ValidationError {
  return createValidationError("MISSING_USERNAME", `${platform.name} username is missing`);
}

export function invalidUsername(platform: PlatformDefinition): ValidationError {
  return createValidationError("INVALID_USERNAME", `${platform.name} username is invalid`);
}

export function invalidProfilePath(platform: PlatformDefinition): ValidationError {
  return createValidationError(
    "INVALID_PROFILE_PATH",
    `The URL is not a valid ${platform.name} profile URL`,
  );
}

export function invalidProtocol(): ValidationError {
  return createValidationError("INVALID_PROTOCOL", "Only HTTP and HTTPS URLs are supported");
}
