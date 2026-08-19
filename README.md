# nota. — Architecture & Context

## 🏛️ Domain Perimeter
- **Execution Root:** verify the current checkout path before acting. Historically this repo has lived at `/Users/christophergoslin/Projects/scentral-hub`.
- **Identity:** This is the **Product Build** folder. It contains the Next.js app, Supabase migrations, and implementation scripts.
- **Separation:** This project is completely distinct from **Foresight** (Strategy/Finance). Never cross-reference Foresight intelligence here unless explicitly instructed.

## 🔑 Ground Truth
- **Current user-facing brand:** nota.
- **Brand history:** current user-facing brand is nota. Older names may remain in repo names, database names, localStorage keys, archived docs, or old prompts.
- **Repo / DB names:** Keep internal DB identifiers like `scentral-mvp` unchanged unless explicitly approved. Always verify the current Git remote and checkout name instead of assuming the repo is still called `scentral-hub`.
- **Live app:** https://notalabs.io — VERIFIED 2026-08-19 (`dig +short notalabs.io A` → `216.198.79.1`; `curl -sIL https://notalabs.io` → `200`). The former `scentral-hub.vercel.app` deployment URL is superseded.
- **Latest source of truth:** `AGENTS.md`, `docs/HANDOVER.md`, and `docs/nota/`. Design canon is root `DESIGN.md` and root `NOTA-BRAND-UIUX-PACK.md` — there are no `docs/` copies; if one reappears, it is a fork, not a mirror.
- **Latest delivered build:** see `docs/HANDOVER.md` for current state. (Do not hand-copy a build date here — it goes stale silently. The handover is the one place this is tracked.)

## 🚀 Script Registry
- `npm run dev`: Start dev server.
- `npm run build`: Production build verification.
- `npm run export:wardrobe`: Generate `MASTER_WARDROBE.md` for NotebookLM.

## 🧠 Integrity Mandate
1. **Perimeter First:** Before reading a file, confirm it belongs to the current nota. execution domain and not a different project.
2. **No Invention:** Use only facts verified from `AGENTS.md`, `docs/HANDOVER.md`, `docs/nota/`, the repo, or the database.
3. **Environment:** Reference keys via `process.env` ONLY.
