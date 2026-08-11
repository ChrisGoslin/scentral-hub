import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
  console.error('Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: { apiVersion: 'v1' }
});

async function backfill() {
  console.log('🚀 Starting Resonance Backfill...');

  // 1. Fetch fragrances missing embedding
  const { data: fragrances, error: fetchError } = await supabase
    .from('fragrances')
    .select('id, brand, name, family, top_notes, heart_notes, base_notes')
    .is('embedding', null);

  if (fetchError) {
    console.error('❌ Failed to fetch fragrances:', fetchError.message);
    return;
  }

  console.log(`🔍 Found ${fragrances.length} fragrances needing enrichment.`);

  let success = 0;
  let failed = 0;

  for (const f of fragrances) {
    try {
      // Build text from note arrays
      const notesText = [
        f.top_notes?.join(', '),
        f.heart_notes?.join(', '),
        f.base_notes?.join(', ')
      ].filter(Boolean).join('; ');
      
      const text = `${f.brand} ${f.name}. Family: ${f.family || 'Unknown'}. Notes: ${notesText || 'N/A'}`;
      console.log(`✨ Embedding [${f.brand}] ${f.name}...`);

      const result = await genAI.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text
      });
      const embedding = result.embeddings?.[0]?.values;

      if (!embedding) {
        throw new Error('Google GenAI returned no embedding values');
      }

      if (embedding.length !== 3072) {
        throw new Error(`Unexpected embedding length: ${embedding.length}`);
      }

      // Update BOTH embedding (vector type literal) and primary_vector (JSON string for legacy)
      const updateData = {
        embedding: `[${embedding.join(',')}]`,
        primary_vector: JSON.stringify(embedding)
      };

      const { error: updateError } = await supabase
        .from('fragrances')
        .update(updateData)
        .eq('id', f.id);

      if (updateError) {
        throw updateError;
      }

      success++;
    } catch (err) {
      console.error(`❌ Failed enrichment for ${f.id}:`, err.message);
      failed++;
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log('===============');
}

backfill();
