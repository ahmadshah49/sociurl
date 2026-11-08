 Sociurl

**Detect, validate, parse, normalize and display social media profile URLs.**

Sociurl is a TypeScript-first library with a framework-independent core and an optional React integration. It understands platform-specific profile URL structures instead of applying one generic URL check to every network.

```ts
import { validateSocialUrl } from "sociurl";

validateSocialUrl("https://instagram.com/ahmad");
// {
//   valid: true,
//   platform: "instagram",
//   username: "ahmad",
//   normalizedUrl: "https://www.instagram.com/ahmad",
//   error: null
// }

validateSocialUrl("https://linkedin.com/in/");
// {
//   valid: false,
//   platform: "linkedin",
//   username: null,
//   normalizedUrl: null,
//   error: {
//     code: "MISSING_USERNAME",
//     message: "LinkedIn username is missing"
//   }
// }
```

> **Structural validation only.** A valid result means the URL has a supported host, a permitted profile path and a syntactically valid username. It does **not** prove that the account exists or is active. Remote account verification is intentionally out of scope.

---

## Features

- 15 built-in platforms with data-driven definitions.
- Exact hostname checks and explicit subdomain allow-lists.
- Platform-specific path patterns, username rules and reserved paths.
- HTTPS normalization, trailing-slash cleanup, canonical domains and alias handling.
- Standardized, discriminated-union validation results.
- Scoped custom platform registration.
- Zero runtime dependencies in the core.
- Optional React components and hooks with React kept external.
- ESM, CommonJS, TypeScript declarations and source maps.
- Tree-shakeable (`sideEffects: false`).

---

## Installation

```bash
npm install sociurl
```

React is only required if you use the React entry point:

```bash
npm install react react-dom
```

React 18 and React 19 are supported. React and React DOM are optional peer dependencies; the core entry point never imports them.

---

## Core API

### `detectPlatform(url)`

Detects the platform from the hostname. Path validity is intentionally not required, so a URL with a missing username still reports its platform.

```ts
import { detectPlatform } from "sociurl";

detectPlatform("https://www.instagram.com/ahmad"); // "instagram"
detectPlatform("www.instagram.com/"); // "instagram"
detectPlatform("https://twitter.com/ahmad"); // "x"
detectPlatform("https://instagram.com.fake.com/ahmad"); // null
detectPlatform("https://example.com/ahmad"); // null
```

Returns `PlatformId | null`.

### `validateSocialUrl(url, options?)`

Returns a discriminated union. Narrow with `result.valid`.

```ts
import { validateSocialUrl } from "sociurl";

const result = validateSocialUrl("instagram.com/ahmad");

if (result.valid) {
  result.platform; // PlatformId
  result.username; // string
  result.normalizedUrl; // string
  result.error; // null
} else {
  result.platform; // PlatformId | null
  result.username; // null
  result.normalizedUrl; // null
  result.error; // { code, message }
}
```

Require a specific platform, for example in a platform-specific form field:

```ts
validateSocialUrl("https://github.com/ahmad", { platform: "instagram" });
// {
//   valid: false,
//   platform: "github",
//   username: null,
//   normalizedUrl: null,
//   error: {
//     code: "UNSUPPORTED_PLATFORM",
//     message: "Expected a profile URL for Instagram"
//   }
// }
```

Options:

| Option     | Type               | Description                                 |
| ---------- | ------------------ | ------------------------------------------- |
| `platform` | `PlatformId`       | Require the URL to belong to this platform. |
| `registry` | `PlatformRegistry` | Use built-ins plus custom registrations.    |

### `extractUsername(url, options?)`

Returns the validated username, or `null` when extraction fails.

```ts
import { extractUsername } from "sociurl";

extractUsername("https://instagram.com/ahmad"); // "ahmad"
extractUsername("https://linkedin.com/in/ahmad"); // "ahmad"
extractUsername("https://reddit.com/u/ahmad"); // "ahmad"
extractUsername("https://youtube.com/@ahmad"); // "ahmad"
extractUsername("https://instagram.com/"); // null
```

For YouTube channel URLs the extracted value is the channel ID. For Facebook numeric profile URLs it is the numeric ID.

### `normalizeSocialUrl(url, options?)`

Returns a canonical HTTPS URL, or `null` for invalid input.

