#!/usr/bin/env node
// Canon uniqueness guard (L77).
//
// Skills, AGENTS.md, and handovers cite canon by bare filename — "see DESIGN.md",
// "per NOTA-BRAND-UIUX-PACK.md". When two files share that name, the citation
// silently resolves to whichever one the reader happens to open. On 2026-08-19
// root DESIGN.md and docs/DESIGN.md had diverged by 87 diff lines and contradicted
// each other on the body font and on a measured WCAG contrast ratio; commit 54ef6ea
// shows an agent editing the non-canonical copy while calling it "the governing
// doc". The fork was first logged 2026-07-26 and survived 24 days of markdown notes
// saying "root is canonical" — prose is not enforcement (AGENTS.md 16.3 / LOG-1).
//
// Scope is a deliberate allowlist, not a scan of every filename in docs/index.md.
// LOG-53 records the opposite approach failing: matching rival sources by bare
// filename across every scan root flags legitimate same-named files (a tool-specific
// AGENTS.md, an archived HANDOVER.md) and buries a real fork in false positives.
// Each entry below therefore declares its canonical path AND the duplicates that are
// legitimate, so the guard has both an allow case and a deny case (LOG-42).

import { readdirSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Same idiom as check-lesson-ids.mjs / check-handover-scripts.mjs / check-skill-integrity.mjs:
// resolve the root from this file's own location rather than spawning git. Works
// identically whether invoked from a hook, from CI, or from any working directory.
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Directories never worth walking. Archived trees are excluded from the *walk*, not
// from judgement: an archived copy that is legitimate must still be declared below,
// so that adding one is a visible decision rather than a silent exemption.
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '.vercel', 'dist', 'build', 'coverage', '.turbo',
]);

// filename -> { canonical, allowed[] }
//   canonical : the one path a bare-filename citation must resolve to
//   allowed   : other paths that may legitimately carry this name, each with a reason
const CANON = {
  'DESIGN.md': {
    canonical: 'DESIGN.md',
    allowed: [],
  },
  'NOTA-BRAND-UIUX-PACK.md': {
    canonical: 'NOTA-BRAND-UIUX-PACK.md',
    allowed: [],
  },
  'NOTA_MANIFESTO.md': {
    canonical: 'NOTA_MANIFESTO.md',
    allowed: [],
  },
  'NOTA_LORE.md': {
    canonical: 'NOTA_LORE.md',
    allowed: [],
  },
  'CLAUDE.md': {
    canonical: 'CLAUDE.md',
    allowed: [],
  },
  'AGENTS.md': {
    canonical: 'AGENTS.md',
    allowed: [
      // Codex/Cursor/Amp read .agents/ natively; this mirror is the adapter, not a fork.
      '.agents/AGENTS.md',
    ],
  },
  'HANDOVER.md': {
    canonical: 'docs/HANDOVER.md',
    allowed: [
      // Explicitly superseded, retained as history. Not a routing target.
      'docs/archived/stale-root/HANDOVER.md',
    ],
  },
};

function walk(dir, hits) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return hits;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, hits);
    } else if (entry.isFile() && CANON[entry.name]) {
      hits[entry.name] ??= [];
      hits[entry.name].push(relative(REPO_ROOT, full).split(sep).join('/'));
    }
  }
  return hits;
}

const found = walk(REPO_ROOT, {});
const problems = [];

for (const [filename, { canonical, allowed }] of Object.entries(CANON)) {
  const paths = (found[filename] ?? []).sort();

  if (paths.length === 0) {
    problems.push({
      filename,
      kind: 'missing',
      detail: `declared canonical at "${canonical}" but no file with this name exists`,
      paths,
    });
    continue;
  }

  if (!paths.includes(canonical)) {
    problems.push({
      filename,
      kind: 'moved',
      detail: `canonical path "${canonical}" is gone; found at ${paths.map((p) => `"${p}"`).join(', ')}`,
      paths,
    });
    continue;
  }

  const undeclared = paths.filter((p) => p !== canonical && !allowed.includes(p));
  if (undeclared.length > 0) {
    problems.push({
      filename,
      kind: 'fork',
      detail: `canonical is "${canonical}"; undeclared duplicate(s) found`,
      paths: undeclared,
    });
  }
}

if (problems.length === 0) {
  const total = Object.values(found).reduce((n, p) => n + p.length, 0);
  console.log(
    `✅ Canon uniqueness: ${Object.keys(CANON).length} declared names, ` +
      `${total} file(s) on disk, no undeclared duplicates.`
  );
  process.exit(0);
}

console.error('❌ Canon uniqueness check failed.\n');
for (const { filename, kind, detail, paths } of problems) {
  console.error(`   ${filename} — ${detail}`);
  for (const p of paths) console.error(`      ${p}`);
  if (kind === 'fork') {
    console.error(
      '      A bare-filename citation ("see ' +
        filename +
        '") cannot tell these apart.\n' +
        '      Delete the duplicate, or — if it is legitimate (a tool mirror, an\n' +
        '      explicitly superseded archive) — add its path to the `allowed` list in\n' +
        '      scripts/check-canon-uniqueness.mjs with a one-line reason.'
    );
  }
  console.error('');
}
console.error('See docs/lessons.md L77.');
process.exit(1);
