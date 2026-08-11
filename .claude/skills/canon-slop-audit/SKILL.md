---
name: canon-slop-audit
description: "Use when reviewing whether nota.'s own canon has drifted toward generic — periodically, before a major release, or when a canonical choice (typeface, colour, motion, layout pattern) is suspected of having become an industry default since it was chosen. Audits DESIGN.md / NOTA-BRAND-UIUX-PACK.md against external evidence, not just against code. Complements canonical-source-reconciler (routing drift) and verify-cli-claims (post-hoc proof); this one questions the doctrine itself."
---

# Skill: canon-slop-audit

## Purpose

Every other guardrail in this repo enforces canon against code. This one asks the question none of them ask: **has canon itself become generic?**

A doctrine written in year N encodes year N's defaults. Defaults commoditise. A choice that read as considered when made can, two years later, be the exact marker of an unedited AI export — while remaining perfectly internally consistent across every doc. Internal consistency cannot detect this; only external evidence can.

Origin: `docs/lessons.md` L34. `NOTA-BRAND-UIUX-PACK.md` §4 names Geist as the 90% body face; by 2026 Geist sits in the widely-recognised "AI-startup typeface" cluster alongside Inter and General Sans — precisely the convergence §14 exists to prevent.

## When to invoke

- Annually, or before any major release or rebrand
- When a canonical choice "feels everywhere" suddenly
- When a competitor teardown or design review notes the product looks familiar
- Before committing to a font licence, palette, or component library
- When onboarding a new brand/design collaborator (fresh eyes are the cheapest audit)

**Do not** invoke this to justify trend-chasing. §15's 2036 test still governs: the output must argue *timelessness*, never novelty.

## Workflow

### 1. Extract the canonical choices
Read `NOTA-BRAND-UIUX-PACK.md`, `DESIGN.md`, `NOTA_MANIFESTO.md`. List every choice that is (a) canonical and (b) also a common industry default: typefaces, accent colour family, radius scale, shadow style, motion curves, layout patterns, iconography source, component library.

### 2. Gather external evidence — required, not optional
For each candidate, search for current-year evidence of ubiquity. A claim of "this looks generic now" without a source is taste, and per L33 taste in a uniform is what generates false violations.

Useful queries: `<choice> overused <year>`, `AI generated website tells <year>`, `<choice> design cliché`, `fonts every AI startup uses`. Prefer designer-community and type-foundry sources over SEO listicles; note the weakness of any source you rely on.

Record for each: **the choice · the evidence · the date · how strong the evidence actually is.**

### 3. Classify
- **Still distinctive** — no action
- **Becoming common** — watch, re-check next cycle, note in the doc
- **Now a tell** — propose replacement with evidence
- **Load-bearing regardless** — commoditised but correct for this product (e.g. a system that must feel neutral). Say so explicitly and stop; this is a legitimate outcome, not a failure to act.

### 4. Check the code separately
Canon changes are worthless if code still loads the old thing. For every asset canon has retired, grep it:

```bash
for f in Satoshi Unbounded Space_Grotesk Caveat Cormorant; do
  printf "%-16s " "$f"; grep -rl "$f" app/ 2>/dev/null | tr '\n' ' '; echo
done
```

Any hit is outstanding migration work with an owner — see L35. Retirement is not done when the doc changes; it is done when the byte stops shipping.

### 5. Propose — do not unilaterally edit
Typeface, palette, and material choices are Christopher's call. This skill produces a **decision memo**, never a canon edit made on its own authority. `AGENTS.md` §5a exists because `DESIGN.md`'s body-sans flipped `Geist → Unbounded → Geist` across sessions with no record; silently editing canon is the exact failure mode.

When a change is approved, follow §5a in full: confirm the file is git-tracked, state the *why* in the commit message with the evidence that moved the decision, date the change, and update **every** doc stating the same fact — `DESIGN.md`, `NOTA-BRAND-UIUX-PACK.md`, `NOTA_MANIFESTO.md`, and any `.claude/skills/` file repeating it — so three truths don't go live.

## Output format

```
CANON SLOP AUDIT — <date>

CHOICE: <what canon specifies> (doc §section)
  Status:     still distinctive | becoming common | now a tell | load-bearing
  Evidence:   <source, date, and how strong it is>
  Ships as:   <what the code actually does — file:line>
  Options:    2–3 replacements, with trade-offs and licence cost
  Recommend:  one, with reasoning against the 2036 test
  Decision:   AWAITING CHRISTOPHER — no edit made

RETIRED-ASSET MIGRATION
  <asset> — still referenced in <files> — owner: <who>
```

## Hard rules

1. **No canon edit without explicit approval.** Output is a memo.
2. **No claim without a dated source.** Unsourced "this is slop now" is banned by L33.
3. **Distinguish canon from code.** Say which layer each finding lives in.
4. **A commoditised choice can still be right.** Ubiquity is evidence, not a verdict — argue the product case, not the trend.
5. **Never recommend a change that fails the 2036 test.** Swapping one year's default for another year's default is lateral motion, not improvement.
