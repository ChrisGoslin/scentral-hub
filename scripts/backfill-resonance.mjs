import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function backfill() {
  console.log('🚀 Starting Resonance Backfill...');

  // 1. Fetch fragrances missing primary_vector
  const { data: fragrances, error: fetchError } = await supabase
    .from('fragrances')
    .select('id, brand, name, notes')
    .is('primary_vector', null);

  if (fetchError) {
    console.error('❌ Failed to fetch fragrances:', fetchError.message);
    return;
  }

  console.log(`🔍 Found ${fragrances.length} fragrances needing enrichment.`);

  let success = 0;
  let failed = 0;

  for (const f of fragrances) {
    try {
      const text = `${f.brand} ${f.name}. Notes: ${f.notes || 'N/A'}`;
      console.log(`✨ Embedding [${f.brand}] ${f.name}...`);

      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      if (embedding.length !== 3072) {
        throw new Error(`Unexpected embedding length: ${embedding.length}`);
      }

      // Update BOTH primary_vector (text legacy) and embedding (vector type if it exists)
      const updateData = {
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
