import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlatformRegistry } from "../../src";
import type { PlatformDefinition } from "../../src";
import { useSocialValidator } from "../../src/react";

describe("useSocialValidator", () => {
  it("starts empty and validates immediately when called", () => {
    const { result } = renderHook(() => useSocialValidator());
    expect(result.current.result).toBeNull();
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeNull();

    let returned = result.current.result;
    act(() => {
      returned = result.current.validate("https://instagram.com/ahmad");
    });

    expect(returned).toMatchObject({
      valid: true,
      platform: "instagram",
      username: "ahmad",
    });
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.result?.valid).toBe(true);
  });

  it("stores invalid results", () => {
    const { result } = renderHook(() => useSocialValidator());

    act(() => {
      result.current.validate("https://instagram.com/");
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toEqual({
      code: "MISSING_USERNAME",
      message: "Instagram username is missing",
    });
  });

  it("clears the result for empty input", () => {
    const { result } = renderHook(() => useSocialValidator());

    act(() => {
      result.current.validate("https://instagram.com/ahmad");
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      const returned = result.current.validate("   ");
      expect(returned).toBeNull();
    });
    expect(result.current.result).toBeNull();
  });

  it("validates automatically when a value is supplied", async () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useSocialValidator({ platform: "instagram", value }),
      { initialProps: { value: "" } },
    );

    expect(result.current.result).toBeNull();

    rerender({ value: "instagram.com/ahmad" });
    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(result.current.result).toMatchObject({
      valid: true,
      normalizedUrl: "https://www.instagram.com/ahmad",
    });
  });

  it("supports blur-triggered validation", async () => {
    const { result } = renderHook(() =>
      useSocialValidator({
        platform: "instagram",
        value: "instagram.com/",
        validateOn: "blur",
      }),
    );

    expect(result.current.result).toBeNull();
    expect(result.current.touched).toBe(false);

    act(() => {
      result.current.validateOnBlur("instagram.com/");
    });

    expect(result.current.touched).toBe(true);
    expect(result.current.error?.code).toBe("MISSING_USERNAME");
  });

  it("enforces the configured platform", () => {
    const { result } = renderHook(() => useSocialValidator({ platform: "instagram" }));

    act(() => {
      result.current.validate("https://github.com/ahmad");
    });

    expect(result.current.error?.code).toBe("UNSUPPORTED_PLATFORM");
    expect(result.current.error?.message).toBe("Expected a profile URL for Instagram");
  });

  it("accepts a custom registry", () => {
    const custom: PlatformDefinition = {
      id: "devto",
      name: "DEV Community",
      domains: ["dev.to"],
      canonicalDomain: "dev.to",
      profilePatterns: [
        {
          handle: "at",
          username: { pattern: /^[A-Za-z0-9_]{2,30}$/ },
        },
      ],
    };
    const registry = createPlatformRegistry({ platforms: [custom] });
    const { result } = renderHook(() => useSocialValidator({ registry }));

    act(() => {
      result.current.validate("https://dev.to/@ahmad");
    });

    expect(result.current.result).toMatchObject({
      valid: true,
      platform: "devto",
      normalizedUrl: "https://dev.to/@ahmad",
    });
  });

  it("resets result and touched state", () => {
    const { result } = renderHook(() => useSocialValidator());

    act(() => {
      result.current.validateOnBlur("https://instagram.com/ahmad");
    });
    expect(result.current.result).not.toBeNull();
    expect(result.current.touched).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.result).toBeNull();
    expect(result.current.touched).toBe(false);
  });
});
