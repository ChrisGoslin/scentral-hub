# Testing Framework Skill

Complete testing strategy for Next.js applications using smoke tests, E2E tests, and manual QA.

---

## Quick Start

**New to this skill?** Start here:
1. Read `SKILL.md` (core overview)
2. Copy an example from `examples/`
3. Explore `references/` for deep dives

**In a hurry?** Use these templates:
- Smoke test: `examples/smoke-test.example.mjs`
- E2E test: `examples/e2e-test.example.ts`
- Playwright config: `examples/playwright.config.example.ts`

---

## Skill Contents

### 📖 SKILL.md (Required Reading)
**Core documentation** covering:
- Testing strategy (smoke → E2E → manual QA)
- Setup instructions for each test type
- Common patterns and best practices
- npm scripts and CI/CD integration
- Performance baselines

**Length:** 1,800 words | **Time to read:** 15-20 min

### 📚 references/ (Deep Dives)

#### `e2e-patterns.md` (2,500 words)
Comprehensive Playwright guide:
- Selector strategies (role, text, label, CSS)
- Async handling (waitForLoadState, Navigation)
- Setup & teardown patterns
- API mocking & stubbing
- Mobile device emulation
- Accessibility testing
- Error handling patterns
- Common gotchas & solutions

**When to read:** Learning Playwright or debugging selectors

#### `troubleshooting.md` (2,000 words)
Solutions for 20+ common issues:
- Smoke test problems (network, status codes, timeouts)
- E2E test issues (timeouts, selectors, flakiness)
- CI/CD debugging
- Performance profiling
- Debug tools & trace recordings

**When to read:** Test is failing or acting flaky

#### `performance-baselines.md` (future)
Core Web Vitals targets and optimization strategies.

### 💻 examples/ (Copy-Paste Ready)

#### `smoke-test.example.mjs`
Working HTTP smoke test script.
- Tests 7-9 critical routes
- Supports custom URLs
- Colored terminal output
- Exit codes for CI integration

**Use:** Copy to `scripts/smoke-test.mjs` and customize routes

#### `e2e-test.example.ts`
Comprehensive E2E test template with 8 test types:
1. Search functionality
2. Navigation between pages
3. Form submission
4. Error handling
5. Data persistence
6. Keyboard accessibility
7. Mobile responsiveness
8. Loading states

**Use:** Copy sections to your own `e2e/*.spec.ts` files

#### `playwright.config.example.ts`
Complete Playwright configuration:
- Desktop browsers (Chrome, Safari)
- Mobile devices (Pixel 5, iPhone 12)
- Timeout & retry settings
- Dev server integration
- Screenshot & trace on failure

**Use:** Copy to `playwright.config.ts` and adjust for your project

### 🔧 scripts/

#### `validate-test-setup.sh`
Validation script checking:
- npm scripts are present
- Playwright is installed
- Test directory exists
- Configuration files are in place
- Dependency conflicts

**Use:** `bash skills/testing-framework/scripts/validate-test-setup.sh`

---

## Common Workflows

### Workflow 1: Set Up Smoke Tests

1. Read: `SKILL.md` (section "Smoke Tests")
2. Copy: `examples/smoke-test.example.mjs` → `scripts/smoke-test.mjs`
3. Edit: Customize the routes to test
4. Run: `npm run test:smoke`
5. Verify: All 9 routes passing

**Time:** 10 minutes

### Workflow 2: Write E2E Tests

1. Read: `SKILL.md` (section "E2E Tests")
2. Copy: `examples/e2e-test.example.ts` → `e2e/mytest.spec.ts`
3. Read: `references/e2e-patterns.md` (selector strategy section)
4. Write: Your first test using AAA pattern
5. Run: `npm run test:e2e`
6. Debug: Use references/troubleshooting.md if issues

**Time:** 30-60 minutes per test

### Workflow 3: Debug a Test Failure

1. Run test: `npm run test:e2e -- --debug`
2. Read: `references/troubleshooting.md` (matching error type)
3. Apply: Solution from troubleshooting guide
4. Re-run: Verify fix works

**Time:** 5-20 minutes depending on issue

### Workflow 4: Create QA Checklist

1. Copy: `references/qa-checklist-template.md` (future)
2. Customize: Add your critical user flows
3. Print: Checklist for manual testing
4. Track: Check items as QA progresses

**Time:** 30 minutes

---

## File Lookup Table

