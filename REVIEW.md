# Review handoff — Brevion polish + image↔copy match

**Slug:** `aeris-cnc` (port **4007** keep-tunnel)  
**Repo:** `axiqom/brevion`  
**Status:** review-required

## URLs

| Surface | URL |
|---------|-----|
| Sticky preview | https://carmen-subject-sellers-contribution.trycloudflare.com |
| GitHub Pages | https://axiqom.github.io/brevion/ |
| Routes | `/` · `/capabilities` · `/industries` · `/work` · `/rfq` |

## What changed

### Image ↔ copy (bugs fixed)
- **Turning** → unique `cap-turning.jpg` (CNC lathe interior). No longer shares spark/grinder with Assembly / Work.
- **Assembly** → unique `cap-assembly.jpg` (precision electronics build).
- **Production** → unique `cap-production.jpg` (multi-machine floor). No longer reuses milling photo.
- **Energy** → `ind-energy.jpg` (wind turbines). No longer uses rocket/space.
- **Automotive + Consumer Products** → intentional typography-only porcelain cards (no wrong filler).
- Removed identical `cap-finishing.jpg` / `port-02.jpg` spark pair; removed unused team portraits and `ind-space.jpg`.
- Full map: `public/media/MANIFEST.md`.

### Polish
- Stronger page intro hierarchy, more whitespace, cinematic crops, controlled hover motion.
- Hexagon-restraint copy kept; Brand Guidelines tokens + Sora only; no hero logo.
- Multi-page IA unchanged.

### Deploy
- `npm run build` passes.
- Classic **gh-pages** branch publish only (no GitHub Actions).

## Verify
- [ ] Sticky + Pages HTTP 200 on all five routes
- [ ] Turning / Assembly / Production / Energy no longer share misleading assets
- [ ] Automotive / Consumer are typography cards
