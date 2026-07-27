# Brand assets

Drop final artwork here. The app reads these paths when present.

## Expected files

| File | Purpose |
|------|---------|
| `mark.svg` | App mark (nav, favicon source) |
| `wordmark.svg` | Horizontal logo |
| `wordmark-white.svg` | Wordmark on dark |
| `favicon.ico` | Browser tab (or use `mark.svg` via Next metadata) |
| `apple-touch-icon.png` | 180×180 |
| `og-default.png` | 1200×630 default social |
| `industries/*.svg` | Optional per-industry icons (see INDUSTRIES in code) |

Until real files land, [`mark.svg`](mark.svg) is a placeholder. Update CSS variables in `src/app/globals.css` (`--primary`, etc.) to match your palette.
