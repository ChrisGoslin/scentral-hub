---
name: alignment-sweep
description: "Monthly whole-system drift check. Runs every alignment check in one pass — canon vs shipped code, skill divergence across Cowork/repo/global, retired assets still loading, broken routing pointers, doc freshness, and whether canon itself has gone generic. Produces one ranked report and changes nothing. Trigger monthly, before a release, after a multi-session sprint, or on 'run the sweep' / 'check for drift' / 'is everything still aligned'."
---

# Skill: alignment-sweep

One scheduled pass that answers a single question: **is everything still saying the same thing?**

The failure this prevents is quiet. Nothing breaks. Docs stay internally consistent, code keeps building, agents keep sounding confident — while doc, code, and tooling slowly diverge until an agent confidently acts on a value nothing has held for months.

**Read-only. This skill reports; it never edits, resolves, or "fixes."** Every finding routes to an owner and a decision.

Origin: `docs/lessons.md` L29–L36 and `claude-global/LESSONS.md` GL-1–GL-4.

## Scope

Repos: `~/Projects/scentral-hub` (nota.), `~/Projects/abundance`.
Global: `~/Projects/claude-global/` (`CLAUDE.md`, `PROJECTS.md`, `LESSONS.md`).

---

## Pass 1 — Grounding

Confirm the working folder is mounted and both repos are reachable. If not, **stop** — an unmounted sweep reports a false all-clear, which is worse than no sweep. Record git branch, last commit, and whether the tree is clean for each repo.

## Pass 2 — Canon vs shipped code

For each canonical value, compare doc against what actually renders.

```bash
cd ~/Projects/scentral-hub
grep -n "body-sans\|headline-display" DESIGN.md
grep -n "next/font\|@font-face" app/layout.tsx app/globals.css
grep -n "^\s*--color-bg\|^\s*--r-card\|^\s*--r-btn" app/globals.css
```

Check at minimum: body + display typeface · base background and default mode · radius scale · motion scale · contrast values in `DESIGN.md` vs rendered tokens.

Report each mismatch as:
```
DRIFT: <what>
  Doc (file:line)     → value
  Shipped (file:line) → value
  Shipped is what users see. Canonical value is Christopher's call.
```

**Known open at last sweep (2026-07-29)** — re-verify, don't assume:
1. `DESIGN.md` / `NOTA_MANIFESTO.md` say **Geist**; `app/layout.tsx` ships **Unbounded** (retired per brand pack §4)
2. `DESIGN.md` describes ivory paper surface; `globals.css :root` ships `--color-bg:#1f1d1a` (dark-default)
3. Brand pack §14 bans gradients and "arbitrary glassmorphism"; `globals.css` ships `--bg-gradient-start/end` and `--glass-bg`/`--glass-blur`

## Pass 3 — Retired assets still shipping

Retirement isn't done when the doc changes; it's done when the byte stops shipping (L35).

```bash
cd ~/Projects/scentral-hub
for f in Satoshi Unbounded Space_Grotesk Caveat Cormorant; do
  printf "%-16s " "$f"; grep -rl "$f" app/ 2>/dev/null | tr '\n' ' '; echo
done
```

Also sweep retired product names in user-facing surfaces: `Scentral` · `BaseNote` · `AnotherSense` · `ScentOI` · `NosePrint` · `ScentBloom` · `Scent Tarot`, and gamification terms `XP` · `Streaks` · `Badges` · `Levels`.

**Exceptions — never flag these:** `Scentiment` as the Insights resonance metric; guardrail lists that name retired terms deliberately (`AGENTS.md` §82, `repo-tidy`, brand docs, this file).

## Pass 4 — Skill-layer divergence

Skills of the same name exist at **five** places: global Cowork (`~/.claude/skills/`), and four repo trees — `.claude/skills/` (Claude Code, 29 skills), `.agents/skills/` (Codex, 6), `.gemini/skills/` (Gemini, 5), plus plugin sets.

**First check the three CLI trees agree** (L39) — they are not auto-mirrored and have silently diverged before:

```bash
cd ~/Projects/scentral-hub
for s in repo-tidy verify-cli-claims canonical-source-reconciler loop-orchestrator; do
  printf "%-30s " "$s"
  a=$(diff -q .claude/skills/$s/SKILL.md .agents/skills/$s/SKILL.md >/dev/null 2>&1 && echo ok || echo DIFF)
  g=$(diff -q .claude/skills/$s/SKILL.md .gemini/skills/$s/SKILL.md >/dev/null 2>&1 && echo ok || echo DIFF)
  echo "agents:$a gemini:$g"
done
```

Any `DIFF` here is a **HIGH** finding — Codex or Gemini is running different rules from Claude Code on the same named skill.

Then compare repo vs global Cowork:

