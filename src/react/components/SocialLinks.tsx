import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { getPlatformInfo } from "../../core/platform-info";
import { validateSocialUrl } from "../../core/validate-url";
import type { PlatformRegistry } from "../../registry/platform-registry";
import type { PlatformDefinition, PlatformId, ValidValidationResult } from "../../types";
import { SocialIcon } from "./SocialIcon";
import type { SocialIconColorStyle } from "./SocialIcon";

export interface SocialLinkItem {
  platform: PlatformId;
  url: string;
  /** Optional visible label; defaults to the platform name. */
  label?: ReactNode;
}

export interface SocialLinkRenderContext {
  item: SocialLinkItem;
  platform: PlatformDefinition;
  /** Canonical, validated URL. */
  href: string;
  result: ValidValidationResult;
  index: number;
}

export interface SocialLinksProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  links: readonly SocialLinkItem[];
  registry?: PlatformRegistry;
  /** Show text labels next to icons. Defaults to false. */
  showLabels?: boolean;
  iconSize?: number | string;
  /** Per-icon color override. Takes precedence over `colorStyle`. */
  iconColor?: string;
  /** Monochrome `currentColor` (default) or each platform's brand color. */
  colorStyle?: SocialIconColorStyle;
  itemClassName?: string;
  linkClassName?: string;
  itemStyle?: CSSProperties;
  linkStyle?: CSSProperties;
  iconStyle?: CSSProperties;
  /** Open links in a new tab with safe `rel` attributes. Defaults to true. */
  newTab?: boolean;
  /** Replace the content of each `<li>` entirely. */
  renderItem?: (context: SocialLinkRenderContext) => ReactNode;
  renderIcon?: (platform: PlatformDefinition, item: SocialLinkItem) => ReactNode;
}

/**
 * Renders only structurally valid profile links. Invalid entries are omitted
 * rather than emitted with unsafe or malformed `href` values.
 */
export function SocialLinks({
  links,
  registry,
  showLabels = false,
  iconSize = 20,
  iconColor,
  colorStyle = "default",
  itemClassName,
  linkClassName,
  itemStyle,
  linkStyle,
  iconStyle,
  newTab = true,
  renderItem,
  renderIcon,
  ...listProps
}: SocialLinksProps) {
  const resolved = links.flatMap((item, index) => {
    const platform = getPlatformInfo(item.platform, { registry });
    if (!platform) {
      return [];
    }

    const result = validateSocialUrl(item.url, {
      registry,
      platform: item.platform,
    });

    if (!result.valid) {
      return [];
    }

    return [{ item, platform, href: result.normalizedUrl, result, index }];
  });

  if (resolved.length === 0) {
    return null;
  }

  return (
    <ul {...listProps} aria-label={listProps["aria-label"] ?? "Social links"}>
      {resolved.map(({ item, platform, href, result, index }) => (
        <li key={`${platform.id}-${href}-${index}`} className={itemClassName} style={itemStyle}>
          {renderItem ? (
            renderItem({ item, platform, href, result, index })
          ) : (
            <a
              href={href}
              className={linkClassName}
              style={linkStyle}
              target={newTab ? "_blank" : undefined}
              rel={newTab ? "noopener noreferrer me" : "me"}
              aria-label={
                showLabels
                  ? undefined
                  : typeof item.label === "string"
                    ? item.label
                    : `${platform.name} profile`
              }
            >
              {renderIcon ? (
                renderIcon(platform, item)
              ) : (
                <SocialIcon
                  platform={platform.id}
                  registry={registry}
                  size={iconSize}
                  color={iconColor}
                  colorStyle={colorStyle}
                  style={iconStyle}
                  decorative
                />
              )}
              {showLabels || !platform.icon ? <span>{item.label ?? platform.name}</span> : null}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

SocialLinks.displayName = "SocialLinks";
