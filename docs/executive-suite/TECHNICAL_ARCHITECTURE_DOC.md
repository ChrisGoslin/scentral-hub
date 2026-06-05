# Scentral Hub: Technical Architecture Document (TAD)

## 🏗️ The "Golden Source" Stack

Scentral is built as a high-performance, edge-ready application designed for rapid iteration and high-trust data handling.

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Unified group routing, RSC for performance, and edge compatibility. |
| **Language** | TypeScript | Strict typing for olfactory metadata and complex resonance logic. |
| **Backend** | Supabase | Postgres-native, built-in Auth, and RLS (Row Level Security) for user data sovereignty. |
| **AI (Cognition)** | Gemini 2.5 Flash | High-speed enrichment and expert sommelier reasoning. |
| **AI (Vision)** | Vertex AI Imagen 3.0 | Premium, photorealistic asset generation via REST handshake. |
| **AI (Memory)** | gemini-embedding-001 | 3072-dimensional vector mapping for semantic resonance. |
| **Styling** | Vanilla CSS + Design Tokens | "Quiet Luxury" custom theme system. No Tailwind-gray dependency. |
| **Icons** | Lucide-React | Modern, minimal, innovative iconography. |

---

## 🔧 Core Systems

### 1. The Ingestion Pipeline (`scripts/`)
- **Discovery:** Playwright-based crawlers targeting premium vendors (Jomashop) to scale the library autonomously.
- **Enrichment:** Async worker using Gemini 2.5 to generate high-fidelity metadata from raw fragrance names.
- **Visuals:** Vertex AI REST integration to generate bottle imagery based on photographic descriptions.

### 2. Resonance Engine (`api/dna-match`)
- **Logic:** Semantic similarity searches using PostgreSQL vector extensions (or application-layer similarity).
- **Implementation:** Maps the 3072-dim embeddings to find "Olfactory Siblings" based on note proximity rather than simple keyword matching.

### 3. Identity & Security (`utils/supabase`)
- **Middleware:** Gated access to `/schedule` and `/profile`.
- **RLS:** Row Level Security policies ensure users can only view their own rituals and private formulations.

---

## 📉 Debt & Refactoring Targets

1. **Component Consolidation:** Move legacy `app/components` into the root `components/ui` folder for better tree-shaking and organization.
2. **Schema Cache:** Shift popularity ranking from `rating` (INT) to a more flexible floating-point system for real-time ranking.
3. **Client-Side State:** Consolidate local storage hooks into a single unified `useWorkspace` context.

---

## 🚀 Deployment
- **Vercel:** Primary deployment target.
- **Environment:** Strictly enforced `.env.local` for API keys (AQ format) and service roles.
