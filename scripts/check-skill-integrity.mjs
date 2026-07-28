#!/usr/bin/env node
// Skill integrity guard. Blocks the push if any skill file's on-disk content hash
// doesn't match docs/skills.lock.json, or if a tracked skill file has no lock entry
// at all. Run `node scripts/relock-skills.mjs`, review the diff, and commit both
// together to fix a real, deliberate skill change.
//
// Deliberately does NOT trust commit messages: the 55b2d2d incident's commit
// message named both affected skills while lying about what it did to them
// (docs/lessons.md L26-L29). Only content hashes are checked here.
//
// Enforced two ways (see docs/lessons.md L30): locally via .husky/pre-push on
// every branch, and server-side via .github/workflows/skill-integrity.yml on
// push/PR to main — the latter closes the case where a GitHub UI merge would
// otherwise bypass the local hook entirely (the path 55b2d2d could have taken).
//
// Genuine remaining limit: this forces a skill content change to appear as an
// explicit, reviewable diff in docs/skills.lock.json. It does not make
// tampering impossible — an agent or person who edits a skill file and then
// honestly runs relock-skills will produce a matching hash. The guard's value
// is forcing visibility, not guaranteeing intent.

import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { listSkillFiles } from "./lib/skill-files.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lockPath = join(root, "docs", "skills.lock.json");
const { absoluteFiles, relativeFiles } = listSkillFiles(root);

if (!existsSync(lockPath)) {
  console.error("❌ docs/skills.lock.json is missing. Run: node scripts/relock-skills.mjs");
  process.exit(1);
}

let lock;
try {
  lock = JSON.parse(readFileSync(lockPath, "utf8"));
} catch (err) {
  console.error(`❌ docs/skills.lock.json is not valid JSON: ${err.message}`);
  console.error("Run: node scripts/relock-skills.mjs to regenerate it.");
  process.exit(1);
}
let failed = false;
const discovered = new Set(relativeFiles);

for (let i = 0; i < relativeFiles.length; i++) {
  const f = relativeFiles[i];
  const content = readFileSync(absoluteFiles[i]);
  const hash = createHash("sha256").update(content).digest("hex");
  if (!(f in lock)) {
    console.error(`❌ ${f} has no entry in docs/skills.lock.json (new skill file not locked).`);
    failed = true;
  } else if (lock[f] !== hash) {
    console.error(`❌ ${f} content does not match docs/skills.lock.json — its content changed without being relocked.`);
    failed = true;
  }
}

for (const f of Object.keys(lock)) {
  if (!discovered.has(f)) {
    console.error(`❌ ${f} has a lock entry but no corresponding skill file on disk — stale entry, run relock-skills.mjs.`);
    failed = true;
  }
}

if (failed) {
  console.error("\nRun: node scripts/relock-skills.mjs");
  console.error("Then review the printed diff carefully — it is the actual record of what changed in this skill.");
  console.error("Commit the updated docs/skills.lock.json together with the skill file, then push again.");
  process.exit(1);
}

console.log("✅ Skill integrity check passed — all skill files match docs/skills.lock.json.");
process.exit(0);
