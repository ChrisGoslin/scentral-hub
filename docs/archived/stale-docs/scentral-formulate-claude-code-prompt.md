# Claude Code Prompt — Wire /api/formulate

Paste this exactly into Claude Code from your ~/projects/scentral folder.

---

I'm building Scentral — a personal fragrance intelligence tool. I need to wire the Formulate feature end-to-end.

## Step 1 — Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

## Step 2 — Add env var

Add this to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

(Get your key from console.anthropic.com → API Keys)

## Step 3 — Create the route handler

Copy `/Users/christophergoslin/AI Studio/scentral-formulate-route.ts` into:
`app/api/formulate/route.ts`

Do not modify the file — copy it exactly.

## Step 4 — Update LayeringClient to call the route

In `app/layering/LayeringClient.tsx`, find the Formulate button handler (currently shows a placeholder response).

Replace the placeholder with this real implementation:

```typescript
// Add this state near the top of LayeringClient:
const [formulating, setFormulating] = useState(false);
const [formulateResult, setFormulateResult] = useState<{
  combo_name: string;
  application_steps: string[];
  sillage_prediction: string;
  occasion_tag: string;
  anosmia_warning: string | null;
  claude_note: string;
} | null>(null);
const [formulateError, setFormulateError] = useState<string | null>(null);

// Replace the Formulate button onClick handler with:
const handleFormulate = async () => {
  if (!selectedFragrance || !selectedPairing) return;
  setFormulating(true);
  setFormulateResult(null);
  setFormulateError(null);
  
  try {
    const res = await fetch('/api/formulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fragrance1: selectedFragrance,
        fragrance2: selectedPairing,
        context: {
          time_of_day: selectedTime || 'evening',
          weather: selectedWeather || 'cool',
          occasion: selectedOccasion || 'casual',
        }
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Formulate failed');
    setFormulateResult(data.result);
  } catch (err) {
    setFormulateError(String(err));
  } finally {
    setFormulating(false);
  }
};
```

## Step 5 — Replace the Formulate result placeholder UI

Where the placeholder response currently shows, replace with:

```tsx
{formulating && (
  <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-amber-800/40 animate-pulse">
    <p className="text-amber-400 text-sm">Formulating your combo...</p>
  </div>
)}

{formulateResult && (
  <div className="mt-4 p-5 bg-slate-800 rounded-xl border border-amber-500/40 space-y-4">
    {/* Combo name */}
    <div>
      <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Your Combo</p>
      <h3 className="text-2xl font-bold text-white">{formulateResult.combo_name}</h3>
      <p className="text-sm text-amber-300 mt-0.5">{formulateResult.occasion_tag}</p>
    </div>

    {/* Anosmia warning */}
    {formulateResult.anosmia_warning && (
      <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg">
        <p className="text-xs text-red-400">⚠ {formulateResult.anosmia_warning}</p>
      </div>
    )}

    {/* Application steps */}
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Application Steps</p>
      <ol className="space-y-2">
        {formulateResult.application_steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
            <span className="text-slate-200">{step}</span>
          </li>
        ))}
      </ol>
    </div>

    {/* Sillage */}
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sillage Prediction</p>
      <p className="text-sm text-slate-300">{formulateResult.sillage_prediction}</p>
    </div>

    {/* Expert note */}
    <div className="pt-2 border-t border-slate-700">
      <p className="text-xs text-slate-500 italic">{formulateResult.claude_note}</p>
    </div>
  </div>
)}

{formulateError && (
  <div className="mt-4 p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
    <p className="text-sm text-red-400">Error: {formulateError}</p>
  </div>
)}
```

## Step 6 — Wire the Formulate button

Find the amber Formulate button and change its onClick to `handleFormulate` and add a disabled state:

```tsx
<button
  onClick={handleFormulate}
  disabled={formulating || !selectedPairing}
  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors"
>
  {formulating ? 'Formulating...' : '✦ Formulate This Combo'}
</button>
```

## Step 7 — Test locally

Run `npm run dev` and go to http://localhost:3001/layering

1. Select "His Confession" from the fragrance list
2. Select any Phase 2 or Phase 3 pairing
3. Click Formulate
4. Verify you get: combo name, application steps, sillage prediction, expert note

If you get a 500 error, check:
- ANTHROPIC_API_KEY is set in .env.local
- The @anthropic-ai/sdk is installed (`npm install @anthropic-ai/sdk`)

## Step 8 — Deploy

```bash
cd ~/projects/scentral
npx vercel --prod
```

Add ANTHROPIC_API_KEY to Vercel dashboard → Settings → Environment Variables (scope: Production).

---

## What selectedPairing needs to contain

The LayeringClient needs a second state `selectedPairing` that captures the full fragrance object (not just the ID) when the user clicks a compatible fragrance in the pairing list. 

If `selectedPairing` doesn't exist yet, add:
```typescript
const [selectedPairing, setSelectedPairing] = useState<typeof fragrances[0] | null>(null);
```

And on each compatible pairing card, add an onClick:
```tsx
onClick={() => setSelectedPairing(pairing)}
className={`... cursor-pointer ${selectedPairing?.id === pairing.id ? 'ring-2 ring-amber-500' : ''}`}
```

This lets the user pick WHICH pairing they want to formulate before hitting the button.
