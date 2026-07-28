# Brevion — SEO / AEO / GEO + Conversion Notes

**Shipped:** 2026-07-28  
**Kanban:** `t_7ceb4aae`  
**Brief:** `SEO_AEO_GEO_CONVERSION.md`

## What shipped

### SEO
- Unique titles + descriptions on home, capabilities, industries, work, RFQ
- Canonical + `og:url` + `og:image` / `twitter:image` (`hero-cnc.jpg`) + `summary_large_image`
- `public/robots.txt` + `public/sitemap.xml` with `/brevion/` Pages URLs
- JSON-LD: Organization/ManufacturingBusiness, WebSite, Service (milling/turning/assembly/inspection), FAQPage (home), BreadcrumbList (inner pages)
- No invented phone, street address, or certifications in schema

### AEO / GEO
- Answer-first section intros (capabilities, industries, materials, how-to-quote)
- FAQ restored on home (shared `src/lib/faq.ts` + FAQPage schema)
- How quoting works (4 steps; nav `#process`)
- `public/llms.txt` for crawlers
- Citation-ready first sentences on capability/industry cards

### Conversion
- Hero intake restored (`#intake` / `#contact`) beside Hexagon-restraint headline
- Home spine: Hero → Capabilities → MidCta → Industries → How quoting → Materials → FAQ → CTA + convert bar
- Header / footer / MidCta / Cta / mobile bar: Email + RFQ; Call gated on `PUBLIC_PHONE` (empty)
- Form success states push mailto + RFQ next steps (still mock submit)

## Remaining (Mendel input)
- **Phone number** — set `PUBLIC_PHONE` (or comment a real number) to unlock Call CTAs + schema telephone
- Optional NAP / claimable certs for LocalBusiness richer schema
- Live form backend (Resend/ESP) — still mock per HANDOFF

## Verify
- Sticky `:4007` + tunnel HTTP 200 on `/`, `/capabilities`, `/industries`, `/work`, `/rfq`
- Pages `https://axiqom.github.io/brevion/` HTTP 200 on same routes
- Build: `npm run test` + `GITHUB_PAGES=1 npm run build`
