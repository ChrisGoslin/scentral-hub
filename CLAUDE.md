@AGENTS.md

# SENSUS UI/UX OVERHAUL — In Progress (10 Weeks)

Focus group feedback: "novice and vibe-coded" → Target: **"Premium, like Spotify + Glossier"**

**Status:** Production sprint active  
**Phase 1:** Weeks 2–4 (Dark Ambient Material tokens + 12-column grid)  
**Documentation:** See `/docs/SENSUS_COMPLETE_PLAYBOOK.md` for master strategy + all Epics

**Key Changes:**
- Color system: Warm browns → Deep Slate #0F172A + Electric Cyan #06B6D4 (M3 compliant)
- Grid: 2-col stretched → 12-col responsive Collector's Wall
- Filters: Vertical stacks → Edge-to-edge horizontal carousels
- Search: Simple match → "Smells Like" proximity engine (70%+ note matching)
- New: Aura AI Spritz Schedule (gamified daily guidance)
- Landing: Scent Identity above fold + value prop hero

**Executable Briefs:**
- `docs/claude-code-briefs/epic-1-collectors-wall.md` (Weeks 2–4)
- `docs/claude-code-briefs/epic-2-carousel-filters.md` (Week 5)
- `docs/claude-code-briefs/epic-3-smells-like-search.md` (Weeks 6–8)
- Epic 4–5 in SENSUS_COMPLETE_PLAYBOOK.md

**Principal UI/UX Architect Gem:** Copy system prompt from `docs/principal-uiux-architect-gem.md` into new Claude chat for design guidance.

---

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

## Available Skills

Claude Code has access to reusable skills for common tasks. See `docs/SKILLS_GUIDE.md` for complete discovery guide.

### 🧪 Testing Framework
**Location:** `skills/testing-framework/`  
**Trigger:** Ask about "testing setup", "smoke tests", "E2E tests", "QA checklist"

**Includes:**
- Smoke test strategy (HTTP verification)
- E2E test patterns (Playwright across browsers + mobile)
- Manual QA checklist (features, accessibility, performance)
- Troubleshooting guide (20+ common issues & solutions)
- Working examples: smoke-test, e2e-test, playwright.config

**Quick start:**
```bash
# View skill overview
cat skills/testing-framework/SKILL.md

# Copy working examples
cp skills/testing-framework/examples/smoke-test.example.mjs scripts/smoke-test.mjs
```

**When to use:**
- Setting up testing framework for new feature
- Debugging test failures
- Creating QA checklist before release
- Optimizing test performance

**Resources:**
- `SKILL.md` — Core documentation (1,800 words)
- `references/e2e-patterns.md` — Playwright patterns & anti-patterns
- `references/troubleshooting.md` — Common issues with solutions
- `examples/` — Working code templates
- `scripts/validate-test-setup.sh` — Setup validation

### How to Use Skills

1. **Automatically** — Claude detects skill-related questions and references relevant files
2. **Explicitly** — Ask Claude: "Use the testing-framework skill to help with [task]"
3. **Manually** — Copy examples from `skills/[skill-name]/examples/` and adapt

See `docs/SKILLS_GUIDE.md` for complete skill discovery guide.