| Task | Read This | Then Try This |
|------|-----------|---------------|
| **Understand testing strategy** | `SKILL.md` | Nothing, just read |
| **Set up smoke tests** | `SKILL.md` (§1) | `examples/smoke-test.example.mjs` |
| **Write E2E tests** | `SKILL.md` (§2) + `references/e2e-patterns.md` | `examples/e2e-test.example.ts` |
| **Configure Playwright** | `SKILL.md` (§2) | `examples/playwright.config.example.ts` |
| **Debug test timeout** | `references/troubleshooting.md` | `scripts/validate-test-setup.sh` |
| **Learn selector strategies** | `references/e2e-patterns.md` (§1) | Write a test using getByRole |
| **Handle API mocking** | `references/e2e-patterns.md` (§6) | Copy mock example |
| **Test mobile** | `references/e2e-patterns.md` (§7) | Modify playwright.config |
| **Fix flaky tests** | `references/troubleshooting.md` (§7) | Add waitForLoadState calls |

---

## Skill Structure

```
testing-framework/
├── SKILL.md                                      # START HERE (core docs)
├── README.md                                     # This file (skill overview)
├── references/                                   # Detailed topics (load as needed)
│   ├── e2e-patterns.md                          # Playwright patterns & anti-patterns
│   └── troubleshooting.md                       # 20+ common issues & solutions
├── examples/                                     # Working code (copy & adapt)
│   ├── smoke-test.example.mjs                   # HTTP sanity test
│   ├── e2e-test.example.ts                      # Comprehensive E2E template
│   └── playwright.config.example.ts             # Full browser configuration
└── scripts/                                      # Utilities (run directly)
    └── validate-test-setup.sh                   # Verify setup is complete
```

---

## Progressive Disclosure

This skill uses 3 levels to manage context:

**Level 1: Metadata** (always loaded)
- Name: Testing Framework
- Description: Complete testing strategy
- Triggers: "testing", "E2E", "QA"

**Level 2: SKILL.md** (when triggered)
- Overview & strategy
- Setup steps
- Quick patterns
- ~1,800 words

**Level 3: references/ + examples/** (on demand)
- Detailed patterns
- Complete examples
- Advanced techniques
- Load when you ask about them

---

## Best Practices

✅ **DO:**
- Start with SKILL.md
- Copy examples and adapt them
- Read troubleshooting.md when stuck
- Test locally before CI
- Ask Claude to help customize examples

❌ **DON'T:**
- Modify skill files directly (use as templates)
- Assume examples work without adaptation
- Skip documentation (it has critical context)
- Ignore error messages (they're debugging hints)

---

## Examples Quick Copy

### Smoke Test
```bash
cp skills/testing-framework/examples/smoke-test.example.mjs scripts/smoke-test.mjs
npm run test:smoke
```

### E2E Test
```bash
cp skills/testing-framework/examples/e2e-test.example.ts e2e/auth.spec.ts
# Edit e2e/auth.spec.ts to match your app
npm run test:e2e
```

### Playwright Config
```bash
cp skills/testing-framework/examples/playwright.config.example.ts .
npm run test:e2e:headed  # Run with browser visible
```

---

## Troubleshooting This Skill

**Problem:** Examples don't work
**Solution:** Read the example file comments first, then check `references/troubleshooting.md`

**Problem:** Don't understand a pattern
**Solution:** Find it in `references/e2e-patterns.md`, search for keyword

**Problem:** Test keeps timing out
**Solution:** Search `references/troubleshooting.md` for "timeout"

**Problem:** Can't find what I need
**Solution:** Read `SKILL.md` for full overview, then browse `references/`

---

## Contribution Ideas

Ways to improve this skill:

1. **Add examples** for your specific use cases
2. **Improve troubleshooting** with new issues you discover
3. **Document patterns** you find useful
4. **Simplify language** in SKILL.md
5. **Add CI/CD guide** for GitHub Actions / Vercel

---

## Related Resources

- **Project Testing:** `docs/TESTING.md` — Project-specific testing setup
- **Cleanup Audit:** `docs/CLEANUP_AUDIT.md` — Recent codebase cleanup
- **Skills Guide:** `docs/SKILLS_GUIDE.md` — How to use all skills
- **Skills Directory:** `skills/README.md` — All available skills

---

## Getting Help

1. **Search this skill:** grep for keywords in `references/`
2. **Ask Claude:** Reference the skill when asking testing questions
3. **Read SKILL.md:** Most common questions answered there
4. **Check troubleshooting:** `references/troubleshooting.md`

---

**Ready to test?** Start with `SKILL.md` → 🚀
