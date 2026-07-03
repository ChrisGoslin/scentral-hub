# Epic 14: Noseprint Evolution — Identity Drift Detection & User-Driven Evolution

## Overview
Detects when a user's scent identity has shifted meaningfully (family distribution change, descriptor pattern divergence) and surfaces an evolution moment for them to explicitly choose: stay with their current persona, evolve to the new one, or keep both in a "transition" state.

## Features

### 1. Weekly Background Detection (Edge Function)
**File:** `supabase/functions/detect-noseprint-evolution/index.ts`

Runs on a weekly schedule (via Supabase cron / scheduled job):
- Reads interactions from past 30 days: collections (shelf adds/updates), wear_logs, descriptor analysis
- Calculates family distribution across recent fragrances
- Extracts descriptor patterns from scent_memory text
- **Threshold:** >20% shift in top families OR >3 new dominant descriptors
- On detection:
  - Creates `evolution_events` record with old → new persona, confidence (0-100)
  - Marks current `noseprint_history` as 'previous'
  - Inserts new `noseprint_history` snapshot with 'current' status

### 2. Full Circle Detection
If detected persona matches any 'previous' or 'kept' identity from user's history, surfaces a quiet moment: "You're returning to [Old]" — no pressure, just recognition.

### 3. UI Component — "Something's Shifted" Card
**File:** `app/(main)/you/components/EvolutionCard.tsx`

- Location: Top of `/you` page (user profile)
- Appears only if active `evolution_events` exist for current user
- Styling: Moss palette (`--moss-1`, `--moss-2`, `--moss-accent`), smooth motion animations
- Copy tone: Reflective, non-prescriptive, serif-italic for emotional resonance

**Three Choices:**
1. **Evolve to [New]** — Update persona to new identity, close the card
2. **Keep Both** — Stay ambiguous during transition, mark evolution as 'kept', archive old noseprint as 'kept'
3. **Stay as [Old]** — Dismiss the suggestion, keep current persona

**Visual Details:**
- Confidence progress bar (0-100%) with moss-to-gold gradient
- Before/After persona cards with descriptions
- "What changed" reason: family shift vs descriptor drift
- Footer copy: "No pressure. Your taste keeps evolving—we'll track it."

### 4. API Route for Testing/Manual Trigger
**File:** `app/api/evolution/detect/route.ts`

Manual POST endpoint: `/api/evolution/detect`
- Optional query param: `?limit=10` (for testing, checks only recent N interactions)
- Runs the full detection logic synchronously
- Returns JSON with analysis results, confidence, top families/descriptors

**Usage:**
```bash
curl -X POST https://scentral-hub.vercel.app/api/evolution/detect
```

## Database Schema

