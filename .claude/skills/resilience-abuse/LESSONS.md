# Resilience & Abuse Lessons — nota. / scentral-hub

> Append-only record. Format: see SKILL.md "Learning loop". Newest at the bottom.

## RES-1 (2026-07-04) — Catalogue endpoints unaudited for dump-all behaviour
**What happened:** Baseline audit found ~58 API routes with no systematic check for unbounded fragrance list responses; pagination caps were client-trusted where they existed.
**Response & guard:** Query-shaping rule adopted (server-enforced limit ≤ 50, filters required for deep pages, enriched fields session-gated) — 06 §3.2. Route audit is a pre-launch backlog item; every unbounded route found becomes its own lesson.

## RES-2 (2026-07-04) — Graceful-degradation pattern confirmed as house style
**What happened:** Three independent implementations already degrade calmly when unconfigured (shopify.ts → null, affiliates.ts → plain search URL, formulate rate limit → allow-through). This was convention, not rule.
**Response & guard:** Promoted to a binding rule in this skill: every external dependency must have a calm fallback; a 500 from a missing env var is a bug.
