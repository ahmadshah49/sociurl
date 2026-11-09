---
name: Sociurl
description: Add, install, configure, or troubleshoot the sociurl package. Covers social profile URL detection/validation/normalization, the optional React components (SocialInput, SocialIcon, SocialLinks, useSocialValidator), brand colors, custom messages, custom platforms, styling, and local install/link workflows. Use when integrating sociurl into an app or working with social profile URLs.
---

# Sociurl

`sociurl` detects, validates, extracts, normalizes and displays social media
profile URLs. It is framework-independent, with an optional React entrypoint.

| Entry                  | Contents                    |
| ---------------------- | --------------------------- |
| `sociurl`              | Core API, no React required |
| `sociurl/react`        | React components and hook   |
| `sociurl/package.json` | Package metadata            |

## Rules for the agent

1. **Inspect before installing.** Read the target `package.json` first. If
   `sociurl` already exists, do not add a second copy — check the version and
   use it, or update it deliberately.
2. **Never publish.** The package is local-only unless the user explicitly asks
   to publish. `npm publish` must not be run.
3. **Validation is structural only.** A `valid: true` result means the URL has
   the right shape for that platform. It does **not** prove the account exists.
   Never present it as account verification.
4. **Do not bundle React.** If you touch the library build, keep `react` and
   `react-dom` external; they are optional peer dependencies.
5. **Reinstall after rebuilding.** The app imports `dist/`. A rebuild alone is
   not enough for a tarball or copied install.

## Install

Choose the path that matches the user's setup.

### Published package

```bash
npm install sociurl
```

```bash
yarn add sociurl
pnpm add sociurl
```

### Local tarball (recommended for testing)

```bash
cd <path-to-sociurl>
npm run verify
npm pack
```

```bash
cd <path-to-app>
npm uninstall sociurl
npm install <path-to-sociurl>/sociurl-<version>.tgz
```

Uninstall first: npm can serve a cached copy for an unchanged version number.

To pin it in `package.json`:

```json
{
  "dependencies": {
    "sociurl": "file:../sociurl/sociurl-1.0.1.tgz"
  }
}
```

### npm link (live iteration)

```bash
cd <path-to-sociurl>
npm run build
npm link

cd <path-to-app>
npm link sociurl
```

Rebuild the library after every source change. If React complains about
duplicate copies, switch to the tarball.

Unlink:

```bash
cd <path-to-app>
npm unlink sociurl

# and remove the global link
npm unlink -g sociurl
```

### Workspace / monorepo

Add `packages/*` to the root `workspaces` and run `npm install` once. The
workspace symlinks `sociurl`, so only rebuilds are needed.

## Verify the install

```bash
node -e "console.log(require.resolve('sociurl'))"
node -e "const s=require('sociurl'); console.log(s.validateSocialUrl('instagram.com/natgeo'))"
```

With the React entry:

```bash
node -e "console.log(require.resolve('sociurl/react'))"
```

In a Next.js app, confirm the new props exist:

```bash
Select-String -Path node_modules/sociurl/dist/react/index.d.ts -Pattern "colorStyle"
```

## Core API

```ts
import {
  detectPlatform,
  validateSocialUrl,
  extractUsername,
  normalizeSocialUrl,
  getSupportedPlatforms,
  getPlatformInfo,
  createPlatformRegistry,
  PlatformRegistry,
  builtInPlatforms,
} from "sociurl";

import type {
  PlatformDefinition,
  PlatformId,
  BuiltInPlatformId,
  ValidationResult,
  ValidationErrorCode,
  ValidationMessages,
  SocialUrlOptions,
  ValidateSocialUrlOptions,
} from "sociurl";
```

### `validateSocialUrl(url, options?)`

Returns a discriminated union. Narrow with `result.valid`.

```ts
const result = validateSocialUrl("instagram.com/@natgeo");

if (result.valid) {
  result.platform; // "instagram"
  result.username; // "natgeo"
  result.normalizedUrl; // "https://www.instagram.com/natgeo"
  result.error; // null
} else {
  result.platform; // PlatformId | null
  result.username; // null
  result.normalizedUrl; // null
  result.error.code; // ValidationErrorCode
  result.error.message; // string
}
```

