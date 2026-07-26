# Cabinet vs Shelf — options memo (investigation only, no code changed)

**Date:** 2026-07-24. Written per `docs/todo/homepage-followups-2026-07-24.md` item 4.
**Status:** decision is Christopher's — nothing below has been implemented.

## Verified current state

Two live, user-facing surfaces both claim "what the user owns / wears," backed by
two different tables:

- **`/cabinet`** (`app/(main)/cabinet/page.tsx`) → renders `CollectionClientWrapper`
  → reads/writes the **`collections`** table (`status: 'owned'|'wishlist'|'tested'|
  'past_purchase'`, `shelf_tier int`, `affinity_score int`, `scent_memory`). Used by
  `/api/collection/add`, `/api/affinity`, `/api/evolution/detect`,
  `/api/spritz/generate`.
- **`/shelf`** (`app/(main)/shelf/page.tsx`, 215 lines) → reads/writes the
  **`shelf_items`** table (`rank int ±20 ≠0`, `tier` GENERATED S/A/B/C from rank,
  `blind_ranking_*`). Used by `/api/shelf`, `/api/blind-ranking/session`,
  `/api/blind-ranking/reveal`.

Already flagged as "two competing shelf models" in `CLAUDE.md` §5–6,
`DESIGN.md` §12, and `NOTA-BRAND-UIUX-PACK.md` §10. No code touched here.

## Option A — Merge into one model

**Approach:** pick one table (`shelf_items` has the richer rank/tier/blind-ranking
model; `collections` has the larger surface area of consumers) and migrate the
other's data + callers onto it.

**Blast radius:**
- DB: migration to move `collections` rows into `shelf_items` (or vice versa),
  preserving `status`, `scent_memory`, `wear_logs` FK relationships.
- Code: rewrite `/api/collection/add`, `/api/affinity`, `/api/evolution/detect`,
  `/api/spritz/generate` (4 routes) to read the surviving table, or rewrite
  `/api/shelf` + both blind-ranking routes (3 routes) — whichever direction loses.
- UI: `WardrobeShelf`/`ShelfTier`/`OptimizedBottleCard` (Living Wardrobe, dnd-kit)
  vs `ShelfClient` (rank-based tiers) have different interaction models — one of
  the two component trees gets replaced or significantly adapted, not just rewired.
- Risk: `cabinetSnapshot` CustomEvent (never remove — feeds a future vision
  pipeline) is emitted from the Living Wardrobe drag flow; a merge must preserve
  wherever that hook lives.
- Estimated size: multi-day, cross-cutting (DB + 4-7 API routes + 2 component
  trees + e2e specs `collection.spec.ts`, `collection-drag-drop.spec.ts`).

## Option B — Keep distinct, clarify positioning

**Approach:** no schema/route changes. Make the product distinction legible in
copy/nav so two tables backing two surfaces reads as intentional, not duplicated.
E.g. Cabinet = "everything you've tried or own" (wishlist/tested/owned inventory);
Shelf = "your current top 20, ranked" (curated subset, blind-ranking-driven).

**Blast radius:**
- Copy-only changes to nav labels, empty states, and any place either surface's
  purpose is ambiguous (check `BottomNav.tsx` and onboarding copy).
- No DB/API/component changes — zero regression risk to `cabinetSnapshot`,
  blind-ranking flow, or existing e2e specs.
- Does not resolve the underlying "why two tables" question — a future feature
  that needs both (e.g. "add from Cabinet to Shelf") still has to bridge two
  models by hand, as `app/(main)/shelf/page.tsx` already does for seeding
  (noted in `CLAUDE.md` §6).
- Estimated size: hours, not days.

## Recommendation framing (not a decision)

Option B is the safer near-term move — it's reversible and doesn't touch the
`cabinetSnapshot` hook or blind-ranking data model. Option A is the right call
only if there's a concrete roadmap reason two inventories need to become one
(e.g. Shelf's blind-ranking feature is meant to fully replace Cabinet's manual
affinity scoring). That's a product call, not something to infer from code.