### `evolution_events` Table
```sql
CREATE TABLE evolution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id text NOT NULL,
  old_identity text NOT NULL,       -- 'velvet_intellectual' etc.
  new_identity text NOT NULL,
  shift_type text NOT NULL,         -- 'descriptor_drift', 'family_shift', 'blind_ranking'
  confidence integer NOT NULL,      -- 0-100
  user_choice text,                 -- NULL, 'stay', 'evolve', 'keep_both'
  status text NOT NULL DEFAULT 'active', -- 'active', 'previous', 'kept'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `noseprint_history` Table
```sql
CREATE TABLE noseprint_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id text NOT NULL,
  version integer NOT NULL,         -- 1-indexed, increments on shift
  identity_json jsonb NOT NULL,     -- { persona_id, confidence, detected_at, reason, full_circle? }
  status text NOT NULL DEFAULT 'current', -- 'current', 'previous', 'kept'
  created_at timestamp with time zone DEFAULT now()
);
```

## Design Tokens (CSS Variables)

Added to `app/globals.css` (root scope):
```css
/* Moss Palette — Epic 14 Noseprint Evolution */
--moss-1: oklch(0.32 0.08 120);          /* Dark moss background */
--moss-2: oklch(0.25 0.06 120);          /* Deeper moss gradient */
--moss-accent: oklch(0.52 0.12 120);     /* Bright moss highlight */
--moss-surface: oklch(0.18 0.04 120 / 0.6); /* Translucent surface */
--moss-border: oklch(0.45 0.06 120 / 0.3);  /* Subtle moss rim */
```

All colours use OKLch for perceptual uniformity and accessibility.

## Integration Points

### `/you` Page
- EvolutionCard imported and rendered at top of `app/(main)/you/YouClient.tsx`
- Fetches current anon_id from localStorage
- Queries `evolution_events` table for active events
- Non-blocking: if no events, component returns null

### Personas System
- Uses existing `lib/personas.ts` for persona definitions (6 personas)
- Detection heuristic maps family distribution + descriptors to persona
- Fallback: 'comfort_seeker' if no strong signal

### Wearing System
- Reads `collections` (shelf adds/updates) as primary interaction source
- Analyzes `scent_memory` text field for descriptor patterns
- Respects `affinity_score` tiers (optional for future refinement)

## Detection Heuristics

### Family Shift
- Calculates distribution of families in recent collections
- Threshold: >20% shift in top 3 families
- Example: if user previously wore 50% Floral, now 30% Floral + 50% Woody → shift detected

### Descriptor Drift
- Extracts keywords from `scent_memory` text (woody, floral, fresh, fruity, spicy, oriental, musky, citrus, sweet)
- Counts unique descriptors appearing in top 3 most-worn fragrances
- Threshold: >3 new dominant descriptors
- Example: scent_memory changes from "clean, bright, citrus" to "complex, spicy, woody"

### Persona Mapping
- Maps (families, descriptors) → persona using simple heuristic:
  - solar_minimalist ← Citrus or 'fresh'
  - dark_alchemist ← Woody or 'spicy'
  - ritual_keeper ← Floral or 'sweet'
  - rebel_experimentalist ← 'musky'
  - velvet_intellectual ← Oriental
  - comfort_seeker ← default fallback

**In production,** consider refining with Claude Haiku classification via Edge Function.

## Edge Function Scheduling

**Setup (manual, one-time):**
```bash
supabase functions deploy detect-noseprint-evolution
```

**Schedule (via Supabase dashboard or CLI):**
- Recommended: Weekly (e.g., every Monday at 2 AM UTC)
- Adjust threshold values in `index.ts` if needed

**Local testing:**
```bash
supabase functions serve detect-noseprint-evolution
# Then curl http://localhost:54321/functions/v1/detect-noseprint-evolution
```

## RLS Policies

Both tables enforce row-level security:
- Users can only read/insert their own records (keyed by anon_id)
- Policies use `current_setting('app.current_anon_id', true)` for context

**Note:** Ensure Supabase client sets this claim when making requests:
```typescript
const { data } = await supabase
  .from('evolution_events')
  .select('*')
  .eq('anon_id', anonId)  // RLS enforces this at DB layer
```

## Future Enhancements

1. **Claude Haiku copy generation** — Surface personalized evolution narratives via Edge Function
2. **Blind ranking integration** — Detect shifts via A/B comparison of old vs new fragrances
3. **Seasonality analysis** — Account for seasonal wearing patterns before flagging shift
4. **History visualization** — Graph persona journey over time on `/you` page
5. **Community signals** — Compare user's shift against cohort trends

## Testing

### Unit Test: Detection Logic
```typescript
// Verify family shift calculation
const familyDist = { 'Floral': 15, 'Woody': 20 };
const shift = calculateFamilyShift(['Woody', 'Oriental', 'Fresh']); // should be > 0.2
expect(shift).toBeGreaterThan(0.2);
```

### E2E Test: Full Flow
1. Add 15+ fragrances to collection with diverse families/descriptors
2. Call `/api/evolution/detect`
3. Verify `evolution_events` record created with confidence > 50
4. Verify `/you` page renders EvolutionCard
5. Click "Evolve" → verify choice saved, card dismissed
6. Verify `noseprint_history` updated with new version, status='current'

### Smoke Test
```bash
npm run test:smoke:prod
# Should verify /you page loads without errors when evolution event exists
```

## Commit History
- `feat(evolution): weekly noseprint shift detection with user-driven identity evolution` — schema + Edge Function + UI component