```ts
import { normalizeSocialUrl } from "sociurl";

normalizeSocialUrl("instagram.com/ahmad"); // "https://www.instagram.com/ahmad"
normalizeSocialUrl("HTTP://instagram.com/ahmad/"); // "https://www.instagram.com/ahmad"
normalizeSocialUrl("https://m.instagram.com/ahmad?hl=en#top");
// "https://www.instagram.com/ahmad"

normalizeSocialUrl("https://twitter.com/ahmad"); // "https://x.com/ahmad"
normalizeSocialUrl("https://reddit.com/u/ahmad"); // "https://www.reddit.com/user/ahmad"
normalizeSocialUrl("https://threads.com/@ahmad/"); // "https://www.threads.net/@ahmad"
```

Normalization rules:

- Missing protocols are upgraded to HTTPS.
- HTTP is accepted and converted to HTTPS in the output.
- Canonical domains are used (`instagram.com` → `www.instagram.com`, `twitter.com` → `x.com`).
- Unnecessary trailing slashes and duplicate empty path segments are removed.
- Required prefixes are preserved (`/in/`, `/user/`, `/channel/`, `/c/`).
- Query parameters are dropped unless the identifier lives in the query (`profile.php?id=`).
- Fragments are always dropped.
- Username casing is preserved.
- Encoded usernames are safely decoded and re-encoded.

### `getSupportedPlatforms(options?)`

Returns the platform definitions in the registry. With no options, this is the 15 built-ins.

```ts
import { getSupportedPlatforms } from "sociurl";

for (const platform of getSupportedPlatforms()) {
  console.log(platform.id, platform.name, platform.domains);
}
```

### `getPlatformInfo(platform, options?)`

Returns one definition, or `null`.

```ts
import { getPlatformInfo } from "sociurl";

getPlatformInfo("instagram");
// {
//   id: "instagram",
//   name: "Instagram",
//   domains: ["instagram.com"],
//   allowedSubdomains: ["www", "m"],
//   canonicalDomain: "www.instagram.com",
//   profilePatterns: [...],
//   reservedPaths: [...],
//   icon: { viewBox, paths, color }
// }
```

---

## Supported platforms

| Platform    | ID          | Brand color | Accepted profile structures                              |
| ----------- | ----------- | ----------- | -------------------------------------------------------- |
| Instagram   | `instagram` | `#E4405F`   | `/username`                                              |
| Facebook    | `facebook`  | `#1877F2`   | `/username`, `/profile.php?id=123` (also `fb.com`)       |
| LinkedIn    | `linkedin`  | `#0A66C2`   | `/in/username`                                           |
| GitHub      | `github`    | `#181717`   | `/username`                                              |
| X (Twitter) | `x`         | `#000000`   | `/username` (also `twitter.com`)                         |
| YouTube     | `youtube`   | `#FF0000`   | `/@handle`, `/c/name`, `/user/name`, `/channel/UC...`    |
| TikTok      | `tiktok`    | `#000000`   | `/@username`                                             |
| Pinterest   | `pinterest` | `#BD081C`   | `/username`                                              |
| Reddit      | `reddit`    | `#FF4500`   | `/user/username`, `/u/username` (normalized to `/user/`) |
| Twitch      | `twitch`    | `#9146FF`   | `/username`                                              |
| Medium      | `medium`    | `#000000`   | `/@username`                                             |
| Dribbble    | `dribbble`  | `#EA4C89`   | `/username`                                              |
| Behance     | `behance`   | `#1769FF`   | `/username`                                              |
| Telegram    | `telegram`  | `#26A5E4`   | `/username` (also `telegram.me`)                         |
| Threads     | `threads`   | `#000000`   | `/@username` (also `threads.com`)                        |

Each platform has its own path patterns, username rule and reserved-path list. Content URLs such as `instagram.com/p/...`, `youtube.com/watch?v=...` and `reddit.com/r/...` are rejected.

Brand colors live on `platform.icon.color` and are used only when you opt in with `colorStyle="brand"`. Some official colors are pure black (`x`, `medium`, `tiktok`, `threads`); on dark backgrounds either keep the default `currentColor` or override with `color`/`iconColor`.

---

## Validation result examples

### Valid

```json
{
  "valid": true,
  "platform": "github",
  "username": "ahmad",
  "normalizedUrl": "https://github.com/ahmad",
  "error": null
}
```

### Missing username

