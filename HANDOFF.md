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

- Hero contact intake (`HeroContactForm.tsx`) is preview-only: 3 primary fields (company, work email, need); phone/preference behind progressive disclosure; validates client-side; success lists next steps (full RFQ + 24h reply claim). No API, no email.
- RFQ form is preview-only: 5-step wizard with progress labels, CAD upload polish + NDA note, draft in `localStorage` (`milltrue-rfq-draft`), success page (not toast), `?capability=` prefill from Capabilities cards. Files stay in-memory for the session.
- FAQ accordion is client-side only.
- Mobile convert bar (`MobileConvertBar.tsx`): sticky Request quote → `#intake` when intake off-screen (IntersectionObserver); hides when `#intake` in view; mailto + Full RFQ; dismiss in `localStorage`.
- **MillTrueChat** (`MillTrueChat.tsx`): messenger-style FAQ chatbot (home + RFQ via BaseLayout). Client-side rule/FAQ intent matching only — **no external LLM / Intercom**. Launcher label **Chat** (`data-milltrue-chat-launcher`); when closed, **only the launcher is mounted** (dialog not in DOM — no overlay/pointer-events steal). When open: compact MillTrue header, thread-first layout, welcome bubble with **in-thread** suggestion pills, typing dots, bot/user bubbles; **Start quote** / **Full RFQ** only under the latest bot turn; follow-up suggestions also in-thread (cleared on next send). Composer is **input + send only** — no permanent form action bar / chip grid / FAQ disclaimer footer. Mailto is a quiet focusable header link. Storage keys `milltrue-chat-v3-*` (legacy v1/v2 cleared). z-[47] above MobileConvertBar; lifts when convert bar visible. Production messaging (Intercom/Crisp/LLM) TBD.
- Fake **555 phone numbers removed** site-wide (Footer, JSON-LD, docs). Contact path = mailto `sales@milltrue.com` + chat + RFQ only until a real number exists.
- No auth, database, payments, Stripe, Supabase, Resend, Formspree, or managed cloud services.

**Why:** Marketing + first-contact + RFQ UX can be demonstrated honestly without persistence. Backend setup would delay visual review without improving the preview for stakeholders.

**2026-07-26 UX conversion trifecta + AI chat (preview only):**

- Shorter hero intake (3 fields + expand optional); mobile bar demotes when intake visible.
- Home trimmed: Hero → Capabilities → Proof → Portfolio → FAQ → final CTA (removed Team/Timeline/Industries/Quality/ValueProp/Resources/LogoCloud/extra MidCtas from the live path).
- RFQ wizard polish + capability deep-links.
- MillTrueChat preview widget mounted globally.
- Still no production email / SMS / DB / Formspree / Resend / LLM API.

**2026-07-26 alive interactive chat (preview only):**

- MillTrueChat upgraded: online presence, streaming/multi-bubble replies, topic-biased chips, soft proactive launcher badge, desk-style contact ask, in-thread quote/RFQ actions.
- Still client-side simulation only — no LLM API, Intercom, or paid chat provider.

**2026-07-26 FAQ desk simplify + click fix (preview / Pages):**

- Fixed closed-panel Tailwind `pointer-events-auto` + `pointer-events-none` conflict that blocked the Ask/Message launcher on live Pages.
- Softened Intercom-feel into FAQ → RFQ: MillTrue help header, no presence/unread/Seen/contact interrupt; short answers + Start quote / Full RFQ handoffs.

**2026-07-26 simple Chat bot always-open rewrite (preview / Pages):**

- Rewrote MillTrueChat so closed state mounts **launcher only** (no hidden dialog / inset-0 shell). Label **Chat**.
- Simple chatbot UX: welcome bubble, chips → user message → bot reply → Start quote / Full RFQ; free text; `milltrue-chat-v2` storage.
- Still client-side FAQ only — real AI / Intercom noted under Production needs.

**2026-07-26 messenger chatbot feel (not form) (preview / Pages):**

