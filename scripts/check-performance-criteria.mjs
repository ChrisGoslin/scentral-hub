import { readFile } from 'node:fs/promises';

const canonicalPath = 'docs/todo/homepage-follow-ups-2026-07-26.md';
const activeReferences = [
  'docs/LCP-GATE-INVESTIGATION.md',
  'docs/LAUNCH_READINESS_CHECKLIST.md',
  'docs/NOTA-BRAND-UIUX-PACK.md',
  'docs/todo/session-handoff-2026-07-26.md',
];

const canonical = await readFile(canonicalPath, 'utf8');
const requiredCanonical = [
  'Mobile LCP must be `<=3.0s` on slow 4G',
  'desktop LCP must remain below 1.5s',
  'PASS under revised acceptance criteria',
];

const failures = requiredCanonical
  .filter((text) => !canonical.includes(text))
  .map((text) => `${canonicalPath}: missing canonical criterion: ${text}`);

for (const path of activeReferences) {
  const contents = await readFile(path, 'utf8');
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
