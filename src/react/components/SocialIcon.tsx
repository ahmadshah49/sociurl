import type { SVGProps } from "react";
import { getPlatformInfo } from "../../core/platform-info";
import type { PlatformRegistry } from "../../registry/platform-registry";
import type { PlatformId } from "../../types";

/**
 * `"default"` inherits `currentColor`; `"brand"` uses the platform's official
 * color from its icon metadata, falling back to `currentColor`.
 */
export type SocialIconColorStyle = "default" | "brand";

export interface SocialIconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  platform: PlatformId;
  /** Width and height in pixels (or any CSS length). Defaults to 24. */
  size?: number | string;
  /**
   * Fill color. Takes precedence over `colorStyle`, so you can use brand
   * colors by default and override a single icon.
   */
  color?: string;
  /** Monochrome `currentColor` (default) or the platform brand color. */
  colorStyle?: SocialIconColorStyle;
  /** Accessible label. Defaults to "<Platform> icon". */
  label?: string;
  /** Hide the icon from assistive technology when adjacent text repeats it. */
  decorative?: boolean;
  registry?: PlatformRegistry;
}

/**
 * Renders a bundled platform icon. Icons use `currentColor` by default so they
 * inherit text color; pass `colorStyle="brand"` for official brand colors or
 * `color` to override the fill.
 */
export function SocialIcon({
  platform,
  size = 24,
  color,
  colorStyle = "default",
  label,
  decorative = false,
  registry,
  ...props
}: SocialIconProps) {
  const definition = getPlatformInfo(platform, { registry });
  const icon = definition?.icon;

  if (!definition || !icon) {
    return null;
  }

  // Explicit `color` wins, then brand colors, then inherited text color.
  const fill = color ?? (colorStyle === "brand" ? (icon.color ?? "currentColor") : "currentColor");

  const {
    className,
    role,
    "aria-label": ariaLabel,
    "aria-hidden": ariaHidden,
    ...svgProps
  } = props;
  const accessibleLabel = ariaLabel ?? label ?? `${definition.name} icon`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill={fill}
      className={className}
      data-platform={definition.id}
      {...svgProps}
      role={decorative ? undefined : (role ?? "img")}
      aria-hidden={decorative ? true : ariaHidden}
      aria-label={decorative ? undefined : accessibleLabel}
      focusable={decorative ? false : undefined}
    >
      {icon.paths.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
}

SocialIcon.displayName = "SocialIcon";
