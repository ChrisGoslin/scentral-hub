# nota. E2E Product, UX, QE, Security, Performance Audit

Date: 2026-07-05  
Auditor: Codex  
Scope: `scentral-hub` / nota. web app, production at `https://scentral-hub.vercel.app`, current local `main`

## Executive Summary

nota. has a strong product thesis and several valuable live loops: scent identity, shelf, blind ranking, traces, trails, insights, and AI-assisted recommendations. The main customer value is clear: help users understand and organize their scent identity in a way that feels personal, not like a catalogue.

However, the current release state is not launch-stable. Production is behind local `main`, and customers are still exposed to bugs that local commits appear to have fixed. The largest customer-facing defect is Discover reliability: Chromium E2E shows the Discover page can render the global error boundary instead of search/filter/wishlist because an external fragrance image host is not whitelisted for `next/image`.

Most urgent actions:

1. Ship the local fixes or redeploy from the correct commit. Production still fails the smoke checks for sanitized `/api/fragrances` queries and ID lookup even though local commits suggest both were fixed.
2. Fix the Discover crash caused by unconfigured image host `www.mannenzaak.nl`.
3. Close critical API security gaps: unauthenticated push broadcast and service-role likes trusting caller-supplied `userId`.
4. Align `react` and `react-dom` versions. E2E dev runtime logs show a hard version mismatch.
5. Fix lint scope so `.claude/worktrees` and `.next` are ignored, then clean the real app lint failures.

## Evidence Collected

| Area | Result |
|---|---|
| Production smoke | 16 passed, 2 failed |
| Local `npm run build` | Passed |
| Local Chromium E2E | 15 passed, 3 failed, 1 skipped |
| Local lint | Failed: ESLint scans `.claude/worktrees`, `.next`, plus real app errors |
| `npm audit --audit-level=high` | Failed: 28 vulnerabilities, 5 high |
| Lighthouse production | Performance 71, Accessibility 95, Best Practices 96, SEO 100 |
| Branch/deploy hygiene | Local `main` is ahead of `origin/main`; production appears stale |
| iOS/native | No Xcode/native iOS project found; audit limited to mobile web/PWA readiness |
| AI Elements | Not installed; no AI SDK chat UI found. Future streaming/markdown AI UI should use AI Elements `MessageResponse`/`Message` patterns. |

## P0 Findings

### P0-1: Production is stale and still exposes already-fixed API defects

Evidence:
- `git status --short --branch`: local `main...origin/main [ahead 7]`.
- `git log`: local commits include `fix(api): respect ?id= query param in /api/fragrances` and `security: sanitize search input in fragrances API routes`.
- Production smoke still fails:
  - `/api/fragrances?q=rose,or(name.like.*)` returns 500.
  - `/api/fragrances?id=e71ee478-59b7-4a94-a396-34795657d202` returns 100 fragrances instead of 1.
- Current local code includes ID handling and sanitization in `app/api/fragrances/route.ts`.

Customer impact:
- Users can hit broken search behavior in production.
- Smoke-test confidence is misleading unless deployment source is verified.

Recommended fix:
- Push local `main` or reconcile with `origin/main`, then run `bin/deploy`.
- Confirm Vercel deploy commit equals local `HEAD`.
- Keep scheduled smoke tests, but ensure they alert on failure.

Acceptance criteria:
- Production smoke test passes 18/18.
- Vercel deployment commit matches the intended Git commit.
- `git status --short --branch` no longer shows local main ahead of origin.

### P0-2: Discover page can crash behind the global error boundary

Evidence:
- Chromium E2E failed all Discover tests:
  - `can search for fragrances`
  - `can toggle filters`
  - `can heart a fragrance to wishlist`
- Playwright page snapshot showed `Something went wrong` instead of Discover UI.
- Runtime log:
  - `Invalid src prop (https://www.mannenzaak.nl/...jpg) on next/image, hostname "www.mannenzaak.nl" is not configured`.
