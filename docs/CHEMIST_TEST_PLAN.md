# Chemist Feature Test Plan (C1–C3)
## fragrance_notes Enrichment → API → UI Integration

**Target Scope:** C1 (data foundation), C2 (API logic), C3 (UI integration)  
**Trigger:** After `fragrance_notes` table is seeded with PubChem data  
**Test Environment:** Local dev + staging (scentral-hub.vercel.app) + production

---

## I. Data Foundation Tests (C1 — fragrance_notes table)

### Test 1.1: Schema Verification
- [ ] **Manual** — Connect to Supabase scentral-mvp DB
  - Verify table `fragrance_notes` exists with columns: `name` (PK text), `volatility_class` (text enum: top/heart/base), `molecular_weight` (float), `xlogp` (float), `boiling_point` (float), `source` (text, default 'pubchem'), `created_at` (timestamptz)
  - Verify index on `volatility_class` exists
  - Verify constraint: `volatility_class in ('top', 'heart', 'base')`

### Test 1.2: Enrichment Script Output
- [ ] **Manual** — Run enrichment script and verify output
  - `node scripts/enrich-notes.mjs --dry-run --limit=10` → logs proposed fetch operations (no DB writes)
  - `node scripts/enrich-notes.mjs --limit=10` → inserts 10 sample notes into `fragrance_notes`
  - **Verify:** All 10 notes appear in Supabase with correct volatility_class derived from MW
  - **Verify:** PubChem fallbacks logged to `scripts/data/pubchem-fallbacks.txt`

### Test 1.3: Data Quality — Volatility Classification
- [ ] **Automated** (SQL query in Supabase console)
  - Query: `SELECT name, molecular_weight, volatility_class FROM fragrance_notes ORDER BY molecular_weight LIMIT 20`
  - **Verify:** 
    - All rows with MW < 150 have volatility_class = 'top'
    - All rows with MW 150–220 have volatility_class = 'heart'
    - All rows with MW > 220 have volatility_class = 'base'
  - Spot-check known notes (e.g., "limonene" should be top, "geraniol" should be heart, "ambroxan" should be base)

### Test 1.4: Coverage — Unique Notes in fragrances Table
- [ ] **Automated** (SQL query)
  - Count unique notes in `fragrances.notes` column: `SELECT COUNT(DISTINCT (regexp_split_to_table(notes, ','))) as total_notes FROM fragrances`
  - Count enriched notes: `SELECT COUNT(*) FROM fragrance_notes`
  - **Verify:** enriched notes ≥ 90% of total unique notes (allowing for PubChem misses on accord descriptors)

### Test 1.5: Fallback Handling — Non-PubChem Notes
- [ ] **Manual** — Verify fallback rows
  - Check `fragrance_notes` for source = 'fallback'
  - **Verify:** All fallback rows have `volatility_class = 'heart'` (safest default)
  - **Verify:** `scripts/data/pubchem-fallbacks.txt` lists all fallback note names (e.g., "fresh spicy", "warm creamy")

### Test 1.6: Edge Cases — Null & Empty Notes
- [ ] **Automated**
  - Query fragrances with empty notes: `SELECT COUNT(*) FROM fragrances WHERE notes IS NULL OR notes = ''`
  - **Verify:** Chemist API handles gracefully (returns partial response, no crash)

---

## II. API Route Tests (C2 — /api/chemist)

### Test 2.1: Similarity Scoring
- [ ] **Automated** (Playwright test: `e2e/chemist-api.spec.ts`)
  - POST `/api/chemist` with two fragrances known to have overlapping notes
  - **Verify:** Response includes `similarity` object with `score` (0–1), `label` (one of 4), `explanation` (string)
  - **Verify:** Score matches manual Jaccard calculation: `|intersection| / |union|`
  - **Verify:** Label thresholds correct:
    - score ≥ 0.82 → "Clone" (e.g., Dior Sauvage clone)
    - score ≥ 0.60 → "Close" (similar families)
    - score ≥ 0.35 → "Complementary" (some overlap)
    - score < 0.35 → "Contrasting" (minimal overlap)

