# Scentral Hub: Master Product Specification (June 2026)

## 🏛️ Vision: "Sensory Sovereignty"
Scentral is a high-fidelity, autonomous laboratory designed for the curation, synthesis, and planning of fragrance rituals. It moves beyond a simple "collection tracker" into an AI-powered atelier where olfactory resonance is mapped and preserved.

---

## 1. Current State (Live Features)

### 💎 The Wardrobe (Core Library)
- **Status:** High-Fidelity.
- **Function:** A curated gallery of the user's fragrance collection.
- **Key Specs:**
  - Support for 76+ essences (scaling to 500+).
  - High-fidelity AI-generated visuals for every bottle (Imagen 3.0).
  - Expert metadata: Top/Heart/Base notes, Phase (Anchor/Modulator/Top), Family, Projection, and Lean.
  - "Sensory Caution" alerts for high-ARR (Anosmia Risk) items.

### ⚗️ The Atelier (Layering Lab)
- **Status:** High-Fidelity.
- **Function:** An interactive canvas for fragrance synthesis and pairing.
- **Key Specs:**
  - Dual-essence slot selection.
  - "Olfactory Synthesis" engine powered by Gemini 2.5.
  - Dynamic harmony scoring based on note compatibility.
  - Generation of application protocols (spray counts and zones).
  - "Why it works" expert rationale.

### 📅 The Ritual (Spritz Scheduler)
- **Status:** Live & Integrated.
- **Function:** A 3-slot daily planner (Morning, Midday, Evening).
- **Key Specs:**
  - Contextual fragrance picker (prioritizes Anchors for morning, Modulators for midday).
  - Integrated spray steppers.
  - Persistence layer (Supabase) for "Preserved Rituals."
  - Anosmia risk detection across the daily sequence.

### 👤 The You (Profile)
- **Status:** Active.
- **Function:** Personal identity and saved data hub.
- **Key Specs:**
  - Supabase-gated authentication.
  - Access to preserved rituals and synthesis history.

---

## 2. Immediate Backlog (Morocco Sprint)

1. **The Infinite Wardrobe (Vol. 1):** Break the 500+ essence barrier via enhanced discovery crawlers.
2. **Resonance Engine (V2):** Deepen the "Sensory Sovereignty" logic using the now-mapped vector embeddings.
3. **Mobile Polish:** Final pass on `safe-area-inset` for all modal sheets on iPhone SE/Mini.

---

## 3. Post-MVP Explorations (The Horizon)

- **The Community:** A peer-to-peer sharing network for successful layering formulations.
- **Commerce Integration:** Direct "Buy" or "Sample" links for discovered resonances.
- **Visual Aura:** Real-time CSS shaders representing the scent profile (The "Aura" tab).
- **Wear Logs:** Statistical tracking of fragrance performance over time.

---

## 4. Governance & Integrity
- **The Golden Source:** All development is centralized in `Projects/scentral-hub`.
- **Prestige Audit:** Every UI/UX change must pass the **LUNA** audit (Stone-50 background, serif typography, pillar-less whitespace).
- **Empirical Handshake:** All data ingestion is verified against the database schema before execution.
