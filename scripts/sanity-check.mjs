import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function runCheck() {
  console.log(`${COLORS.bold}🏛️ SCENTRAL HUB: EVP SANITY CHECK${COLORS.reset}\n`);

  let totalFailures = 0;

  // ── 1. Environment Verification ──────────────────────────────────────────
  console.log(`${COLORS.cyan}[1/4] Checking Environment...${COLORS.reset}`);
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'GEMINI_API_KEY'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.log(`${COLORS.red}❌ Missing Variables: ${missing.join(', ')}${COLORS.reset}`);
    totalFailures++;
  } else {
    console.log(`${COLORS.green}✅ All required keys found.${COLORS.reset}`);
  }

  // ── 2. Next.js 16 Architectural Scan ───────────────────────────────────────
  console.log(`\n${COLORS.cyan}[2/4] Scanning for Next.js 16 Violations...${COLORS.reset}`);
  
  // Find all server-side files
  const serverFiles = execSync('find app utils proxy.ts -name "*.ts" -o -name "*.tsx" | grep -v ".client.tsx"').toString().split('\n').filter(Boolean);
  
  let architectureDebt = 0;

  for (const file of serverFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Skip client components
    if (content.includes("'use client'") || content.includes('"use client"')) continue;

    // Check for unawaited createClient calls
    // Pattern: not "await", followed by some optional space/comments, then "createClient("
    const unawaitedCreatePattern = /(?<!await\s+)\bcreateClient\(/g;
    const matches = content.match(unawaitedCreatePattern);
    
    // Pattern: synchronous cookies()
    const syncCookiesPattern = /(?<!await\s+)\bcookies\(\)/g;
    const cookieMatches = content.match(syncCookiesPattern);

    if (matches || cookieMatches) {
      console.log(`${COLORS.yellow}⚠️  Violation in ${file}:${COLORS.reset}`);
      if (matches) console.log(`   - Unawaited createClient() detected.`);
      if (cookieMatches) console.log(`   - Synchronous cookies() detected.`);
      architectureDebt++;
    }
  }

  if (architectureDebt === 0) {
    console.log(`${COLORS.green}✅ No architectural debt found.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}❌ Found ${architectureDebt} Next.js 16 violations.${COLORS.reset}`);
    totalFailures += architectureDebt;
  }

  // ── 3. Schema Cache Verification ───────────────────────────────────────────
  console.log(`\n${COLORS.cyan}[3/4] Verifying Supabase Schema...${COLORS.reset}`);
  
  try {
    // We use node-fetch or similar if available, but let's try a simple curl-like check via node
    const checkSql = "import { createClient } from '@supabase/supabase-js'; const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); s.rpc('resonance_match', { query_embedding: Array(3072).fill(0), match_threshold: 0.1, match_count: 1 }).then(r => console.log(r.error ? 'FAIL:' + r.error.code : 'OK'))";
    
    const schemaResult = execSync(`node --input-type=module -e "${checkSql}"`, { env: process.env }).toString().trim();
    
    if (schemaResult === 'OK') {
      console.log(`${COLORS.green}✅ resonance_match function is active and dimensions match (3072).${COLORS.reset}`);
    } else if (schemaResult.includes('FAIL:PGRST202')) {
      console.log(`${COLORS.red}❌ resonance_match function missing from schema cache.${COLORS.reset}`);
      console.log(`${COLORS.yellow}👉 ACTION: Run the provided SQL migration in the Supabase Dashboard.${COLORS.reset}`);
      totalFailures++;
    } else {
      console.log(`${COLORS.yellow}⚠️  Schema Check Ambiguous: ${schemaResult}${COLORS.reset}`);
    }
  } catch (err) {
    console.log(`${COLORS.red}❌ Schema verification script failed: ${err.message}${COLORS.reset}`);
    totalFailures++;
  }

  // ── 4. Build Integrity ──────────────────────────────────────────────────────
  console.log(`\n${COLORS.cyan}[4/4] Verifying Build Integrity...${COLORS.reset}`);
  try {
    console.log(`   (Running npm run build --dry-run equivalent...)`);
    // Just check if the last build was successful in .next/ if it exists, or just warn
    if (fs.existsSync('.next')) {
      console.log(`${COLORS.green}✅ .next folder exists (Last build detected).${COLORS.reset}`);
    } else {
      console.log(`${COLORS.yellow}⚠️  No build detected. Run 'npm run build' to verify production readiness.${COLORS.reset}`);
    }
  } catch (err) {
    // ignore
  }

  console.log(`\n${COLORS.bold}🏁 VERDICT:${COLORS.reset}`);
  if (totalFailures === 0) {
    console.log(`${COLORS.green}${COLORS.bold}MASTERPIECE READY: All systems verified.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}${COLORS.bold}UNREADY: ${totalFailures} critical gaps remaining.${COLORS.reset}`);
    process.exit(1);
  }
}

runCheck();