- `next.config.ts` whitelists several image domains but not `www.mannenzaak.nl`.
- `app/(main)/discover/page.tsx` orders by populated `image_url`, so a single unapproved host in top results can crash first paint.

Customer impact:
- Discover is the top acquisition/value route. Search, filtering, and wishlist can be unavailable.

Recommended fix:
- Prefer migrating external `image_url` values into Supabase Storage or proxying via a controlled image service.
- Short-term: add `www.mannenzaak.nl` and any other observed production image hosts to `next.config.ts`.
- Add a CI check that samples live `image_url` hostnames from the database and verifies every host exists in `next.config.ts`.

Acceptance criteria:
- Chromium Discover E2E passes.
- Browser console has no `next/image` unconfigured-host errors.
- New image sources cannot be introduced without config coverage.

### P0-3: Unauthenticated push broadcast endpoint can send arbitrary notifications

Evidence:
- `app/api/push/send/route.ts` accepts POST body `{ title, body, url, targetEndpoint }`.
- It uses `SUPABASE_SERVICE_KEY`.
- It has no session check, admin check, CSRF protection, or rate limit.
- If `targetEndpoint` is omitted, it fetches all `push_subscriptions` and sends to every subscription.

Customer impact:
- Anyone who can call the endpoint can spam all subscribed users or send misleading links.

Recommended fix:
- Remove public access.
- Require admin auth or a server-only scheduled job path.
- Validate `url` as an internal relative URL.
- Rate limit and audit-log sends.

Acceptance criteria:
- Anonymous POST to `/api/push/send` returns 401/403.
- Only authorized admin/service callers can send.
- Payload title/body length and URL are validated.

### P0-4: Likes endpoint allows user impersonation with service role

Evidence:
- `app/api/likes/route.ts` creates a Supabase service-role client.
- Request body controls `postId`, `userId`, and `action`.
- The route inserts/deletes likes for the supplied `userId` without verifying the caller owns that identity.

Customer impact:
- A caller can like/unlike content as any user ID.
- This corrupts social proof and trust signals.

Recommended fix:
- Use cookie-bound Supabase server client to get the authenticated user.
- Ignore any client-supplied `userId`.
- Keep service role out of the route unless absolutely required.

Acceptance criteria:
- Anonymous POST returns 401.
- Authenticated POST can only mutate likes for `auth.uid()`.
- Tests cover both impersonation and duplicate-like cases.

## P1 Findings

### P1-1: React package versions are mismatched

Evidence:
- `package.json` has `react: 19.2.7` and `react-dom: 19.2.4`.
- E2E dev server logs repeatedly:
  - `Incompatible React versions: react 19.2.7, react-dom 19.2.4`.

Customer impact:
- Dev/test runtime reliability is compromised.
- Production build passed, but this mismatch can mask hydration/runtime bugs and slows debugging.

Recommended fix:
- Pin `react` and `react-dom` to the exact same version.
- Reinstall lockfile and rerun build + E2E.

### P1-2: Lint is not usable as a quality gate

Evidence:
- `npm run lint` reported 48,560 problems because ESLint scans `.claude/worktrees` and generated `.next`.
- `eslint.config.mjs` only ignores `.next`, `out`, `build`, `next-env.d.ts`.
- Real app issues also exist, including `react-hooks/set-state-in-effect`, `no-explicit-any`, unescaped entities, and CommonJS scripts.

Customer impact:
- CI cannot use lint as a meaningful gate.
- Real defects are buried under generated/worktree noise.

Recommended fix:
- Add ignores for `.claude/**`, `test-results/**`, `node_modules/**`, `coverage/**`, and generated outputs.
- Split lint scripts:
  - `lint:app` for app/components/lib/hooks/utils.
  - `lint:scripts` for scripts with Node rules.
- Then fix the remaining app errors.

### P1-3: Local build passes but Turbopack root inference is wrong

Evidence:
- `next build` warning:
  - Next selected `/Users/christophergoslin/package-lock.json` as workspace root.
  - It also detected `/Users/christophergoslin/Projects/scentral-hub/package-lock.json`.

