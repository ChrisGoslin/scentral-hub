#!/usr/bin/env node
// Phase 2 v2: Backfill inspired_by with richer prompt + known mappings seed

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => {
      const idx = l.indexOf('=');
      const key = l.slice(0, idx).trim();
      let val = l.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      return [key, val];
    })
);

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

const BATCH_SIZE = 15;
const DELAY_MS = 600;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Well-known mappings to seed the prompt with context
const KNOWN_EXAMPLES = `Known examples of inspired-by fragrances:
- Afnan 9PM → Paco Rabanne Invictus
- Armaf Club de Nuit Intense Man → Creed Aventus
- Lattafa Asad → Creed Aventus
- Lattafa Khamrah → Kilian Angels' Share
- Lattafa Raghba → Tobacco Vanille Tom Ford
- Armaf Sillage → Creed Original Sillage
- Afnan Supremacy Silver → Creed Silver Mountain Water
- Swiss Arabian Warde → Frederic Malle Portrait of a Lady
- Al Haramain Amber Oud → Maison Margiela Replica Jazz Club
- Armaf Tres Nuit → Bleu de Chanel
- Afnan Soiree → Jean Paul Gaultier Scandal
- Rasasi Hawas → Acqua di Gio Profondo Giorgio Armani`;

async function getInspiredBy(batch) {
  const prompt = `You are a fragrance expert specialising in Middle Eastern fragrance houses and their inspired-by relationships to Western designer fragrances.

${KNOWN_EXAMPLES}

For each fragrance below, identify the well-known designer fragrance it is commonly inspired by or compared to.
Return a value if you are reasonably confident (>70% confidence). Return null only if you genuinely don't know.
Use the full "Brand FragranceName" format (e.g. "Creed Aventus", "Dior Sauvage").

Fragrances:
${JSON.stringify(batch, null, 2)}

Return a JSON array ONLY (no markdown, no explanation):
[{ "id": "...", "inspired_by": "Brand FragranceName" | null }]`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, top_notes, heart_notes, base_notes, projection')
    .is('inspired_by', null)
    .order('brand');

  if (error) { console.error('DB fetch error:', error.message); process.exit(1); }
  console.log(`Found ${fragrances.length} fragrances needing inspired_by`);

  const batches = [];
  for (let i = 0; i < fragrances.length; i += BATCH_SIZE) {
    batches.push(fragrances.slice(i, i + BATCH_SIZE));
  }

  let totalWritten = 0;
  let totalSkipped = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(`Batch ${i + 1}/${batches.length}... `);

    let results;
    try {
      results = await getInspiredBy(batch);
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
      await sleep(DELAY_MS * 3);
      continue;
    }

    let batchWritten = 0;
    for (const { id, inspired_by } of results) {
      if (!inspired_by) { totalSkipped++; continue; }
      const { error: updateErr } = await supabase
        .from('fragrances')
        .update({ inspired_by })
        .eq('id', id);
      if (!updateErr) {
        const frag = batch.find(f => f.id === id);
        console.log(`\n  ✓ ${frag?.brand} ${frag?.name} → ${inspired_by}`);
        totalWritten++;
        batchWritten++;
      }
    }
    if (batchWritten === 0) process.stdout.write(`(none matched)\n`);

    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  const { count } = await supabase
    .from('fragrances')
    .select('*', { count: 'exact', head: true })
    .not('inspired_by', 'is', null);

  console.log(`\n── Done ─────────────────────────────────────────`);
  console.log(`Written this run:      ${totalWritten}`);
  console.log(`No match:              ${totalSkipped}`);
  console.log(`Total with inspired_by: ${count}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
