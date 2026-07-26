# MillTrue — Developer Handoff

## What this is

Prototype preview of a precision CNC manufacturing marketing site for **MillTrue**. Project slug remains `aeris-cnc` (do not rename folder/repo) so the sticky preview tunnel on port **4007** stays intact.

Brand name is locked to MillTrue. Logo SVGs, photography, and some contact details remain easy to swap.

## Domain note

**Buy ASAP (do not purchase from this session):** milltrue.com — register when ready; placeholders currently use `sales@milltrue.com`.

Custom domain can later point at GitHub Pages (`axiqom/milltrue`). Not configured in the Pages go-live task.

## Live hosting (Mendel-approved exception)

**Public GitHub Pages** (production marketing site requested by Mendel 2026-07-26):

| Item | Value |
|------|-------|
| Repo | `https://github.com/axiqom/milltrue` (public — Pages Free requires public) |
| Pages URL | `https://axiqom.github.io/milltrue/` |
| Deploy | GitHub Actions `.github/workflows/deploy-pages.yml` |
| Local slug | `aeris-cnc` (unchanged; sticky preview port 4007) |
| Origin remote | `jewgo-team/aeris-cnc` (private working copy) |
| Pages remote | `pages` → `axiqom/milltrue` |

`webdev-policy-check` may flag hosting — intentional exception for Mendel-requested Pages go-live. Prototype disclaimer remains on the site.

Build base path: `/milltrue` when `GITHUB_PAGES=1` or `GITHUB_ACTIONS=true`; local/sticky preview still uses `/`.

## Backend decision

**Current:** none / mock client state only. **Unchanged.**

- Hero contact intake (`HeroContactForm.tsx`) is preview-only: validates client-side, shows thank-you / follow-up success state. No API, no email, no storage.
- RFQ form is preview-only: multi-step UI, local file list in memory, submit shows thank-you. No API, no email, no storage.
- FAQ accordion is client-side only.
- Mobile convert bar (`MobileConvertBar.tsx`) is UI-only; dismiss preference in `localStorage` (`milltrue-mobile-convert-dismissed`).
- No auth, database, payments, Stripe, Supabase, Resend, Formspree, or managed cloud services.

**Why:** Marketing + first-contact + RFQ UX can be demonstrated honestly without persistence. Backend setup would delay visual review without improving the preview for stakeholders.

**2026-07-26 EnSima conversion-pattern pass (preview only):**

- Hero reframed around buyer need (tolerance / lead time / DFM / AS9100) — primary CTA → `#intake`, secondary Full RFQ; intake form kept.
- Capabilities: numbered 01–04 cards with concrete metrics (5-axis, ±0.0001", 24h, AS9102 FAI, Type II/III, 2–3 wk proto) + self-select bullets.
- WhyChooseUs → proof section: big-number stats strip + MillTrue vs typical shop comparison (no fake logos).
- Section rhythm: thin eyebrows on Capabilities / Industries / Quality / Portfolio / WhyChooseUs (+ ValueProp).
- MidCta after Capabilities + Portfolio only; Cta + MobileConvertBar copy tightened to Request quote / Full RFQ.
- Still no production email / SMS / DB / Formspree / Resend; existing truthful claims only.

**2026-07-26 premium + conversion pass (preview only):**

- Home funnel tightened: MidCta bands after Capabilities and Portfolio; Team collapsed to thin strip; Resources to short links row.
- Hero intake anchors: `#intake` and `#contact`; bottom CTA offers Full RFQ + quick note → `#intake` + mailto Book a Call.
- LogoCloud: removed fake customer marks; honest trust claims only (AS9100 processes, materials, quotes in 24h, ITAR-ready).
- ValueProp: card grid → hairline proof columns (fewer mega-cards).
- Sticky mobile convert bar (dismissible once, `localStorage`); body padding when visible so CTAs stay clear; respects reduced motion.
- Still no production email / SMS / DB / Formspree / Resend.

**Production later needs:**

- CMS (or structured content) for capabilities, industries, portfolio, resources, FAQ
- Real photography / video assets (replace Unsplash/Pexels URLs)
- **Hero intake + RFQ email hookup:** form endpoint or serverless action → CRM/email (e.g. Resend or ESP) with spam protection; keep hero as low-friction path and RFQ for drawings/CAD uploads
- RFQ backend: file upload (S3 or similar), spam protection, CRM/email notification, optional ITAR-aware handling
- Analytics, SEO meta polish, legal pages (privacy/terms)
- Real contact details and certifications copy review
- Real (approved) customer marks only if/when cleared — never invent logos

## Logo assets (designer swap paths)

| Asset | Path | Notes |
|-------|------|-------|
| Mark only | `public/milltrue-mark.svg` | Dark (#09090b) strokes; used in white rounded containers (Header, Hero, Footer) |
| Full lockup | `public/milltrue-logo.svg` | White mark + MILLTRUE wordmark for dark backgrounds |
| Favicon | `public/favicon.svg` | Mark on zinc-950 tile |

Wired in: `Header.tsx`, `Hero.astro`, `Footer.astro`, `BaseLayout.astro` (`<link rel="icon">`).

## Placeholder assets still remaining

| Slot | Current | Replace with |
|------|---------|--------------|
| Hero video/poster | Pexels/Unsplash CNC footage (full-bleed) | Own shop footage |
| Section imagery | Unsplash CNC/aerospace (`data-placeholder` / "Placeholder" caption) | Owned photography |
| Logo cloud | Honest claim strip (AS9100 / materials / 24h quotes / ITAR-ready) | Real (approved) customer marks only if cleared |
| Contact | sales@milltrue.com, 555 number, Austin address | Real contact |
| Portfolio case studies | Sample titanium bracket / sensor housing | Real (cleared) projects |

## Design deltas vs reference-source

- Hero sells the need (tolerances / lead times / DFM / certs): brand + headline + trust chips + primary Request quote → `#intake` + secondary Full RFQ; contact intake card kept
- Capabilities: EnSima-style numbered cards (01–04) with concrete metrics and self-select bullets — not lifestyle fluff
- WhyChooseUs: stats strip + MillTrue vs typical shop comparison (truthful claims only)
- Trust strip (LogoCloud) uses claim language only — no fake customer logos
- Mid-page soft CTA bands after Capabilities and Portfolio; footer CTA primary = Request quote → `#intake`
- Framer Motion replaced with CSS `animate-fade-up` / `animate-fade-in` + FAQ grid expand; `prefers-reduced-motion` respected
- Brand mark is custom geometric SVG (not lucide Cuboid)

## Stack

- Astro 5 + Tailwind 3 + `@astrojs/react`
- React islands (`client:load`) for hero contact intake, RFQ wizard, FAQ, mobile nav
- lucide-react icons (UI only)
- Fonts: Manrope + Rajdhani (Google Fonts)

## Routes

- `/` — Home landing (hero contact intake + sections)
- `/rfq` — Request for Quote wizard
