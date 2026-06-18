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

---

## ⚠️ How to maintain this file (READ BEFORE EDITING)

This file was previously corrupted by a fabricating agent that introduced fictional lore:
"Hegemony", "Olfactory NFTs", "Invisible Commerce", "Shadow Branching", "Enshrinement Shelf",
"Dynamic Aura", "Reinforcement Sommelier", "Sillage telemetry network" — none of these are real features.
AGENTS.md §1 lists the full known fabrications — never reintroduce them.

**Rules for keeping this file honest:**

1. **Only mark something [x] complete after `git log --oneline` confirms it landed on main.**
   Do not mark complete based on an agent's "Done!" summary.

2. **Only list features that exist in the codebase.** If you're not sure, run:
   `find app -name "*.tsx" | sort` and check before adding to Completed.

3. **When starting a new session**, update the Completed / In progress sections to reflect
   what actually shipped. Do not carry forward items that were never verified.

4. **Do not invent phase names or feature names** not already in LAUNCH_PLAN.md or AGENTS.md.
   Proposed features go in LAUNCH_PLAN.md, not here.

5. **After every Cowork or Claude Code session**, run:
   ```bash
   cd ~/Projects/scentral-hub
   git add -A && git commit -m "docs: update PROJECTS.md to reflect current build state"
   git push origin main
   ```
