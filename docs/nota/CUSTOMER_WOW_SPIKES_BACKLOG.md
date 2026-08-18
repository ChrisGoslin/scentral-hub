# nota. & Portfolio Innovation Horizons: Customer "WOW" Backlog & Technical Spikes

> **Goal**: Unlocking breakthrough customer delight, technical moats, and sensory intelligence for `nota.` and sibling products.

---

## 1. Top Customer "WOW" Product Features (Spikes & Prototypes)

### SPIKE-01: The "Digital Scent Drawer" Physical Sync (NFC & Smart Vanity)
- **Concept**: User taps an NFC tag affixed to their physical perfume bottle using their iPhone.
- **Customer Experience**: Instant haptic confirmation on the phone opens the bottle's dynamic "Identity & Memory Portal", logging today's wear, displaying current weather sillage guidance, and revealing how much liquid remains in their digital collection.
- **Technical Investigation**: Web NFC API / iOS CoreNFC universal deep-linking (`nota.app/tap/[fragranceId]`).

### SPIKE-02: Synesthetic Color & Note Harmonics Canvas (WebGL / GLSL Shaders)
- **Concept**: Transform static bottle listings into live fluid-dynamic color fields.
- **Customer Experience**: As the user hovers over notes (e.g. *Bergamot → Cardamom → Haitian Vetiver*), the background canvas blends volumetric shader fluids matching the molecular evaporation colors of the accords.
- **Technical Investigation**: Lightweight Three.js / OGL fragment shader running on `(main)/read` and `(main)/discover`.

### SPIKE-03: Olfactory AI "Scent Passport" & Blind-Ranking Duels
- **Concept**: Fast, gamified pairwise comparison mini-game (*"Between bottle A and bottle B on a crisp autumn evening, which wins?"*).
- **Customer Experience**: 60 seconds of quick binary choices generates an Elo-rated personal fragrance hierarchy and updates their Top 20 Shelf automatically.
- **Technical Investigation**: Elo rating algorithm running client-side with Supabase batch sync.

### SPIKE-04: Personalized Discovery Box Concierge (Dynamic Decant Bundler)
- **Concept**: Algorithmic bundling of 3 complementary 2ml sample decants based on gaps in the user's Scent Wheel.
- **Customer Experience**: One-click custom sample discovery set linked directly to Shopify Storefront or branded retail partners.
- **Technical Investigation**: Graph clustering across `noseprints.matches` and `collections.wishlist`.

---

## 2. Deep Technical Spikes & Architectural Moats

| Spike ID | Target Subsystem | Feasibility Question / Hypothesis | Verification Metric |
|---|---|---|---|
| **TECH-01** | `pgvector` HNSW Indexing | Can Supabase `pgvector` return cosine similarity matches across 127k fragrances in <25ms on serverless? | Benchmark query latency with 1,536-dim embeddings under 50 concurrent requests. |
| **TECH-02** | Client-Side NeRF / Splatting | Can mobile WebGL render an interactive 3D rotatable bottle model in <500KB bundle footprint? | Test Gaussian Splat viewer in Next.js page. |
| **TECH-03** | Local ONNX Barcode/OCR | Can WebWorker Tesseract/ONNX extract perfume batch codes in browser memory without API calls? | Test OCR accuracy on 50 sample fragrance labels. |
| **TECH-04** | Web Audio Synesthesia Engine | Can Web Audio API synthesize a pleasing harmonic drone based on Top 3 fragrance accords? | Prototype 4-second audio generator for Noseprint OG share cards. |
