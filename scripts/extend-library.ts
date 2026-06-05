import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface ScrapedFragrance {
  name: string;
  brand: string;
  clone_target?: string;
  accords: string[];
  olfactory_family: string;
  sillage_profile: 'Intense' | 'Moderate' | 'Intimate';
  versatility_score: number;
  notes?: string;
}

/**
 * 🕵️ Library Extender Pipeline
 * Targets structured clone catalogs and community repositories.
 */
async function extendLibrary() {
  console.log('🚀 Starting Library Extension Sprint...');

  // Target: Lattafa/Middle Eastern Clone House Catalog (Simulated/Mocked logic for speed)
  // In a real scenario, this would loop through paginated results from a target like fragrantica/lattafa.ae
  const targetUrls = [
    'https://dummy-perfume-db.com/houses/lattafa',
    'https://dummy-perfume-db.com/houses/afnan',
  ];

  for (const url of targetUrls) {
    try {
      console.log(`📡 Fetching ${url}...`);
      // const response = await fetch(url);
      // const html = await response.text();
      // const $ = cheerio.load(html);
      
      // Mocked extraction for demonstration based on Cheerio selector logic
      const scrapedData: ScrapedFragrance[] = [
        {
          name: 'Asad',
          brand: 'Lattafa',
          clone_target: 'Dior Sauvage Elixir',
          accords: ['Warm Spicy', 'Amber', 'Vanilla', 'Woody'],
          olfactory_family: 'Oriental',
          sillage_profile: 'Intense',
          versatility_score: 8,
          notes: 'Black Pepper, Tobacco, Pineapple, Patchouli, Coffee, Vanilla, Amber, Benzoin'
        },
        {
          name: 'Khamrah',
          brand: 'Lattafa',
          clone_target: 'By Kilian Angels Share',
          accords: ['Sweet', 'Warm Spicy', 'Amber', 'Vanilla', 'Cinnamon'],
          olfactory_family: 'Gourmand',
          sillage_profile: 'Intense',
          versatility_score: 6,
          notes: 'Cognac, Cinnamon, Tonka Bean, Oak, Praline, Vanilla, Sandalwood'
        },
        {
          name: '9pm',
          brand: 'Afnan',
          clone_target: 'Jean Paul Gaultier Ultra Male',
          accords: ['Vanilla', 'Sweet', 'Fruity', 'Warm Spicy'],
          olfactory_family: 'Amber Vanilla',
          sillage_profile: 'Intense',
          versatility_score: 7,
          notes: 'Apple, Cinnamon, Lavender, Bergamot, Orange Blossom, Lily-of-the-Valley, Vanilla, Amber'
        }
      ];

      console.log(`✅ Scraped ${scrapedData.length} fragrances from ${url}. Normalizing...`);

      // Batch Upsert into Supabase
      const { error } = await supabase
        .from('fragrances')
        .upsert(
          scrapedData.map(f => ({
            name: f.name,
            brand: f.brand,
            clone_target: f.clone_target,
            accords: f.accords,
            olfactory_family: f.olfactory_family,
            sillage_profile: f.sillage_profile,
            versatility_score: f.versatility_score,
            notes: f.notes
          })),
          { onConflict: 'brand, name' }
        );

      if (error) throw error;
      console.log(`💎 Successfully integrated ${scrapedData.length} new profiles into Scentral Hub.`);

      // Rate limiting / Throttling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.error(`❌ Error extending library from ${url}:`, err);
    }
  }

  console.log('🏁 Library extension complete.');
}

extendLibrary();
