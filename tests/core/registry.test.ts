import { describe, expect, it } from "vitest";
import {
  builtInPlatforms,
  createPlatformRegistry,
  detectPlatform,
  getPlatformInfo,
  getSupportedPlatforms,
  normalizeSocialUrl,
  validateSocialUrl,
} from "../../src";
import type { PlatformDefinition } from "../../src";

const devTo: PlatformDefinition = {
  id: "devto",
  name: "DEV Community",
  domains: ["dev.to"],
  canonicalDomain: "dev.to",
  profilePatterns: [
    {
      handle: "at",
      username: {
        pattern: /^[A-Za-z0-9_]{2,30}$/,
        minLength: 2,
        maxLength: 30,
      },
    },
  ],
  reservedPaths: ["about"],
};

const prefixPlatform: PlatformDefinition = {
  id: "example",
  name: "Example",
  domains: ["example.social"],
  canonicalDomain: "example.social",
  profilePatterns: [
    {
      prefix: ["people"],
      username: {
        pattern: /^[a-z0-9-]{2,20}$/,
        minLength: 2,
        maxLength: 20,
      },
    },
  ],
  reservedPaths: ["explore"],
};

describe("PlatformRegistry", () => {
  it("exposes all 15 built-in platforms", () => {
    const platforms = getSupportedPlatforms();
    expect(platforms).toHaveLength(15);
    expect(platforms.map((platform) => platform.id)).toEqual([
      "instagram",
      "facebook",
      "linkedin",
      "github",
      "x",
      "youtube",
      "tiktok",
      "pinterest",
      "reddit",
      "twitch",
      "medium",
      "dribbble",
      "behance",
      "telegram",
      "threads",
    ]);
  });

  it("returns individual platform metadata", () => {
    expect(getPlatformInfo("instagram")?.name).toBe("Instagram");
    expect(getPlatformInfo("missing")).toBeNull();
  });

  it("deep-freezes built-in metadata", () => {
    const instagram = getPlatformInfo("instagram");
    expect(Object.isFrozen(builtInPlatforms)).toBe(true);
    expect(Object.isFrozen(instagram)).toBe(true);
    expect(Object.isFrozen(instagram?.domains)).toBe(true);
    expect(Object.isFrozen(instagram?.profilePatterns)).toBe(true);
    expect(Object.isFrozen(instagram?.icon)).toBe(true);
  });

  it("registers a custom platform in a scoped registry", () => {
    const registry = createPlatformRegistry();
    registry.register(devTo);

    expect(getSupportedPlatforms({ registry })).toHaveLength(16);
    expect(getPlatformInfo("devto", { registry })?.name).toBe("DEV Community");
    expect(getPlatformInfo("devto")).toBeNull();

    const result = validateSocialUrl("https://dev.to/@ahmad", { registry });
    expect(result).toMatchObject({
      valid: true,
      platform: "devto",
      username: "ahmad",
      normalizedUrl: "https://dev.to/@ahmad",
    });
    expect(detectPlatform("https://dev.to/@ahmad", { registry })).toBe("devto");
    expect(normalizeSocialUrl("https://dev.to/@ahmad/", { registry })).toBe(
      "https://dev.to/@ahmad",
    );
  });

  it("supports custom prefix patterns", () => {
    const registry = createPlatformRegistry({ platforms: [prefixPlatform] });
    const result = validateSocialUrl("https://example.social/people/ahmad/", { registry });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.normalizedUrl).toBe("https://example.social/people/ahmad");
    }

    expect(validateSocialUrl("https://example.social/people/", { registry }).valid).toBe(false);
    expect(validateSocialUrl("https://example.social/ahmad", { registry }).valid).toBe(false);
  });

  it("does not mutate the global built-in registry", () => {
    const registry = createPlatformRegistry();
    registry.register(devTo);
    registry.unregister("instagram");

    expect(
      getSupportedPlatforms({ registry }).some((platform) => platform.id === "instagram"),
    ).toBe(false);
    expect(getSupportedPlatforms().some((platform) => platform.id === "instagram")).toBe(true);
    expect(getSupportedPlatforms().some((platform) => platform.id === "devto")).toBe(false);
  });

  it("throws on duplicate registration unless overwrite is requested", () => {
    const registry = createPlatformRegistry();
    registry.register(devTo);

    expect(() => registry.register(devTo)).toThrow(/already registered/);
    expect(() => registry.register({ ...devTo, name: "DEV" }, { overwrite: true })).not.toThrow();
    expect(registry.get("devto")?.name).toBe("DEV");
  });

  it("validates registration data", () => {
    const registry = createPlatformRegistry();

    expect(() =>
      registry.register({
        ...devTo,
        id: "Bad ID",
      }),
    ).toThrow(/Invalid platform id/);

    expect(() =>
      registry.register({
        ...devTo,
        id: "uppercase-domain",
        domains: ["Example.com"],
      }),
    ).toThrow(/invalid domain/);

    expect(() =>
      registry.register({
        ...devTo,
        id: "missing-patterns",
        profilePatterns: [],
      }),
    ).toThrow(/at least one profile pattern/);
  });

  it("can create a registry without built-ins", () => {
    const registry = createPlatformRegistry({
      includeBuiltIns: false,
      platforms: [devTo],
    });

    expect(getSupportedPlatforms({ registry })).toHaveLength(1);
    expect(validateSocialUrl("https://instagram.com/ahmad", { registry }).valid).toBe(false);
    expect(validateSocialUrl("https://dev.to/@ahmad", { registry }).valid).toBe(true);
  });

  it("removes a platform", () => {
    const registry = createPlatformRegistry();
    expect(registry.unregister("github")).toBe(true);
    expect(registry.unregister("github")).toBe(false);
    expect(registry.has("github")).toBe(false);
  });
});
