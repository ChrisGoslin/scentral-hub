# Scentral Hub: Retrospective V1 (June 2026)

## 🔍 "If it was built again from the beginning..."

While the current Scentral Hub is a high-fidelity "Masterpiece Ready" platform, building it again from scratch would allow for several structural improvements based on our learnings during the Morocco Demo phase.

### 1. Data-First Architecture
- **The Issue:** We relied on scraping Jomashop via Playwright, which is prone to selector drift and timeouts.
- **The Pivot:** We would establish a **Fragrance Knowledge Graph** first, using a dedicated API or a pre-populated static dataset of 1,000+ items, rather than growing the library organically through discovery scripts.

### 2. Unified Component Strategy
- **The Issue:** The codebase currently has fragmentation between `app/components` and root `components/`.
- **The Pivot:** Adopt a **"Shadcn-plus"** approach from day one—customizing a base UI library into our "Quiet Luxury" tokens immediately, rather than surgically "sculpting" them later with LUNA.

### 3. Native Vector Database
- **The Issue:** Vector resonance was added as a second-layer enrichment.
- **The Pivot:** Use **Supabase `pgvector`** as the primary index for the entire library from the first migration. Every search would be a semantic vector search by default, rather than keyword-based.

### 4. PWA-First
- **The Issue:** Service workers and offline caching were integrated later in the build.
- **The Pivot:** Design as a **Progressive Web App** from the first commit. Fragrance enthusiasts are often in "low-connectivity" retail environments; 100% offline availability of `The Wardrobe` should be a foundational requirement, not a feature.

### 5. Nomenclature Discipline
- **The Issue:** We started with mechanical names (Schedule, Lab, Collection).
- **The Pivot:** Apply the **LUNA Standard** to the naming convention before a single line of UI code is written. "The Atelier" is a lifestyle; "The Lab" is a tool. We would build for the lifestyle from day one.
