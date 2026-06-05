import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;

const NOTES_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    top_notes:   { type: Type.ARRAY, items: { type: Type.STRING } },
    heart_notes: { type: Type.ARRAY, items: { type: Type.STRING } },
    base_notes:  { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['top_notes', 'heart_notes', 'base_notes'],
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inferNotes(brand, name, family) {
  const prompt = `You are a fragrance expert. Infer realistic top notes, heart notes, and base notes for this fragrance based on its name and olfactory family.

Fragrance: "${brand} ${name}"
Family: "${family || 'Unknown'}"

Rules:
- Provide 2–5 specific ingredient names per category (e.g. "Bergamot", "Sandalwood", "Ambroxan").
- Use proper fragrance note names, not descriptions.
- Base inference on the brand's known style and the fragrance name cues.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: NOTES_SCHEMA,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  return JSON.parse(text);
}

async function main() {
  console.log('🌸 Scentral — Note Enrichment Script');
  console.log('=====================================\n');

  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, family')
    .is('top_notes', null)
    .order('brand');

  if (error) {
    console.error('❌ Failed to fetch fragrances:', error.message);
    process.exit(1);
  }

  console.log(`Found ${fragrances.length} fragrance(s) with null top_notes\n`);

  if (fragrances.length === 0) {
    console.log('Nothing to enrich. Exiting.');
    return;
  }

  const totalBatches = Math.ceil(fragrances.length / BATCH_SIZE);
  let success = 0;
  let failed = 0;

  for (let i = 0; i < fragrances.length; i += BATCH_SIZE) {
    const batch = fragrances.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`── Batch ${batchNum}/${totalBatches} ──────────────────────`);

    for (const f of batch) {
      try {
        const notes = await inferNotes(f.brand, f.name, f.family);

        const { error: updateError } = await supabase
          .from('fragrances')
          .update({
            top_notes:   notes.top_notes,
            heart_notes: notes.heart_notes,
            base_notes:  notes.base_notes,
          })
          .eq('id', f.id);

        if (updateError) {
          console.error(`  ✗ [${f.brand}] ${f.name} — DB update failed: ${updateError.message}`);
          failed++;
        } else {
          console.log(`  ✓ [${f.brand}] ${f.name}`);
          console.log(`    Top:   ${notes.top_notes.join(', ')}`);
          console.log(`    Heart: ${notes.heart_notes.join(', ')}`);
          console.log(`    Base:  ${notes.base_notes.join(', ')}`);
          success++;
        }
      } catch (err) {
        console.error(`  ✗ [${f.brand}] ${f.name} — ${err.message}`);
        failed++;
      }
    }

    if (i + BATCH_SIZE < fragrances.length) {
      console.log(`\n  ⏱  Waiting ${BATCH_DELAY_MS}ms before next batch...\n`);
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`✓ Enriched: ${success}`);
  console.log(`✗ Failed:   ${failed}`);
  if (failed > 0) {
    console.log('\nRe-run to retry failed entries (they remain null and will be picked up again).');
  }
}

main();
