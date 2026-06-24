# Skills Discovery & Usage Guide

Complete guide to finding and using Claude Code skills on the scentral-hub project.

---

## What Are Skills?

Skills are reusable, self-contained knowledge packages that extend Claude's capabilities with:
- **Specialized workflows** — Multi-step procedures for specific domains
- **Working examples** — Copy-paste-ready code you can adapt
- **Troubleshooting guides** — Solutions to common problems
- **Best practices** — Patterns and anti-patterns to follow

Think of skills as specialized "how-to guides" that Claude knows about and can reference when you ask related questions.

---

## Where Are Skills Located?

```
scentral-hub/
└── .claude/skills/
    ├── README.md                          ← Master skill catalog (full list lives here,
    │                                          not duplicated in this guide — read it first)
    └── testing-framework/                 ← one of several skills; see README.md for the rest
        ├── SKILL.md                       ← Core documentation
        ├── README.md                      ← Skill overview
        ├── references/                    ← Detailed topics
        │   ├── e2e-patterns.md
        │   ├── troubleshooting.md
        │   └── performance-baselines.md
        ├── examples/                      ← Working code
        │   ├── smoke-test.example.mjs
        │   ├── e2e-test.example.ts
        │   └── playwright.config.example.ts
        └── scripts/                       ← Utilities
            └── validate-test-setup.sh
```

**This guide focuses on the `testing-framework` skill as a worked example** of how to use
any skill in this repo — the mechanics (SKILL.md → references/ → examples/) generalize to all
of them. For the current full list of skills and what each covers, read
`.claude/skills/README.md` rather than this section.

---

## How to Use Skills with Claude Code

### Method 1: Ask Claude Code Directly (Automatic)

Claude Code automatically detects and uses skills when you ask related questions — **as long
as they live at `.claude/skills/<name>/SKILL.md`**. Before 2026-06-24 these lived at a
top-level `skills/` directory, which is not Claude Code's actual discovery path; auto-matching
silently never worked. If a skill you expect to trigger doesn't, check it's actually under
`.claude/skills/` with valid frontmatter before assuming you described the task wrong.

**Example:**
```
You: "Can you help me set up testing for this Next.js project?"

Claude Code:
→ Detects testing-related question
→ Loads testing-framework skill
→ References SKILL.md for overview
→ Provides tailored guidance with examples
→ Links to references/ for deeper topics
```

**Trigger phrases that activate the testing-framework skill:**
- "set up testing"
- "create smoke tests"
- "write E2E tests"
- "add Playwright tests"
- "create QA checklist"
- "debug test failures"
- "verify deployment"

### Method 2: Explicitly Reference a Skill

You can also explicitly tell Claude Code to use a skill:

```
"Use the testing-framework skill to help me write E2E tests"
```

### Method 3: Browse Skill Files Directly

View skill contents directly:

```bash
# View master catalog
cat .claude/skills/README.md

# View testing-framework skill
cat .claude/skills/testing-framework/SKILL.md

# View specific references
cat .claude/skills/testing-framework/references/e2e-patterns.md

# Copy an example to adapt
cp .claude/skills/testing-framework/examples/smoke-test.example.mjs scripts/smoke-test.mjs
```

---

## Available Skills

### 🧪 Testing Framework
**Trigger:** "set up testing", "create smoke tests", "E2E tests", "QA checklist"

**What it covers:**
- ✅ Smoke tests (HTTP verification)
- ✅ E2E tests (Playwright across browsers)
- ✅ Manual QA checklists
- ✅ Troubleshooting test failures
- ✅ Performance baselines

**Key files:**
- `SKILL.md` — Start here (overview)
- `references/e2e-patterns.md` — Playwright deep dive
- `references/troubleshooting.md` — Debug guide
- `examples/` — Working code templates

**Quick start:**
```bash
# Copy smoke test example
cp .claude/skills/testing-framework/examples/smoke-test.example.mjs scripts/smoke-test.mjs

# Copy E2E test example
cp .claude/skills/testing-framework/examples/e2e-test.example.ts e2e/example.spec.ts

# Copy Playwright config
cp .claude/skills/testing-framework/examples/playwright.config.example.ts .
```

---

## Skill File Structure Explained

### SKILL.md (Always Start Here)

**What it is:** The main skill documentation (1,500-2,000 words)

**What's inside:**
- Description & purpose
- When to use it
- Quick reference tables
- Implementation steps
- Common patterns
- Best practices

**Length:** Lean and focused, loads quickly

**Example:**
```bash
cat .claude/skills/testing-framework/SKILL.md
```

### references/ (Deep Dives)

**What it is:** Detailed documentation for specific topics

**What's inside:**
- Comprehensive pattern guides
- Troubleshooting solutions
- Advanced techniques
- API references
- Migration guides

**Length:** Can be long (2,000-5,000+ words per file)

**When loaded:** Only when you ask about a specific topic

**Example:**
```bash
# For Playwright patterns
cat .claude/skills/testing-framework/references/e2e-patterns.md

# For debugging tests
cat .claude/skills/testing-framework/references/troubleshooting.md
```

### examples/ (Copy-Paste Ready)

**What it is:** Working code samples you can adapt

**What's inside:**
- Complete, runnable scripts
- Configuration files
- Test templates
- Real-world usage examples

**How to use:** Copy, then modify for your use case

**Example:**
```bash
# Copy smoke test script
cp .claude/skills/testing-framework/examples/smoke-test.example.mjs scripts/smoke-test.mjs

# Modify for your routes
vim scripts/smoke-test.mjs
```

### scripts/ (Utilities)

**What it is:** Executable helper scripts

**What's inside:**
- Validation tools
- Setup checkers
- Testing helpers
- Automation utilities

**How to use:** Run directly or integrate into your workflow

