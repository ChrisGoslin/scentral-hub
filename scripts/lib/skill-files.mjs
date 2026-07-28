// Shared helpers for scripts/relock-skills.mjs and scripts/check-skill-integrity.mjs.
// Deliberately fs-only, no child_process/git — avoids the OS-command security
// hotspot entirely rather than trying to prove a specific invocation is safe.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SKILL_ROOTS = [".claude", ".agents", ".gemini"];

/**
 * Returns absolute paths to every `<skillDir>/SKILL.md` directly under `skillsDir`.
 * @param {string} skillsDir absolute path to a `skills` directory (e.g. `<root>/.claude/skills`)
 * @returns {string[]}
 */
function findSkillFilesIn(skillsDir) {
  if (!existsSync(skillsDir)) {
    return [];
  }
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(skillsDir, entry.name, "SKILL.md"))
    .filter((p) => existsSync(p));
}

/**
 * Finds every SKILL.md under `.claude/skills`, `.agents/skills`, and `.gemini/skills`
 * beneath `root`, sorted for deterministic ordering.
 * @param {string} root absolute path to the repository root
 * @returns {{ absoluteFiles: string[], relativeFiles: string[] }} paired absolute
 *   paths and their root-relative equivalents (same order, same length)
 */
export function listSkillFiles(root) {
  const absoluteFiles = SKILL_ROOTS.flatMap((dir) =>
    findSkillFilesIn(join(root, dir, "skills"))
  ).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const relativeFiles = absoluteFiles.map((p) => p.slice(root.length + 1));
  return { absoluteFiles, relativeFiles };
}
