#!/usr/bin/env node
// pre-push: required
// Hook source-of-truth guard.
//
// `.husky/pre-push` is committed and is the only copy of the hook. Until 2026-08-24
// the documented Local Dev Setup ended with:
//
//     cp scripts/hooks/pre-push .husky/pre-push && chmod +x .husky/pre-push
//
// and `scripts/hooks/pre-push` predated every one of the five always-on guards. So a
// contributor following the mandatory setup on a fresh clone silently deleted the
// skill-integrity, lesson-ID, handover-script, canon-uniqueness and measured-contrast
// checks — including the canon-uniqueness guard PR #98 added to stop canon forking.
// The guards stayed green in CI and simply never ran locally again.
//
// The failure is not that someone wrote a bad line; it is that an install step which
// overwrites the installed artifact from a second copy can only ever be as good as
// that copy, and nothing was keeping the two in sync. So this guard forbids the shape,
// not the specific path: no second copy of the hook, and no instruction to copy one
// over it. A note in AGENTS.md saying "don't do this" is what we had; prose is not
// enforcement (AGENTS.md 16.3 / LOG-1).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const failures = [];

// 1. The hook must exist where core.hooksPath points.
const hookPath = join(REPO_ROOT, '.husky', 'pre-push');
if (!existsSync(hookPath)) {
  failures.push(
    '.husky/pre-push is missing. It is committed and is the single source of truth for the hook.\n' +
      '       Restore it: git restore --source=HEAD -- .husky/pre-push'
  );
} else if ((statSync(hookPath).mode & 0o111) === 0) {
  // Existence is not enough. Git does not error on a non-executable hook — it prints
  // "hook was ignored because it's not set as executable" and PROCEEDS, so a mode-only
  // change silently disables every gate below while this guard reports green.
  failures.push(
    '.husky/pre-push exists but is not executable, so git skips it with a warning and ' +
      'pushes anyway — every local gate is off.\n       Fix: chmod +x .husky/pre-push'
  );
}

// 2. The hook must actually invoke the checks CI runs, and vice versa.
//
// Existence and mode are not enough: the committed hook can be edited to drop a check
// and every other test here still passes, so the "single source of truth" can quietly
// stop running one of the gates it promises. Found in review — and worth recording that
// the parity below is a diff a human (me) had been running BY HAND every round and
// reporting as evidence. It passed every time. Nothing enforced it, so it would have
// stopped happening the moment nobody remembered. That is the same failure class as
// L82 itself: a guarantee that depends on someone remembering is not a guarantee.
//
// Neither side is a hardcoded list. A fixed array here would be a third copy of the
// truth, which is the defect this whole guard exists to remove — so the hook and the
// workflow check each other. Adding a guard therefore means editing both, deliberately.
//
// But parity alone only catches ASYMMETRIC drift. Delete a check from the hook AND the
// workflow in one commit and the two sets stay equal: this guard reported six matching
// checks and exited 0 while both enforcement paths had dropped a gate (found in review,
// round 7). Comparing two copies can never notice what is missing from both — the same
// blindness as L78, where two forks of DESIGN.md agreed on a wrong ratio and every
// reconciliation preserved it.
//
// So there is a third input, and it is still not a list in this file: each
// scripts/check-*.mjs declares its own status on line 1 or 2 as
// `// pre-push: required` or `// pre-push: excluded — <reason>`. Every `required`
// script must appear in both the hook and the workflow. The truth stays in the script
// it describes, and dropping a gate now means editing the guarded script itself, where
// it is visible in the diff rather than inferable from an absence.
const WORKFLOW = join(REPO_ROOT, '.github', 'workflows', 'skill-integrity.yml');

function checksIn(path) {
  if (!existsSync(path)) return null;
  // Comments do not run. Scanning raw text meant commenting out a workflow step
  // (`# - run: node scripts/check-contrast-claims.mjs`) still satisfied parity while
  // GitHub Actions skipped the guard entirely — the check reported all seven present
  // and exited 0. `#` starts a comment in both YAML and shell, so one rule covers the
  // workflow and the hook.
  const active = readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n');
  return new Set(
    [...active.matchAll(/scripts\/(check-[a-z-]+\.mjs)/g)].map((m) => m[1])
  );
}