Options (`ValidateSocialUrlOptions`):

| Option     | Type                 | Default           | Purpose                          |
| ---------- | -------------------- | ----------------- | -------------------------------- |
| `registry` | `PlatformRegistry`   | built-in registry | Custom platform set              |
| `platform` | `PlatformId`         | —                 | Reject URLs from other platforms |
| `messages` | `ValidationMessages` | —                 | Override error messages          |

### `detectPlatform(url, options?)`

Returns `PlatformId | null`. Hostname only, so `instagram.com/` still returns
`"instagram"`.

### `extractUsername(url, options?)`

Returns `string | null`. `null` for unsupported hosts, bad paths, missing or
invalid usernames.

### `normalizeSocialUrl(url, options?)`

Returns the canonical HTTPS URL, or `null` when invalid.

```ts
normalizeSocialUrl("HTTP://Twitter.com/Jack"); // "https://x.com/Jack"
normalizeSocialUrl("not-a-url"); // null
```

### `getSupportedPlatforms(options?)`

Returns `readonly PlatformDefinition[]` from the registry.

### `getPlatformInfo(platform, options?)`

Returns `PlatformDefinition | null`.

### Parsing behavior

- A missing scheme is upgraded to `https://`.
- `http://` is accepted and normalized to `https://`.
- Credentials (`user:pass@`) and non-default ports are rejected.
- Only exact hostnames and explicitly allowed subdomain labels match.
  `www.instagram.com` and `m.instagram.com` match; `cdn.instagram.com` and
  `instagram.com.evil.com` do not.
- Paths are percent-decoded; encoded separators, `..`, null bytes and
  backslashes are rejected.
- Query strings are preserved only for query-based patterns such as
  `facebook.com/profile.php?id=123`.

## Error codes

| Code                   | Meaning                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `INVALID_URL`          | Empty, malformed, credential-bearing, non-standard port, or ambiguous encoding |
| `UNSUPPORTED_PLATFORM` | Unknown host, or URL does not match the required `platform` option             |
| `MISSING_USERNAME`     | Valid platform and path shape, but no username                                 |
| `INVALID_USERNAME`     | Username violates the platform rule or is reserved                             |
| `INVALID_PROFILE_PATH` | Content page, reserved route, or unrelated path shape                          |
| `INVALID_PROTOCOL`     | Non-HTTP(S) scheme such as `ftp:`, `javascript:`, `data:`                      |

## Custom messages

`messages` is keyed by error code. Unlisted codes keep their defaults. Strings
support a `{platform}` token; functions receive the full context.

```ts
validateSocialUrl(url, {
  messages: {
    MISSING_USERNAME: "Enter your {platform} username",
    INVALID_USERNAME: ({ platform, defaultMessage }) =>
      platform ? `That is not a valid ${platform.name} handle` : defaultMessage,
  },
});
```

Overrides never change `code`, `platform`, `username` or `normalizedUrl`.

## Built-in platforms

15 platforms: `instagram`, `facebook`, `linkedin`, `github`, `x`, `youtube`,
`tiktok`, `pinterest`, `reddit`, `twitch`, `medium`, `dribbble`, `behance`,
`telegram`, `threads`.

| Platform  | Brand color | Accepted profile shapes                               |
| --------- | ----------- | ----------------------------------------------------- |
| Instagram | `#E4405F`   | `/username`                                           |
| Facebook  | `#1877F2`   | `/username`, `/profile.php?id=123` (also `fb.com`)    |
| LinkedIn  | `#0A66C2`   | `/in/username`                                        |
| GitHub    | `#181717`   | `/username`                                           |
| X         | `#000000`   | `/username` (also `twitter.com`)                      |
| YouTube   | `#FF0000`   | `/@handle`, `/c/name`, `/user/name`, `/channel/UC...` |
| TikTok    | `#000000`   | `/@username`                                          |
| Pinterest | `#BD081C`   | `/username`                                           |
| Reddit    | `#FF4500`   | `/user/username`, `/u/username`                       |
| Twitch    | `#9146FF`   | `/username`                                           |
| Medium    | `#000000`   | `/@username`                                          |
| Dribbble  | `#EA4C89`   | `/username`                                           |
| Behance   | `#1769FF`   | `/username`                                           |
| Telegram  | `#26A5E4`   | `/username` (also `telegram.me`)                      |
| Threads   | `#000000`   | `/@username` (also `threads.com`)                     |

