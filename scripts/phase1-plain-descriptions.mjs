#!/usr/bin/env node
// Phase 1: Generate plain_description for all fragrances via Claude Haiku

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env from .env.local
const envFile = readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => {
      const idx = l.indexOf('=');
      const key = l.slice(0, idx).trim();
      let val = l.slice(idx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      return [key, val];
    })
);

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

const BATCH_SIZE = 10;
const DELAY_MS = 500;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateDescriptions(batch) {
  const prompt = `You are writing product descriptions for a fragrance app aimed at people new to collecting.
Write ONE sentence per fragrance in plain English — no jargon, no note pyramids.
Focus on: how it smells in everyday language, when/where to wear it, and longevity if notable.
Max 20 words per description.

Fragrances:
${JSON.stringify(batch, null, 2)}

Return a JSON array ONLY (no markdown, no explanation): [{ "id": "...", "plain_description": "..." }]`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  // Fetch all fragrances missing plain_description
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, projection, anosmia_risk, optimal_season, top_notes, heart_notes, base_notes')
    .is('plain_description', null)
    .order('brand');

  if (error) {
    console.error('DB fetch error:', error.message);
    process.exit(1);
  }

  console.log(`Found ${fragrances.length} fragrances needing plain_description`);

  const batches = [];
  for (let i = 0; i < fragrances.length; i += BATCH_SIZE) {
    batches.push(fragrances.slice(i, i + BATCH_SIZE));
  }

  let totalWritten = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Batch ${i + 1}/${batches.length} (${batch.length} fragrances)...`);

    let results;
    try {
      results = await generateDescriptions(batch);
    } catch (err) {
      console.error(`  Haiku error on batch ${i + 1}:`, err.message);
      if (i < batches.length - 1) await sleep(DELAY_MS);
      continue;
    }

    // Write each result back
    for (const { id, plain_description } of results) {
      if (!plain_description) continue;
      const { error: updateErr } = await supabase
        .from('fragrances')
        .update({ plain_description })
        .eq('id', id);
      if (updateErr) {
        console.error(`  Update error for ${id}:`, updateErr.message);
      } else {
        totalWritten++;
      }
    }

    console.log(`  Batch ${i + 1}/${batches.length} complete (${totalWritten} total written)`);

    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  // Verify
  const { data: verified } = await supabase
    .from('fragrances')
    .select('id', { count: 'exact', head: true })
    .not('plain_description', 'is', null);

  console.log(`\nDone. ${totalWritten} descriptions written this run.`);
  console.log(`Verification: ${verified?.length ?? 'unknown'} fragrances now have plain_description`);

  // Final count via count query
  const { count } = await supabase
    .from('fragrances')
    .select('*', { count: 'exact', head: true })
    .not('plain_description', 'is', null);
  console.log(`Total with plain_description: ${count}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
