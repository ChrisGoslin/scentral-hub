import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
  // Query information_schema.columns directly using .from() if possible (usually not)
  // Or just try to select from 'collections' and see what we get
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from collections:', error.message);
  } else {
    console.log('Collections exists. Sample data:', data);
  }

  const { data: data2, error: error2 } = await supabase
    .from('user_collection')
    .select('*')
    .limit(1);

  if (error2) {
    console.error('Error selecting from user_collection:', error2.message);
  } else {
    console.log('user_collection exists. Sample data:', data2);
  }
}

checkSchema();
