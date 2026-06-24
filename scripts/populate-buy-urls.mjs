import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('🔍 Querying curated fragrances with null buy_url...\n');

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, name, brand, is_curated, buy_url')
    .eq('is_curated', true)
    .is('buy_url', null)
    .limit(500);

  if (error) {
    console.error('❌ Query error:', error);
    process.exit(1);
  }

  console.log(`✓ Found ${data.length} curated fragrances with null buy_url\n`);

  // Build updates
  const updates = data.map(row => {
    const query = `${row.brand} ${row.name}`.trim();
    const encodedQuery = encodeURIComponent(query);
    return {
      id: row.id,
      brand: row.brand,
      name: row.name,
      buy_url: `https://www.fragrancedirect.co.uk/search?q=${encodedQuery}`,
      buy_label: 'Buy on Fragrance Direct',
    };
  });

  // Preview first 10
  console.log('📋 PREVIEW (first 10 rows):\n');
  updates.slice(0, 10).forEach((row, i) => {
    console.log(`${i + 1}. ${row.brand} ${row.name}`);
    console.log(`   URL: ${row.buy_url}`);
    console.log();
  });

  console.log(`\n📊 Total to update: ${updates.length}`);

  // Check if --dry-run is set
  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log('\n✓ Dry run completed. Use without --dry-run to execute.');
    process.exit(0);
  }

  // Execute update
  console.log('\n⏳ Executing update...');

  const { error: updateError } = await supabase
    .from('fragrances')
    .upsert(
      updates.map(u => ({
        id: u.id,
        buy_url: u.buy_url,
        buy_label: u.buy_label,
      })),
      { onConflict: 'id' }
    );

  if (updateError) {
    console.error('❌ Update error:', updateError);
    process.exit(1);
  }

  console.log(`✅ Successfully updated ${updates.length} rows`);
}

main();
