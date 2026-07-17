# ARCHIVED / SUPERSEDED

This document is historical and must not be used as current project truth. It is superseded by `AGENTS.md`, `CLAUDE.md`, `docs/index.md`, and the active nota. docs under `docs/nota/`. The completion and App Store readiness claims below are stale.

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
- [x] Phase 2-C: Micro-interactions (CSS `.chip-pulse` active keyframes in AffinityRater)
- [x] Phase 3-A: Natural Language Similarity Explanations (lib/similarity.ts + detail page similarity badges)
- [x] Phase 3-B: Social Proof Counts (get_fragrance_social_proof RPC, /api/social-proof route, and detail page count)
- [x] Phase 3-C: Social Tab Upgrades (Trending Right Now section linking to detail pages)
- [x] Phase 4-A: Living Wardrobe Overhaul (3D shelf plank, lip gradients, upright BottleCard, radial shadow puddles)
- [x] Phase 4-B: Shelf View Mode Themes (House highlighting for velvet_intellectual / dark_alchemist)
- [x] Phase 5-A: Landing page overhaul — hero, how-it-works strip, persona teasers
- [x] Phase 5-B: Returning User Experience (You tab PersonaCard, daily wear prompts, streak toasts)
- [x] Phase 5-C: Fragrance Education (Did You Know cards, Dos & Don'ts layering panels)
- [x] Phase 5-D: Web Push Notifications (lib/push.ts frontend + /api/push routes + YouClient toggle integration)
- [x] Phase 6-A: PostHog analytics (page_view, feel_filter_applied, persona_set, wishlist_toggled)
- [x] Phase 7-A: Legal pages — /privacy, /terms unified routes (with global Footer integration)
- [x] Phase 8: Billing / Pro unlock (/pro frontend structure using Stripe SDK)
- [x] Playwright E2E Automation test suite: 100% green and passing (40/40 active tests green across all browser targets)
- [x] Removed duplicate legacy routes app/privacy and app/terms to resolve Next.js conflicts
- [x] globals.css brand token system + [data-theme="dark"] block
- [x] LONGEVITY_PROJECTIONS + FEEL_PROJECTIONS fixed to match real DB values
- [x] Real app icons — icon-192.png, icon-512.png, and dynamic iOS splash screens compiled

## In progress / next

- All MVPs fully complete. Ready for App Store submission!

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
