# nota. — Agent Instructions

> **Read AGENTS.md first.** That is the single source of truth for this project.
> All rules, stack facts, routes, DB schema, and safeguards are defined there.

## Quick reference (Gemini-specific)
- Write clean, scannable TypeScript. No `any`. No verbose comments on self-explanatory logic.
- CSS variables only — never hardcode hex colours.
- Supabase `createClient()` inside handler functions, never at module level.
- `cabinetSnapshot` CustomEvent in WardrobeShelf — NEVER REMOVE.
