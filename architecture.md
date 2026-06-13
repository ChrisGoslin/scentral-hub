# Scentral Hub — Architectural Source of Truth

This file represents the invariant contract for Scentral Hub. All agent modifications must adhere to this protocol.

## 1. Core System Architecture
*   **Next.js App Router Structure**: Uses Next.js 16 group routing under `(main)`. Server Components manage initial data fetching via `utils/supabase/server`. Client Components (`'use client'`) handle interactive UI, state transitions, and animations.
*   **Olfactory Resonance Engine**: Computes similarity using 3072-dimensional pgvector embeddings via Gemini API. Compatibility logic is driven by `/api/aura` and molecular chemical assessments in `/api/chemist` backed by Claude Haiku.
*   **UI Aesthetic**: "Quiet Luxury" palette. Stone-50 (`#f5f5f4`) background, editorial serif typography (Fraunces Display), and Fragrance Gold (`#c49a3c`) accents. Design tokens are located in `lib/design/tokens.css`.

## 2. Engineering Guardrails
*   **Next.js 16 Compliance**: Any database server-client creation or cookies fetch inside Server Components must be awaited (`await createClient()`, `await cookies()`).
*   **Zero Key Visibility**: No API keys are permitted in Markdown, logs, or source code. Configure keys solely in local environment configuration (`.env.local`).
*   **No Redundant Folders**: `scentral-hub` is the primary repository root. No nested folders like `fragrance-community` or `scentral` are allowed.
*   **Pre-Flight Verification**: Run `npm run sanity-check` and `npm run build` to verify there are no compilation or architectural errors before pushing changes.

## 3. Multi-Agent Protocol
*   **Domain Perimeter**: Scentral Hub is the primary **Execution Domain** for fragrance features.
*   **Handshake Protocol**: Always query active branch status (`git status`) and linting states before modifying code.
*   **Dependency Limits**: Do not install additional state management libraries or introduce unapproved AI providers.
