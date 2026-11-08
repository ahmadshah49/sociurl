import { validateSocialUrl } from "./validate-url";
import type { SocialUrlOptions, ValidateSocialUrlOptions } from "../types";

/**
 * Extracts a validated username. Returns `null` for unsupported hosts,
 * malformed paths, missing usernames and invalid usernames.
 */
export function extractUsername(
  url: string,
  options: ValidateSocialUrlOptions | SocialUrlOptions = {},
): string | null {
  const result = validateSocialUrl(url, options);
  return result.valid ? result.username : null;
}
