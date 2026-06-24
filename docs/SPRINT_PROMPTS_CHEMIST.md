# Fragrance Chemist — Claude Code Sprint Prompts
# Feature: Aura AI Chemist Engine
# Prerequisite: Import pipeline complete (130k+ fragrances in DB)
# Run these prompts IN ORDER — each one depends on the previous.

---

## PROMPT C1 — fragrance_notes table + PubChem enrichment script

```
Read AGENTS.md first. Ground yourself before writing any code.

Build the data foundation for the Fragrance Chemist feature.

## Task 1: Supabase migration

Show me the SQL first and wait for "approved" before applying.

Create table `fragrance_notes` in Supabase (project: scentral-mvp):

```sql
create table if not exists fragrance_notes (
  name text primary key,
  volatility_class text check (volatility_class in ('top', 'heart', 'base')),
  molecular_weight float,
  xlogp float,
  boiling_point float,
  source text default 'pubchem',
  created_at timestamptz default now()
);
create index on fragrance_notes (volatility_class);
```

## Task 2: PubChem enrichment script

Write `scripts/enrich-notes.mjs` that:

1. Reads all unique note strings from the `fragrances.notes` column in Supabase
   (notes are stored as comma-separated strings like "woody, rose, oud, amber")
2. For each unique note, checks if it already exists in `fragrance_notes` (skip if so)
3. For cache misses, fetches from PubChem REST API:
   - URL: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{encodeURIComponent(note)}/property/MolecularWeight,XLogP,BoilingPoint/JSON`
   - Rate limit: max 5 concurrent requests using a Promise-based semaphore pattern
   - Retry on 429/503 with exponential backoff: `Math.pow(2, attempt) * 1000 + Math.random() * 1000`
   - After 3 failed attempts, use fallback values: `{ molecular_weight: 150.0, xlogp: 2.0, boiling_point: null, source: 'fallback' }`
   - Log ALL fallback notes to a file `scripts/data/pubchem-fallbacks.txt` (one per line) so we know which descriptors PubChem doesn't recognise (e.g. "fresh spicy", "warm spicy" — these are accord descriptors, not single molecules)
4. Derives volatility_class from the REAL fetched molecular_weight (never guess):
   - MW < 150 → 'top'  (e.g. limonene 136, linalool 154 — borderline, use < 154)
   - MW 150–220 → 'heart'  (e.g. rose oxide 154, geraniol 154)
   - MW > 220 → 'base'  (e.g. ambroxan 236, iso e super 234)
   - Fallback rows: set volatility_class = 'heart' (safest default, not top or base)
5. Upserts to `fragrance_notes` in batches of 50
6. Supports `--dry-run` flag (logs what would be fetched, touches nothing)
7. Supports `--limit=N` flag (process only first N unique notes — use for testing: --limit=50)
8. Final summary log: total notes found / PubChem hits / fallbacks / already cached

Use `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from `.env.local`.
No secrets in code. Run locally — not in sandbox (needs network).

Provide the exact local run commands at the end:
node scripts/enrich-notes.mjs --dry-run --limit=50   # verify first — checks 50 notes, touches nothing
node scripts/enrich-notes.mjs --limit=50             # test insert on 50 notes
node scripts/enrich-notes.mjs                        # full run — leave overnight, ~2000+ unique notes
```

---

## PROMPT C2 — /api/chemist route (similarity + phase cancellation + dry-down)