```json
{
  "valid": false,
  "platform": "instagram",
  "username": null,
  "normalizedUrl": null,
  "error": {
    "code": "MISSING_USERNAME",
    "message": "Instagram username is missing"
  }
}
```

### Unsupported platform

```json
{
  "valid": false,
  "platform": null,
  "username": null,
  "normalizedUrl": null,
  "error": {
    "code": "UNSUPPORTED_PLATFORM",
    "message": "Unsupported social platform"
  }
}
```

### Invalid profile path

```json
{
  "valid": false,
  "platform": "instagram",
  "username": null,
  "normalizedUrl": null,
  "error": {
    "code": "INVALID_PROFILE_PATH",
    "message": "The URL is not a valid Instagram profile URL"
  }
}
```

---

## Error codes

| Code                   | Meaning                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `INVALID_URL`          | Empty, malformed, credential-bearing, non-standard-port or ambiguously encoded URL.         |
| `UNSUPPORTED_PLATFORM` | The hostname is not a supported platform, or does not match the required `platform` option. |
| `MISSING_USERNAME`     | The platform and path shape are valid, but no username is present.                          |
| `INVALID_USERNAME`     | The username is present but violates the platform rule, or is a reserved value.             |
| `INVALID_PROFILE_PATH` | The path is a content page, reserved route, or an unrelated path shape.                     |
| `INVALID_PROTOCOL`     | A non-HTTP(S) scheme such as `ftp:`, `javascript:` or `data:`.                              |

## Custom error messages

Messages are plain strings by default, and every code can be overridden without touching validation behaviour. Pass `messages` to the core API:

```ts
import { validateSocialUrl } from "sociurl";

validateSocialUrl("https://instagram.com/", {
  messages: {
    MISSING_USERNAME: "Please enter your Instagram handle",
    INVALID_USERNAME: "That handle contains characters Instagram does not allow",
  },
});
```

Strings support a `{platform}` token:

```ts
validateSocialUrl(url, {
  messages: {
    MISSING_USERNAME: "Enter your {platform} username",
    UNSUPPORTED_PLATFORM: "{platform} links are not supported",
  },
});
// "Enter your Instagram username", "social platform links are not supported"
```

Use a function when the message depends on more than the platform:

```ts
validateSocialUrl(url, {
  messages: {
    INVALID_PROFILE_PATH: ({ platform, defaultMessage }) =>
      platform ? `This is not a ${platform.name} profile link` : defaultMessage,
  },
});
```

Rules:

- Only listed codes change; everything else keeps its built-in message.
- Overrides never change `code`, `platform`, `username` or `normalizedUrl`.
- The same `messages` object works with `SocialInput` and `useSocialValidator`.

---

## Custom platforms

Custom platforms are registered on a **registry instance**. The global built-in definitions are never mutated.

```ts
import { createPlatformRegistry, validateSocialUrl } from "sociurl";
import type { PlatformDefinition } from "sociurl";

const devTo: PlatformDefinition = {
  id: "devto",
  name: "DEV Community",
  domains: ["dev.to"],
  canonicalDomain: "dev.to",
  profilePatterns: [
    {
      handle: "at", // /@username
      username: {
        pattern: /^[A-Za-z0-9_]{2,30}$/,
        minLength: 2,
        maxLength: 30,
      },
    },
  ],
  reservedPaths: ["about", "settings"],
  // Optional. Custom platforms without icons still validate normally.
  icon: {
    viewBox: "0 0 24 24",
    paths: ["M12 2L2 22h20L12 2z"],
    color: "#000000",
  },
};

const registry = createPlatformRegistry();
registry.register(devTo);

validateSocialUrl("https://dev.to/@ahmad", { registry });
// {
//   valid: true,
//   platform: "devto",
//   username: "ahmad",
//   normalizedUrl: "https://dev.to/@ahmad",
//   error: null
// }
```

You can also pass definitions at creation time:

```ts
const registry = createPlatformRegistry({
  platforms: [devTo],
});

// Start without the built-ins:
const onlyDevTo = createPlatformRegistry({
  includeBuiltIns: false,
  platforms: [devTo],
});
```

Duplicate IDs throw by default. Replace one deliberately:

```ts
registry.register(devTo, { overwrite: true });
```

The same registry can be used with detection, extraction, normalization, the React components and the hook:

```ts
detectPlatform("https://dev.to/@ahmad", { registry });
extractUsername("https://dev.to/@ahmad", { registry });
normalizeSocialUrl("https://dev.to/@ahmad", { registry });
```

### Custom path patterns

```ts
const example: PlatformDefinition = {
  id: "example",
  name: "Example",
  domains: ["example.social"],
  profilePatterns: [
    {
      prefix: ["people"], // /people/username
      handle: "plain",
      canonicalPrefix: ["people"],
      username: {
        pattern: /^[a-z0-9-]{2,20}$/,
      },
    },
    {
      kind: "query", // /profile?id=123
      pathname: "profile",
      queryParam: "id",
      username: {
        pattern: /^\d+$/,
      },
    },
  ],
  reservedPaths: ["explore", "about"],
};
```

---

## React integration

```tsx
import { SocialInput, SocialIcon, SocialLinks, useSocialValidator } from "sociurl/react";
```

### `SocialInput`

```tsx
import { useState } from "react";
import { SocialInput } from "sociurl/react";
import type { ValidationResult } from "sociurl";

function ProfileForm() {
  const [url, setUrl] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  return (
    <form>
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        value={url}
        onChange={setUrl}
        onValidationChange={setValidation}
        placeholder="https://instagram.com/username"
      />

      <button disabled={!validation?.valid}>Save</button>
    </form>
  );
}
```

Controlled and uncontrolled usage:

```tsx
<SocialInput platform="github" value={url} onChange={setUrl} />
<SocialInput platform="github" defaultValue="https://github.com/ahmad" />
```

Blur-triggered validation:

```tsx
<SocialInput platform="github" label="GitHub" validateOn="blur" />
```

The component ships no CSS. Every rendered part accepts both a class name and an inline style:

| Part              | Class prop           | Style prop       |
| ----------------- | -------------------- | ---------------- |
| Outer wrapper     | `containerClassName` | `containerStyle` |
| Visible `<label>` | `labelClassName`     | `labelStyle`     |
| Icon + input row  | `fieldClassName`     | `fieldStyle`     |
| Platform icon     | `iconClassName`      | `iconStyle`      |
| `<input>`         | `className`          | `style`          |
| Error message     | `errorClassName`     | `errorStyle`     |

```tsx
<SocialInput
  platform="instagram"
  label="Instagram"
  containerClassName="field"
  containerStyle={{ display: "grid", gap: 4 }}
  labelClassName="field__label"
  labelStyle={{ fontWeight: 600 }}
  fieldClassName="field__row"
  fieldStyle={{ display: "flex", alignItems: "center", gap: 8 }}
  className="field__input"
  style={{ padding: "8px 12px", borderRadius: 8 }}
  errorClassName="field__error"
  errorStyle={{ color: "crimson", fontSize: 12 }}
/>
```

Additional display props:

| Prop          | Description                                   |
| ------------- | --------------------------------------------- |
| `showIcon`    | Toggle the platform icon. Defaults to `true`. |
| `showError`   | Toggle the error element. Defaults to `true`. |
| `iconSize`    | Icon width/height. Defaults to `20`.          |
| `renderError` | Replace the error content entirely.           |
| `messages`    | Override validation messages per error code.  |

The wrapper also exposes `data-platform` and `data-valid="true" | "false"`, so you can style purely from CSS:

```css
[data-valid="false"] .field__input {
  border-color: crimson;
}
```

Native input props (`disabled`, `readOnly`, `placeholder`, `id`, `name`, `aria-*`, etc.) are forwarded to the `<input>`. A visible `label` is rendered when provided; otherwise an accessible fallback label such as `"Instagram profile URL"` is used.

`onChange` receives the string value first, then the original change event:

```tsx
<SocialInput
  onChange={(value, event) => {
    setUrl(value);
    console.log(event.target);
  }}
/>
```

### `SocialIcon`

```tsx
import { SocialIcon } from "sociurl/react";

<SocialIcon platform="instagram" />
<SocialIcon platform="github" size={32} color="#0f172a" />
<SocialIcon platform="threads" label="Threads profile" />
```

Monochrome (default) versus official brand colors:

```tsx
// Inherits the surrounding text color — works on light and dark themes.
<SocialIcon platform="instagram" />

// Uses Instagram's official brand color (#E4405F).
<SocialIcon platform="instagram" colorStyle="brand" />

// Per-icon override wins over the brand color.
<SocialIcon platform="instagram" colorStyle="brand" color="#ffffff" />
```