Customer impact:
- Build caching and module resolution can differ between local, CI, and Vercel.
- This makes bugs harder to reproduce.

Recommended fix:
- Remove or move the unrelated `/Users/christophergoslin/package-lock.json`, or set `turbopack.root` explicitly in `next.config.ts`.

### P1-4: Discovery Boxes query schema is inconsistent

Evidence:
- Lighthouse console error: Supabase 400 on:
  - `/rest/v1/discovery_boxes?select=*&is_active=eq.true&order=created_at.desc&limit=1`
- `app/(main)/components/DiscoveryBoxCard.tsx` queries `.eq('is_active', true)`.
- `app/(main)/boxes/page.tsx` queries `.eq('active', true)`.

Customer impact:
- Landing page Discovery Box card silently disappears.
- Commerce/waitlist path loses value.

Recommended fix:
- Pick one column name in schema and app code.
- Add an integration/smoke check for Discovery Box visibility or graceful empty state.

### P1-5: Privacy/consent implementation still loads PostHog before consent in some paths

Evidence:
- `lib/posthog.ts` comments say PostHog is gated behind explicit consent.
- `app/components/PageTracker.tsx` calls `posthog.capture` whenever a key and pathname exist.
- The lazy proxy triggers `loadClient()`, which imports `posthog-js` before checking consent inside initialization.
- `session_recording.maskAllInputs` is set to `false`, and `maskInputFn` returns raw text.

Customer impact:
- The consent promise is weaker than stated.
- It can increase unused JS and creates privacy risk if session recording is enabled.

Recommended fix:
- Check `hasAnalyticsConsent()` before calling the lazy proxy at all.
- Do not import PostHog before consent.
- Set `maskAllInputs: true` unless there is a documented need and explicit consent for recording.

### P1-6: Security headers are incomplete

Evidence:
- `curl -I https://scentral-hub.vercel.app` shows HSTS present.
- No visible CSP, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, or `Permissions-Policy`.
- Lighthouse best-practices passed CSP audit, but explicit headers should still be controlled for a community/AI app.

Customer impact:
- Higher exposure to clickjacking, data leakage via referrer, and avoidable browser capability access.

Recommended fix:
- Add headers via `next.config.ts` or Vercel config:
  - `Content-Security-Policy`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `X-Content-Type-Options: nosniff`
  - `frame-ancestors 'none'` or appropriate allowlist.

### P1-7: Dependency audit has high vulnerabilities

Evidence:
- `npm audit --audit-level=high` found 28 vulnerabilities, 5 high.
- High issues include `tar-fs`, `tmp`, and `ws`, largely through Lighthouse/LHCI/Puppeteer tooling.

Customer impact:
- These appear mostly dev/tooling transitive risks, but they affect CI and local audit tooling.

Recommended fix:
- Update or isolate Lighthouse/LHCI dependencies.
- Avoid `npm audit fix --force` blindly because npm reports breaking downgrades for some fixes.

## P2 Findings

### P2-1: Lighthouse performance is below launch-quality

Evidence:
- Performance score: 71.
- LCP: 6.2s.
- TTI: 6.2s.
- Unused JavaScript estimated savings: 255 KiB.
- PostHog surveys bundle appears in unused JS (`eu-assets.i.posthog.com/static/surveys.js`).

Customer impact:
- First impression feels slower than the premium positioning suggests.
- Mobile users on weaker networks will feel this most.

Recommended fix:
- Remove/defer nonessential landing-page JS.
- Ensure PostHog and survey scripts load only after consent and only where needed.
- Audit landing components for unnecessary client components.
- Use server components for static landing sections where possible.

### P2-2: Accessibility contrast failures in marquee

Evidence:
- Lighthouse Accessibility: 95 but contrast failures remain.
- Press marquee text uses `text-white/40` and `text-white/35`.
- Failing examples include:
  - `"The invisible architecture of identity. Radically democratized."`
  - `KNOW YOUR NOSE.`
  - `THE $18 ANSWER TO THE $140 QUESTION.`

