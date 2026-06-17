# Scentral — Pre-Submission Audit Checklist

## 1. Phase 1 Gates (Core UX)
- [x] Onboarding: Sanctuary profiler assigns persona correctly.
- [x] Onboarding: Persona is stored in `localStorage` (`scentral_persona`).
- [x] Landing Page: Primary CTA drives to `/onboarding`.
- [x] Navigation: Bottom Nav works for all 5 primary tabs.
- [x] Search: Hybrid search (Fuse.js + Vector) returns relevant results.

## 2. PWA / Mobile Layouts
- [x] Viewport: Using `min-h-[100dvh]` to prevent iOS address bar shifts.
- [x] Safe Areas: Header and Nav respect `env(safe-area-inset-*)`.
- [x] Standalone: Top header hidden when installed as PWA.
- [x] Manifest: `start_url`, `theme_color`, and `display: standalone` verified.
- [x] Kinetic Scroll: `WebkitOverflowScrolling: touch` applied to all feeds.
- [x] Images: All bottles use `object-fit: contain` with consistent `3/4` aspect ratio.

## 3. Performance Metrics
- [x] First Paint: Below 800ms on mobile (verified via Vercel).
- [x] Interaction: No layout shifts when loading fragrance lists.
- [x] Caching: Service Worker (Serwist) precaches static assets.
- [x] Bundle Size: PostHog and Fuse.js installed as modern ESM.

## 4. Legal & Telemetry Compliance
- [x] Privacy Policy: Clean Markdown at `/privacy` with GDPR statements.
- [x] Terms of Service: Clean Markdown at `/terms` with clone disclaimer.
- [x] Links: Both pages linked from the "You" settings panel.
- [x] Telemetry: PII removal guardrails active in `lib/analytics.ts`.
- [x] DNT: Analytics respects browser "Do Not Track" headers.

---

*Verified by Gemini CLI — June 17, 2026*
