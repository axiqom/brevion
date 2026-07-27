# Mobile optimization pass (kanban t_6c144de9)

**Focus:** iPhone-class (360 / 390 / 430) polish for sticky preview + GitHub Pages.  
**Brand constraints preserved:** Hexagon restraint copy, porcelain / Sora / Carbon+Gold, pack logos `5.png` + `8–26.png` (chrome `18.png`), Fictiv expandable cards + CTA funnel.

## Changed files

| File | Fix |
|------|-----|
| `src/components/Header.tsx` | Body scroll lock, Escape close, focus into drawer + restore, Tab focus trap, ≥44px targets, RFQ in drawer, safe-area drawer padding |
| `src/components/Hero.astro` | Tighter mobile type, full-width CTAs, safe-area top/bottom, overflow-x clip |
| `src/components/ExpandableCard.tsx` | Touch-friendly padding/targets, full-width RFQ on narrow, scroll-into-view on open (≤767px), readable expanded panel |
| `src/components/ProcessStages.tsx` | `snap-x` / `snap-start`, peek `pr-6`, contained overflow, `-webkit-overflow-scrolling: touch` |
| `src/components/MobileConvertBar.tsx` | Hides while chat open (`has-chat-open`) so bar ≠ composer collision |
| `src/components/BrevionChat.tsx` | Safe-area + convert-bar offset (`6.25rem`), panel height accounts for bar, full-bleed panel on phones |
| `src/components/RfqWizard.tsx` | Mobile step dots (≥44px hit), stacked full-width Back/Next |
| `src/components/Footer.astro` | Safe-area + convert-bar bottom padding; logo max-width on narrow |
| `src/components/PrototypeDisclaimer.astro` | Lifted above convert bar (CSS + base bottom) |
| `src/layouts/BaseLayout.astro` | `viewport-fit=cover`, `overflow-x-clip` |
| `src/styles/global.css` | `nav-open` lock, convert-bar/safe-area padding, prototype chip offset, brand-logo mobile heights |
| `src/pages/{capabilities,industries,work}.astro` | Mobile intro type/spacing, single-column rhythm, full-width CTA |
| `src/components/sections/*` | Tighter mobile section padding / heading scale |

## Acceptance checklist

- [x] No intentional page-wide overflow-x (html/body `overflow-x-clip` + strip containment)
- [x] Mobile nav: lock / Escape / focus / RFQ ≤2 taps
- [x] Expandable cards: expand + RFQ path; scroll-into-view on phone
- [x] Convert bar + chat coexist (bar yields when chat open; launcher offset when bar shown)
- [x] Touch targets ≥44px on primary chrome
- [ ] Sticky + Pages HTTP 200 verified after deploy (see commit / agent output)

## Known remaining issues

- Process tab strip still scrolls horizontally by design (contained; should not bleed page width).
- Convert bar is session-dismissible via localStorage; first visit only until dismissed.
- True device QA on physical iPhone Safari still recommended (safe-area + soft keyboard).