### Test 2.2: Similarity Label Colors (UI feedback)
- [ ] **Manual** (visual check in browser DevTools or /layering UI)
  - Similarity badge color:
    - Clone: should be `var(--accent)` (primary gold/amber)
    - Close: `oklch(0.7 0.15 160)` (blue-green)
    - Complementary: `oklch(0.7 0.12 260)` (purple)
    - Contrasting: `var(--text-muted)` (grey)

### Test 2.3: Phase Cancellation Detection
- [ ] **Automated** (Playwright test)
  - POST `/api/chemist` with:
    - fragranceId = fragrance with "top" notes (e.g., linalool, limonene)
    - layerId = fragrance with "base" notes (e.g., ambroxan, oud)
  - **Verify:** Response includes `phaseCancellation` object with `warning: true`
  - **Verify:** Message is present and uses Aura's voice ("Apply X to pulse points, Y to fabric")

### Test 2.4: Phase Cancellation — No Conflict
- [ ] **Automated**
  - POST `/api/chemist` with two fragrances that are BOTH heart-notes or both base-notes (low conflict risk)
  - **Verify:** `phaseCancellation` object either absent or `warning: false`

### Test 2.5: Dry-Down Timeline Generation
- [ ] **Automated** (Playwright test)
  - POST `/api/chemist` with single fragranceId (no layerId)
  - **Verify:** Response includes `dryDown` object with:
    - `topPeakMins` (number, 0–60)
    - `heartPeakMins` (number, 30–180)
    - `baseSettleMins` (number, 60–480)
    - `timeline` array: `[{ minute: number, dominantClass: 'top'|'heart'|'base' }, ...]`
  - **Verify:** Timeline is ordered ascending by minute and represents fragrance profile correctly

### Test 2.6: Dry-Down Timeline — No Notes Edge Case
- [ ] **Automated**
  - POST `/api/chemist` with a fragrance that has empty/null notes column
  - **Verify:** Response still includes `dryDown` object with fallback timeline:
    - `[{ minute: 0, dominantClass: 'top' }, { minute: 30, dominantClass: 'heart' }, { minute: 120, dominantClass: 'base' }]`

### Test 2.7: Partial Data Handling
- [ ] **Automated**
  - POST `/api/chemist` with a fragrance whose notes are only partially in `fragrance_notes` (e.g., 3 of 5 notes enriched)
  - **Verify:** API uses only the enriched notes (skips missing ones gracefully)
  - **Verify:** Response is still valid (not null, not error)

### Test 2.8: API Error Handling
- [ ] **Automated** (negative test cases)
  - **Test 2.8a:** POST with missing `fragranceId` → HTTP 400 with error message
  - **Test 2.8b:** POST with invalid UUID (non-existent fragrance) → HTTP 404
  - **Test 2.8c:** POST with malformed JSON body → HTTP 400
  - **Test 2.8d:** POST with `layerId` that doesn't exist → HTTP 404
  - **Verify:** All error responses include `error` field with readable message

### Test 2.9: Performance — Response Time
- [ ] **Manual** (watch Network tab in browser DevTools)
  - Call `/api/chemist` with full fragrance IDs (rich note sets)
  - **Verify:** Response time < 500ms (acceptable API latency)
  - If > 500ms, profile SQL queries (`fragrance_notes` lookups) for index gaps

### Test 2.10: Database Query Optimization
- [ ] **Manual** (check Supabase logs)
  - Enable query logging on scentral-mvp project
  - Call `/api/chemist` 10 times with different fragrance pairs
  - **Verify:** Queries use indexes (lookup on `fragrance.id`, `fragrance_notes(volatility_class)`)
  - **Verify:** No N+1 query patterns (all note props fetched in one batch query)

---

## III. UI Integration Tests (C3 — Layering Lab + Spritz Schedule)

### Test 3.1: /layering — ChemistPanel Rendering
- [ ] **Manual** (visual test on local dev + staging)
  - Navigate to `/layering`
  - Select two fragrances to layer
  - **Verify:** ChemistPanel appears below fragrance selector with:
    - Similarity badge (colored pill)
    - Phase cancellation warning (amber banner if applicable)
    - Dry-down timeline (horizontal bar with minute labels)
  - **Verify:** Loading state (spinner) appears briefly while fetching