Brand colors live on `platform.icon.color`.

## Custom platforms

Scoped to a registry instance; the built-in registry is immutable.

```ts
import { createPlatformRegistry, validateSocialUrl } from "sociurl";
import type { PlatformDefinition } from "sociurl";

const devto: PlatformDefinition = {
  id: "devto",
  name: "DEV Community",
  domains: ["dev.to"],
  canonicalDomain: "dev.to",
  profilePatterns: [
    {
      handle: "at",
      username: { pattern: /^[A-Za-z0-9_]{2,30}$/, minLength: 2, maxLength: 30 },
    },
  ],
  reservedPaths: ["about", "settings"],
  icon: { viewBox: "0 0 24 24", paths: ["..."], color: "#0A0A0A" },
};

const registry = createPlatformRegistry({ platforms: [devto] });
validateSocialUrl("dev.to/@ahmad", { registry });
```

`createPlatformRegistry(options)`:

| Option            | Type                            | Default |
| ----------------- | ------------------------------- | ------- |
| `includeBuiltIns` | `boolean`                       | `true`  |
| `platforms`       | `readonly PlatformDefinition[]` | `[]`    |

`PlatformRegistry` methods:

| Method                                 | Result                          |
| -------------------------------------- | ------------------------------- |
| `register(definition, { overwrite? })` | `this`, throws on duplicate     |
| `unregister(id)`                       | `boolean`                       |
| `has(id)`                              | `boolean`                       |
| `get(id)`                              | `PlatformDefinition \| null`    |
| `getAll()`                             | `readonly PlatformDefinition[]` |
| `findByHostname(hostname)`             | `PlatformDefinition \| null`    |

Pattern shapes:

- Path pattern: `{ kind?: "path", prefix?, handle: "plain" | "at", canonicalPrefix?, username }`
- Query pattern: `{ kind: "query", pathname: "profile.php", queryParam: "id", username }`

Username rules must be anchored and must not use `g` or `y` flags.

## React integration

```tsx
import { SocialInput, SocialIcon, SocialLinks, useSocialValidator } from "sociurl/react";
```

React and ReactDOM are optional peers: `^18.0.0 || ^19.0.0`.

In Next.js App Router, add `"use client"` to any file importing `sociurl/react`.

### `SocialInput`

Unstyled, accessible, controlled or uncontrolled.

```tsx
<SocialInput
  platform="instagram"
  label="Your Instagram profile"
  defaultValue="https://instagram.com/natgeo"
  placeholder="Paste a profile URL"
  onChange={(value, event) => console.log(value)}
  onValidationChange={(result) => {
    if (result?.valid) console.log(result.normalizedUrl);
  }}
/>
```

| Prop                                    | Type                       | Default     | Purpose                               |
| --------------------------------------- | -------------------------- | ----------- | ------------------------------------- |
| `platform`                              | `PlatformId`               | —           | Constrains validation                 |
| `value`                                 | `string`                   | —           | Controlled value                      |
| `defaultValue`                          | `string`                   | `""`        | Uncontrolled initial value            |
| `onChange`                              | `(value, event) => void`   | —           | Value first, then event               |
| `onValidationChange`                    | `(result \| null) => void` | —           | Fires on every result change          |
| `validateOn`                            | `"change" \| "blur"`       | `"change"`  | When to validate                      |
| `registry`                              | `PlatformRegistry`         | built-in    | Custom platforms                      |
| `messages`                              | `ValidationMessages`       | —           | Custom error text                     |
| `label`                                 | `ReactNode`                | —           | Visible label; fallback is accessible |
| `showIcon`                              | `boolean`                  | `true`      | Toggle the icon                       |
| `showError`                             | `boolean`                  | `true`      | Toggle the error element              |
| `colorStyle`                            | `"default" \| "brand"`     | `"default"` | Icon coloring                         |
| `iconColor`                             | `string`                   | —           | Overrides `colorStyle`                |
| `iconSize`                              | `number \| string`         | `20`        | Icon size                             |
| `containerClassName` / `containerStyle` | `string` / `CSSProperties` | —           | Wrapper                               |
| `labelClassName` / `labelStyle`         | `string` / `CSSProperties` | —           | Label                                 |
| `fieldClassName` / `fieldStyle`         | `string` / `CSSProperties` | —           | Icon + input row                      |
| `iconClassName` / `iconStyle`           | `string` / `CSSProperties` | —           | Icon                                  |
| `className` / `style`                   | `string` / `CSSProperties` | —           | Native input                          |
| `errorClassName` / `errorStyle`         | `string` / `CSSProperties` | —           | Error                                 |
| `renderError`                           | `(error) => ReactNode`     | —           | Replace error content                 |