Customer impact:
- Low-vision users may miss brand/value copy.
- This also makes the premium surface feel washed out.

Recommended fix:
- Raise text contrast or increase size/weight.
- Replace salesy marquee copy at the same time.

### P2-3: Landing page voice still conflicts with nota. doctrine

Evidence:
- `components/ui/PressMarquee.tsx` includes:
  - `The $18 answer to the $140 question.`
  - `Stop blind buying.`
  - `The clone that outperforms the original.`
- `docs/nota/05-recommendations-backlog.md` flags salesy/price-war voice as a violation.

Customer impact:
- The product risks sounding like a clone-price tool rather than a personal scent identity product.
- This undercuts the strongest differentiated value.

Recommended fix:
- Move price/clone mechanics into `/clones` or a secondary section.
- Reframe landing around identity, shelf, and recognition.

### P2-4: Navigation and current product model are inconsistent

Evidence:
- Latest handover lists `/shelf`, `/noseprint`, `/read`, `/traces`, `/trails`, `/insights` as live features.
- Bottom nav still points to `/collection`, `/layering`, `/spritz`, `/you`.
- `docs/nota/05-recommendations-backlog.md` recommends nav loop: `Today / Discover / My Shelf / Traces / You`.

Customer impact:
- The most differentiated features are harder to find than older routes.
- The user journey is not aligned to the current nota. value loop.

Recommended fix:
- Rebuild mobile nav around the current core loop.
- Use `/shelf` instead of `/collection` if Shelf is now canonical.

### P2-5: E2E coverage misses current flagship flows

Evidence:
- Existing E2E files cover collection, discover, fragrance detail, layering, onboarding, and you-tab.
- No current E2E coverage for `/read`, `/shelf`, blind ranking session, traces, trails, insights, push, admin enrichment, or auth migration.

Customer impact:
- Regressions in the latest value loop can ship unnoticed.

Recommended fix:
- Add Playwright specs for:
  - Read generation with mocked API.
  - Shelf capacity and reorder persistence.
  - Blind ranking lock/reveal.
  - Trace post and reaction.
  - Signed-out/signed-in state transitions.

### P2-6: Error handling often returns generic 500s and leaks implementation shape

Evidence:
- Many API routes return raw `error.message`.
- Some routes using non-null env assertions can throw before returning controlled configuration errors.
- The global error page is present and user-friendly, but Discover shows it for a data/image config issue that should degrade gracefully.

Customer impact:
- Users lose whole pages for recoverable data problems.
- Debugging is harder without structured error codes.

Recommended fix:
- Standardize API error wrapper:
  - validate env at route entry.
  - return stable public error codes.
  - log private details only server-side.
- For images, use fallback media instead of crashing page render.

## P3 Findings

### P3-1: AI output UI is structured today, but future AI text should use AI Elements

Evidence:
- The app uses Anthropic and Google AI routes for JSON-style generation.
- No AI SDK `useChat`, `streamText`, or AI Elements components were found.
- AI Elements official docs describe it as a component registry for AI-native React interfaces, including message, conversation, reasoning, tool, code, and voice components.

Recommendation:
- Do not add AI Elements just for current structured JSON fields.
- If nota. adds streaming chat, markdown reports, reasoning panels, or AI-written rich text, install only the needed AI Elements components, especially `message`, and render AI text through `MessageResponse`/`Message` rather than raw JSX.

Reference:
- https://elements.ai-sdk.dev

### P3-2: Native iOS audit is not applicable yet

Evidence:
- No `.xcodeproj`, `.xcworkspace`, `Package.swift`, Capacitor config, or native `ios/` app was found.
- Only `assets/app-store-screenshots/ios` exists.

Recommendation:
- Treat iOS scope as PWA/mobile web for now.
- Before App Store submission, add a dedicated mobile Safari visual pass and PWA install/offline test.

## Prioritized Backlog

### Now: Release-blocking

