# MillTrue — Design

Precision CNC manufacturing marketing site. Dark industrial aesthetic for aerospace / defense / robotics credibility.

**Project slug:** `aeris-cnc` (folder/repo unchanged so sticky preview tunnel port 4007 stays intact). Display brand is **MillTrue**.

## Brand (locked)

- **Name:** MillTrue (legal/display: MillTrue Manufacturing)
- **Logo:** Geometric true-running spindle/crosshair mark + MillTrue wordmark
  - Mark: `/public/milltrue-mark.svg`
  - Lockup: `/public/milltrue-logo.svg`
  - Favicon: `/public/favicon.svg`
- **Images:** Unsplash/Pexels CNC/metrology placeholders marked with "Placeholder" caption or `data-placeholder`
- **Contact:** sales@milltrue.com, +1 (555) 123-4567, 100 Precision Way, Austin TX (placeholder)

## Visual language

- **Palette:** zinc-950 / zinc-900 / zinc-800 surfaces; white primary CTAs; zinc-400 body text
- **Fonts:** Manrope (body), Rajdhani (display / headings) via Google Fonts in BaseLayout
- **Icons:** lucide-react only — no emoji (brand mark is custom SVG, not a lucide icon)
- **Shape:** large rounded corners (2–2.5rem), hairline zinc borders, luminosity-blended imagery
- **Motion:** 3 subtle intentional motions — hero CSS fade-up, RFQ step fade-in, FAQ accordion expand — not noisy

## Hero composition

- Full-bleed dark video/poster plane (edge-to-edge); no inset media cards or floating overlays
- Conversion hero: MillTrue brand + wordmark, need-focused headline (tolerances / lead times), one supporting sentence (DFM / AS9100 / ITAR / proto→prod), compact trust chips, primary Request quote → `#intake`, secondary Full RFQ, and contact intake card (`#intake` / `#contact`)
- Primary trust strip (AS9100 / materials / 24h / ITAR-ready) lives in LogoCloud — no fake customer logos

## Pages

1. **Home** (`/`) — conversion landing: Hero (intake) → trust strip → ValueProp → Capabilities → MidCta → Industries → Timeline → Portfolio → MidCta → WhyChooseUs → Quality → thin Team strip → Resources links → FAQ → CTA
2. **RFQ** (`/rfq`) — 5-step mock quote wizard (Contact → Files → Details → Timeline → Review) ending in thank-you state; client-only, nothing stored externally

## Layout

- Sticky blurred nav with Request Quote CTA; section anchors `#capabilities` `#industries` `#projects` `#quality` `#about` `#resources` `#intake` / `#contact`
- Footer with company blurb + placeholder contact
- PrototypeDisclaimer badge (unobtrusive; bottom-left on mobile above convert bar, bottom-right on `sm+`; does not block CTAs)
- Optional dismissible mobile convert bar (Talk to MillTrue / Full RFQ) after scroll
- Mobile-first; WCAG-minded contrast, keyboard focus rings, touch targets ≥44px

## Stack notes

- Astro components for static sections; React islands (`client:load`) for Header mobile menu, FAQ accordion, RFQ wizard
- Astro `devToolbar` disabled in `astro.config.mjs`
- Backend: none / mock (see HANDOFF.md)

## Reference

Ported from Vite/React prototype (AI Studio export). Astro + React islands for interactive sections. Hero polished to full-bleed brand-first (reference used floating side cards — intentionally dropped).