### Test 3.2: /layering — ChemistPanel Loading State
- [ ] **Manual** (with network throttling)
  - Open DevTools, go to Network tab, throttle to "Fast 3G"
  - Select two fragrances to layer
  - **Verify:** Spinner icon is visible while `/api/chemist` is in flight
  - **Verify:** Spinner uses `var(--accent)` color with `animation: spin 1s linear infinite`

### Test 3.3: /layering — ChemistPanel Error Handling
- [ ] **Automated** (mock API 500 error in Playwright)
  - Intercept `/api/chemist` POST and return HTTP 500
  - Select two fragrances
  - **Verify:** ChemistPanel silently fails (no component rendered, no error toast)
  - **Verify:** Layering experience continues unbroken

### Test 3.4: /layering — Similarity Badge Appearance
- [ ] **Manual** (visual inspection)
  - Layer fragrances with different similarity levels (Clone, Close, Complementary, Contrasting)
  - **Verify:** Badge colors match spec:
    - Clone: accent color (gold/amber)
    - Close: teal (`oklch(0.7 0.15 160)`)
    - Complementary: purple (`oklch(0.7 0.12 260)`)
    - Contrasting: text-muted (grey)
  - **Verify:** Percentage label is correct (rounds to nearest integer)
  - **Verify:** Explanation text is readable and contextual

### Test 3.5: /layering — Phase Cancellation Warning
- [ ] **Manual** (visual + semantic check)
  - Layer a fragrance with top notes + fragrance with base notes
  - **Verify:** Amber warning banner appears with:
    - Icon or label: "⚠ Phase Cancellation"
    - Message text in Aura's voice (warm, specific, not prescriptive)
    - Correct color: `oklch(0.25 0.08 60 / 0.8)` background, `oklch(0.78 0.14 85)` text
    - Font: `var(--font-serif)` italic

### Test 3.6: /layering — Dry-Down Timeline Display
- [ ] **Manual** (visual check)
  - After selecting fragrances, scroll to ChemistPanel
  - **Verify:** Timeline shows colored boxes for each phase:
    - Top notes: cyan/teal
    - Heart notes: purple
    - Base notes: amber/brown
  - **Verify:** Minutes are labeled (e.g., "0m", "30m", "120m")
  - **Verify:** Arrow separators (→) between boxes
  - **Verify:** Summary text below: "Top peaks at Xm · Heart at Ym · Base settles ~Zm"

### Test 3.7: /spritz — DryDownTimeline Component
- [ ] **Manual** (visual test on `/spritz` page)
  - Navigate to `/spritz` (or mock an Aura event)
  - Aura recommends a fragrance for the day
  - **Verify:** DryDownTimeline component appears as a compact inline strip under SpritzCard
  - **Verify:** Text format: "Top notes peak now → Heart settles ~30 mins → Base anchors ~2 hrs"
  - **Verify:** Font: `var(--font-serif)` italic, 12px, text-muted color
  - **Verify:** Layout doesn't overflow on mobile (< 480px)

### Test 3.8: /spritz — DryDownTimeline Silent Failure
- [ ] **Manual** (or automated with mock)
  - Mock `/api/chemist` to return empty dryDown data
  - Trigger a Spritz event with a fragrance that has no enriched notes
  - **Verify:** DryDownTimeline renders nothing (no empty state, no error)
  - **Verify:** SpritzCard still displays (no crash)

### Test 3.9: Responsive Design — Mobile (< 480px)
- [ ] **Manual** (iPhone 12 viewport)
  - Open `/layering` on mobile
  - Select two fragrances
  - **Verify:** ChemistPanel fits on screen without horizontal scroll
  - **Verify:** Similarity badge wraps or scales gracefully
  - **Verify:** Timeline boxes are legible (font size ≥ 11px)
  - **Verify:** Explanation text doesn't overflow

