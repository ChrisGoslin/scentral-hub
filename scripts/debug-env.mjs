import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly to match how the real scripts load it
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('--- Diagnostic Environment Inspection ---');
console.log('GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('GOOGLE_CUSTOM_SEARCH_KEY (masked):', process.env.GOOGLE_CUSTOM_SEARCH_KEY ? '****' + process.env.GOOGLE_CUSTOM_SEARCH_KEY.slice(-4) : 'NOT SET');
console.log('----------------------------------------');
