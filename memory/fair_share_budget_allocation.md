---
name: fair_share_budget_allocation
description: Reusable algorithm for allocating constrained resources (tokens, rows, budget) fairly across uneven demand
metadata:
  type: project
---

**Pattern:** When multiple sources (database rows, API requests, LLM signals) compete for a constrained resource (character budget, row count, API quota), fair-share allocation prevents any source from starving while respecting global limits.

**Algorithm:**
1. Calculate demand per source (e.g., `raw_text.length` for each signal, `MAX_SIGNALS_PER_RUN` for each DB query).
2. Compute per-source allocation: `allocation[i] = (demand[i] / sum(demand)) × budget`.
3. Apply caps: per-source `MAX_CHARS_PER_SOURCE = budget / source_count`.
4. Trim picks from highest-demand sources first until total fits.

**Why it matters:**
- Single-pass greedy approaches (sort by recency, pick while budget remains) starve low-recency sources even with fair-share capping.
- Naive fair-share that ignores per-source demand caps can exhaust budget on a single source, leaving others empty.
- The two-phase approach (allocate, then trim) ensures no source is starved *and* no source overshoots its per-source cap.

**Example (PR #55 insights):**
```ts
// Demand: different sources have different numbers of signals
const charDemandBySource = {
  'source_a': 45000,  // 45k chars of raw text
  'source_b': 12000,  // 12k chars
  'source_c': 8000,   // 8k chars
};

// Allocate fairly
const fairAllocation = fairAllocateBudget(charDemandBySource, 180_000);
// Result: { source_a: 135000, source_b: 36000, source_c: 24000 }
//         (60%, 20%, 13.3% of budget, scaled to demand ratio)

// Then trim each source's picks to fit its allocation
for (const [source, maxChars] of Object.entries(fairAllocation)) {
  const picks = signals[source].slice(0, maxCharsToItemCount(maxChars));
  // ...
}
```

**Linked resources:** [[phantom_object_pattern]]
