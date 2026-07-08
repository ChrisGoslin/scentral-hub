# nota. Release Research Pipeline

Date: 2026-07-07

Purpose: make the latest fork stack useful for the App Store push without letting unreviewed research or agent output leak into the customer experience.

## Priority

`nota` is release-critical. HPFC is a later reuse track and should not consume release energy until nota is through the App Store push.

## Tool Roles

| Tool | Release role | Boundary |
|---|---|---|
| `firecrawl` | Extract source-backed fragrance facts, retailer copy, creator pages, and competitor positioning | Research input only; no direct customer writes |
| `Agent-Reach` | Gather social, web, Reddit, YouTube, and GitHub signals | Human-reviewed summaries only |
| `OpenCLI` | Browser-backed checks where login/session context is needed | No cookie extraction without explicit approval |
| `last30days-skill` | Synthesize current conversation around notes, brands, creators, and product themes | Use as briefing layer, not truth source |
| `taste-skill` | Critique Read, Noseprint, Shelf, Traces, onboarding, and share artifacts | Design lens only; repo patterns still win |
| `SkillSpector` | Scan skill-style repos before global install | Required before installing new skills |
| `codegraph` / `Understand-Anything` | Compare architecture visualization against codebase-memory-mcp | Optional; use only if they answer fragile-flow questions better |
| `system_prompts_leaks` | Reference-only archive | Do not install into runtimes |

## Admin-Reviewed Flow

1. Run a research brief outside the app using `firecrawl`, `Agent-Reach`, `OpenCLI`, and/or `last30days-skill`.
2. Record sources, date, query, and confidence in the brief output.
3. Convert findings into candidate rows for the existing enrichment/admin process.
4. Review in admin before anything changes customer-facing copy, recommendations, or fragrance facts.
5. Reject weak, unsourced, or generic findings rather than lowering the product voice.

## First Release Queries

Use these as the first three reusable briefs:

1. "What are fragrance hobbyists saying about personal scent identity, scent wardrobes, and signature scents in the last 30 days?"
2. "Which fragrance apps, communities, and tools are closest to nota, and what do users praise or complain about?"
3. "Which note-language patterns make fragrance reviews feel personal rather than catalogue-like?"

## Acceptance Bar

- Every accepted finding has at least one source URL.
- Every customer-facing enrichment is reviewed before publication.
- Any skill or agent workflow installed globally has passed `SkillSpector` or is explicitly marked unscanned.
- HPFC reuse ideas stay in fork notes until nota release readiness is stable.