### Test 3.10: Responsive Design — Tablet (480–768px)
- [ ] **Manual** (iPad/tablet viewport)
  - Same as 3.9 but verify layout adapts to wider screen
  - **Verify:** ChemistPanel uses 2-column or side-by-side layout if space allows

---

## IV. Integration Tests (C1 + C2 + C3 together)

### Test 4.1: End-to-End — Full Layering Flow
- [ ] **Automated** (Playwright test: `e2e/chemist-e2e.spec.ts`)
  1. Navigate to `/layering`
  2. Search for fragrance "Sauvage" (or similar with known notes)
  3. Select Sauvage + another fragrance (e.g., Dior Homme)
  4. Wait for ChemistPanel to render
  5. **Verify:** All three Chemist outputs appear (similarity, phase cancellation, dry-down)
  6. Take screenshot for visual regression

### Test 4.2: End-to-End — Spritz + DryDownTimeline
- [ ] **Manual** (or automated mock)
  1. Navigate to `/spritz`
  2. (Manual setup: insert a spritz_schedules row with a known fragrance ID)
  3. **Verify:** SpritzCard renders
  4. **Verify:** DryDownTimeline appears as subtitle/description
  5. Take screenshot

### Test 4.3: Data Consistency — fragrance_notes Updates
- [ ] **Manual** (stress test over time)
  1. Seed `fragrance_notes` with 100 notes
  2. Call `/api/chemist` 50 times with random fragrance pairs
  3. Check Supabase logs for any failed queries
  4. **Verify:** No errors, no stale cache issues

### Test 4.4: Caching & Performance — Repeated Calls
- [ ] **Manual** (performance profiling)
  1. Call `/api/chemist` with the same fragrance pair 10 times in a row
  2. Measure response time for each call
  3. **Verify:** Time is consistent (no dramatic slowdown on repeated queries)
  4. **Verify:** If caching is implemented (e.g., Redis cache), verify cache hits

---

## V. Edge Cases & Boundary Tests

### Test 5.1: Empty Notes Column
- [ ] **Automated**
  - Fragrance with `notes IS NULL` or `notes = ''`
  - POST `/api/chemist` with this fragrance
  - **Verify:** dryDown timeline falls back to default (0–30–120 mins)
  - **Verify:** similarity score = 0 (no common notes)

### Test 5.2: Single Note
- [ ] **Automated**
  - Fragrance with only one note: "rose"
  - Layer with another fragrance containing "rose" + others
  - **Verify:** similarity score = `1 / |union|` (correct Jaccard)

### Test 5.3: Duplicate Notes in One Fragrance
- [ ] **Automated**
  - Fragrance with notes: "rose, rose, woody, woody"
  - **Verify:** API deduplicates before Jaccard (set logic, not list)
  - **Verify:** similarity score is correct

### Test 5.4: Very Long Note Lists
- [ ] **Automated**
  - Fragrance with 20+ comma-separated notes
  - **Verify:** API handles without timeout
  - **Verify:** Response time < 1s

### Test 5.5: Special Characters in Note Names
- [ ] **Automated**
  - Notes like "amber-wood", "iso e super", "rose oxide"
  - **Verify:** Jaccard comparison is case-insensitive and whitespace-trimmed
  - **Verify:** No SQL injection via note names

### Test 5.6: Volatility Class Boundary Values
- [ ] **Automated**
  - Test notes with MW exactly at boundary (150, 220)
  - **Verify:** MW = 150 → volatility = 'heart' (per spec: MW < 150 is top, 150–220 is heart)
  - **Verify:** MW = 220 → volatility = 'base' (per spec: > 220 is base)

---

## VI. Manual & Visual Regression Tests

### Test 6.1: Color Contrast & Accessibility
- [ ] **Manual** (WCAG 2.1 AA check)
  - Similarity badge text vs. background color
  - Phase cancellation warning text vs. background
  - Dry-down timeline colors vs. white/dark mode
  - **Verify:** All text is legible (contrast ratio ≥ 4.5:1 for normal text)

### Test 6.2: Dark Mode / Light Mode
- [ ] **Manual** (toggle theme in browser DevTools)
  - Open `/layering` and `/spritz` in light and dark modes
  - **Verify:** All colors use CSS variables (no hardcoded hex)
  - **Verify:** Contrast is maintained in both modes

