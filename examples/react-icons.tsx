import { SocialIcon, SocialLinks } from "sociurl/react";
import type { SocialLinkItem } from "sociurl/react";

const links: SocialLinkItem[] = [
  { platform: "instagram", url: "https://instagram.com/ahmad", label: "Instagram" },
  { platform: "github", url: "https://github.com/ahmad", label: "GitHub" },
  { platform: "linkedin", url: "https://linkedin.com/in/ahmad", label: "LinkedIn" },
  { platform: "youtube", url: "https://youtube.com/@ahmad", label: "YouTube" },
];

/**
 * Monochrome icons inherit `currentColor`, so they follow the surrounding
 * text color and work on both light and dark themes.
 */
export function MonochromeIcons() {
  return (
    <div style={{ display: "flex", gap: 12, color: "#0f172a" }}>
      <SocialIcon platform="instagram" />
      <SocialIcon platform="github" />
      <SocialIcon platform="linkedin" />
      <SocialIcon platform="youtube" />
    </div>
  );
}

/**
 * Brand mode uses each platform's official color from `platform.icon.color`.
 * `colorStyle` defaults to "default", so this is fully opt-in.
 */
export function BrandIcons() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <SocialIcon platform="instagram" colorStyle="brand" />
      <SocialIcon platform="github" colorStyle="brand" />
      <SocialIcon platform="linkedin" colorStyle="brand" />
      <SocialIcon platform="youtube" colorStyle="brand" />
    </div>
  );
}

/**
 * An explicit `color` always beats the brand color, which is useful when a
 * brand color (for example X's black) would disappear on a dark background.
 */
export function BrandIconsWithOverrides() {
  return (
    <div style={{ display: "flex", gap: 12, background: "#0f172a", padding: 12 }}>
      <SocialIcon platform="x" colorStyle="brand" color="#ffffff" />
      <SocialIcon platform="instagram" colorStyle="brand" />
      <SocialIcon platform="tiktok" colorStyle="brand" color="#ffffff" />
    </div>
  );
}

/** The same options apply to the link list. */
export function BrandLinkList() {
  return (
    <SocialLinks
      links={links}
      colorStyle="brand"
      showLabels
      style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}
    />
  );
}

/** A single `iconColor` repaints every icon, brand mode or not. */
export function UniformLinkList() {
  return <SocialLinks links={links} colorStyle="brand" iconColor="#2563eb" showLabels />;
}
