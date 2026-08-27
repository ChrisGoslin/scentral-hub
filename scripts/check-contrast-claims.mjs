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

// Published values carry two decimals, so rounding explains at most 0.005 and anything
// beyond that is a real discrepancy. An earlier 0.05 here was ten times too loose: it
// would have accepted a 4.61 claim for a token measuring 4.57, which is exactly the
// kind of near-boundary error (AA normal text is 4.5:1) this guard exists to catch.
// Verified achievable — the worst true delta across the shipped tables is 0.0046.
const TOLERANCE = 0.005;

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

// ---- Prose claims: ratios stated in body text, not tables -------------------
//
// Tables are not the only place a ratio gets published. DESIGN.md's front matter and
// several passages state ratios inline, and one of them (#989188 at "5.38:1") was
// wrong by 0.02 — below the old 0.05 tolerance and invisible to a table-only parser.
//
// The rule for what counts as a claim: a hex literal AND a ratio in the SAME sentence.
// That is not merely convenient, it is what makes the check safe. Both docs contain
// narrative passages that must quote the retired wrong figures in order to retract
// them ("the long-standing 10.35:1 figure is wrong — the true ratio is 4.57:1"), and
// those sentences name no hex. Requiring a hex literal excludes every retraction
// without needing a list of exemptions to maintain.

// Known limitation, stated rather than implied: segmentation is approximate, so a
// neighbouring sentence in the same block can supply the ground word. That is the safe
// direction to be wrong in — a mis-resolved ground yields a loud mismatch a human then
// checks, never a silent pass. What it must never do is guess when nothing names a
// ground, so that case fails explicitly.

// Ground keywords, longest first so "shipped ground" wins over a bare "ground".
const GROUND_WORDS = [
  [/\bshipped ground\b|\bevening bench\b|\bdark ground\b|\bon dark\b|#1F1D1A/i, () => darkGround],
  [/\bivory\b|\blight ground\b|#F7F4EE/i, () => lightGround],
];

function groundFor(text, subjectHex) {
  // A ground token is itself a hex, so ignore the claim's own colour when matching.
  const withoutSubject = subjectHex ? text.split(subjectHex).join(' ') : text;
  return GROUND_WORDS.find(([re]) => re.test(withoutSubject))?.[1]();
}

// Check one unit of text known to hold at most one claim. `inheritedGround` carries the
// enclosing block's ground so a wrapped continuation line ("...and taupe #766E64
// (4.57:1) is atmospheric.") is still checkable against the ground its sentence named.
function checkUnit(unit, source, inheritedGround, onAmbiguous) {
  if (/^\s*\|/.test(unit)) return; // table rows are handled by the parsers above
  const hexes = [...unit.matchAll(/(#[0-9A-Fa-f]{6})/g)].map((m) => m[1]);
  const ratios = [...unit.matchAll(/\*{0,2}([0-9]+\.[0-9]+)\*{0,2}:1/g)].map((m) =>
    Number.parseFloat(m[1])
  );
  if (hexes.length === 0 || ratios.length === 0) return;

  if (hexes.length !== 1 || ratios.length !== 1) {
    onAmbiguous(hexes.length, ratios.length);
    return;
  }

  const [hex] = hexes;
  const [claimed] = ratios;
  const ground = groundFor(unit, hex) ?? inheritedGround;

  if (!ground) {
    failures.push(
      `${source} (prose): "${unit.trim().slice(0, 80)}…" states ${claimed}:1 for ${hex} ` +
        'but names no ground. Name the ground (ivory / dark) so the number can be checked.'
    );
    return;
  }
  check(`${source} (prose)`, 'inline claim', hex, ground, claimed);
}

function proseClaims(text, source) {
  // Sentence-ish segmentation: markdown line breaks mid-sentence are common, so split
  // on sentence terminators and blank lines rather than on newlines.
  const segments = text.split(/\n\s*\n|(?<=[.!?])\s+/);

  for (const segment of segments) {
    const flat = segment.replace(/\n/g, ' ');
    checkUnit(flat, source, undefined, () => {
      // A block holding several claims is not a failure if each LINE inside it holds
      // exactly one — the YAML front matter is exactly that shape. Retry line by line,
      // inheriting the block's ground, and only report ambiguity a line cannot resolve.
      const blockGround = groundFor(flat, null);
      for (const line of segment.split('\n')) {
        checkUnit(line, source, blockGround, (h, r) => {
          failures.push(
            `${source} (prose): "${line.trim().slice(0, 70)}…" pairs ${h} hex value(s) with ` +
              `${r} ratio(s), so no claim can be checked unambiguously. Split it so each ` +
              'colour and its ratio sit on their own line.'
          );
        });
      }
    });
  }
}

proseClaims(design, 'DESIGN.md');
proseClaims(pack, 'NOTA-BRAND-UIUX-PACK.md');

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
