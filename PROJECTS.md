# Scentral Hub

**Status:** Pre-launch hardening — targeting App Store + Play Store submission  
**Live:** https://scentral-hub.vercel.app  
**Repo:** ChrisGoslin/scentral-hub  
**Stack:** Next.js 16.2.9, React 19.2.4, Supabase (scentral-mvp), Vercel  
**Architecture lock:** NO AUTH for MVP · isPro = false · do not touch /intelligence, /dna-match, /schedule

## Completed (on main as of 2026-06-18)

- [x] Phase 0: Bug fixes — PWA manifest, viewport dvh, safe-area, image contain, kinetic scroll, DB filter values
- [x] Phase 1-A: Sanctuary Profiler — 3-step quiz + persona reveal (lib/personas.ts + app/onboarding/page.tsx)
- [x] Phase 1-B: Persona-aware Discover — banner, bgGradient, pre-filtered feel chip
- [x] Phase 2-B: Ambient feel-filter colour wash overlay in DiscoverClient
- [x] Phase 3-A: Shelf bottle orientation fix + drop shadows (BottleCard, ShelfTier, WardrobeShelf)
- [x] Phase 5-A: Landing page overhaul — hero, how-it-works strip, persona teasers
- [x] globals.css brand token system + [data-theme="dark"] block
- [x] LONGEVITY_PROJECTIONS + FEEL_PROJECTIONS fixed to match real DB values

## In progress / next

- [ ] Phase 6-A: PostHog analytics (NEXT_PUBLIC_POSTHOG_KEY in .env.local)
- [ ] Phase 7-A: Privacy policy + T&C (required before App Store submission)
- [ ] Real app icons — icon-192.png and icon-512.png are 1×1 placeholder PNGs
- [ ] Social proof counts — "X own this · Y wishlisted" on Discover + detail page
- [ ] Billing / Pro unlock (isPro still false)

## Key rules (see AGENTS.md for full detail)

- CSS variables only — no hardcoded colours
- No secrets in code — keys in .env.local only
- cabinetSnapshot JSON event in WardrobeShelf — never remove (feeds future CV pipeline)
- DB projection values are ONLY: Beast Mode, Strong, Moderate, Medium, Weak
- Commit additive features to main; branch only for risky migrations
