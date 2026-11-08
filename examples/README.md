# Examples

These examples import the package by name and assume the library has been built:

```bash
npm run build
```

Run the core example with Node.js 18+:

```bash
node examples/core.mjs
```

The React examples (`react-form.tsx`, `react-icons.tsx`) are intended to be copied into a React application or used with your preferred React dev setup. They are not part of the library build.

`react-icons.tsx` shows the two icon styles side by side:

- `MonochromeIcons` — the default, icons inherit `currentColor`.
- `BrandIcons` — `colorStyle="brand"` uses each platform's official color.
- `BrandIconsWithOverrides` — `color` beats the brand color per icon.
- `BrandLinkList` / `UniformLinkList` — the same options on `SocialLinks`.
