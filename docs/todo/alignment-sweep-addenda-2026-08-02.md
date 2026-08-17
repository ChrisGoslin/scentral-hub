# alignment-sweep addenda — 2026-08-02

Two blocks added to the three repo trees (`.claude`, `.agents`, `.gemini`) this
session. **They are NOT yet in the two copies outside `~/Projects`:**

- the Cowork account-level skill (update via Cowork `save_skill`, or the skills UI)
- `~/Claude/Scheduled/monthly-alignment-sweep/SKILL.md` — **the only copy that runs
  unattended.** It ran 2026-08-01 and caught none of this session's findings.

Those two copies have a different, shorter base (127 lines vs 251). **Do not overwrite
them with the repo version** — append only:

```bash
marker="## Integrity assertions — added 2026-08-02"
dest=~/Claude/Scheduled/monthly-alignment-sweep/SKILL.md
if ! grep -qF "$marker" "$dest"; then
  sed -n "/^$marker/,\$p" \
    ~/Projects/scentral-hub/.claude/skills/alignment-sweep/SKILL.md \
    >> "$dest"
fi
```

Verbatim content of both blocks follows, for the account-level copy which must be
updated through the Cowork skills interface rather than the filesystem.

---

## Integrity assertions — added 2026-08-02

Machine-checkable additions to the passes above. Each exists because a lesson
claimed enforcement that was not actually in place.

### Pass 2 addendum — a Resolved lesson is a claim, not a state (GL-7)
For every lesson in `claude-global/LESSONS.md` or `docs/lessons.md` marked
**Resolved**, re-open the file its remedy names and confirm the corrected text is
present. A Resolved lesson whose remedy is absent is a **HIGH** finding, ranked
above a merely unresolved one — it has suppressed further checking. Report as
`lesson <id> claims <file>:<what> — absent`.

### Pass 4 addendum — declared scope vs actual trees (L46)
Use `docs/skills.lock.json` as the declared shared-skill inventory rather than
requiring raw tree counts to match; the trees intentionally differ. Compare the
declared shared set across all pairs (`.claude` ↔ `.agents`, `.claude` ↔
`.gemini`, `.agents` ↔ `.gemini`) and report only missing entries from that
declared set. Additionally, when a skill's own description names a repo in its
scope, assert that repo has a skills tree containing it — a skill declaring
scope it cannot reach is a HIGH finding regardless of tree parity.

### Pass 6 addendum — lesson-ID integrity (L47)
```bash
u=$(grep -oE "^### L[0-9]+" docs/lessons.md | sort -u | wc -l)
t=$(grep -cE "^### L[0-9]+" docs/lessons.md)
[ "$u" -eq "$t" ] || echo "HIGH: $((t-u)) duplicate lesson IDs"
```
Unique lesson IDs must equal total lesson headings. On collision, renumber the
**uncited** series only — check citations first with
`grep -rnoE "\bL[0-9]+\b" docs .claude .agents .gemini | grep -v docs/lessons.md`.

### Pass 5 addendum — the second global-instruction surface (GL-8)
Global instructions live on two independently-drifting surfaces: files under
`~/Projects/claude-global/`, and the Cowork account-level preferences. The sweep
can read the first but not the second. Report the preferences surface as
**unverifiable from this tool** and list the canon paths it must name, so the
divergence is visible rather than silent.


## Scope correction — added 2026-08-02

This sweep previously declared its scope as nota., Abundance, and the global
operating docs. That omitted **Household Finance** (`~/Projects/household-finance`),
which `claude-global/PROJECTS.md` lists as an **active** project with real,
violable constraints:

- No Auth **by design** — member tracking uses the `owner` field on transactions.
  An agent "adding auth for safety" is breaking the architecture, not improving it.
- PDF parsing **must** use `unpdf`. Never `pdf-parse`.
- Live at `household-finance-ruby.vercel.app` — it is a public surface.

Include it in every pass. It has `AGENTS.md`, `CLAUDE.md` and a `.claude/skills/`
tree, but **no `docs/lessons.md`** — so Pass 6 (doc freshness) and the lesson-ID
integrity assertion have nothing to read there. Report that absence as a finding
each run until a lessons file exists or the project is explicitly declared exempt.

**Copy parity warning.** `alignment-sweep` now exists in at least five places:
`.claude/`, `.agents/`, `.gemini/`, the Cowork account-level skill, and
`~/Claude/Scheduled/monthly-alignment-sweep/SKILL.md`. **The scheduled copy is the
only one that runs unattended** — it is outside `~/Projects` and therefore invisible
to Cowork sessions. When editing this skill, update all five, and treat the scheduled
copy as the authoritative one for anything that must happen without a human present.
