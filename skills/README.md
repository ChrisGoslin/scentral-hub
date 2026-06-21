# AnotherSense Skills Directory

Comprehensive catalog of reusable skills for Claude Code and other CLI tools working on the scentral-hub project.

## Skills Overview

| Skill | Directory | Purpose | Trigger Phrases |
|-------|-----------|---------|-----------------|
| **Testing Framework** | `testing-framework/` | Smoke tests, E2E tests (Playwright), QA checklists | "set up testing", "create smoke tests", "write E2E tests", "create QA checklist" |

## Currently Available Skills

### 🧪 Testing Framework
**Directory:** `skills/testing-framework/`

Complete testing strategy for Next.js applications.

**What it does:**
- Smoke test setup (HTTP status checks on 7-9 critical routes)
- E2E test patterns (Playwright for desktop + mobile)
- Manual QA checklist (feature flows, accessibility, performance)
- Troubleshooting guide for common test issues

**When to use:**
- Setting up testing for a new project
- Creating smoke tests for deployment verification
- Writing Playwright E2E tests
- Preparing QA checklist before launch
- Debugging test failures

**Trigger phrases:**
- "set up testing"
- "create smoke tests"
- "write E2E tests with Playwright"
- "create QA checklist"
- "debug test failures"
- "add Playwright tests"
- "verify deployment"

**Quick start:**
```bash
# View skill documentation
cat skills/testing-framework/SKILL.md

# View examples
ls skills/testing-framework/examples/

# View references
ls skills/testing-framework/references/
```

**Key files:**
- `SKILL.md` (1,800 words) — Core testing strategy
- `references/e2e-patterns.md` — Detailed Playwright patterns
- `references/troubleshooting.md` — Common issues & solutions
- `examples/smoke-test.example.mjs` — Working HTTP test script
- `examples/e2e-test.example.ts` — Comprehensive E2E test template
- `examples/playwright.config.example.ts` — Full Playwright config

---

## How to Use Skills

### For Claude Code Users

Skills are automatically discovered by Claude Code. To use a skill:

1. **Ask Claude Code** to help with a task that matches the skill's trigger phrases
2. **Claude will reference** the skill documentation and examples
3. **Skill resources** (references, examples, scripts) load as needed

Example:
```
"Can you set up testing for this Next.js project?"
→ Claude loads testing-framework skill
→ References examples/ and references/ directories
→ Provides tailored guidance
```

### For Other CLI Tools

Skills can be referenced directly:

```bash
# View skill structure
tree skills/testing-framework/

# Read core documentation
cat skills/testing-framework/SKILL.md

# Use examples as templates
cp skills/testing-framework/examples/smoke-test.example.mjs scripts/smoke-test.mjs
```

### For Custom Agent Integration

Use skill resources in your custom agents:

```python
# Import Playwright examples
from skills.testing-framework.examples import playwright_config

# Reference troubleshooting guide
with open('skills/testing-framework/references/troubleshooting.md') as f:
    troubleshooting_guide = f.read()
```

---

## Skill Structure

All skills follow a consistent structure:

```
skill-name/
├── SKILL.md                    # Required: core documentation (1,500-2,000 words)
├── README.md                   # Optional: skill overview for this directory
├── references/                 # Detailed documentation (loaded as needed)
│   ├── patterns.md
│   ├── troubleshooting.md
│   └── advanced.md
├── examples/                   # Working code examples (copy-paste ready)
│   ├── example1.mjs
│   └── example2.ts
└── scripts/                    # Utility scripts (executable)
    └── validate.sh
```

**Key principles:**
- **SKILL.md is lean** (1,500-2,000 words max)
- **Detailed content in references/** (loaded only when needed)
- **Working examples in examples/** (copy-paste and adapt)
- **Utilities in scripts/** (executable helpers)

---

## Creating New Skills

To create a new skill:

1. **Create directory:** `mkdir -p skills/new-skill/{references,examples,scripts}`
2. **Add SKILL.md:** Core documentation with frontmatter (name, description, trigger phrases)
3. **Add resources:** references/, examples/, scripts/ as needed
4. **Update README.md:** Add entry to skills table above

See `skills/testing-framework/` as a template.

---

## Skills Roadmap

Planned skills for future development:

- **CI/CD Pipeline Setup** — GitHub Actions, Vercel workflows
- **Performance Optimization** — Core Web Vitals, bundle analysis
- **Accessibility Review** — WCAG 2.1 AA compliance
- **Database Migrations** — Supabase schema changes
- **Security Audit** — Dependency scanning, secret detection

---

## Best Practices for Skill Users

✅ **DO:**
- Read SKILL.md for overview
- Check examples/ for working code
- Use references/ for deep dives
- Copy examples and adapt for your use case

❌ **DON'T:**
- Assume all code can run standalone (skills provide guidance, not complete solutions)
- Skip the SKILL.md (it has critical context)
- Modify skill files directly (use them as templates instead)

---

## Contributing to Skills

To improve a skill:

1. **Identify gap** — What's missing or unclear?
2. **Update SKILL.md** — Keep lean (<2,000 words)
3. **Add to references/** — Detailed content for specific topics
4. **Add examples/** — Working code samples
5. **Test thoroughly** — Verify examples work as documented

---

## For Project Owners

To enable skill usage across your project:

1. **Check this directory** — `skills/` contains all available skills
2. **Reference in CLAUDE.md** — Link to skill when relevant
3. **Update project setup** — Tell new team members to read `docs/SKILLS_GUIDE.md`
4. **Create new skills** — For domain-specific or project-specific workflows

---

## Quick Reference

| I want to... | Skill | File to Read |
|---|---|---|
| Set up testing | testing-framework | `SKILL.md` |
| Learn Playwright patterns | testing-framework | `references/e2e-patterns.md` |
| Debug a test failure | testing-framework | `references/troubleshooting.md` |
| Copy a working smoke test | testing-framework | `examples/smoke-test.example.mjs` |
| Understand Playwright config | testing-framework | `examples/playwright.config.example.ts` |

---

## Questions?

Each skill includes comprehensive documentation. Start with `SKILL.md` in the skill's directory, then explore `references/` for deeper topics.
