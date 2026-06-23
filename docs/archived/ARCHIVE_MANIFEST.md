# Archive Manifest — fabrication & stale docs

> Created 2026-06-23. **Nothing has been moved yet** — this pass was kept purely additive. These are the files recommended for archiving, with ready-to-run commands. Run them only after Christopher confirms (Decision #7 / GAP_ANALYSIS Part D).
>
> Rationale: these files use AGENTS.md's own **"known fabrications"** blocklist terms (Hegemony / Sovereign Focus Group / Agent Luna / Morocco Demo / pgvector "Resonance") or assert facts contradicted by the live code. They mislead any agent that reads them before AGENTS.md.

---

## Tier 1 — Archive (fabrication lore, verified present)
These contradict ground truth and should leave the active doc set:

```bash
cd ~/Projects/scentral-hub
mkdir -p docs/archived/fabrication-era
git mv GEMINI.md                               docs/archived/fabrication-era/GEMINI.md
git mv .claude/AGENT_LUNA.md                   docs/archived/fabrication-era/AGENT_LUNA.md
git mv docs/executive-suite/MASTER.md          docs/archived/fabrication-era/MASTER.md
git mv docs/executive-suite/EXECUTIVE_SUMMARIES docs/archived/fabrication-era/EXECUTIVE_SUMMARIES
git mv docs/executive-suite/AGENT_AUDITS        docs/archived/fabrication-era/AGENT_AUDITS
git mv docs/executive-suite/RETROSPECTIVE_V1.md docs/archived/fabrication-era/RETROSPECTIVE_V1.md
git mv docs/executive-suite/QE_AUTOMATION_STRATEGY.md docs/archived/fabrication-era/QE_AUTOMATION_STRATEGY.md
```
*(Note: `GEMINI.md` is an agent entry point — confirm no tooling depends on it before moving. The Gemini CLI will fall back to AGENTS.md.)*

## Tier 2 — Stale, retire or rewrite (contradicted by live code)
```bash
# architecture.md: says 76 fragrances (real 282), 3-tab nav (real 5+), magic-link auth (real: no-auth)
git mv architecture.md          docs/archived/fabrication-era/architecture.STALE.md
# DIRECTORY_STRUCTURE.md: lists non-existent DynamicAura/ScentBloom/AccordCreator
git mv DIRECTORY_STRUCTURE.md   docs/archived/fabrication-era/DIRECTORY_STRUCTURE.STALE.md
```
Replacement for both: `docs/PRODUCT_TRUTH.md` (already written).

## Tier 3 — Mixed value, REVIEW don't blind-archive
- `docs/executive-suite/MASTER_PRODUCT_SPEC.md` — header retires the old vision and holds the 12-Epic table; **keep but reconcile** into `PRODUCT_TRUTH.md`, then archive.
- `docs/executive-suite/TECHNICAL_ARCHITECTURE_DOC.md` — mostly accurate stack/data model, **but** its "no Tailwind, CSS-vars only" claim is false (repo uses Tailwind 4). Fix that line and keep, or fold into `PRODUCT_TRUTH.md`.

## Missing files (referenced but nonexistent — confirmed via `ls`)
AGENTS.md §1/§10 cite these as canonical; **neither exists**:
- `docs/specs/AnotherSense_Final_UX_Overhaul.md`
- `docs/AnotherSense_Execution_Brief.md`

**Action:** either recreate them from `PRODUCT_TRUTH.md` + `FEATURE_ROADMAP.md`, or edit AGENTS.md §1/§10 to point at the new docs instead. (Editing AGENTS.md is itself a Decision — it's the ground-truth file.)

## After any move
```bash
grep -rl "executive-suite\|AGENT_LUNA\|GEMINI.md" docs/ *.md   # find & fix dangling references
npm run build                                                  # confirm nothing imported these
```
