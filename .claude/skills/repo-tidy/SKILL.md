---
name: repo-tidy
description: >-
  Repository sweep before finalizing a merge or completing a major feature for
  nota. Purges retired product terminology from user-facing components, prompts
  for deletion of stale prototype branches, and enforces the public/brand/assets/
  pipeline over code-drawn botanical SVGs. Trigger before any merge to main or at
  the end of a major feature.
---

# Repo Tidy

Before finalizing any merge or completing a major feature, execute a repository sweep:

1. Scan the working directory for **retired product names** in user-facing surfaces:
   `Scentral` · `BaseNote` · `AnotherSense` · `ScentOI` · `NosePrint` · `ScentBloom` · `Scent Tarot`
   and for **retired gamification terms**: `XP` · `Streaks` · `Badges` · `Levels`.
   Exception: `Scentiment` survives *only* as the name of the Insights resonance metric.
   Exception: canonical guardrail lists (this file, `AGENTS.md`, brand docs) intentionally name
   retired terms so agents know what to block — never mechanically rewrite those lists.
2. If found in user-facing components, replace with the canonical `nota.` lexicon
   (Shelf, Traces, Trails, The Read, Temptations, Evolution, Insights). Report each replacement;
   do not replace silently in doc/guardrail contexts.
3. Scan for **retired fonts** per `NOTA-BRAND-UIUX-PACK.md` §4 — `Satoshi`, `Unbounded`,
   `Space_Grotesk`, `Caveat`, `Cormorant`. Any hit in `app/` or `globals.css` is outstanding
   migration work, not a nit (see `docs/lessons.md` L35):
   ```bash
   for f in Satoshi Unbounded Space_Grotesk Caveat Cormorant; do
     printf "%-16s " "$f"; grep -rl "$f" app/ 2>/dev/null | tr '\n' ' '; echo
   done
   ```
4. Identify and prompt the curator to delete stale Git branches used for prototyping rejected
   SaaS/gamification features.
5. Ensure no code-drawn botanical SVGs exist; enforce the `public/brand/assets/` pipeline.

> **Defect fixed 2026-07-29.** Step 1 previously held three identical `"nota."` entries and
> step 2 instructed replacing them *with* `nota.` — a global rebrand find/replace had
> overwritten the original retired names. Restored from the canonical lists in
> `nota-brand-manager` doctrine and `NOTA-BRAND-UIUX-PACK.md` §4, plus the `AGENTS.md` §82
> rule that guardrail lists may legitimately name retired brands. Retired-font sweep added
> per L35.

7. **Lesson-ID integrity** (added 2026-08-02, `docs/lessons.md` L47). A lesson ID is a
   citation target; a duplicate ID silently retargets every reference to it. Before any
   merge to main:
   ```bash
   u=$(grep -oE "^### L[0-9]+" docs/lessons.md | sort -u | wc -l)
   t=$(grep -cE "^### L[0-9]+" docs/lessons.md)
   [ "$u" -eq "$t" ] || echo "HIGH: $((t-u)) duplicate lesson IDs — do not merge"
   ```
   On collision, renumber the **uncited** series only. Establish which that is first:
   `grep -rnoE "\bL[0-9]+\b" docs .claude .agents .gemini | grep -v docs/lessons.md`.

**Note on skill-name collision:** an account-level skill also named `repo-tidy` exists
with a different 7-phase structure. This repo-level file is the one that governs
`scentral-hub`. Cite steps here by number, never as "Phase N" — that refers to the other file.

