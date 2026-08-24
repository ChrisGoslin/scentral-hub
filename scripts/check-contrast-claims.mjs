#!/usr/bin/env node
// Measured-contrast guard (L78).
//
// L78 records a published WCAG ratio that was never measured and stayed canon for
// 24 days: taupe #766E64 was printed at 10.35:1 on ivory in both forks of DESIGN.md
// when the real ratio is 4.57:1. Because both copies agreed, every reconciliation
// preserved it — diffing finds divergence, never shared wrongness. The dark-ground
// column of NOTA-BRAND-UIUX-PACK.md was worse: three published figures across the
// two forks (7.54:1, 12.2:1, 5.8:1) against a measured 3.18:1, plus a bare "—" for
// a token that actually fails AA on that ground.
//
// PR #98 corrected every number by hand. Nothing stopped them drifting again, and
// L80 names the remedy directly: a CI script should be the arbiter, not a judgement
// call about which fork looks newer. This is that arbiter. Contrast is arithmetic —
// there is no reason for a human or an agent to be the source of truth for it.
//
// Same idiom as check-canon-uniqueness.mjs / check-lesson-ids.mjs: resolve the root
// from this file's own location rather than spawning git, so it behaves identically
// from a hook, from CI, or from any working directory.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// The table quotes two decimals, so anything beyond rounding is a real discrepancy.
const TOLERANCE = 0.05;

// ---- WCAG 2.1 relative luminance and contrast ------------------------------

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * srgbToLinear((n >> 16) & 0xff) +
    0.7152 * srgbToLinear((n >> 8) & 0xff) +
    0.0722 * srgbToLinear(n & 0xff)
  );
}

function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const failures = [];

function check(where, label, fg, bg, claimed) {
  const actual = contrastRatio(fg, bg);
  if (Math.abs(actual - claimed) > TOLERANCE) {
    failures.push(
      `${where}: ${label} ${fg} on ${bg} claims ${claimed.toFixed(2)}:1, actual ${actual.toFixed(2)}:1`
    );
  }
}

// ---- DESIGN.md: one ground, hex inline in each row -------------------------

const designPath = join(REPO_ROOT, 'DESIGN.md');
const design = readFileSync(designPath, 'utf8');

// The ground is read from the section heading rather than hardcoded, so changing
// the ivory token cannot silently invalidate every row beneath it.
const groundMatch = design.match(/###\s+Measured contrast on\s+\S+\s+`(#[0-9A-Fa-f]{6})`/);
if (!groundMatch) {
  console.error('❌ DESIGN.md: no "Measured contrast on <name> `#hex`" heading found.');
  console.error('   The table\'s background ground is read from that heading.');
  process.exit(1);
}
const ivory = groundMatch[1];

// | **Taupe `#766E64`** | 4.57:1 | pass (0.07 margin) | pass | ... |
const designRow = /^\|\s*\*{0,2}([^`|*]+?)\*{0,2}\s*`(#[0-9A-Fa-f]{6})`\*{0,2}\s*\|\s*([0-9.]+):1/gm;

let designRows = 0;
for (const [, name, hex, claimed] of design.matchAll(designRow)) {
  designRows += 1;
  check('DESIGN.md', name.trim(), hex, ivory, Number.parseFloat(claimed));
}

// ---- NOTA-BRAND-UIUX-PACK.md: two grounds, tokens named not inlined --------

const packPath = join(REPO_ROOT, 'NOTA-BRAND-UIUX-PACK.md');
const pack = readFileSync(packPath, 'utf8');

// The raw-pigment block is the pack's own token dictionary:  --pig-taupe  #766E64
const pigments = new Map();
for (const [, name, hex] of pack.matchAll(/^--pig-([a-z-]+)\s+(#[0-9A-Fa-f]{6})/gm)) {
  pigments.set(name, hex);
}

const lightGround = pigments.get('ivory');
const darkGround = pigments.get('ground-dark');
if (!lightGround || !darkGround) {
  console.error('❌ NOTA-BRAND-UIUX-PACK.md: could not resolve --pig-ivory / --pig-ground-dark.');
  console.error('   The dual-ground table is validated against those two pigments.');
  process.exit(1);
}

// | role | taupe `#766E64` | 4.57:1 † | taupe `#766E64` | 3.35:1 †† |
// Token cells name a pigment and may or may not repeat its hex; footnote daggers
// trail the ratio. Resolve by hex when present, else by pigment name.
function resolveToken(cell) {
  const hex = cell.match(/`(#[0-9A-Fa-f]{6})`/);
  if (hex) return hex[1];
  const word = cell.trim().replace(/`/g, '').split(/\s+/)[0];
  return pigments.get(word) ?? null;
}

const packRow = /^\|([^|]+)\|([^|]+)\|\s*([0-9.]+):1[^|]*\|([^|]+)\|\s*([0-9.]+):1[^|]*\|/gm;

let packRows = 0;
for (const [, role, lightCell, lightRatio, darkCell, darkRatio] of pack.matchAll(packRow)) {
  const light = resolveToken(lightCell);
  const dark = resolveToken(darkCell);
  if (!light || !dark) continue; // header/separator rows and prose tables
  packRows += 1;
  const label = role.trim().replace(/`/g, '');
  check('NOTA-BRAND-UIUX-PACK.md (light)', label, light, lightGround, Number.parseFloat(lightRatio));
  check('NOTA-BRAND-UIUX-PACK.md (dark)', label, dark, darkGround, Number.parseFloat(darkRatio));
}

// A vacuous pass is the failure mode this guard exists to prevent: if the tables
// are reformatted so nothing parses, silence would read as "all numbers correct".
if (designRows === 0 || packRows === 0) {
  console.error(
    `❌ Parsed ${designRows} DESIGN.md row(s) and ${packRows} brand-pack row(s) — expected both to be non-empty.`
  );
  console.error('   A contrast table was renamed, reformatted, or removed. Fix this script to match,');
  console.error('   rather than leaving the numbers unguarded.');
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`❌ ${failures.length} contrast claim(s) do not match the computed WCAG 2.1 ratio:`);
  for (const f of failures) console.error(`   - ${f}`);
  console.error('   Contrast is arithmetic — correct the doc, not this script.');
  process.exit(1);
}

console.log(
  `✅ Contrast claims verified — ${designRows} row(s) in DESIGN.md on ${ivory}, ${packRows} row(s) in the brand pack on ${lightGround}/${darkGround}.`
);