Native input props (`disabled`, `readOnly`, `placeholder`, `name`, `id`,
`aria-*`, `type`) are forwarded. The ref goes to the `<input>`. The wrapper
exposes `data-platform` and `data-valid="true" | "false"`.

### `SocialIcon`

| Prop         | Type                   | Default             | Purpose                  |
| ------------ | ---------------------- | ------------------- | ------------------------ |
| `platform`   | `PlatformId`           | —                   | Required                 |
| `size`       | `number \| string`     | `24`                | Width and height         |
| `color`      | `string`               | —                   | Fill; beats `colorStyle` |
| `colorStyle` | `"default" \| "brand"` | `"default"`         | `currentColor` or brand  |
| `label`      | `string`               | `"<Platform> icon"` | Accessible name          |
| `decorative` | `boolean`              | `false`             | Hide from assistive tech |
| `registry`   | `PlatformRegistry`     | built-in            | Custom platforms         |

Also accepts SVG props (`className`, `style`, `fill`, `onClick`, ...). Returns
`null` for unknown platforms or custom platforms without icon metadata.

### `SocialLinks`

```tsx
<SocialLinks
  links={[
    { platform: "github", url: "github.com/ahmad" },
    { platform: "x", url: "https://x.com/ahmad", label: "Ahmad on X" },
  ]}
  showLabels
  colorStyle="brand"
/>
```

| Prop                          | Type                            | Default     | Purpose                               |
| ----------------------------- | ------------------------------- | ----------- | ------------------------------------- |
| `links`                       | `readonly SocialLinkItem[]`     | —           | Items are `{ platform, url, label? }` |
| `showLabels`                  | `boolean`                       | `false`     | Show text next to icons               |
| `newTab`                      | `boolean`                       | `true`      | `target="_blank"` + safe `rel`        |
| `colorStyle`                  | `"default" \| "brand"`          | `"default"` | Icon coloring                         |
| `iconColor`                   | `string`                        | —           | Overrides `colorStyle`                |
| `iconSize`                    | `number \| string`              | `20`        | Icon size                             |
| `itemClassName` / `itemStyle` | —                               | —           | `<li>`                                |
| `linkClassName` / `linkStyle` | —                               | —           | `<a>`                                 |
| `iconStyle`                   | `CSSProperties`                 | —           | Icon                                  |
| `registry`                    | `PlatformRegistry`              | built-in    | Custom platforms                      |
| `renderItem`                  | `(context) => ReactNode`        | —           | Replace `<li>` content                |
| `renderIcon`                  | `(platform, item) => ReactNode` | —           | Replace the icon                      |

`links` **must be objects**, not raw URL strings. Invalid links are dropped
silently. `className`/`style` from `<ul>` props apply to the list.

### `useSocialValidator`

```tsx
const { validate, validateOnBlur, reset, result, isValid, error, touched } = useSocialValidator({
  platform: "instagram",
  messages,
});
```

| Option       | Type                 | Default    |
| ------------ | -------------------- | ---------- |
| `platform`   | `PlatformId`         | —          |
| `registry`   | `PlatformRegistry`   | built-in   |
| `messages`   | `ValidationMessages` | —          |
| `value`      | `string`             | —          |
| `validateOn` | `"change" \| "blur"` | `"change"` |

