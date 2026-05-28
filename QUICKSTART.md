# Layering Lab — Quick Start

## Setup

```bash
cd Scentral\ Hub
npm install
npm run dev
```

Server runs on `http://localhost:3000`

## File Structure

```
app/
├── components/
│   └── LayeringLab.tsx          ← Main interactive component
├── lib/
│   ├── types.ts                 ← TypeScript interfaces
│   ├── harmonyEngine.ts         ← Matching logic
│   └── presets.ts               ← Fragrance data (3 presets)
├── layout.tsx                   ← Root layout
├── page.tsx                     ← Home page
└── globals.css                  ← Tailwind reset

Config:
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

## How It Works

1. **Select Fragrances:** Click "+ Add Fragrance" in any slot (0, 1, 2)
2. **Pick from Presets:** Dropdown shows Lattafa Raghba, Afnan Turathi, Ajmal Wazn Al Oud
3. **Instant Score:** Harmony % updates in real-time
4. **See Breakdown:** Top, Heart, Base note match percentages
5. **Persist:** Reload page—state survives via localStorage

## Key Features

✅ **Client-only** — No auth, no API, no database
✅ **Responsive** — Desktop 3-col, mobile 1-col
✅ **Dark mode** — Charcoal + amber accents
✅ **Type-safe** — Full TypeScript
✅ **Debounced sync** — localStorage updates at 500ms intervals

## Testing

```bash
# Load Preset button → populates slots 0, 1 with Lattafa + Afnan
# Edit → Harmony Score updates
# Remove (✕) → clears slot
# Reload → state persists
```

## Next Steps

1. Add more fragrances to presets
2. Implement fragrance database (Supabase)
3. Add auth for user collections
4. Build sharing/social features
5. Deploy to Vercel