### Test 6.3: Print & Export (if applicable)
- [ ] **Manual** (Press Ctrl+P or Cmd+P on /layering)
  - **Verify:** ChemistPanel content is printable (not hidden by overflow or print-none)
  - **Verify:** Colors are readable in print preview

### Test 6.4: Animation Smoothness
- [ ] **Manual** (visual frame inspection)
  - Loading spinner rotates smoothly (`animation: spin 1s linear infinite`)
  - Phase cancellation warning fades in smoothly
  - **Verify:** No jank or frame drops on 60 Hz displays

---

## VII. Staging & Production Validation

### Test 7.1: Staging Deploy
- [ ] **Manual** (after merging C1–C3 to main)
  ```bash
  git log --oneline -1  # verify commit
  npx vercel --prod
  ```
  - **Verify:** Deploy succeeds (READY state)
  - **Verify:** `/layering` and `/spritz` are accessible at https://scentral-hub.vercel.app

### Test 7.2: Staging — API Smoke Test
- [ ] **Automated** (smoke-test script or manual curl)
  ```bash
  curl -X POST https://scentral-hub.vercel.app/api/chemist \
    -H 'Content-Type: application/json' \
    -d '{"fragranceId":"<real-uuid>"}'
  ```
  - **Verify:** HTTP 200 response with all three fields (similarity, phaseCancellation, dryDown)

### Test 7.3: Production — Spot-Check Real Data
- [ ] **Manual** (sample a few real fragrances from DB)
  - Layer "Dior Sauvage" with "Dior Sauvage Elixir" (high similarity expected)
  - **Verify:** Similarity ≥ 0.82 ("Clone" label)
  - Layer "Dior Sauvage" with "Creed Aventus" (different families)
  - **Verify:** Similarity < 0.6 ("Complementary" or "Contrasting")

---

## VIII. Test Automation Summary

### Automated Tests (Playwright E2E + API mocking)
- `e2e/chemist-api.spec.ts` — API contract tests (similarity, phase cancellation, dry-down)
- `e2e/chemist-e2e.spec.ts` — Full layering flow (UI + API integration)
- `e2e/spritz-drydown.spec.ts` — Spritz card with DryDownTimeline

### Manual Tests (Visual + Performance + Accessibility)
- Color correctness (badge colors, warning banner)
- Responsive layout (mobile, tablet, desktop)
- Dark mode / light mode consistency
- Performance profiling (API response time < 500ms)
- Accessibility (color contrast, screen reader labels)

---

## IX. Known Issues & Workarounds

### Issue 1: PubChem Rate Limiting
- **Symptom:** Script fails after 1000+ requests with HTTP 429
- **Workaround:** Run in batches with exponential backoff; check `scripts/data/pubchem-fallbacks.txt` for descriptor notes that can't be enriched (e.g., "fresh spicy", "warm creamy" are accords, not molecules)

### Issue 2: Accord Descriptors Not in PubChem
- **Symptom:** Many fragrance notes are descriptive (e.g., "fresh spicy", "warm creamy") rather than actual molecules
- **Workaround:** These fall back to `volatility_class = 'heart'` with source = 'fallback'. Acceptable degradation.

### Issue 3: Silent API Failures
- **Symptom:** ChemistPanel doesn't render if `/api/chemist` errors
- **Workaround:** By design — don't break layering experience. Check browser console for errors.

---

## X. Sign-Off Checklist

- [ ] All C1 tests pass (schema, enrichment, data quality)
- [ ] All C2 tests pass (API logic, error handling)
- [ ] All C3 tests pass (UI integration, responsive, dark mode)
- [ ] Integration tests pass (E2E flows)
- [ ] Edge cases handled (no notes, partial data, special chars)
- [ ] Staging deploy successful + smoke test green
- [ ] Performance OK (API < 500ms, page load < 2s)
- [ ] Accessibility verified (WCAG AA contrast)
- [ ] Code review passed
- [ ] PR merged to main
- [ ] Production deployment confirmed
