# BaseNote — Claude Code Prompts

**Sprint 1–5 COMPLETE** (2026-06-28). Archive: docs/archive/CLAUDE_CODE_PROMPTS_sprint1-5_complete.md
**Sprint 6–7 COMPLETE** (2026-06-29). All four prompts landed via independent commits:
- 0041f4c fix(filters): move Saved chip above Vibe carousel for better discoverability
- ad39e42 fix(api): sommelier — switch gap_analysis from Gemini to Claude Haiku
- b4ddd9c fix(api): dna-match — add chemist_cache lookup + switch to Claude Haiku
- e2a4234 fix(api): disable Vertex AI image generation route — stops Google billing

All outstanding work is now complete.

---

## POST-DEPLOY ACTIONS (manual, not Claude Code)

1. Add `ANTHROPIC_API_KEY` to Vercel env vars
2. `npm run build && git push`
3. Apply to Notino + Douglas on AWIN dashboard
4. Add `NEXT_PUBLIC_AWIN_PUBLISHER_ID=2955445` to Vercel env vars
