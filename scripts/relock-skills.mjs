#!/usr/bin/env node
// Regenerates docs/skills.lock.json — a content-hash manifest of every skill file
// under .claude/skills, .agents/skills, and .gemini/skills.
//
// Run this deliberately after any real edit to a skill file, then review the diff
// in docs/skills.lock.json before committing both together. The pre-push hook
// blocks pushes where a skill file's on-disk hash doesn't match the committed
// lock entry — see docs/lessons.md L26-L30 for why (commit 55b2d2d replaced
// repo-tidy/verify-cli-claims with dangerous content behind an unrelated-sounding
// commit message; a keyword check on the message would not have caught it, only
// a content hash does).
//
// Deliberately uses only fs, not child_process/git — no OS command execution
// surface at all, avoiding the generic "OS command" security hotspot entirely
// rather than trying to prove a specific invocation is safe.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lockPath = join(root, "docs", "skills.lock.json");

function findSkillFiles(skillsDir) {
  if (!existsSync(skillsDir)) return [];
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(skillsDir, entry.name, "SKILL.md"))
    .filter((p) => existsSync(p));
}

const absoluteFiles = [
  ...findSkillFiles(join(root, ".claude", "skills")),
  ...findSkillFiles(join(root, ".agents", "skills")),
  ...findSkillFiles(join(root, ".gemini", "skills")),
].sort();

const files = absoluteFiles.map((p) => p.slice(root.length + 1));

const lock = {};
for (let i = 0; i < files.length; i++) {
  const content = readFileSync(absoluteFiles[i]);
  lock[files[i]] = createHash("sha256").update(content).digest("hex");
}

const prev = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, "utf8")) : {};
const changed = Object.keys(lock).filter((f) => lock[f] !== prev[f]);
const removed = Object.keys(prev).filter((f) => !(f in lock));

writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");

if (changed.length || removed.length) {
  console.log("skills.lock.json updated:");
  for (const f of changed) console.log(`  ${prev[f] ? "changed" : "added"}: ${f}`);
  for (const f of removed) console.log(`  removed: ${f}`);
  console.log("\nReview this diff carefully before committing — it's the record that a skill's content actually changed.");
} else {
  console.log("skills.lock.json already up to date — no skill file content changed.");
}