```bash
G=~/.claude/skills; R=~/Projects/scentral-hub/.claude/skills
for s in $(ls "$R"); do
  if [ -f "$G/$s/SKILL.md" ] && [ -f "$R/$s/SKILL.md" ]; then
    diff -q "$G/$s/SKILL.md" "$R/$s/SKILL.md" >/dev/null 2>&1 \
      && echo "$s: identical" \
      || echo "$s: DIVERGENT ($(wc -l < "$G/$s/SKILL.md") global / $(wc -l < "$R/$s/SKILL.md") repo)"
  fi
done
```

**Divergence is not automatically a fault.** Repo copies are often deliberately nota-specialised — e.g. repo `verify-cli-claims` enforces the ≤3 glass-layer budget and `DESIGN.md` token usage, which the generic global version cannot. Repo wins inside the repo, which is correct.

Classify each: **intentional specialisation** (record and move on) · **accidental drift** (same intent, wording diverged — flag for merge) · **stale copy** (one is an abandoned earlier version — flag for deletion).

Only accidental drift and stale copies are findings.

## Pass 5 — Routing and pointer chains

Walk every pointer; a pointer is not canon until its target is opened (GL-3).

- `scentral-hub/docs/index.md` — do all links resolve? Does the External Context path exist?
- `claude-global/CLAUDE.md`, `PROJECTS.md`, `LESSONS.md` — present and current?
- Any doc claiming another file is "source of truth" — does that file exist at that path, and is it reachable from Cowork?

**Known broken at last sweep:** `docs/index.md` → `Claude/AI Studio/PROJECTS.md` is a superseded stub; `~/.claude/CLAUDE.md`/`PROJECTS.md`/`LESSONS.md` are cited as source of truth but absent (only `projects/` and `skills/` exist there).

## Pass 6 — Doc freshness

For each canon file: date of last commit, and whether any "verified <date>" claim inside is older than 90 days. Stale verification claims are more dangerous than no claim — they buy false confidence. List anything unverified for a quarter.

```bash
cd ~/Projects/scentral-hub
for f in AGENTS.md DESIGN.md NOTA-BRAND-UIUX-PACK.md NOTA_MANIFESTO.md CLAUDE.md; do
  printf "%-30s %s\n" "$f" "$(git log -1 --format=%ci -- "$f")"
done
```

## Pass 7 — Has canon itself gone generic?

Invoke `canon-slop-audit`. Internal consistency cannot detect commoditisation; only external evidence can (L34). Run at most quarterly unless something specific prompts it — it needs live research, not just repo reads.

## Pass 8 — Uncommitted canon and repo health

**First: stale git lock.** A crashed git process leaves `.git/index.lock`, which blocks every index operation for *every* tool and human touching the repo — and goes unnoticed for days because most sessions only read. Report a stale lock as a **HIGH** finding (GL-6).

```bash
cd ~/Projects/scentral-hub
if [ -f .git/index.lock ]; then
  echo "HIGH: .git/index.lock present since $(stat -c '%y' .git/index.lock)"
  ps -eo pid,cmd | grep "[g]it " || echo "  no live git process — lock is STALE. Fix: rm -f .git/index.lock"
fi
```

Then, per `AGENTS.md` §5a, canon docs must be git-tracked and their history must read as a decision log.

```bash
cd ~/Projects/scentral-hub && git status --short AGENTS.md DESIGN.md NOTA-BRAND-UIUX-PACK.md NOTA_MANIFESTO.md CLAUDE.md docs/lessons.md
cd ~/Projects/claude-global && git status --short 2>/dev/null
```

Anything `??` (untracked) or long-uncommitted `M` is a finding — an edit with no trace of who or why is how doctrine drifts silently.

---

## Report format

```
ALIGNMENT SWEEP — <date>
Repos: <name@branch, clean/dirty> …

🔴 HIGH   — actively wrong, or an agent would act on it today
🟡 MEDIUM — divergence that will cause rework
🟢 LOW    — hygiene

CANON VS CODE       <n findings>
RETIRED ASSETS      <n still shipping>
SKILL DIVERGENCE    <n accidental — specialisations listed separately>
ROUTING             <n broken chains>
FRESHNESS           <n stale >90d>
UNCOMMITTED CANON   <n>

DECISIONS NEEDED FROM CHRISTOPHER
  1. …

NOTHING WAS CHANGED.
```

Compare against the previous sweep. **A finding that appears three sweeps running is not a finding — it's an accepted state or a broken process.** Say which, and stop re-reporting it as new.

## Hard rules

1. **Read-only.** No edits, no auto-resolution, no "while I was in there."
2. **No finding without file:line evidence.**
3. **Distinguish doc-layer from code-layer** for every finding.
4. **Intentional specialisation is not drift** — classify before flagging.
5. **If the sweep can't run fully** (unmounted, unreachable), report partial scope explicitly. A silent partial sweep reads as an all-clear.
6. Log genuinely new lessons to `docs/lessons.md`; cross-project ones to `claude-global/LESSONS.md`.
