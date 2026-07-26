# AERIS — Design

Precision CNC manufacturing marketing site (placeholder brand). Dark industrial aesthetic for aerospace / defense / robotics credibility.

## Brand (placeholders — easy to swap)

- **Name:** AERIS (placeholder company name)
- **Logo:** Cuboid icon + AERIS wordmark (placeholder mark; replace later)
- **Images:** Unsplash/Pexels CNC/metrology placeholders marked with "Placeholder" caption or `data-placeholder`
- **Contact:** sales@aerismfg.com, +1 (555) 123-4567, 100 Precision Way, Austin TX (placeholder)

## Visual language

- **Palette:** zinc-950 / zinc-900 / zinc-800 surfaces; white primary CTAs; zinc-400 body text
- **Fonts:** Manrope (body), Rajdhani (display / headings) via Google Fonts in BaseLayout
- **Icons:** lucide-react only — no emoji
- **Shape:** large rounded corners (2–2.5rem), hairline zinc borders, luminosity-blended imagery
- **Motion:** 3 subtle intentional motions — hero CSS fade-up, RFQ step fade-in, FAQ accordion expand — not noisy

## Hero composition

- Full-bleed dark video/poster plane (edge-to-edge); no inset media cards or floating overlays
- First viewport: AERIS brand mark + wordmark, one headline, one supporting sentence, one CTA group
- Certification / trust line lives in LogoCloud (not as a hero badge)

## Pages

1. **Home** (`/`) — full landing: Hero, LogoCloud, ValueProp, Capabilities, Industries, Timeline, Portfolio, WhyChooseUs, Quality, Team, Resources, FAQ, CTA
2. **RFQ** (`/rfq`) — 5-step mock quote wizard (Contact → Files → Details → Timeline → Review) ending in thank-you state; client-only, nothing stored externally

## Layout

- Sticky blurred nav with Request Quote CTA; section anchors `#capabilities` `#industries` `#projects` `#about` `#resources`
- Footer with company blurb + placeholder contact
- PrototypeDisclaimer badge (unobtrusive, fixed bottom-right, does not block CTAs)
- Mobile-first; WCAG-minded contrast and keyboard focus rings

## Stack notes

- Astro components for static sections; React islands (`client:load`) for Header mobile menu, FAQ accordion, RFQ wizard
- Astro `devToolbar` disabled in `astro.config.mjs`
- Backend: none / mock (see HANDOFF.md)

## Reference

Ported from Vite/React prototype at `reference-source/` (AERIS CNC AI Studio export). Astro + React islands for interactive sections. Hero polished to full-bleed brand-first (reference used floating side cards — intentionally dropped).
