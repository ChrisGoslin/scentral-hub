# Scentral Hub — Architecture & Context

## 🏛️ Domain Perimeter
- **Execution Root:** `/Users/christophergoslin/Projects/scentral-hub`
- **Identity:** This is the **Product Build** folder. It contains the Next.js app, Supabase migrations, and implementation scripts.
- **Separation:** This project is completely distinct from **Foresight** (Strategy/Finance). Never cross-reference Foresight intelligence here unless explicitly instructed.

## 🔑 Ground Truth (Verified June 2026)
- **Scope:** Mobile-first fragrance wardrobe (76 items).
- **Tabs:** 3-tab navigation (Collection, Lab, You).
- **Visuals:** Vertex AI Imagen 3.0 via raw REST fetch.
- **Auth:** Magic-link via Supabase.

## 🚀 Script Registry
- `npm run dev`: Start dev server.
- `npm run build`: Production build verification.
- `npm run export:wardrobe`: Generate `MASTER_WARDROBE.md` for NotebookLM.

## 🧠 Integrity Mandate
1. **Perimeter First:** Before reading a file, confirm it belongs to the `scentral-hub` execution domain.
2. **No Invention:** Use only the real 76-fragrance database.
3. **Environment:** Reference keys via `process.env` ONLY.
