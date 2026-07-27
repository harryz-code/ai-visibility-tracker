# Brand assets

Source of truth: [`avt-design-system.html`](avt-design-system.html) (Design System v1).

## Files

| File | Purpose |
|------|---------|
| `mark.svg` | App mark — aperture + data point (iris on light) |
| `mark-on-dark.svg` | Mark for dark / ink backgrounds |
| `favicon-16.svg` / `favicon-32.svg` | Tab favicons (also via `src/app/icon.tsx`) |
| `apple-touch-icon.svg` | Apple touch source (PNG via `src/app/apple-icon.tsx`) |
| `og-default.svg` | Static 1200×630 social fallback |
| `avt-design-system.html` | Full token + type + icon reference |

Dynamic OG for reports: `src/app/r/[slug]/opengraph-image.tsx`.

## Tokens live in code

CSS variables are mirrored in [`src/app/globals.css`](../../src/app/globals.css):

- Primary Iris `#4A2CE0`
- Fonts: Space Grotesk (display), Hanken Grotesk (UI), JetBrains Mono (data)
- Model series: OpenAI / Claude / Gemini / Perplexity colors

## Icons in code

Nav / action / status SVGs: [`src/components/icons.tsx`](../../src/components/icons.tsx)  
Industry glyphs: [`src/components/industry-icons.tsx`](../../src/components/industry-icons.tsx)  
Model badges: [`src/components/model-badge.tsx`](../../src/components/model-badge.tsx)
