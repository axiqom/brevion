# Brevion brand logo pack

Source of truth: Mendel official pack — `public/brand/raw/5.png` through `24.png` (exact PNGs; match `brevion.zip` byte-for-byte).

## Rules

- Site references **only** `brand/raw/<N>.png` via `withBase('brand/raw/N.png')`.
- **Derivatives forbidden:** no cropped/resized favicons, no `mark-*`, `wordmark-*`, `brevion-*` web copies, no AI-generated or redrawn logos.
- Size logos with CSS only. Browsers scale favicons; do not export new raster sizes.

## Pack map

| Files | Role |
|-------|------|
| 5–12 | Icons (square-ish mark) |
| 13–16, 21–24 | Horizontal wordmarks |
| 17–20 | Stacked lockups (mark over wordmark) |

## Color families (from pack)

- Copper-warm: 5–6 (icon), 14 (wordmark), 19 (stacked)
- Cream/light on dark: 11–12 (icon), 13 & 24 (wordmark), 20 (stacked cream-dominant)
- Dark / charcoal: 21–23 (wordmark); darker icon frames in 7–10

## Site picks (wired)

| Use | Path | Notes |
|-----|------|-------|
| Header / Footer / RFQ (porcelain chrome) | `brand/raw/7.png` | Dark icon beside CSS wordmark (full lockup `17.png` too wide for nav) |
| Hero (photo overlay) | `brand/raw/11.png` | Light icon; alt: `12.png` or stacked `20.png` |
| Favicon + apple-touch | `brand/raw/7.png` | Direct pack file; browsers scale |
| Optional dark-on-light lockup | `brand/raw/17.png` | Stacked; CSS size only |
| Optional light lockup on dark | `brand/raw/20.png` | Stacked; CSS size only |

Hero photography (`hero-cnc.jpg`) is not a logo asset.
