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
// Known limits (see docs/lessons.md L30 / docs/todo/README.md):
// - This is a LOCAL pre-push hook only. A merge performed through the GitHub UI
//   never runs it — the same path 55b2d2d could have taken. A GitHub Actions
//   twin of this check on push/PR events is a tracked follow-up, not yet built.
// - This forces a skill content change to appear as an explicit, reviewable
//   diff in docs/skills.lock.json. It does not make tampering impossible: an
//   agent or person who edits a skill file and then honestly runs relock-skills
//   will produce a matching hash. The guard's value is forcing visibility, not
//   guaranteeing intent.

import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const root = execSync("git rev-parse --show-toplevel").toString().trim();
const lockPath = `${root}/docs/skills.lock.json`;

const files = execSync(
  `git ls-files -- '.claude/skills/*/SKILL.md' '.agents/skills/*/SKILL.md' '.gemini/skills/*/SKILL.md'`,
  { cwd: root }
)
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);

if (!existsSync(lockPath)) {
  console.error("❌ docs/skills.lock.json is missing. Run: node scripts/relock-skills.mjs");
  process.exit(1);
}

const lock = JSON.parse(readFileSync(lockPath, "utf8"));
let failed = false;

for (const f of files) {
  const content = readFileSync(`${root}/${f}`);
  const hash = createHash("sha256").update(content).digest("hex");
  if (!(f in lock)) {
    console.error(`❌ ${f} has no entry in docs/skills.lock.json (new skill file not locked).`);
    failed = true;
  } else if (lock[f] !== hash) {
    console.error(`❌ ${f} content does not match docs/skills.lock.json — its content changed without being relocked.`);
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
