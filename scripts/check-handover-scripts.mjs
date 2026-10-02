#!/usr/bin/env node
// pre-push: required
// Fails if any docs/HANDOVER-*.md references an `npm run <script>` that does
// not exist in package.json. Built after a 2026-08-18 session's handover
// cited `npm run test:spikes` with a claimed "26/26 passing" result — the
// script never existed, so the claim was unrunnable and unverified by
// construction (see docs/lessons.md L76).

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "docs");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const knownScripts = new Set(Object.keys(pkg.scripts ?? {}));

// Incident/verification-audit docs are narrative records that must be able to
// quote a bad command to document it (same exemption pattern .husky/pre-push
// already uses for dead canon pointers) — they are not instructions to a live
// agent, so a quoted bad script here is not a fresh hallucination.
const handoverFiles = readdirSync(docsDir).filter(
  (f) =>
    f.startsWith("HANDOVER-") &&
    f.endsWith(".md") &&
    !f.includes("incident") &&
    !f.includes("verification-audit")
);

const npmRunPattern = /npm run ([a-zA-Z0-9_:-]+)/g;
const failures = [];

for (const file of handoverFiles) {
  const content = readFileSync(join(docsDir, file), "utf8");
  let match;
  npmRunPattern.lastIndex = 0;
  while ((match = npmRunPattern.exec(content)) !== null) {
    const script = match[1];
    if (!knownScripts.has(script)) {
      failures.push({ file, script });
    }
  }
}

if (failures.length > 0) {
  console.error("❌ Handover doc(s) reference npm scripts that do not exist in package.json:");
  for (const f of failures) {
    console.error(`   docs/${f.file} — "npm run ${f.script}"`);
  }
  console.error("   Fix the script name, or if intentionally aspirational, mark it clearly as not-yet-implemented.");
  process.exit(1);
}

console.log(`✅ Handover script check passed — ${handoverFiles.length} handover doc(s) scanned, all referenced npm scripts exist.`);
