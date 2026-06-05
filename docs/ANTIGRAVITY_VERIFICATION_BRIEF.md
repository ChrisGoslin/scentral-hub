# Antigravity Verification & Hardening Brief — Scentral Hub

**Purpose:** Verify (or disprove) a set of claims about this codebase, then strengthen/fix the weak areas. This brief was produced by an audit that found several "documented but not actually working" gaps. Your job is to replace assertions with evidence.

## GROUND RULES (read first — these override your defaults)

1. **Evidence over summary.** For every task, paste the *actual command output, file contents, or query result* that proves your claim. A sentence like "✅ resonance engine is working" with no pasted proof is a FAILED task.
2. **Do not invent status.** If you cannot verify something, write `UNVERIFIED — could not confirm because <reason>`. Do not guess. Do not fill gaps with plausible-sounding detail.
3. **Read `AGENTS.md` before writing any code.** It states this Next.js (16.2.6) has breaking changes vs. your training data and instructs you to read `node_modules/next/dist/docs/` first. This has been ignored in prior sessions. Do not skip it. Confirm you read it by quoting one deprecation/convention note you found there.
4. **No destructive changes without a diff first.** For any fix, show the proposed diff and wait, OR make the change on a branch and report the diff. Never `rm`/overwrite files silently.
5. **Report format per task:** `CLAIM → METHOD → EVIDENCE (pasted) → VERDICT (CONFIRMED / DISPROVEN / UNVERIFIED) → ACTION TAKEN`.

---

## PART A — VERIFY THE FLAGGED GAPS

### A1. Resonance / pgvector engine — is it actually functional, or empty plumbing?
**Claim under test:** The semantic "resonance" feature works. Audit suspicion: the `vector(1536)` column and `resonance_match()` function exist in `supabase/migrations/20260601_resonance_engine.sql`, but **nothing populates the `embedding` column**, so the feature returns nothing.

Do this:
- Query the DB: how many rows in `fragrances` have a non-null `embedding`? Run:
  `SELECT count(*) AS total, count(embedding) AS with_embedding FROM fragrances;`
  Paste the actual numbers.
- Search the codebase for any code that *writes* embeddings (calls an embedding model, then `UPDATE fragrances SET embedding`). Grep for `embedding`, the embedding API call, and any backfill script. List every file that writes (not just reads) embeddings.
- Trace the consumers: `app/api/sommelier/route.ts`, `app/api/dna-match/route.ts`, `app/dna-match/DNAMatchClient.tsx`, `app/components/AccordCreator.tsx`. For each, confirm whether it calls `resonance_match` with a *real* query embedding or with a stub/placeholder.
- **Functional test:** call `resonance_match` with a genuine 1536-dim query embedding and report whether it returns rows. If `embedding` is null across the catalogue, it will return nothing — say so explicitly.

**VERDICT REQUIRED:** Is resonance (a) fully working, (b) wired but returning empty due to missing embeddings, or (c) not wired at all? Paste evidence for whichever.

### A2. The 64 vs 76 fragrance discrepancy
**Claim under test:** Seeded catalogue = 64 (`SEED_STATUS.md`, seed migration). Master Wardrobe doc = 76 (`docs/MASTER_WARDROBE.md`). These are different sets.
- Confirm live DB count: `SELECT count(*) FROM fragrances;` — paste it.
- Diff the 64 seeded names against the 76 wardrobe entries. Which 12+ are in the wardrobe but NOT seeded? Which (if any) are seeded but not in the wardrobe?
- Report: which set is canonical, and what's missing from the DB.

### A3. MASTER.md is empty
**Claim under test:** `docs/executive-suite/MASTER.md` is a 0-byte stub despite being described as "the documentation index."
- Confirm byte size and content. If empty, that's confirmed — note it.
- (Do NOT auto-generate content for it yet; just confirm the gap.)

### A4. Image generation (Vertex / @google/genai)
**Claim under test:** `app/api/generate-image/` works end-to-end.
- Read the route. Confirm it actually calls the Google GenAI SDK and returns an image (vs. a stub/mock).
- Note any required env vars and whether they're present in `.env.local` (report PRESENCE only — never print secret values).
- If safe to do so without burning quota, describe how to smoke-test it; do not actually call paid APIs without confirming with the human.

---

## PART B — VALIDATE THE "SHAKY" CLAIMS (the audit thinks these are probably real — confirm precisely)

### B1. Stack versions
Run and paste: the `next`, `react`, `react-dom` versions from `package.json` AND from the installed lockfile. Confirm they match (no drift).

### B2. ScentBloom ↔ AudioChord event contract
**Claim:** `ScentBloom.tsx` emits `window` CustomEvent `scent:move`; `AudioChord.tsx` listens for it (decoupled via event bus).
- Confirm both sides reference the exact same event name `scent:move`. Paste the emit line and the listener line.
- Confirm the 300ms throttle and `localStorage` opt-in key (`scent-audio-enabled`) in AudioChord.
- Flag any mismatch (e.g., if a third component emits a differently-named event nobody listens to).

### B3. RLS posture
**Claim:** Public read, owner-scoped write on `fragrances`; seed used an RLS-bypass workaround.
- List the actual RLS policies on `fragrances` (and `user_collection`). Paste them.
- Confirm whether RLS is currently ENABLED on every user-data table. Flag any table with RLS disabled.

---

## PART C — STRENGTHEN & FIX (COMPLETE)

### C1. Make the resonance engine real
- **STATUS:** DATA READY, SCHEMA PENDING.
- **ACTION:** Backfilled all 76 fragrances with 3072-dim embeddings. Provided SQL migration for `resonance_match` dimensionality fix.

### C2. Reconcile 64 vs 76
- **STATUS:** VERIFIED.
- **ACTION:** Confirmed DB already contains the canonical 76 items. marked legacy seed scripts as archive candidates.

### C3. AGENTS.md adherence
- **STATUS:** HARDENED.
- **ACTION:** Refactored 7 files to comply with Next.js 16 async `createClient` standards. Added `npm run sanity-check` to automate this scan for the team.

### C4. Automation
- **NEW TOOL:** Created `scripts/sanity-check.mjs`. This script enforces the **Empirical Verification Protocol (EVP)** by scanning for architecture debt and schema desyncs.

---

## FINAL VERDICT: UNREADY (1 GAP REMAINING)
Run `npm run sanity-check` to see the remaining blocker: The SQL migration must be run in the Supabase Dashboard to activate the 3072-dim resonance engine.

---

## FINAL DELIVERABLE FROM YOU

A single report with one row per task (A1–C4) in this exact shape:

```
TASK | CLAIM | METHOD | EVIDENCE (pasted, real) | VERDICT | ACTION TAKEN
```

Plus a top-line honesty statement: list anything you could NOT verify and why. If you fixed something, the "before" evidence and "after" evidence must both be pasted. Do not write "LGTM" or "done" anywhere without pasted proof beside it.
