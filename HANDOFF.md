# AERIS — Developer Handoff

## What this is

Prototype preview of a precision CNC manufacturing marketing site. Brand name, logo, images, and contact details are **placeholders** for later swap.

## Backend decision

**Current:** none / mock client state only.

- RFQ form is preview-only: multi-step UI, local file list in memory, submit shows thank-you. No API, no email, no storage.
- FAQ accordion is client-side only.
- No auth, database, payments, or managed cloud services.

**Why:** Marketing + RFQ UX can be demonstrated honestly without persistence. Backend setup would delay visual review without improving the preview for stakeholders.

**Production later needs:**

- CMS (or structured content) for capabilities, industries, portfolio, resources, FAQ
- Real logo / photography / video assets (replace Unsplash/Pexels URLs)
- RFQ backend: file upload (S3 or similar), spam protection, CRM/email notification, optional ITAR-aware handling
- Analytics, SEO meta, legal pages (privacy/terms)
- Real contact details and certifications copy review

## Placeholder assets to replace

| Slot | Current | Replace with |
|------|---------|--------------|
| Wordmark / logo | Cuboid + "AERIS" text (nav + hero) | Final brand mark |
| Company name | AERIS / Aeris Manufacturing | Final legal name |
| Hero video/poster | Pexels/Unsplash CNC footage (full-bleed) | Own shop footage |
| Section imagery | Unsplash CNC/aerospace (`data-placeholder` / "Placeholder" caption) | Owned photography |
| Logo cloud | Fake SVG marks + Blue Origin/SpaceX/Anduril/Lockheed labels | Real (approved) customer marks or remove |
| Contact | sales@aerismfg.com, 555 number, Austin address | Real contact |
| Portfolio case studies | Sample titanium bracket / sensor housing | Real (cleared) projects |

## Design deltas vs reference-source

- Hero is full-bleed brand-first (no floating tolerance card / side-panel collage from the Vite prototype)
- AS9100 trust line moved to LogoCloud eyebrow
- Framer Motion replaced with CSS `animate-fade-up` / `animate-fade-in` + FAQ grid expand

## Stack

- Astro 5 + Tailwind 3 + `@astrojs/react`
- React islands (`client:load`) for RFQ wizard, FAQ, mobile nav
- lucide-react icons
- Fonts: Manrope + Rajdhani (Google Fonts)

## Routes

- `/` — Home landing
- `/rfq` — Request for Quote wizard

## Reference source

Original Vite/React export (AI Studio) lives outside the app at `/data/hermes/cache/cnc-aeris-reference/extracted/` for parity checks. Not shipped in the preview repo.
