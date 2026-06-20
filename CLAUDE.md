@AGENTS.md

## Living Wardrobe — Collection Page

New shelf UI being built in `app/(main)/collection/`. See `AGENTS.md §1` for full ground truth.

| Component | Path | Purpose |
|---|---|---|
| `WardrobeShelf` | `app/(main)/collection/WardrobeShelf.tsx` | Main shelf container — walnut cabinet aesthetic, hosts all tiers |
| `ShelfTier` | `app/(main)/collection/ShelfTier.tsx` | Single 3D shelf row, one per affinity tier — items in a CSS grid (`rectSortingStrategy`) |
| `OptimizedBottleCard` | `components/collection/OptimizedBottleCard.tsx` | Full-bleed image/family-gradient bottle card, ombre overlay, dnd-kit sortable. (`app/(main)/collection/BottleCard.tsx` is dead code — not imported anywhere) |
| `WardrobeSidebar` | `app/(main)/collection/WardrobeSidebar.tsx` | View-mode toggle: All / By House / By Season / Wishlist |

**Stack addition:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**4-tier layout** (top → bottom by affinity score):
1. Top Signatures (16–20)
2. Occasion Modifiers (8–15)
3. Base Anchors (1–7)
4. Holding Zone (unrated)

**Vision pipeline hook:** every drag-drop emits a `cabinetSnapshot` JSON event — do not remove this hook; it feeds a future computer-vision shelf detection pipeline.
