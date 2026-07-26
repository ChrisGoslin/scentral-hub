// Diagnostic utility: print environment variable status for development/debugging.
// Useful when scripts behave unexpectedly and env vars may be misconfigured.
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('--- Diagnostic Environment Inspection ---');
console.log('GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('GOOGLE_CUSTOM_SEARCH_KEY (masked):', process.env.GOOGLE_CUSTOM_SEARCH_KEY ? '****' + process.env.GOOGLE_CUSTOM_SEARCH_KEY.slice(-4) : 'NOT SET');
console.log('----------------------------------------');
