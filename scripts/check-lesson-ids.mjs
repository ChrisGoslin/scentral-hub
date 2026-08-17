#!/usr/bin/env node
// Fails if docs/lessons.md contains a duplicate `### L<n>` lesson ID.
// Built because two unrelated 2026-07-27 sessions each independently
// authored L26-L32, and it went uncaught by a human read-through until
// CodeRabbit flagged it (see docs/lessons.md L45).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lessonsPath = join(root, "docs", "lessons.md");

const content = readFileSync(lessonsPath, "utf8");
const idPattern = /^### (L\d+)\b/gm;

const seen = new Map(); // id -> first line number
const duplicates = [];
let lineNumber = 0;

for (const line of content.split("\n")) {
  lineNumber++;
  idPattern.lastIndex = 0;
  const match = idPattern.exec(line);
  if (!match) continue;
  const id = match[1];
  if (seen.has(id)) {
    duplicates.push({ id, firstLine: seen.get(id), duplicateLine: lineNumber });
  } else {
    seen.set(id, lineNumber);
  }
}

if (duplicates.length > 0) {
  console.error("❌ Duplicate lesson IDs found in docs/lessons.md:");
  for (const dup of duplicates) {
    console.error(`   ${dup.id} — first defined at line ${dup.firstLine}, repeated at line ${dup.duplicateLine}`);
  }
  console.error("   Renumber the later occurrence and update every cross-reference to it.");
  process.exit(1);
}

console.log(`✅ Lesson ID check passed — ${seen.size} unique lesson IDs in docs/lessons.md.`);
