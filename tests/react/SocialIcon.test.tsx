import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlatformRegistry, getSupportedPlatforms } from "../../src";
import type { PlatformDefinition } from "../../src";
import { SocialIcon } from "../../src/react";

describe("SocialIcon", () => {
  it("renders an accessible built-in SVG icon", () => {
    render(<SocialIcon platform="instagram" />);
    const icon = screen.getByRole("img", { name: "Instagram icon" });

    expect(icon.tagName.toLowerCase()).toBe("svg");
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
    expect(icon).toHaveAttribute("fill", "currentColor");
    expect(icon.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("accepts size, color, label and className", () => {
    render(
      <SocialIcon
        platform="github"
        size={32}
        color="#ffffff"
        label="GitHub logo"
        className="custom-icon"
      />,
    );
    const icon = screen.getByRole("img", { name: "GitHub logo" });

    expect(icon).toHaveAttribute("width", "32");
    expect(icon).toHaveAttribute("height", "32");
    expect(icon).toHaveAttribute("fill", "#ffffff");
    expect(icon).toHaveClass("custom-icon");
  });

  it("can be decorative", () => {
    const { container } = render(<SocialIcon platform="instagram" decorative />);
    const icon = container.querySelector("svg");

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).not.toHaveAttribute("aria-label");
  });

  it("returns null for an unknown platform", () => {
    const { container } = render(<SocialIcon platform="missing" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("supports every built-in platform", () => {
    for (const platform of getSupportedPlatforms()) {
      const { container, unmount } = render(<SocialIcon platform={platform.id} />);
      const icon = container.querySelector("svg");

      expect(icon, `${platform.id} should render an icon`).not.toBeNull();
      expect(icon?.querySelectorAll("path").length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("renders custom platform icon metadata", () => {
    const custom: PlatformDefinition = {
      id: "custom",
      name: "Custom",
      domains: ["custom.example"],
      profilePatterns: [
        {
          handle: "plain",
          username: { pattern: /^[a-z]+$/ },
        },
      ],
      icon: {
        viewBox: "0 0 10 10",
        paths: ["M0 0h10v10H0z"],
        color: "#123456",
      },
    };
    const registry = createPlatformRegistry({ platforms: [custom] });

    render(<SocialIcon platform="custom" registry={registry} />);
    expect(screen.getByRole("img", { name: "Custom icon" })).toHaveAttribute(
      "viewBox",
      "0 0 10 10",
    );
  });

  it("defaults to currentColor", () => {
    render(<SocialIcon platform="github" />);
    expect(screen.getByRole("img", { name: "GitHub icon" })).toHaveAttribute(
      "fill",
      "currentColor",
    );
  });

  it("uses the official brand color when colorStyle is brand", () => {
    render(<SocialIcon platform="github" colorStyle="brand" />);
    expect(screen.getByRole("img", { name: "GitHub icon" })).toHaveAttribute("fill", "#181717");
  });

  it("lets an explicit color override the brand color", () => {
    render(<SocialIcon platform="github" colorStyle="brand" color="#ffffff" />);
    expect(screen.getByRole("img", { name: "GitHub icon" })).toHaveAttribute("fill", "#ffffff");
  });

  it("uses a custom platform brand color", () => {
    const custom: PlatformDefinition = {
      id: "custom",
      name: "Custom",
      domains: ["custom.example"],
      profilePatterns: [{ handle: "plain", username: { pattern: /^[a-z]+$/ } }],
      icon: { viewBox: "0 0 10 10", paths: ["M0 0h10v10H0z"], color: "#123456" },
    };
    const registry = createPlatformRegistry({ platforms: [custom] });

    render(<SocialIcon platform="custom" colorStyle="brand" registry={registry} />);
    expect(screen.getByRole("img", { name: "Custom icon" })).toHaveAttribute("fill", "#123456");
  });

  it("falls back to currentColor when a custom platform has no brand color", () => {
    const custom: PlatformDefinition = {
      id: "nocolor",
      name: "No Color",
      domains: ["nocolor.example"],
      profilePatterns: [{ handle: "plain", username: { pattern: /^[a-z]+$/ } }],
      icon: { viewBox: "0 0 10 10", paths: ["M0 0h10v10H0z"] },
    };
    const registry = createPlatformRegistry({ platforms: [custom] });

    render(<SocialIcon platform="nocolor" colorStyle="brand" registry={registry} />);
    expect(screen.getByRole("img", { name: "No Color icon" })).toHaveAttribute(
      "fill",
      "currentColor",
    );
  });
});