| Rank | Item | Owner | Acceptance Criteria |
|---|---|---|---|
| 1 | Push/redeploy local API fixes | Eng | Production smoke 18/18; Vercel commit matches local `HEAD` |
| 2 | Fix Discover image-host crash | Eng | Discover E2E passes; no `next/image` host errors |
| 3 | Lock down `/api/push/send` | Eng/Sec | Anonymous POST is denied; admin/service auth required |
| 4 | Fix `/api/likes` impersonation | Eng/Sec | Caller can only mutate own likes |
| 5 | Align React versions | Eng | `react` and `react-dom` exact match; E2E no mismatch logs |

### Next: Quality gate

| Rank | Item | Owner | Acceptance Criteria |
|---|---|---|---|
| 6 | Fix ESLint scope | Eng | Lint ignores generated/worktree files and reports only real code |
| 7 | Fix real lint errors | Eng | `npm run lint` passes |
| 8 | Resolve Turbopack root warning | Eng | `next build` has no workspace-root warning |
| 9 | Reconcile discovery box schema | Eng/Product | Landing box fetch has no Supabase 400; empty state exists |
| 10 | Repair consent gating | Eng/Privacy | No PostHog network/import before consent |

### Then: Launch polish

| Rank | Item | Owner | Acceptance Criteria |
|---|---|---|---|
| 11 | Add missing security headers | Eng/Sec | Headers verified on landing and API responses |
| 12 | Reduce landing LCP | Eng/Design | Lighthouse performance >= 85; LCP < 2.5s on mobile profile |
| 13 | Fix contrast and brand voice in marquee | Design/Product | Lighthouse contrast pass; copy matches nota. doctrine |
| 14 | Rebuild nav around current loop | Product/Design/Eng | Core live routes are first-class: Shelf, Read/Noseprint, Traces |
| 15 | Add current flagship E2E specs | QE/Eng | Read, Shelf, Blind Ranking, Traces covered in Chromium and mobile |

### Later: Scale and resilience

| Rank | Item | Owner | Acceptance Criteria |
|---|---|---|---|
| 16 | Dependency audit cleanup | Eng | `npm audit --audit-level=high` passes or accepted exceptions documented |
| 17 | Structured API error layer | Eng | Common error codes and server-only detailed logs |
| 18 | Database/image-host guardrail | Eng/Data | CI checks DB image hosts against `next.config.ts` |
| 19 | Mobile Safari/PWA audit | QE | Install, safe-area, offline, and Add-to-Home-Screen flows verified |
| 20 | AI Elements adoption plan for future chat/streaming | Product/Eng | Only needed components installed when AI UI becomes markdown/streaming |

## Customer Value Assessment

Strongest value:
- nota. is no longer just a fragrance catalogue. The Read, Noseprint, Shelf, Blind Ranking, and Traces point toward a product that helps people recognize their own taste and make better scent decisions.

Weakest current value delivery:
- The most valuable loop is fragmented. The navigation and landing page still emphasize older concepts and price/clone mechanics while the handover says Shelf, Noseprint, The Read, Traces, Trails, and Insights are live.

Customer-first recommendation:
- Make the first-session loop: Discover one scent -> place/test it on Shelf -> get a Read/Noseprint -> share or compare a Trace. Everything else should support that loop.

## Validation Commands Run

```bash
npm run test:smoke:prod
npm run build
npm run lint
npm audit --audit-level=high
npm run test:e2e -- --project=chromium
npx lighthouse https://scentral-hub.vercel.app --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/nota-lighthouse.json --chrome-flags="--headless --no-sandbox"
curl -I https://scentral-hub.vercel.app
curl -I 'https://scentral-hub.vercel.app/api/fragrances?q=rose,or(name.like.*)'
```

## Notes and Limits

- This is a broad parent-agent audit, not a full exhaustive Codex Security scan. The Codex Security app setup tool was not available in this session.
- Production findings reflect `https://scentral-hub.vercel.app` as tested on 2026-07-05.
- Local findings reflect the current local `main`, which is ahead of `origin/main`.
- Full mobile Safari and native iOS testing were not run because there is no native iOS app in the repo and the Chromium pass already exposed blocking defects.