**Example:**
```bash
# Run validation script
bash .claude/skills/testing-framework/scripts/validate-test-setup.sh
```

---

## Progressive Disclosure: How Skills Load

Skills use a 3-level loading system to manage context efficiently:

**Level 1: Metadata** (Always in context)
- Skill name
- Short description
- Trigger phrases
- ~100 words

**Level 2: SKILL.md** (When skill triggers)
- Core concepts
- Implementation steps
- Quick reference
- ~1,800 words
- Takes ~30 seconds to read

**Level 3: references/ & examples/** (As needed)
- Detailed patterns
- Complete examples
- Advanced techniques
- Load on demand

**Why this matters:** Claude doesn't load entire skill documentation upfront. It loads what's needed when you ask, keeping context window efficient.

---

## Common Questions

### Q: How do I know which skill to use?

**A:** Look at the trigger phrases in `.claude/skills/README.md`. When your task matches a trigger phrase, that skill applies.

**Example:**
- Task: "Set up E2E tests" → testing-framework skill
- Task: "Debug a test" → testing-framework skill
- Task: "Optimize images" → (not covered yet)

### Q: Can I use a skill's examples in my code?

**A:** Absolutely! Examples are meant to be copied and adapted.

**Process:**
1. Copy the example file
2. Modify for your use case
3. Test thoroughly
4. Commit to your repo

**Example:**
```bash
cp .claude/skills/testing-framework/examples/e2e-test.example.ts e2e/auth.spec.ts
# Then edit e2e/auth.spec.ts to test your auth flow
```

### Q: What if a skill doesn't cover my exact use case?

**A:** Skills cover core patterns and common scenarios. You may need to:
1. Read the skill's references/ for deep patterns
2. Adapt examples for your specific case
3. Ask Claude to help customize based on the skill

**Example:**
```
"Based on the testing-framework skill, can you help me write a test for 
[your specific feature]?"
```

### Q: How do I report a skill issue?

**A:** Skill improvements can be made by updating the skill files:

1. **Found a typo or unclear text?** → Update `SKILL.md`
2. **Example doesn't work?** → Update `examples/`
3. **Missing a pattern?** → Add to `references/`

### Q: Can I create my own skills?

**A:** Yes! Follow the structure in `.claude/skills/testing-framework/`:

1. Create skill directory: `mkdir -p .claude/skills/my-skill/{references,examples,scripts}`
2. Write `SKILL.md` with frontmatter (name, description, triggers)
3. Add `references/` for detailed topics
4. Add `examples/` for working code
5. Update `.claude/skills/README.md` to catalog your skill

---

## Skill Discovery Workflow

**Step 1: Identify Your Task**
```
Task: "I need to set up testing"
```

**Step 2: Find Matching Skill**
```
Read .claude/skills/README.md → Find testing-framework skill
```

**Step 3: Read SKILL.md**
```
cat .claude/skills/testing-framework/SKILL.md
```

**Step 4: Explore Examples**
```
ls .claude/skills/testing-framework/examples/
cp .claude/skills/testing-framework/examples/smoke-test.example.mjs scripts/
```

**Step 5: Deep Dive (If Needed)**
```
cat .claude/skills/testing-framework/references/troubleshooting.md
```

**Step 6: Ask Claude for Help**
```
"Based on the testing-framework skill, can you help me with [specific need]?"
```

---

## Tips for Getting the Most from Skills

✅ **DO:**
- Read `SKILL.md` first (comprehensive overview)
- Copy examples and adapt them
- Use references/ when stuck
- Ask Claude to customize examples for your use case
- Report issues or suggestions

❌ **DON'T:**
- Skip the documentation (skills are guides, not just code)
- Assume examples work as-is (they're templates, adapt them)
- Modify skill files directly (use them as references)
- Ignore error messages (they often point to skill issues)

---

## For First-Time Users

### Day 1: Discovery
1. Read this guide (you're here!)
2. Read `.claude/skills/README.md`
3. Skim `.claude/skills/testing-framework/SKILL.md`

### Day 2: Learning
1. Pick a task (e.g., "set up smoke tests")
2. Copy the relevant example
3. Modify it for your project
4. Ask Claude for help if stuck

### Day 3+: Mastery
1. Read detailed references/ for patterns
2. Create custom examples
3. Suggest skill improvements

---

## Quick Reference: Skill Lookup Table

| I want to... | Skill | Read This | Then Try This |
|---|---|---|---|
| Set up testing | testing-framework | SKILL.md | examples/smoke-test.example.mjs |
| Learn E2E testing | testing-framework | references/e2e-patterns.md | examples/e2e-test.example.ts |
| Debug test failure | testing-framework | references/troubleshooting.md | scripts/validate-test-setup.sh |
| Create QA checklist | testing-framework | SKILL.md (section 3) | docs/qa-checklist.md |
| Optimize Playwright config | testing-framework | references/e2e-patterns.md | examples/playwright.config.example.ts |

---

## Next Steps

1. **Explore Skills:** `cd .claude/skills/` and browse available skills
2. **Read a Skill:** Start with `.claude/skills/testing-framework/SKILL.md`
3. **Copy an Example:** `cp .claude/skills/testing-framework/examples/smoke-test.example.mjs scripts/`
4. **Ask Claude:** Reference the skill when asking related questions
5. **Improve Skills:** Report issues or suggest additions

---

## More Information

- **Skills Directory:** `.claude/skills/README.md` — Master catalog
- **Testing Skill:** `.claude/skills/testing-framework/SKILL.md` — Core documentation
- **Project Instructions:** `AGENTS.md` — Operating rules & constraints
- **Cleanup Audit:** `docs/CLEANUP_AUDIT.md` — Recent cleanup results

---

**Happy learning! Skills are designed to make you productive faster.** 🚀
