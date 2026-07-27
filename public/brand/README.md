# Brevion brand web assets

Official logo pack lives in `raw/` only (`5.png`–`24.png`). Exact Mendel PNGs — do not redraw, crop, resize-export, or AI-regenerate.

## Usage

Reference pack files directly:

```ts
withBase('brand/raw/7.png')   // dark icon / favicon
withBase('brand/raw/11.png')  // light icon on dark media
```

| Use | File |
|-----|------|
| Header / Footer / RFQ | `raw/7.png` |
| Hero photo overlay | `raw/11.png` |
| Favicon + apple-touch | `raw/7.png` |

## Forbidden

- Derived rasters (`mark-*.png`, `wordmark-*.png`, `favicon*.png`, `apple-touch-icon.png`, `brevion-*.png`/`.webp` outside `raw/`)
- Generating or cropping new logo PNGs for the site

See `MANIFEST.md` for the full pack map and allowed picks.