Rules:

- `colorStyle` is `"default"` (monochrome `currentColor`) or `"brand"`.
- Precedence is `color` → `colorStyle="brand"` → `currentColor`.
- Brand colors come from each platform's `icon.color`, so custom platforms get brand support by setting `icon.color`.
- A custom platform without `icon.color` falls back to `currentColor` instead of breaking.

Other behavior:

- Bundled SVG path data for all built-in platforms.
- `decorative` hides the icon from assistive technology when adjacent text already names the platform.
- Returns `null` for an unknown platform or a custom platform without icon metadata.

### `SocialLinks`

```tsx
import { SocialLinks } from "sociurl/react";

<SocialLinks
  links={[
    { platform: "instagram", url: "https://instagram.com/ahmad" },
    { platform: "github", url: "https://github.com/ahmad" },
    { platform: "linkedin", url: "https://linkedin.com/in/ahmad" },
  ]}
/>;
```

Invalid links are omitted rather than rendered with an unsafe or malformed `href`.

```tsx
<SocialLinks
  showLabels
  links={[
    { platform: "instagram", url: "instagram.com/ahmad", label: "Instagram" },
    { platform: "github", url: "github.com/ahmad", label: "Code" },
  ]}
/>
```

Monochrome by default, brand colors on request:

```tsx
// Default: every icon inherits currentColor.
<SocialLinks links={links} />

// Official brand colors per platform.
<SocialLinks links={links} colorStyle="brand" />

// One color for all icons, overriding the brand palette.
<SocialLinks links={links} colorStyle="brand" iconColor="#ffffff" />
```

`iconColor` always wins over `colorStyle`, and both leave `size`, `style` and `renderIcon` untouched.

Custom rendering:

```tsx
<SocialLinks
  links={links}
  renderItem={({ platform, href, result }) => (
    <a href={href} data-platform={platform.id}>
      {platform.name}: @{result.username}
    </a>
  )}
/>
```

Styling props: `className`/`style` on the `<ul>`, plus `itemClassName`/`itemStyle`, `linkClassName`/`linkStyle` and `iconStyle`. For full icon control, use `renderIcon`.

```tsx
<SocialLinks
  links={links}
  className="social"
  style={{ display: "flex", gap: 12, listStyle: "none" }}
  itemStyle={{ margin: 0 }}
  linkStyle={{ color: "inherit", textDecoration: "none" }}
  iconStyle={{ opacity: 0.8 }}
/>
```

### `useSocialValidator`

```tsx
import { useSocialValidator } from "sociurl/react";

function MyField() {
  const { validate, result, isValid, error, validateOnBlur, reset } = useSocialValidator({
    platform: "instagram",
  });

  return (
    <>
      <input
        onChange={(event) => validate(event.target.value)}
        onBlur={(event) => validateOnBlur(event.target.value)}
      />
      {error ? <p>{error.message}</p> : null}
      {isValid ? <p>Looks good: {result?.normalizedUrl}</p> : null}
      <button type="button" onClick={reset}>
        Reset
      </button>
    </>
  );
}
```

Immediate validation with a controlled value:

```tsx
const { result, error, isValid } = useSocialValidator({
  platform: "github",
  value: url,
});
```

Deferred validation:

```tsx
const { validateOnBlur, error } = useSocialValidator({
  platform: "github",
  value: url,
  validateOn: "blur",
});
```

Returned values:

| Value                 | Type                       | Description                                         |
| --------------------- | -------------------------- | --------------------------------------------------- |
| `validate(url)`       | `ValidationResult \| null` | Runs validation immediately and stores the result.  |
| `validateOnBlur(url)` | `ValidationResult \| null` | Marks the field as touched and runs validation.     |
| `reset()`             | `void`                     | Clears the result and touched state.                |
| `result`              | `ValidationResult \| null` | Latest result.                                      |
| `isValid`             | `boolean`                  | True only for a valid result.                       |
| `error`               | `ValidationError \| null`  | Latest error.                                       |
| `touched`             | `boolean`                  | Whether a blur/interaction validation has happened. |

---

## Security model

Sociurl uses the native `URL` parser and platform-specific rules.

