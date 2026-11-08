import { validateSocialUrl } from "./validate-url";
import type { SocialUrlOptions, ValidateSocialUrlOptions } from "../types";

/**
 * Returns the canonical HTTPS profile URL, or `null` when the input is not a
 * structurally valid profile URL.
 */
export function normalizeSocialUrl(
  url: string,
  options: ValidateSocialUrlOptions | SocialUrlOptions = {},
): string | null {
  const result = validateSocialUrl(url, options);
  return result.valid ? result.normalizedUrl : null;
}
