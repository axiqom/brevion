# Brevion — SEO / AEO / GEO + Conversion Focus Pass

**Created:** 2026-07-28  
**Project:** `~/apps/aeris-cnc` (display brand Brevion)  
**Live:** sticky port 4007 + `https://axiqom.github.io/brevion/`  
**Constraint:** No fake phone numbers. Call CTAs only if Mendel provides a real number; until then keep Email + RFQ + Chat + intake form.

---

## Goal

Move Brevion from polished prototype → buyer-conversion machine: every visitor understands who this is for, gets the facts they need to trust a quote request, and hits Email / Contact form / RFQ (and Call when a number exists).

---

## Target customer (ICP)

### Primary buyer
**Mechanical / manufacturing / sourcing engineer** at an OEM, contract manufacturer, or funded hardware company who already has (or will have) a STEP + PDF and needs a reliable CNC mill/turn partner for prototype → production.

### Secondary
**Hardware founder / PM / procurement** who needs a clear path: capabilities → materials/certs → lead-time expectations → send files → get a quote.

### Not the audience
Hobby makers shopping commodity quotes, pure commodity job-board browsers, or people looking for DIY CNC machines.

### Jobs to be done
1. Confirm “you machine parts like mine” (industry + capability + material).
2. Confirm risk reducers (tolerance language, inspection, NDA, certs when asked).
3. Know how to start (files, intake fields, response expectation).
4. Contact with lowest friction (form / email / RFQ / call).

### Information they scan for (must be visible, not buried)
| Buyer question | Where it should live |
|----------------|----------------------|
| Do you mill / turn / assemble / inspect? | Hero strip + Capabilities (expand) + schema Service |
| Which industries? | Industries expand + page + schema |
| Materials? | Materials + FAQ + AEO answer block |
| Lead times / MOQ / prototype vs production? | FAQ + short “How quoting works” |
| File formats / NDA? | FAQ + RFQ step copy |
| Certs / ITAR / AS9100? | Honest copy only when true; chat already handles asks — don’t invent certs |
| How do I get a quote? | Hero intake + MidCta + convert bar + RFQ |
| Who do I contact? | Persistent email; call if number; footer; schema |

---

## SEO (search engines)

### Current gaps (as of 2026-07-28)
- Meta description + basic OG/Twitter only; **no `og:image`**, no `og:url`, no canonical.
- Minimal Organization JSON-LD only (no WebSite, Service, FAQPage, BreadcrumbList).
- **No `robots.txt` / `sitemap.xml`.**
- FAQ component exists but **is not on the live home path** (`index.astro` omits Faq).
- Titles/descriptions are thin / repetitive across pages.

### Implement
1. **BaseLayout head upgrade**
   - `canonical` using site URL + `withBase` path awareness for Pages (`/brevion/`).
   - `og:image` / `twitter:image` (use a real existing media asset or hero; absolute URL for Pages).
   - `twitter:card` = `summary_large_image`.
   - Optional `og:site_name`, `og:locale`.
2. **Per-page unique title + description** (home, capabilities, industries, work, rfq) — buyer language, not fluff.
3. **`public/robots.txt`** + **`public/sitemap.xml`** (or Astro sitemap integration) with correct Pages base path.
4. **JSON-LD**
   - Organization / ManufacturingBusiness (email; telephone only if real).
   - WebSite (+ SearchAction skip if no search).
   - Service nodes for milling, turning, assembly, inspection.
   - FAQPage when FAQ is visible.
   - BreadcrumbList on inner pages.
5. **Semantic HTML**
   - One H1 per page; logical H2s; FAQ as real Q/A markup.
6. **Internal linking**
   - Capabilities ↔ Industries ↔ Work ↔ RFQ deep links with `?capability=` preserved.
7. **Do not invent** certifications, addresses, or phone numbers for SEO.

---

## AEO (answer engines) + GEO (generative engines)

Make Brevion easy to **cite and summarize correctly** in ChatGPT / Perplexity / Google AI Overviews.

