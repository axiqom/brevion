import { BRAND_LOGO, type BrandLogoKind } from '../lib/brandLogo';
import { withBase } from '../lib/base';

export type BrandLogoSurface = 'header' | 'footer' | 'hero' | 'rfq' | 'chat';

type BrandLogoProps = {
  /** Which surface — picks asset + visual height classes. */
  surface: BrandLogoSurface;
  className?: string;
  alt?: string;
};

/**
 * Target visual (mark) heights — readable BREVION SYSTEMS lockup.
 * Header ~40–48px; footer ~40–44px; hero ~40–48px; RFQ ~36–40px; chat lockup ~28px.
 *
 * Padding math (documented in brandLogo.ts + .brand-logo CSS):
 * img height = visualH / 0.208 (horizontal) or / 0.45 (mark); wrapper clips canvas pad.
 */
const SURFACE: Record<
  BrandLogoSurface,
  { srcKey: keyof typeof BRAND_LOGO; kind: BrandLogoKind; sizeClass: string }
> = {
  header: { srcKey: 'chrome', kind: 'horizontal', sizeClass: 'brand-logo--header' },
  footer: { srcKey: 'chrome', kind: 'horizontal', sizeClass: 'brand-logo--footer' },
  hero: { srcKey: 'hero', kind: 'horizontal', sizeClass: 'brand-logo--hero' },
  rfq: { srcKey: 'chrome', kind: 'horizontal', sizeClass: 'brand-logo--rfq' },
  // Prefer mark+wordmark lockup when space allows (chat panel ~22rem).
  chat: { srcKey: 'chrome', kind: 'horizontal', sizeClass: 'brand-logo--chat' },
};

export default function BrandLogo({
  surface,
  className = '',
  alt = 'Brevion Systems',
}: BrandLogoProps) {
  const cfg = SURFACE[surface];
  const contentAspect = cfg.kind === 'mark' ? 1009 / 900 : 1365 / 416;
  const visualH = cfg.kind === 'mark' ? 28 : surface === 'chat' ? 28 : 40;
  const width = Math.round(visualH * contentAspect);

  return (
    <span className={`brand-logo ${cfg.sizeClass} ${className}`.trim()}>
      <img
        src={withBase(BRAND_LOGO[cfg.srcKey])}
        alt={alt}
        width={width}
        height={visualH}
        decoding="async"
      />
    </span>
  );
}
