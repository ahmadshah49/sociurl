import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlatformRegistry } from "../../src";
import type { PlatformDefinition } from "../../src";
import { SocialLinks } from "../../src/react";

describe("SocialLinks", () => {
  it("renders validated links with canonical URLs", () => {
    render(
      <SocialLinks
        links={[
          { platform: "instagram", url: "instagram.com/ahmad" },
          { platform: "github", url: "https://github.com/ahmad/" },
        ]}
      />,
    );

    const instagram = screen.getByRole("link", { name: "Instagram profile" });
    const github = screen.getByRole("link", { name: "GitHub profile" });

    expect(instagram).toHaveAttribute("href", "https://www.instagram.com/ahmad");
    expect(github).toHaveAttribute("href", "https://github.com/ahmad");
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer me");
    expect(instagram.querySelector("svg")).not.toBeNull();
  });

  it("omits invalid links", () => {
    render(
      <SocialLinks
        links={[
          { platform: "instagram", url: "https://instagram.com/" },
          { platform: "github", url: "https://github.com/ahmad" },
        ]}
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "GitHub profile" })).toBeInTheDocument();
  });

  it("can show visible labels", () => {
    render(
      <SocialLinks
        showLabels
        links={[
          { platform: "instagram", url: "https://instagram.com/ahmad" },
          { platform: "github", url: "https://github.com/ahmad", label: "My code" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My code" })).toBeInTheDocument();
  });

  it("supports custom item rendering", () => {
    render(
      <SocialLinks
        links={[{ platform: "instagram", url: "https://instagram.com/ahmad" }]}
        renderItem={({ platform, href, result }) => (
          <a href={href} data-testid="custom-link">
            {platform.name}: {result.username}
          </a>
        )}
      />,
    );

    expect(screen.getByTestId("custom-link")).toHaveTextContent("Instagram: ahmad");
  });

  it("supports custom icon rendering", () => {
    render(
      <SocialLinks
        links={[{ platform: "instagram", url: "https://instagram.com/ahmad" }]}
        renderIcon={(platform) => <span data-testid="custom-icon">{platform.id}</span>}
      />,
    );

    expect(screen.getByTestId("custom-icon")).toHaveTextContent("instagram");
  });

  it("can open links in the same tab", () => {
    render(
      <SocialLinks
        newTab={false}
        links={[{ platform: "instagram", url: "https://instagram.com/ahmad" }]}
      />,
    );

    const link = screen.getByRole("link", { name: "Instagram profile" });
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAttribute("rel", "me");
  });

  it("renders nothing when all links are invalid", () => {
    const { container } = render(
      <SocialLinks
        links={[
          { platform: "instagram", url: "https://instagram.com/" },
          { platform: "github", url: "https://github.com/ahmad/repo" },
          { platform: "missing", url: "https://example.com/ahmad" },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("supports an accessible list label", () => {
    render(
      <SocialLinks
        aria-label="Find me online"
        links={[{ platform: "instagram", url: "https://instagram.com/ahmad" }]}
      />,
    );

    expect(screen.getByRole("list", { name: "Find me online" })).toBeInTheDocument();
  });

  it("supports custom platforms", () => {
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

    render(
      <SocialLinks
        registry={registry}
        showLabels
        links={[{ platform: "devto", url: "https://dev.to/@ahmad/" }]}
      />,
    );

    const link = screen.getByRole("link", { name: "DEV Community" });
    expect(link).toHaveAttribute("href", "https://dev.to/@ahmad");
  });

  it("applies inline styles to the list, items and icons", () => {
    render(
      <SocialLinks
        style={{ gap: "6px" }}
        itemStyle={{ margin: "2px" }}
        linkStyle={{ textDecoration: "none" }}
        iconStyle={{ opacity: 0.25 }}
        links={[{ platform: "github", url: "https://github.com/ahmad" }]}
      />,
    );

    const list = screen.getByRole("list");
    const link = screen.getByRole("link", { name: "GitHub profile" });

    expect(list.style.gap).toBe("6px");
    expect(list.querySelector("li")?.style.margin).toBe("2px");
    expect(link.style.textDecoration).toBe("none");
    expect(link.querySelector("svg")?.style.opacity).toBe("0.25");
  });

  it("renders monochrome icons by default", () => {
    render(
      <SocialLinks
        links={[
          { platform: "instagram", url: "https://instagram.com/ahmad" },
          { platform: "github", url: "https://github.com/ahmad" },
        ]}
      />,
    );

    for (const link of screen.getAllByRole("link")) {
      expect(link.querySelector("svg")).toHaveAttribute("fill", "currentColor");
    }
  });

  it("can render brand-colored icons", () => {
    render(
      <SocialLinks
        colorStyle="brand"
        links={[
          { platform: "instagram", url: "https://instagram.com/ahmad" },
          { platform: "github", url: "https://github.com/ahmad" },
        ]}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Instagram profile" }).querySelector("svg"),
    ).toHaveAttribute("fill", "#E4405F");
    expect(
      screen.getByRole("link", { name: "GitHub profile" }).querySelector("svg"),
    ).toHaveAttribute("fill", "#181717");
  });

  it("lets iconColor override the brand color", () => {
    render(
      <SocialLinks
        colorStyle="brand"
        iconColor="#abcdef"
        links={[{ platform: "github", url: "https://github.com/ahmad" }]}
      />,
    );

    expect(
      screen.getByRole("link", { name: "GitHub profile" }).querySelector("svg"),
    ).toHaveAttribute("fill", "#abcdef");
  });
});
