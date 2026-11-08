import type { ValidationError } from "../types";
import { invalidProtocol, invalidUrl } from "../core/errors";

export interface ParsedInputUrl {
  /** Native URL with a normalized http/https protocol. */
  url: URL;
  /** True when the input explicitly included a scheme. */
  hadProtocol: boolean;
}

export type ParseInputUrlResult =
  { ok: true; value: ParsedInputUrl } | { ok: false; error: ValidationError };

const SCHEME_PATTERN = /^([A-Za-z][A-Za-z0-9+.-]*):/;

function hasControlOrSpace(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint <= 0x20 || codePoint === 0x7f) {
      return true;
    }
  }

  return false;
}

/**
 * Parses a user-supplied social URL. Missing protocols are upgraded to HTTPS
 * before parsing; HTTP is accepted and normalized later.
 */
export function parseInputUrl(input: string): ParseInputUrlResult {
  if (typeof input !== "string") {
    return { ok: false, error: invalidUrl("The URL must be a string") };
  }

  const value = input.trim();
  if (!value) {
    return { ok: false, error: invalidUrl("The URL is empty") };
  }

  if (hasControlOrSpace(value)) {
    return {
      ok: false,
      error: invalidUrl("The URL contains whitespace or control characters"),
    };
  }

  if (value.includes("\\")) {
    return { ok: false, error: invalidUrl("Backslashes are not allowed in URLs") };
  }

  let hadProtocol = false;
  let candidate = value;

  const schemeMatch = SCHEME_PATTERN.exec(value);
  if (schemeMatch) {
    const scheme = schemeMatch[1]?.toLowerCase() ?? "";
    const remainder = value.slice(schemeMatch[0].length);

    // A hostname followed by a port (example.com:443) also matches the scheme
    // shape. Treat it as a hostname unless the token has no dot, because real
    // schemes used to attack URL parsers never contain dots.
    const looksLikePort = scheme.includes(".") && !remainder.startsWith("//");

    if (!looksLikePort) {
      hadProtocol = true;

      if (scheme !== "http" && scheme !== "https") {
        return { ok: false, error: invalidProtocol() };
      }

      if (!remainder.startsWith("//")) {
        return {
          ok: false,
          error: invalidUrl("Protocol-relative input must use //"),
        };
      }
    }
  }

  if (!hadProtocol) {
    if (value.startsWith("//")) {
      candidate = `https:${value}`;
    } else {
      candidate = `https://${value}`;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: invalidUrl() };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: invalidProtocol() };
  }

  if (parsed.username || parsed.password) {
    return {
      ok: false,
      error: invalidUrl("URLs containing credentials are not supported"),
    };
  }

  if (!parsed.hostname) {
    return { ok: false, error: invalidUrl("The URL must include a hostname") };
  }

  // The URL API strips default ports (80/443). Any remaining port is
  // non-standard for these public profile URLs and is rejected rather than
  // silently ignored.
  if (parsed.port) {
    return {
      ok: false,
      error: invalidUrl("Non-standard ports are not supported"),
    };
  }

  return { ok: true, value: { url: parsed, hadProtocol } };
}

export interface DecodedPath {
  segments: string[];
}

export type DecodePathResult =
  { ok: true; value: DecodedPath } | { ok: false; error: ValidationError };

/**
 * Splits and decodes path segments. Encoded separators are rejected because
 * they make the routing boundary ambiguous.
 */
export function decodePath(pathname: string): DecodePathResult {
  const rawSegments = pathname.split("/").filter((segment) => segment !== "");
  const segments: string[] = [];

  for (const raw of rawSegments) {
    let decoded: string;

    try {
      decoded = decodeURIComponent(raw);
    } catch {
      return { ok: false, error: invalidUrl("The URL contains invalid percent-encoding") };
    }

    if (decoded === "." || decoded === "..") {
      return { ok: false, error: invalidUrl("Relative path segments are not allowed") };
    }

    if (decoded.includes("/") || decoded.includes("\\") || decoded.includes("\u0000")) {
      return { ok: false, error: invalidUrl("Encoded path separators are not allowed") };
    }

    segments.push(decoded);
  }

  return { ok: true, value: { segments } };
}