- **Exact hosts only.** `instagram.com.fake.com`, `fakeinstagram.com`, `instagram.com.evil.com`, `cdn.instagram.com` and homograph/punycode hosts are not accepted.
- **Explicit subdomains.** Only listed labels are accepted (`www`, and platform-specific values such as `m`, `mobile`, `old`, `new`).
- **No credentials.** `https://instagram.com@evil.com/ahmad` and `https://user:pass@instagram.com/ahmad` are rejected.
- **No non-standard ports.** Ports other than the scheme default are rejected.
- **No raw backslashes or embedded whitespace/control characters.**
- **Encoded-separator protection.** `%2F`, `%5C` and null bytes inside path segments are rejected.
- **Content paths are rejected.** Reserved routes and extra path segments do not become usernames.
- **Only relevant query parameters survive normalization.** Fragments and tracking parameters are dropped.
- **No `dangerouslySetInnerHTML`.** React components render plain SVG paths, text and validated `href` values.

This is structural validation. It is not a reputation system, an account-existence check, or a guarantee that a username belongs to a particular person.

---

## TypeScript support

The package ships declarations for both entry points:

```ts
import type {
  PlatformDefinition,
  PlatformId,
  ValidationResult,
  ValidationError,
  ValidValidationResult,
  InvalidValidationResult,
  UsernameRule,
  ProfilePathPattern,
} from "sociurl";

import type { SocialInputProps } from "sociurl/react";
```

The result is a discriminated union:

```ts
const result = validateSocialUrl(input);

if (result.valid) {
  const username: string = result.username;
} else {
  const code = result.error.code;
}
```

`PlatformId` includes the built-in IDs while remaining open to custom IDs.

---

## Browser and Node.js compatibility

- Core uses the standard `URL` and `URLSearchParams` APIs.
- Node.js 18+ is required.
- Modern browsers and edge runtimes with URL support are supported.
- The React entry works with React 18 and React 19.
- Core is SSR-safe because it has no browser or React dependency.
- React components render without effects; the hook runs effects in the browser or during SSR hydration as usual.

---

## Package outputs

```text
dist/
  index.js       ESM
  index.cjs      CommonJS
  index.d.ts     TypeScript declarations
  react/
    index.js     ESM
    index.cjs    CommonJS
    index.d.ts   TypeScript declarations
```

All JavaScript outputs include source maps. React and React DOM are external in the React build and are never bundled.

---

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run verify   # typecheck + lint + tests + build
```

To preview coverage:

```bash
npm run test:coverage
```

---

## Known limitations

- **No account existence verification.** Sociurl validates structure only.
- **Public URL formats change.** Platform rules reflect documented/common profile formats and can require updates when a network changes its URLs.
- **Medium** supports `medium.com/@handle`; custom publication subdomains are not treated as profile URLs.
- **LinkedIn** validates personal `/in/username` profiles, not company pages.
- **Facebook** supports vanity paths and `profile.php?id=` numeric profiles, not every legacy or `/people/...` variant.
- **YouTube** supports handles, legacy `/c/` and `/user/`, and `/channel/UC...` IDs. Short video links such as `youtu.be/...` are not profiles.
- **Custom platform rules are developer-owned.** A permissive custom regex can accept values the built-ins would reject.
- **Remote checks such as HTTP status or follower counts are out of scope.**

---

## Icons and trademarks

The bundled icon path data is sourced from [Simple Icons](https://simpleicons.org/) (CC0 1.0). The LinkedIn path is sourced from Simple Icons v13 because LinkedIn was removed from later Simple Icons releases. See `src/platforms/icon-data.ts` for the source note.

All product names, logos, brand names and trademarks are the property of their respective owners. Icons are included for platform identification only and do not imply endorsement or affiliation. If you use these marks in a commercial product, review the relevant brand guidelines and replace icons if necessary. Platform names are used descriptively.

---

## Contributing

1. Open an issue or discussion for non-trivial changes.
2. Add platform changes to the relevant file under `src/platforms/`; do not add a single catch-all regex.
3. Add valid, missing-username, invalid-username, invalid-path and spoofing tests.
4. Run `npm run verify` before opening a pull request.
5. Keep the core React-free and avoid new runtime dependencies.

Platform definitions should remain data-driven and custom registrations must stay scoped to a registry instance.

---

## License

MIT © 2026 Sociurl contributors. See [LICENSE](./LICENSE).