```
Read AGENTS.md first. Ground yourself before writing any code.

Upgrade the existing /api/chemist route at app/api/chemist/route.ts.
Read the current file first before changing anything.

The Chemist API takes two fragrance IDs and returns analytical output for Aura AI.

## Request shape
POST /api/chemist
{ "fragranceId": "uuid", "layerId": "uuid" }  // layerId optional

## Response shape
{
  "similarity": {
    "score": 0.0–1.0,
    "label": "Clone" | "Close" | "Complementary" | "Contrasting",
    "explanation": "string"
  },
  "phaseCancellation": {           // only present when layerId provided
    "warning": boolean,
    "message": "string"            // Aura-voice explanation if warning true
  },
  "dryDown": {
    "topPeakMins": number,         // minutes until top notes fade
    "heartPeakMins": number,
    "baseSettleMins": number,
    "timeline": [                  // array of { minute: number, dominantClass: string }
      { "minute": 0, "dominantClass": "top" },
      { "minute": 30, "dominantClass": "heart" },
      { "minute": 120, "dominantClass": "base" }
    ]
  }
}

## Implementation rules

1. SIMILARITY: Fetch both fragrances' note arrays from Supabase. 
   Compute Jaccard similarity: |intersection| / |union| of note sets.
   Score → label:
   - ≥ 0.82 → "Clone"
   - ≥ 0.60 → "Close"  
   - ≥ 0.35 → "Complementary"
   - < 0.35 → "Contrasting"

2. PHASE CANCELLATION (only when layerId provided):
   - Fetch both fragrances' notes from fragrance_notes table
   - If fragrance A has a top note with MW < 150 AND fragrance B has a base note with MW > 220:
     warning: true
     message: "These scents fight for attention at different stages. 
               Apply [fragrance A] to pulse points and [fragrance B] to fabric 
               for the best result."
   - Write the message in Aura's voice: warm, specific, never prescriptive.

3. DRY-DOWN TIMELINE:
   - For the primary fragrance, fetch its notes from fragrance_notes
   - Use these evaporation rate approximations (derived from MW):
     - top (MW < 150): peak at 0–30 mins, fades by 60 mins
     - heart (MW 150–220): peak at 30–90 mins, fades by 180 mins
     - base (MW > 220): settles at 90+ mins, lasts 4–8 hours
   - Return a simple 5-point timeline array

4. If fragrance_notes has no data for a note, skip it gracefully — 
   do not throw, do not return null for the whole response.

5. Use createClient() inside the handler function, not at module level.
   No hardcoded values. CSS variables only in any UI touched.
```

---

## PROMPT C3 — Wire Chemist output into Layering Lab + Spritz Schedule

```
Read AGENTS.md first. Ground yourself before writing any code.

Wire the /api/chemist response into two existing UI surfaces.
Read each target file before modifying it.

## Task A: Layering Lab (/layering)

Find the layering page at app/(main)/layering/. 

When a user selects two fragrances to layer:
1. Call POST /api/chemist with both IDs
2. Show a ChemistPanel component below the fragrance selector with:
   - Similarity badge (pill: "Clone" / "Close" / "Complementary" / "Contrasting")
     colour: Clone = var(--accent), Close = oklch(0.7 0.15 160), 
             Complementary = oklch(0.7 0.12 260), Contrasting = var(--text-muted)
   - Phase cancellation warning if present — amber banner with Aura's message
   - Dry-down timeline: simple horizontal bar divided into top/heart/base segments
     with minute labels. Use CSS variables for colours, no hardcoded hex.

Create ChemistPanel as a new client component at:
components/chemist/ChemistPanel.tsx

It should handle loading state (skeleton), error state (silent — don't break layering 
if Chemist fails), and empty state (no notes data available yet).

## Task B: Spritz Schedule (/spritz)

Find the Spritz/Aura schedule at app/(main)/spritz/.

When Aura recommends a fragrance for the day's wear slot:
1. Call POST /api/chemist with that fragrance ID (no layerId)
2. Display the dry-down timeline as a compact inline strip under the SpritzCard:
   "Top notes peak now → Heart settles ~30 mins → Base anchors ~2 hrs"
   Write this in Instrument Serif italic to match Aura's voice.

Only show the timeline strip if fragrance_notes has data for that fragrance's notes.
If no data, render nothing — don't show an empty state here.

## Constraints
- cabinetSnapshot CustomEvent in WardrobeShelf — NEVER TOUCH
- isPro = false — do not touch ProGate
- CSS variables only, no hardcoded colours
- createClient() inside handler functions only
- All new components: 'use client' only if they use hooks or browser APIs
```

---

## Dependency order
C1 must complete before C2 (needs the table).
C2 must complete before C3 (needs the API).
Each can be delegated to a separate Claude Code session.

## After all 3 are done
Run: npx vercel --prod
Then test /layering with two fragrances that have overlapping notes — 
you should see a similarity score and dry-down timeline appear.