// Declared status of every guard script, read from the scripts themselves.
function declaredChecks() {
  const dir = join(REPO_ROOT, 'scripts');
  const required = new Set();
  const undeclared = [];
  for (const entry of readdirSync(dir)) {
    if (!/^check-[a-z-]+\.mjs$/.test(entry)) continue;
    const head = readFileSync(join(dir, entry), 'utf8').split('\n').slice(0, 3).join('\n');
    const m = head.match(/^\/\/ pre-push: (required|excluded)\b/m);
    if (!m) undeclared.push(entry);
    else if (m[1] === 'required') required.add(entry);
  }
  return { required, undeclared };
}

const { required: requiredChecks, undeclared } = declaredChecks();
if (undeclared.length > 0) {
  failures.push(
    `these guard scripts declare no pre-push status: ${undeclared.sort().join(', ')} — add ` +
      "'// pre-push: required' or '// pre-push: excluded — <reason>' as the first comment " +
      'line. Without it a script can be dropped from both the hook and CI without this ' +
      'guard noticing.'
  );
}

const hookChecks = existsSync(hookPath) ? checksIn(hookPath) : null;
const ciChecks = checksIn(WORKFLOW);

for (const [label, set] of [
  ['.husky/pre-push', hookChecks],
  ['.github/workflows/skill-integrity.yml', ciChecks],
]) {
  if (!set) continue;
  const missing = [...requiredChecks].filter((c) => !set.has(c)).sort();
  if (missing.length > 0) {
    failures.push(
      `${label} does not run: ${missing.join(', ')} — each declares '// pre-push: required'. ` +
        'Removing a gate from both enforcement paths at once keeps them in parity while ' +
        'turning the gate off; the declaration in the script is what makes that visible.'
    );
  }
}

if (!ciChecks) {
  failures.push(
    `${relative(REPO_ROOT, WORKFLOW)} is missing — it is the server-side twin of the hook ` +
      'and the only gate that survives a GitHub UI merge.'
  );
} else if (hookChecks) {
  const missingFromHook = [...ciChecks].filter((c) => !hookChecks.has(c)).sort();
  const missingFromCi = [...hookChecks].filter((c) => !ciChecks.has(c)).sort();
  if (missingFromHook.length > 0) {
    failures.push(
      `.husky/pre-push does not run: ${missingFromHook.join(', ')} — CI does. A check that ` +
        'runs only server-side lets a bad change reach review before anything catches it.'
    );
  }
  if (missingFromCi.length > 0) {
    failures.push(
      `.github/workflows/skill-integrity.yml does not run: ${missingFromCi.join(', ')} — the ` +
        'hook does. A check that runs only locally is skipped entirely by a GitHub UI merge.'
    );
  }
}

// 3. No rival copy of the hook anywhere else in the tree.
const IGNORED = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.vercel', '.husky']);
function walk(dir, onFile) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      // Nested checkouts (worktrees, submodules) are not this repo's tree — same
      // structural exclusion check-canon-uniqueness.mjs uses, and for the same reason.
      if (existsSync(join(full, '.git'))) continue;
      walk(full, onFile);
    } else if (st.isFile()) {
      onFile(full);
    }
  }
}

walk(REPO_ROOT, (full) => {
  // Exact basename, not endsWith: a future `docs/notes-pre-push` or `lib/x-pre-push`
  // is not a copy of the hook, and a guard that cries wolf gets disabled.
  if (basename(full) !== 'pre-push') return;
  failures.push(
    `${relative(REPO_ROOT, full)} is a second copy of the pre-push hook. ` +
      'Delete it — .husky/pre-push is the only copy, and a second one drifts silently.'
  );
});

