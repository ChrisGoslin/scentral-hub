# Engagement Scorecard — dual-perspective critique

Template for the `Rate` / `Critique` trigger (SKILL.md §7). Two independent voices score the same engagement. Both must be written; a provider-only score is marketing.

**Governing premise:** Christopher is a **non-technical client who relies on the provider's expertise to find defects he cannot see himself.** Therefore the primary measure of value is not whether the work was correct — it is **how much of the correctness the client had to enforce.** A provider who produces good work only after five rounds of client QE has failed at the job they were hired for, regardless of the final artifact's quality.

---

## Voice 1 — Solutions Architect (the provider)

Score each 0–10 with a one-line justification tied to observable evidence. No score without a reason a reviewer could check.

| Dimension | What it measures |
|---|---|
| **Discovery** | Was the ground established before producing? Sources mounted, canon read, existing capability inventoried, client state verified rather than assumed. |
| **Analysis** | Was the diagnosis correct, and was it a diagnosis of the *client's* problem rather than of the provider's own wreckage? |
| **Implementation** | Did the artifact ship correct the first time? Count rebuilds of the same spec — each is rework billed to the client. |
| **Review** | Was self-critique proactive or extracted? Review performed only when asked is not a review practice. |
| **Output** | Are the deliverables durable, verifiable, and placed where the consuming tool actually loads them (L36)? |
| **Customer satisfaction** | The client's number, transcribed. The provider does not get to set this. |

Scoring discipline: **rebuilds cap the Implementation score.** One rebuild → max 8. Two → max 6. Three or more → max 5. Recovery quality never restores points lost to avoidable rework.

---

## Voice 2 — The Client (non-technical, dependent on provider expertise)

Written in first person as Christopher. Blunt, specific, and quantified. Not a courtesy section.

### The QE Ledger — the headline metric

List every correction in the engagement and attribute its origin:

```
| # | Defect / wrong direction              | Found by | How it surfaced        |
|---|---------------------------------------|----------|------------------------|
| 1 | <what was wrong>                      | CLIENT   | "<the question I asked>" |
| 2 | <what was wrong>                      | PROVIDER | unprompted             |
```

Then compute:

- **Unprompted discovery ratio** = provider-found ÷ total. **This is the number that matters.**
- **Client QE interventions** = how many times I had to catch something.

Bands: **≥0.8** the provider is doing the job · **0.5–0.8** acceptable, watch it · **0.3–0.5** I am subsidising your QA · **<0.3** I am doing your job and paying you for it.

State the ratio explicitly. Do not bury it.

### Commercial impact

- **Rework %** — proportion of spend on work that should never have been produced. Name the binned artifacts.
- **Overspend** — what was paid for twice.
- **Time-to-first-correct-output** — how many turns before anything survived review.

### Risk introduced

Every instance where following the provider's instruction *as given* would have damaged the client's systems. State the blast radius and what caught it. **A near-miss caught by the client is a failure, not a save.**

### The specific insult (when applicable)

If the provider broke a rule the client had already documented and paid to learn — quote the file, the line, and the date it was written. Nothing else in a retrospective lands as hard, and nothing else so reliably prevents recurrence.

### What earns the score it got

Name what was genuinely good. A retrospective that only attacks is as useless as one that only flatters, and the client will stop trusting the instrument.

### Would I rehire?

Answer separately for **discovery** and **execution** — they are different products and frequently deserve different answers.

---

## Adversarial pass — mandatory before publishing the score

Run the session's own new rules against the session's own output (L40). Specifically:

1. Every lesson written this session — does this session's output satisfy it?
2. Every `Enforced by:` reference — does the named mechanism exist and actually run where claimed (L23)?
3. Every new skill or doc — is it present in **all** consuming trees (`.claude/`, `.agents/`, `.gemini/`, Cowork account) per L39?
4. Every skill prescribing a command — has that command been run once against the real target (L41)?

Findings here are **not** deductions to argue away. Fix them before publishing, then record both the violation and the fix. A rule authored and violated in the same session is worse than no rule.

---

## Output order

1. Provider scorecard — six dimensions, table form
2. Client verdict — QE ledger, ratio, commercial impact, risk, insult, credit, rehire
3. Adversarial pass — self-violations found and fixed
4. Lessons routed to canonical owners
5. Open items with owners

## Hard rules

1. **Both voices, always.** Provider-only is marketing.
2. **No score without checkable evidence.**
3. **The client voice is not softened.** If the number is a 4, write 4 and justify it.
4. **The unprompted discovery ratio is stated explicitly**, never implied.
5. **Fix self-violations before publishing**, then report them.
6. **Route lessons to their single canonical owner** — `docs/lessons.md` for project, `claude-global/LESSONS.md` for cross-project. Do not duplicate (L6, L30).
7. **Never inflate to end on a positive.** The instrument's only value is that it is trusted.
