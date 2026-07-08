# nota. — Architecture & Context

## 🏛️ Domain Perimeter
- **Execution Root:** `/Users/christophergoslin/Projects/scentral-hub`
- **Identity:** This is the **Product Build** folder. It contains the Next.js app, Supabase migrations, and implementation scripts.
- **Separation:** This project is completely distinct from **Foresight** (Strategy/Finance). Never cross-reference Foresight intelligence here unless explicitly instructed.

## 🔑 Ground Truth
- **Current user-facing brand:** nota.
- **Brand history:** Scentral Hub → AnotherSense → BaseNote → nota. Older names may remain in repo names, database names, localStorage keys, archived docs, or old prompts.
- **Repo / DB names:** Keep `scentral-hub` and `scentral-mvp` unchanged unless explicitly approved.
- **Live app:** https://scentral-hub.vercel.app
- **Latest source of truth:** `AGENTS.md`, `docs/HANDOVER.md`, and `docs/nota/`.
- **Latest delivered build:** Tier 1 and Tier 2 pre-launch work complete per `docs/HANDOVER.md` dated 2026-07-04.

## 🚀 Script Registry
- `npm run dev`: Start dev server.
- `npm run build`: Production build verification.
- `npm run export:wardrobe`: Generate `MASTER_WARDROBE.md` for NotebookLM.

## 🧠 Integrity Mandate
1. **Perimeter First:** Before reading a file, confirm it belongs to the `scentral-hub` execution domain.
2. **No Invention:** Use only facts verified from `AGENTS.md`, `docs/HANDOVER.md`, `docs/nota/`, the repo, or the database.
3. **Environment:** Reference keys via `process.env` ONLY.
