import type { PlatformDefinition, UsernameRule } from "../types";
import { decodePath } from "./url-parser";

export type ProfileResolution =
  | {
      kind: "match";
      username: string;
      /** Path + relevant query used to build the canonical URL. */
      normalizedPath: string;
    }
  | { kind: "missing-username" }
  | { kind: "invalid-username" }
  | { kind: "invalid-profile-path" }
  | { kind: "invalid-url"; message: string };

function lowercase(value: string): string {
  return value.toLowerCase();
}

function matchesPrefix(segments: readonly string[], prefix: readonly string[]): boolean {
  if (segments.length < prefix.length) {
    return false;
  }

  return prefix.every((segment, index) => lowercase(segments[index] ?? "") === lowercase(segment));
}

function usernameIsValid(rule: UsernameRule, username: string): boolean {
  if (!username) {
    return false;
  }

  if (rule.minLength !== undefined && username.length < rule.minLength) {
    return false;
  }

  if (rule.maxLength !== undefined && username.length > rule.maxLength) {
    return false;
  }

  // Defensive check shared by every platform. Path separators, whitespace and
  // query/fragment delimiters must not appear inside a decoded username.
  for (const character of username) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (
      codePoint <= 0x20 ||
      codePoint === 0x7f ||
      character === "/" ||
      character === "\\" ||
      character === "?" ||
      character === "#"
    ) {
      return false;
    }
  }

  return rule.pattern.test(username);
}

function encodeSegment(value: string): string {
  return encodeURIComponent(value);
}

function buildPath(prefix: readonly string[], handle: "plain" | "at", username: string): string {
  const parts = [...prefix];
  parts.push(handle === "at" ? `@${encodeSegment(username)}` : encodeSegment(username));
  return `/${parts.join("/")}`;
}

/**
 * Resolves a path against a platform definition. Reserved paths and content
 * paths are distinguished from profile paths missing a username.
 */
export function resolveProfile(
  platform: PlatformDefinition,
  pathname: string,
  searchParams: URLSearchParams,
): ProfileResolution {
  const decoded = decodePath(pathname);
  if (!decoded.ok) {
    return { kind: "invalid-url", message: decoded.error.message };
  }

  const { segments } = decoded.value;
  if (segments.length === 0) {
    return { kind: "missing-username" };
  }

  const reserved = new Set((platform.reservedPaths ?? []).map(lowercase));
  const first = lowercase(segments[0] ?? "");

  if (reserved.has(first)) {
    return { kind: "invalid-profile-path" };
  }

  // Query-based identifiers (for example Facebook's profile.php?id=123) are
  // checked before path patterns so that a filename is never mistaken for a
  // username.
  const queryPatterns = platform.profilePatterns.filter((pattern) => pattern.kind === "query");

  for (const pattern of queryPatterns) {
    if (segments.length !== 1 || first !== lowercase(pattern.pathname)) {
      continue;
    }

    const value = searchParams.get(pattern.queryParam);

    if (value === null || value.trim() === "") {
      return { kind: "missing-username" };
    }

    const username = value.trim();
    if (reserved.has(lowercase(username)) || !usernameIsValid(pattern.username, username)) {
      return { kind: "invalid-username" };
    }

    return {
      kind: "match",
      username,
      normalizedPath: `/${pattern.pathname}?${encodeSegment(pattern.queryParam)}=${encodeSegment(
        username,
      )}`,
    };
  }

  let sawMissingUsername = false;
  let sawInvalidUsername = false;
  let sawInvalidPath = false;

  for (const pattern of platform.profilePatterns) {
    if (pattern.kind === "query") {
      continue;
    }

    const prefix = pattern.prefix ?? [];
    if (!matchesPrefix(segments, prefix)) {
      continue;
    }

    if (segments.length === prefix.length) {
      sawMissingUsername = true;
      continue;
    }

    if (segments.length > prefix.length + 1) {
      sawInvalidPath = true;
      continue;
    }

    const raw = segments[prefix.length] ?? "";
    let username: string;

    if (pattern.handle === "at") {
      if (!raw.startsWith("@")) {
        continue;
      }
      username = raw.slice(1);
    } else {
      username = raw;
    }

    if (!username) {
      sawMissingUsername = true;
      continue;
    }

    if (reserved.has(lowercase(username))) {
      sawInvalidUsername = true;
      continue;
    }

    if (!usernameIsValid(pattern.username, username)) {
      sawInvalidUsername = true;
      continue;
    }

    const canonicalPrefix = pattern.canonicalPrefix ?? prefix;
    return {
      kind: "match",
      username,
      normalizedPath: buildPath(canonicalPrefix, pattern.handle ?? "plain", username),
    };
  }

  if (sawInvalidUsername) {
    return { kind: "invalid-username" };
  }

  if (sawMissingUsername) {
    return { kind: "missing-username" };
  }

  if (sawInvalidPath) {
    return { kind: "invalid-profile-path" };
  }

  return { kind: "invalid-profile-path" };
}