// 4. No document may instruct copying anything over the installed hook.
//    Matched on the shape (`cp <anything> .husky/pre-push`) rather than the old path,
//    so reintroducing it from a new location is caught too.
// An *instruction* is a bare command occupying its own line — which is how it appeared
// in AGENTS.md, and how a setup step is always written. A *mention* is inline inside a
// sentence ("...used to end with `cp ... .husky/pre-push`"), which every doc discussing
// this incident necessarily contains, including L82 itself.
//
// Distinguishing by line shape rather than by nearby negation words is what makes this
// robust. Two earlier attempts keyed on negation: a +/-4-line window let a live
// instruction through three lines after an unrelated "removed", and a same-line-only
// rule then flagged the lesson entry documenting the fix. Shape has no such tradeoff.
// Leading blockquote markers and shell prompts are stripped so neither can disguise a
// real command.
// Anchored on the DESTINATION, not on argument count. An earlier version assumed
// exactly one token between `cp` and the target, so `cp -f src .husky/pre-push` walked
// straight past it (found in review). GNU documents the syntax as `cp [OPTION]... SOURCE
// DEST`, so any number of options may precede the source.
// Anchored on the normalised DESTINATION rather than one literal spelling. Two earlier
// versions matched a fixed shape and were evaded in turn: first by options
// (`cp -f src .husky/pre-push`), then by quoting and a `./` prefix
// (`cp -f src "./.husky/pre-push"`). Normalising the final operand closes both as a
// class instead of adding a third pattern.
const HOOK_DESTINATIONS = new Set(['.husky/pre-push', 'husky/pre-push']);

function copiesOverHook(line) {
  // Split on shell separators FIRST. Taking the last token of the whole line treated
  // `cp source .husky/pre-push && echo installed` as copying to "installed", so a
  // perfectly ordinary chained setup command sailed through (found in review).
  return line
    .split(/&&|\|\||[;|]/)
    .some((segment) => segmentCopiesOverHook(segment.trim()));
}

function normaliseDest(raw) {
  return raw
    .replace(/^["']|["']$/g, '') // surrounding quotes
    .replace(/^\.\//, '') // leading ./
    .replace(/\/+/g, '/'); // duplicated slashes
}

// `cp` is not the only way to write a file over another. `install`, `mv`, a symlink,
// and a redirect all replace the committed hook just as completely — matching only the
// literal command that caused the original incident would guard the anecdote instead of
// the shape. Found by testing `install -m755 x .husky/pre-push` against this guard and
// watching it pass.
const OVERWRITE_COMMANDS = /^(cp|install|mv|ln|rsync|cat|tee|curl|wget)\b/;

function segmentCopiesOverHook(segment) {
  // A redirect writes the destination without naming it as an argument.
  const redirect = segment.match(/>{1,2}\s*(\S+)\s*$/);
  if (redirect && HOOK_DESTINATIONS.has(normaliseDest(redirect[1]))) return true;
  if (!OVERWRITE_COMMANDS.test(segment)) return false;
  const dest = segment.trim().split(/\s+/).pop() ?? '';
  return HOOK_DESTINATIONS.has(normaliseDest(dest));
}

walk(REPO_ROOT, (full) => {
  if (!full.endsWith('.md')) return;
  const rel = relative(REPO_ROOT, full);
  const text = readFileSync(full, 'utf8');
  for (const [i, line] of text.split('\n').entries()) {
    const bare = line.replace(/^[\s>]*/, '').replace(/^[$#]\s+/, '');
    if (!copiesOverHook(bare)) continue;
    failures.push(
      `${rel}:${i + 1} instructs copying a file over .husky/pre-push. ` +
        'That overwrites the committed hook with a copy that will drift out of date — ' +
        'the setup only needs `git config core.hooksPath .husky`.'
    );
  }
});

if (failures.length > 0) {
  console.error(`❌ ${failures.length} hook source-of-truth problem(s):`);
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}

console.log(
  `✅ Hook source of truth OK — .husky/pre-push is the only copy, executable, no doc copies ` +
    `over it, and hook/CI run the same ${hookChecks?.size ?? 0} checks.`
);