- Removed permanent Start quote / Full RFQ / Email footer under composer and the standalone chip grid between thread and composer.
- Suggestions + quote/RFQ CTAs live **inside the thread** under bot turns; composer is one message field + send.
- Compact messenger header (MT mark + MillTrue + quiet subtitle). Storage bumped to `milltrue-chat-v3`.
- Still client-side FAQ only — real AI / Intercom under Production needs.

**2026-07-26 hero conversion polish (preview only):**

- Hero: major redesign (t_9b9925d2). Full-bleed real photo hero (no video, no placeholder text), borderless composition for stats and form.
- Form: elevated surface with blur/shadow (no rings/borders), borderless inputs with focus rings only for a11y.
- Mobile convert bar: borderless shadow edge, softer contrast.
- Eyebrow (Precision CNC · Aerospace / Defense / Robotics), slightly quieter MillTrue mark, need-led H1, one support line, compact text stats + trust chips.
- Removed redundant desktop/mobile Request quote buttons that only jumped to in-view `#intake`; quiet Full RFQ text link under support / below form.
- Header `#intake` / Capabilities / proof untouched. Still no production email.

**2026-07-26 EnSima conversion-pattern pass (preview only):**

- Hero reframed around buyer need (tolerance / lead time / DFM / AS9100) — intake form primary; secondary Full RFQ.
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
- Real photography / video assets (optional: replace local stock under `public/media/` and hero with owned shop photos)
- **Hero intake + RFQ email hookup:** form endpoint or serverless action → CRM/email (e.g. Resend or ESP) with spam protection; keep hero as low-friction path and RFQ for drawings/CAD uploads
- RFQ backend: file upload (S3 or similar), spam protection, CRM/email notification, optional ITAR-aware handling
- **Production messaging:** Intercom, Crisp, or custom LLM-backed agent (current MillTrueChat is client-side FAQ only)
- Analytics, SEO meta polish, legal pages (privacy/terms)
- Real contact details (phone when available) and certifications copy review
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
| Hero image | Local `public/hero-cnc.jpg` (+ `hero-cnc-sm.jpg`) full-bleed | Own shop photography |
| Section imagery | Local `public/media/` (cap-*, ind-*, port-*, team-*, bg-*) via `withBase('media/...')` | Owned / cleared photography |
| Logo cloud | Honest claim strip (AS9100 / materials / 24h quotes / ITAR-ready) | Real (approved) customer marks only if cleared |
| Contact | sales@milltrue.com (no phone until real number) | Real phone + address when available |
| Portfolio case studies | Sample titanium bracket / sensor housing | Real (cleared) projects |

**2026-07-26 $100k polish + local media:** Unsplash hotlinks and placeholder captions removed from Capabilities / Industries / Portfolio / Team / Quality / Cta. Soft-surface zinc language site-wide (including RFQ). PrototypeDisclaimer retained.


## Design deltas vs reference-source

- Hero sells the need (tolerances / lead times / DFM / certs): brand + eyebrow + headline + stats/chips + intake form as primary CTA; quiet Full RFQ secondary
- Capabilities: EnSima-style numbered cards (01–04) with concrete metrics and self-select bullets — not lifestyle fluff
- WhyChooseUs: stats strip + MillTrue vs typical shop comparison (truthful claims only)
- Trust strip (LogoCloud) uses claim language only — no fake customer logos
- Mid-page soft CTA bands after Capabilities and Portfolio; footer CTA primary = Request quote → `#intake`
- Framer Motion replaced with CSS `animate-fade-up` / `animate-fade-in` + FAQ grid expand; `prefers-reduced-motion` respected
- Brand mark is custom geometric SVG (not lucide Cuboid)

## Stack

- Astro 5 + Tailwind 3 + `@astrojs/react`
- React islands (`client:load`) for hero contact intake, RFQ wizard, FAQ, mobile nav, MillTrueChat
- lucide-react icons (UI only)
- Fonts: Manrope + Rajdhani (Google Fonts)

## Routes

- `/` — Home landing (hero contact intake + sections)
- `/rfq` — Request for Quote wizard
