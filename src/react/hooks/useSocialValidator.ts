import { useCallback, useEffect, useState } from "react";
import { validateSocialUrl } from "../../core/validate-url";
import type { PlatformRegistry } from "../../registry/platform-registry";
import type {
  PlatformId,
  ValidationError,
  ValidationMessages,
  ValidationResult,
} from "../../types";

export interface UseSocialValidatorOptions {
  /** Require URLs to belong to this platform. */
  platform?: PlatformId;
  /** Registry containing built-in and/or custom platforms. */
  registry?: PlatformRegistry;
  /** Override error messages per error code. */
  messages?: ValidationMessages;
  /**
   * Optional value to validate automatically. When omitted, call `validate`
   * from your change handler for immediate validation.
   */
  value?: string;
  /**
   * `"change"` validates whenever `value` changes. `"blur"` waits for
   * `validateOnBlur`. Defaults to `"change"`.
   */
  validateOn?: "change" | "blur";
}

export interface UseSocialValidatorResult {
  /** Runs validation immediately and stores the result. */
  validate: (url: string) => ValidationResult | null;
  /** Marks the field as touched and runs validation (for blur handlers). */
  validateOnBlur: (url: string) => ValidationResult | null;
  /** Clears the result and touched state. */
  reset: () => void;
  result: ValidationResult | null;
  isValid: boolean;
  error: ValidationError | null;
  touched: boolean;
}

/**
 * React state wrapper around `validateSocialUrl`. The hook handles both
 * immediate validation (`validate` or the optional `value` prop) and
 * user-interaction validation (`validateOnBlur`).
 */
export function useSocialValidator(
  options: UseSocialValidatorOptions = {},
): UseSocialValidatorResult {
  const { platform, registry, messages, value, validateOn = "change" } = options;
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (url: string): ValidationResult | null => {
      if (!url.trim()) {
        setResult(null);
        return null;
      }

      const next = validateSocialUrl(url, { platform, registry, messages });
      setResult(next);
      return next;
    },
    [platform, registry, messages],
  );

  const validateOnBlur = useCallback(
    (url: string): ValidationResult | null => {
      setTouched(true);
      return validate(url);
    },
    [validate],
  );

  const reset = useCallback(() => {
    setResult(null);
    setTouched(false);
  }, []);

  useEffect(() => {
    if (value === undefined || validateOn !== "change") {
      return;
    }

    validate(value);
  }, [value, validateOn, validate]);

  const error = result && !result.valid ? result.error : null;

  return {
    validate,
    validateOnBlur,
    reset,
    result,
    isValid: result?.valid ?? false,
    error,
    touched,
  };
}
