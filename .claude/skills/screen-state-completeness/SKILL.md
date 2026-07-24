---
name: screen-state-completeness
description: >-
  Ensure every screen, component, or flow is designed for ALL of its states, not
  just the happy path. Trigger when designing, reviewing, or building any
  user-facing surface — a screen, form, list, reveal, empty view, or async
  interaction. Also trigger on "review this screen", "is this flow complete",
  "design the X screen", or before marking any UI work done. Forces loading,
  empty, error, success, the product-specific trust/recovery state, and the full
  accessibility state set. Build the emotion-carrying state first.
---

# Screen State Completeness

A surface is not complete when the success case looks good. It is complete when
every state a real user will hit is designed, and the state that carries the
screen's emotion is built first.

## The state matrix (design all, before building any)

| State | The question | Failure if skipped |
|---|---|---|
| Loading | What does waiting feel like? Skeleton, held breath, or nothing? | Spinner slop, or a flash of empty |
| Empty | First-run and zero-data. Invitation, not void. | Dead-end; user doesn't know what to do |
| Error | The system failed. Own it calmly, offer the next step. | Blame, jargon, or a stuck user |
| Success | The happy path. | (usually the only one built) |
| **Trust / recovery** | The product was *wrong about the user*. How does it own that without shame? | The deepest trust breach — user feels assessed, not seen |
| Partial / thin | Data came back sparse or degraded. | Layout breaks; looks broken |

## Accessibility states (not optional)

- Keyboard: every action reachable and operable, visible focus.
- Screen reader: async content changes announced (`aria-live`), reveals and
  timed sequences don't leave SR users in silence.
- Reduced motion: the surface arrives without performing.
- Large text / narrow width: no clipping, no overlap.

## Order of construction

1. Identify the screen's **one target emotion** (recognition, ownership,
   trust, belonging…).
2. Identify the single element that carries it.
3. Build that first — including its failure/recovery state.
4. Then loading/empty/error/partial. Then polish.

Theatre never substitutes for the emotion-carrying mechanism. If you built the
animation before the trust state, you built it in the wrong order.

## Review output

```
Target emotion: <one, from the map>
States designed: loading / empty / error / success / trust-recovery / partial  (✓ or GAP each)
Emotion-carrying element: <what it is; built first? y/n>
A11y: keyboard / SR-announce / reduced-motion / large-text  (✓ or GAP each)
Gaps to close before "done": <ranked list>
```

Final test: if the product misreads the user here, does the screen make them
feel owned-up-to, or judged? Only the first is acceptable.