### Principles
- Answer-first short paragraphs (40–60 words) under clear H2s.
- Explicit entity: “Brevion (Brevion Systems) is a precision CNC manufacturing partner…”
- Stable facts block: services, materials, contact, quote path.
- FAQ visible on home (or dedicated section) matching FAQPage schema.
- Optional `public/llms.txt` pointing to key pages + contact (plain text for crawlers).

### Content blocks to add/restore (Hexagon/Siemens restraint voice — no fluff)
1. **Who we serve** (1 short section) — engineer/sourcing ICP language.
2. **How to get a quote** — 3–4 steps (files → intake/RFQ → review → reply window claim only if already used elsewhere; don’t invent SLA).
3. **FAQ on home** — restore `Faq` (or slim AEO FAQ) with answer-first copy; expand with conversion FAQs (how to start, what happens after submit, email path).
4. **Capabilities / industries** expanded panels already help — ensure first sentence of each is citation-ready.

---

## Conversion (every visitor sold toward contact)

### Primary conversion paths (priority order)
1. **Hero intake** (`HeroContactForm`) — company / email / need → success next steps.
2. **Full RFQ** (`/rfq`) — when CAD ready.
3. **Email** `mailto:sales@brevion.com` — everywhere contact chrome exists.
4. **Chat** → Start quote / Full RFQ / mailto.
5. **Call** — **only after Mendel supplies a real number**; wire into convert bar, header, footer, schema, hero secondary.

### UX upgrades
1. **Restore buyer-proof path on home** without returning to clutter:
   Recommended spine:  
   Hero (intake) → Capabilities → MidCta → Industries → **How quoting works** → Materials → **FAQ** → final CTA (+ convert bar).  
   Keep Timeline/Why only if they earn conversion; trim decorative fat.
2. **MobileConvertBar**
   - Keep RFQ + Email.
   - Add Call when `PUBLIC_PHONE` / config constant is set; hide Call when empty (no 555).
3. **Header / Footer**
   - Persistent Email; Call when available; RFQ primary.
4. **MidCta / Cta copy**
   - Specific asks: “Send the STEP + drawing” / “Email sales@…” — not vague “Learn more”.
5. **Post-submit honesty**
   - Preview-only forms stay mock, but success copy must make the **mailto / RFQ** next step obvious so the visitor still converts off-platform until backend exists.
6. **Do not** add Formspree/Resend/Stripe unless Mendel explicitly asks (HANDOFF backend decision). Improve conversion UX inside current mock + mailto/tel.

### Microcopy rules
- Hexagon/Siemens restraint (see `brand-incoming/MENDEL_COPY_BRIEF_HEXAGON.md`).
- No banned fluff; no fake cert badges.
- Every major section ends with a clear action (quote / email / RFQ).

---

## Brand / deploy locks (do not break)
- Logos: pack `5` + `8`–`26` only; porcelain chrome = `18.png`.
- Deploy: classic `gh-pages` only (no Actions churn unless already the live method for brevion).
- Sticky preview port **4007**; slug folder `aeris-cnc`.
- `withBase()` for all asset/routes under Pages `/brevion/`.
- PrototypeDisclaimer may remain until Mendel says remove.

---

## Acceptance criteria
- [ ] Unique titles/descriptions per page; canonical + OG image on all pages.
- [ ] robots.txt + sitemap with correct `/brevion/` URLs on Pages.
- [ ] Rich JSON-LD (Org + Services + FAQPage when FAQ visible); no fake phone/address/certs.
- [ ] Home shows ICP-facing answer blocks + FAQ + clear How-to-quote.
- [ ] Convert chrome: Email + RFQ (+ Call iff real number provided) on mobile bar, header/footer, hero.
- [ ] Sticky + Pages HTTP 200 on `/`, `/capabilities`, `/industries`, `/work`, `/rfq`.
- [ ] Build passes; commit on `main`; publish Pages; update `STATE.md`.
- [ ] Write `SEO_CONVERSION_NOTES.md` with what shipped + remaining (phone/backend).

## Open input from Mendel
- **Phone number** for Call CTAs (required to ship call buttons).
- Optional: real street address / NAP for LocalBusiness schema.
- Optional: which certs are actually claimable (AS9100, ITAR, etc.).
