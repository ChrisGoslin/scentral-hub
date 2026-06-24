# Architecture Plan: Returning User Experience (Prompt 5-B)

## 1. Hydration Guard Architecture
**Challenge:** Reading `localStorage` directly in a Next.js component causes hydration mismatch errors between the server-rendered HTML (which has no access to the client's local storage) and the initial client render.
**Solution:** Implement an explicit hydration guard (a custom hook or mounted state block).

```tsx
// lib/hooks/useHydratedPersona.ts
import { useState, useEffect } from 'react'

export function useHydratedPersona() {
  const [mounted, setMounted] = useState(false)
  const [persona, setPersona] = useState<Persona | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('scentral_persona')
      if (stored) setPersona(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to parse persona', e)
    }
    setMounted(true)
  }, [])

  return { mounted, persona }
}
```

In `YouClient.tsx`:
```tsx
const { mounted, persona } = useHydratedPersona()

// Render a safe fallback (or null) until mounted to ensure server/client match
if (!mounted) return <LoadingShimmer variant="card" />
```

## 2. Dynamic CSS & High-Contrast Persona Card
**Challenge:** Applying dynamic colors (like `cardBg` and `accentColor`) safely without exposing injection vulnerabilities or conflicting with Tailwind's static extraction.
**Solution:** Use inline CSS Custom Properties (CSS variables) scoped to the card container, allowing the CSS engine to handle the dynamic application cleanly.

```tsx
<div
  className="relative rounded-[12px] p-4 mb-5 border overflow-hidden shadow-sm"
  style={{
    background: persona.ui_theme.cardBg,
    borderColor: `${persona.ui_theme.accentColor}30`,
    borderLeft: `3px solid ${persona.ui_theme.accentColor}`,
    '--persona-accent': persona.ui_theme.accentColor,
  } as React.CSSProperties}
>
  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">
    Your Scent Identity
  </p>
  <p className="text-[20px] font-display italic text-[var(--text)] mt-1">
    {persona.name}
  </p>
  <p className="text-[13px] text-[var(--text-muted)] mt-1">
    {persona.narrative.tagline}
  </p>
  <button 
    onClick={() => router.push('/onboarding')}
    className="text-[11px] text-[var(--text-muted)] mt-2 hover:text-[var(--persona-accent)] transition-colors"
  >
    Retake profiler →
  </button>
</div>
```

## 3. Daily Engagement Loops & Streak Tracking
**Challenge:** Tracking streaks accurately based on the local time zone and evaluating deadlines (e.g., 6 PM local checkpoint) without causing UI layout shifts during the calculation.
**Solution:**
- **State initialization:** Defer streak calculation until the component is mounted (tying it into the same `useEffect` hydration barrier).
- **Time logic:** Use the native `Intl.DateTimeFormat` or a robust library like `date-fns` to retrieve the start of the local day.
- **Engagement Check:**
  - Retrieve the last logged wear date from `localStorage` (`scentral_last_wear`).
  - Calculate `isWornToday`: Compare the last wear timestamp against today's local midnight.
  - Calculate `deadlinePassed`: Check if the current time is past 18:00 (6 PM) local time.

```tsx
const [engagementState, setEngagementState] = useState({
  isWornToday: false,
  isAtRisk: false, // Past 6 PM without a wear
  streak: 0
})

useEffect(() => {
  const now = new Date()
  const lastWearRaw = localStorage.getItem('scentral_last_wear')
  const lastWearDate = lastWearRaw ? new Date(lastWearRaw) : null
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const isWornToday = lastWearDate ? lastWearDate >= startOfToday : false
  const currentHour = now.getHours()
  
  setEngagementState({
    isWornToday,
    isAtRisk: !isWornToday && currentHour >= 18,
    streak: parseInt(localStorage.getItem('scentral_streak') || '0', 10)
  })
}, [])
```
*Visual Output:* Render the streak toast or prompt seamlessly based on `engagementState` once `mounted` is true.