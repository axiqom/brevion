/**
 * Official pack PNGs under public/brand/raw/ are 2000×2000 with large transparent padding.
 *
 * Horizontal lockups (15–18.png): content ≈ 1365×416 → contentH / canvasH = 0.208.
 * Square marks (5, 9.png): content ≈ 1009×900 → contentH / canvasH = 0.45.
 *
 * CSS that sets height on the full canvas (e.g. h-10) shrinks the visible mark to ~20.8% of
 * that height (~8px for h-10). Compensate by sizing the <img> to visualHeight / ratio and
 * clipping with a fixed-height overflow:hidden wrapper so layout matches the mark, not the pad.
 * See `.brand-logo` in global.css.
 */
export const HORIZONTAL_CONTENT_HEIGHT_RATIO = 0.208;
export const MARK_CONTENT_HEIGHT_RATIO = 0.45;

export type BrandLogoKind = 'horizontal' | 'mark';

/** Official raw assets — never substitute 6/7 or generated crops. */
export const BRAND_LOGO = {
  /** Dark/mid horizontal lockup — porcelain chrome (header, footer, RFQ, chat). */
  chrome: 'brand/raw/17.png',
  /** Light horizontal lockup — on photo / dark hero. */
  hero: 'brand/raw/15.png',
  /** Mark — favicon, apple-touch, compact icon uses. */
  mark: 'brand/raw/9.png',
} as const;

export function contentHeightRatio(kind: BrandLogoKind): number {
  return kind === 'mark' ? MARK_CONTENT_HEIGHT_RATIO : HORIZONTAL_CONTENT_HEIGHT_RATIO;
}
