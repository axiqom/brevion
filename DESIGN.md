# Brevion — Design

Precision CNC manufacturing marketing site. Official **Brand Guidelines v1.0** porcelain light system.

**Project slug:** `aeris-cnc` (folder/repo unchanged so sticky preview tunnel port 4007 stays intact). Display brand is **Brevion**.

## Brand (locked)

- **Name:** Brevion (legal/display: Brevion Systems)
- **Guidelines:** `BRAND_GUIDELINES.md` (source of truth)
- **Logo:** Official Mendel Brevion pack (exact PNGs; never redraw)
  - Mark (porcelain / light chrome): `/public/brand/mark-dark.png`
  - Mark (dark media overlays / hero photo): `/public/brand/mark-light.png`
  - Wordmark (optional dark UI): `/public/brand/wordmark-light.png`
  - Favicon: `/public/brand/favicon.png` + apple-touch
  - Pack map: `/public/brand/MANIFEST.md` (`raw/` untouched)
  - Root aliases synced: `brevion-mark.png`, `favicon.png`, `apple-touch-icon.png`
- **Images:** Local section media under `public/media/`; hero uses `public/hero-cnc.jpg` + `hero-cnc-sm.jpg`. Always reference via `withBase()`.
- **Contact:** sales@brevion.com (mailto + chat + RFQ; no phone until a real number exists)

## Visual language (Brand Guidelines v1.0)

- **Palette:** Porcelain `#F5F2ED` (~65%) · Carbon Taupe `#453F3A` (~20%) · Warm Aluminum `#B8AEA1` (~10%) · Brevion Gold `#FFB668` (~5%) · Light Gold `#FDCE7E` (hover/soft only)
- **Fonts:** Sora throughout (headings Bold/SemiBold; body Regular/Medium). No Manrope / Rajdhani.
- **SYSTEMS descriptor:** tracking ~+200–300
- **Buttons:** Primary = Carbon bg, Gold hover · Secondary = Carbon outline on Porcelain · Links = Carbon → Gold hover
- **Icons:** lucide-react only — no emoji
- **Shape:** rounded rects / squares (`rounded-lg`–`rounded-2xl`); avoid circles unless functional
- **Motion:** fast, purposeful, no bounce — hero fade-up, RFQ step fade-in, FAQ accordion
- **Gold:** accent only — never flood layouts

## Hero composition

- Full-bleed CNC photography (edge-to-edge); dark carbon overlays (`to-carbon/10`, no pure black); light text on media
- Intake card on porcelain surface with brand buttons
- Lockup: mark-light + BREVION + SYSTEMS (tracking ~0.3em) on dark photo; capability strip + trust chips; Request quote → `#intake`, Full RFQ secondary

## Compliance (Brand Guidelines v1.0)

Pass as of 2026-07-27: porcelain card elevations (no chalk-white `bg-white/*`); carbon replaces black gradients; Sora only; Carbon→Gold primary / Carbon outline secondary / Carbon→Gold links; gold accent-only; RFQ progress + chat typing use `rounded-sm` (no decorative circles).

## Pages

1. **Home** (`/`) — Hero (intake) → trust strip → ValueProp → Capabilities → MidCta → Industries → Timeline → Portfolio → MidCta → WhyChooseUs → Quality → Team → Resources → FAQ → CTA
2. **RFQ** (`/rfq`) — 5-step mock quote wizard; client-only

## Layout

- Sticky porcelain nav with Carbon primary CTA; section anchors unchanged
- Footer porcelain + aluminum borders
- PrototypeDisclaimer; optional mobile convert bar
- Mobile-first; WCAG-minded contrast; touch targets ≥44px

## Stack notes

- Astro + React islands; `devToolbar` disabled
- Backend: none / mock (see HANDOFF.md)