Empty input produces `result === null` and `error === null`.

## Styling and brand colors

No CSS ships with the package. Every part accepts a class and an inline style.

```tsx
<SocialInput
  platform="instagram"
  label="Instagram"
  containerClassName="field"
  containerStyle={{ display: "grid", gap: 4 }}
  className="field__input"
  style={{ padding: "8px 12px", borderRadius: 8 }}
  errorStyle={{ color: "crimson", fontSize: 12 }}
/>
```

```css
[data-platform="instagram"][data-valid="false"] .field__input {
  border-color: crimson;
}
```

Brand colors are opt-in:

```tsx
<SocialIcon platform="instagram" />                        {/* currentColor */}
<SocialIcon platform="instagram" colorStyle="brand" />     {/* #E4405F */}
<SocialIcon platform="instagram" colorStyle="brand" color="#fff" />

<SocialLinks links={links} colorStyle="brand" />
<SocialLinks links={links} colorStyle="brand" iconColor="#2563eb" />
```

Precedence: `color` / `iconColor` → `colorStyle="brand"` → `currentColor`.

Some official colors are pure black (`x`, `medium`, `tiktok`, `threads`). On
dark backgrounds, keep the default or override with `color`/`iconColor`.

## Recipes

**Reject invalid links in a form**

```ts
function cleanSocials(raw: string[]) {
  return raw.flatMap((url) => {
    const result = validateSocialUrl(url);
    return result.valid ? [result.normalizedUrl] : [];
  });
}
```

**Platform-locked field**

```ts
validateSocialUrl("https://github.com/ahmad", { platform: "instagram" });
// { valid: false, error: { code: "UNSUPPORTED_PLATFORM" } }
```

**Find social links in text**

```ts
const links = text
  .split(/\s+/)
  .map((chunk) => chunk.replace(/[),.;]+$/, ""))
  .map((chunk) => validateSocialUrl(chunk))
  .filter((result) => result.valid);
```

**Profile footer**

```tsx
<SocialLinks
  links={user.socials.map(({ key, url }) => ({ platform: key, url }))}
  colorStyle="brand"
  showLabels
/>
```

## Framework notes

- **Next.js App Router:** `"use client"` in files importing `sociurl/react`.
  Core functions work in Server Components, route handlers and middleware.
- **Vite / CRA / Remix / Astro:** import directly. ESM and CJS are both built.
- **TypeScript:** types ship with the package. Prefer
  `moduleResolution: "bundler"` or `"node16"`.
- **Node:** `>=18`, CommonJS works via `require("sociurl")`.

## Troubleshooting

| Symptom                           | Fix                                                      |
| --------------------------------- | -------------------------------------------------------- |
| `Cannot find module 'sociurl'`    | Install it, or install the tarball after `npm run build` |
| Old behavior after a rebuild      | Re-pack and reinstall; npm caches by version             |
| `Module not found: sociurl/react` | `npm install react react-dom`                            |
| Invalid hook call / two Reacts    | Avoid `npm link`; use the tarball or dedupe React        |
| `"use client"` error              | Add the directive to the importing file                  |
| Types not resolving               | Use `moduleResolution: "bundler"` or `"node16"`          |
| Stale Vite/Next output            | Delete `node_modules/.vite` or `.next`, restart          |

## Package facts

| Key           | Value                                              |
| ------------- | -------------------------------------------------- |
| Name          | `sociurl`                                          |
| License       | MIT                                                |
| Node          | `>=18`                                             |
| Module type   | `"type": "module"`, dual ESM/CJS                   |
| Exports       | `.`, `./react`, `./package.json`                   |
| Side effects  | `false` (tree-shakeable)                           |
| Peer deps     | `react`, `react-dom` (`^18 \|\| ^19`, optional)    |
| Build         | Rollup, outputs in `dist/`                         |
| Local scripts | `npm run verify` = typecheck + lint + test + build |

Do not publish this package unless the user explicitly asks.
