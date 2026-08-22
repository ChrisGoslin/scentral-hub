import { readFile } from 'node:fs/promises';

const canonicalPath = 'docs/todo/homepage-follow-ups-2026-07-26.md';
const activeReferences = [
  'docs/LCP-GATE-INVESTIGATION.md',
  'docs/LAUNCH_READINESS_CHECKLIST.md',
  // Repo root, not docs/. The docs/ copy was a fork and was deleted 2026-08-19;
  // root has been the canonical path per docs/index.md:13 throughout (L77).
  'NOTA-BRAND-UIUX-PACK.md',
  'docs/todo/session-handoff-2026-07-26.md',
];

// A path in this list that no longer exists is a real failure — a moved or deleted
// reference means the criterion has silently stopped being enforced there. Report it
// by name rather than dying on an unhandled ENOENT: the 2026-08-19 canon
// de-duplication moved NOTA-BRAND-UIUX-PACK.md and this script exited with a stack
// trace that named neither the check nor why it mattered.
async function readOrNull(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

const failures = [];

const canonical = await readOrNull(canonicalPath);
if (canonical === null) {
  failures.push(`${canonicalPath}: canonical criteria doc not found — has it moved?`);
} else {
  const requiredCanonical = [
    'Mobile LCP must be `<=3.0s` on slow 4G',
    'desktop LCP must remain below 1.5s',
    'PASS under revised acceptance criteria',
  ];
  for (const text of requiredCanonical) {
    if (!canonical.includes(text)) {
      failures.push(`${canonicalPath}: missing canonical criterion: ${text}`);
    }
  }
}

for (const path of activeReferences) {
  const contents = await readOrNull(path);
  if (contents === null) {
    failures.push(
      `${path}: listed as an active reference but does not exist — ` +
        `update activeReferences in this script, or restore the file`
    );
    continue;
  }
  if (!contents.includes('3.0s')) {
    failures.push(`${path}: missing revised 3.0s mobile LCP criterion`);
  }
  if (contents.includes('target: <2.5s') || contents.includes('Target: <2.5s')) {
    failures.push(`${path}: contains stale <2.5s active target`);
  }
}

if (failures.length > 0) {
  console.error('Performance criteria check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Performance criteria check passed: ${canonicalPath} is canonical; ${activeReferences.length} active references agree.`);
