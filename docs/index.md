# nota. Docs Index

Start here when opening this repo from any CLI. This file is a short map; it does not replace the source docs.

## Canonical Repo Docs

Read in this order:

1. [AGENTS.md](../AGENTS.md) - binding operating rules, safety constraints, git/deploy hygiene, and lessons learned.
2. [NOTA_MANIFESTO.md](../NOTA_MANIFESTO.md) - absolute psychological, material, kinetic, and cognitive-load doctrine.
3. [DESIGN.md](../DESIGN.md) - executable design-system contract: tokens, typography split, material rules, glass budget, and Dot states.
4. [NOTA_LORE.md](../NOTA_LORE.md) - compressed interaction laws and reusable sensory patterns.
5. [NOTA-BRAND-UIUX-PACK.md](../NOTA-BRAND-UIUX-PACK.md) - implementation companion, surface glossary, and anti-slop design checklist.
6. [docs/HANDOVER.md](./HANDOVER.md) - current cross-CLI alignment, repository state, task loop, and historical implementation handover.
7. [CLAUDE.md](../CLAUDE.md) - living nota. product memory and implementation context; verify drift-prone claims against code.
8. [docs/nota/07-engineering-handover.md](./nota/07-engineering-handover.md) - engineering context, known rough edges, and source-of-truth order.
9. [docs/nota/08-release-research-pipeline.md](./nota/08-release-research-pipeline.md) - nota-first fork/tooling plan for source-backed enrichment and App Store release work.
10. [docs/nota/](./nota/) - active audit suite, design notes, architecture, backlog, and testing/security docs.

For verification-discipline history and the three-round audit that motivated the current trust rule, see [docs/nota/HANDOVER-2026-07-19-verification-audit.md](./nota/HANDOVER-2026-07-19-verification-audit.md).
For future handoffs, use [docs/nota/HANDOVER-TEMPLATE-verification-first.md](./nota/HANDOVER-TEMPLATE-verification-first.md) as the default scaffold.
For hero-media brand rulings (stock-footage subject/face checks), see [docs/BRAND-RULING-hero-video.md](./BRAND-RULING-hero-video.md) — RESOLVED 2026-07-24, clip replaced with a faceless ink-in-water shot; confirmed still current in `components/landing/HeroSection.tsx` as of 2026-08-10.
For accumulated session lessons (verification traps, drift patterns, reusable fixes), see [docs/lessons.md](./lessons.md).
For substantial multi-pass work, use [the loop orchestrator](../.claude/skills/loop-orchestrator/SKILL.md) to select the appropriate depth and enforce independent critique and completion evidence.

Older legacy docs may be useful history, but treat them as stale unless one of the files above points to them.

## External Context

These live outside the repo and are useful for planning, priorities, and Christopher's working preferences:

- `~/Projects/claude-global/CLAUDE.md` — operating system and partnership protocol
- `~/Projects/claude-global/PROJECTS.md` — portfolio status, per-project constraints
- `~/Projects/claude-global/LESSONS.md` — cross-project lessons (GL-n)
- `~/Projects/claude-global/profile.md` — working preferences

**Do not cite `~/.claude/*.md`.** That directory holds only `projects/` and
`skills/`; the canon files are not there and the path is unreachable from Cowork.
This block was wrong from 2026-07-27 (`bc2d60f`, which introduced it) to 2026-08-02,
despite a remediation recorded as complete on 2026-07-29 and a second attempt in
`3620406` — see GL-3 and GL-7 in `claude-global/LESSONS.md`.

Do not copy long content from those files into this repo. Link or cite the path, then update the canonical source when direction changes.

## Update Rule

When context changes, update the smallest canonical file that owns that fact. Prefer editing this index only when the map itself changes.
