# Scentral Hub: QE & Automation Strategy

## 🕵️ Current Quality Audit (June 2026)

**Current Status:** High-Fidelity Manual Verification.
**Risk Level:** Medium (Low test coverage).

### ✅ What works:
- **Build Integrity:** `npm run build` passes with zero type errors.
- **Visual Regression:** Manually verified across iPhone SE, Mini, and Pro form factors.
- **Auth Flow:** Manually smoke-tested magic link and session persistence.

### ❌ What is missing:
- **E2E Tests:** No automated regression for the Save Ritual or Synthesis flows.
- **Unit Tests:** No coverage for the `harmonyEngine` or resonance calculations.
- **API Mocks:** No automated testing for the Gemini 2.5 fallback logic.

---

## 🚀 Automation Roadmap

### Phase 1: Foundation (Current Week)
1. **Playwright Integration:** Implement E2E tests in `e2e/` for the "Critical Path":
   - Discover essence -> Synthesize -> Save formulation.
   - Plan ritual -> Update sprays -> Preserve ritual.
2. **Vitest:** Unit tests for `lib/harmonyEngine.ts` to ensure 100% accuracy in resonance scores.

### Phase 2: CI/CD (Next Month)
1. **GitHub Actions:** Automate `npm run build` and `npm run lint` on every PR.
2. **Staging Environment:** Automated deployment to Vercel previews with E2E smoke tests.

### Phase 3: Autonomous Testing (Q3 2026)
1. **Visual Regression Bot:** Use an agent to scan for "LUNA" compliance (token drift, padding issues) on every UI change.
2. **Chaos Ingestion:** Randomly test discovery crawlers against non-standard brand entries to harden the ingestion pipeline.
