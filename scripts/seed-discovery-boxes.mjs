import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

/**
 * Sample discovery boxes to seed.
 * Note: Shopify product IDs are placeholders — replace with real product IDs from your store.
 */
const SAMPLE_BOXES = [
  {
    name: 'Oud Essentials Sampler',
    slug: 'oud-essentials-sampler',
    description: 'Explore the richness of oud. Five carefully selected fragrances featuring prominent oud notes.',
    image_url: null,
    fragrance_ids: [], // Will be populated with real IDs
    shopify_product_id: 'gid://shopify/Product/OUD_SAMPLER_001',
    price_cents: 4999, // $49.99
    tier: 'discovery',
    theme: 'oud',
  },
  {
    name: 'Fresh & Citrus Collection',
    slug: 'fresh-citrus-collection',
    description: 'Bright, energizing scents perfect for daily wear. Discover your new everyday fragrance.',
    image_url: null,
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/FRESH_CITRUS_001',
    price_cents: 3999, // $39.99
    tier: 'discovery',
    theme: 'fresh',
  },
  {
    name: 'Warm & Spicy Journey',
    slug: 'warm-spicy-journey',
    description: 'Rich, inviting warmth with exotic spices. Perfect for cooler seasons and evening wear.',
    image_url: null,
    fragrance_ids: [],
    shopify_product_id: 'gid://shopify/Product/WARM_SPICY_001',
    price_cents: 4999, // $49.99
    tier: 'discovery',
    theme: 'warm',
  },
];

async function seedBoxes() {
  console.log('🌸 Seeding Discovery Boxes...');

  // Step 1: Fetch some fragrances to use in boxes
  console.log('📊 Fetching fragrances by theme...');

  const { data: oudFragrances } = await supabase
    .from('fragrances')
    .select('id')
    .ilike('plain_description', '%oud%')
    .limit(5);

  const { data: freshFragrances } = await supabase
    .from('fragrances')
    .select('id')
    .ilike('family', '%Fresh%')
    .limit(5);

  const { data: warmFragrances } = await supabase
    .from('fragrances')
    .select('id')
    .ilike('family', '%Warm%')
    .limit(5);

  const boxFragrances = [
    oudFragrances?.map(f => f.id) || [],
    freshFragrances?.map(f => f.id) || [],
    warmFragrances?.map(f => f.id) || [],
  ];

  // Step 2: Insert boxes
  const boxesToInsert = SAMPLE_BOXES.map((box, idx) => ({
    ...box,
    fragrance_ids: boxFragrances[idx],
  })).filter(box => box.fragrance_ids.length > 0);

  if (boxesToInsert.length === 0) {
    console.warn('⚠️  No fragrances found to populate boxes. Ensure fragrances table has data.');
    return;
  }

  console.log(`✅ Found fragrances. Inserting ${boxesToInsert.length} boxes...`);

  const { data, error } = await supabase
    .from('discovery_boxes')
    .insert(boxesToInsert)
    .select();

  if (error) {
    console.error('❌ Error inserting boxes:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data?.length || 0} discovery boxes!`);
  console.log('\nBoxes created:');
  data?.forEach(box => {
    console.log(`  • ${box.name} (${box.fragrance_ids.length} fragrances) — /boxes/${box.slug}`);
  });
}

seedBoxes().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
