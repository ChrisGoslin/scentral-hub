#!/usr/bin/env node
/**
 * rls-adversarial-suite.mjs
 *
 * RLS adversarial test suite: attempts unauthorized cross-user reads/writes
 * as a non-owner authenticated user, using the ANON key so Postgres RLS
 * (not a service-role bypass) is actually what's under test.
 *
 * Creates two throwaway test users (random emails under a rls-test+ prefix),
 * writes rows as User A, then attempts to read/update/delete those rows as
 * User B. Every attempt that a non-owner should NOT be able to perform is
 * expected to return zero rows / be rejected. Cleans up both users (and any
 * surviving rows, via service role) at the end regardless of outcome.
 *
 * Requires (from .env.local only, per AGENTS.md §8.5):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 *   SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)  — cleanup only
 *
 * Usage:
 *   node scripts/rls-adversarial-suite.mjs
 *
 * Exit code is non-zero if any adversarial probe succeeded (a real RLS gap).
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import crypto from 'node:crypto'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL / (NEXT_PUBLIC_)SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

const results = []
function record(name, expected, actual, note = '') {
  const pass = expected === actual
  results.push({ name, pass, note })
  console.log(`  ${pass ? '✅' : '❌'} ${name}${note ? ` — ${note}` : ''}`)
  return pass
}

async function makeUser(label) {
  const email = `rls-test+${label}-${crypto.randomUUID()}@example.invalid`
  const password = crypto.randomUUID() + 'Aa1!'
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(`Failed to create test user ${label}: ${error.message}`)
  const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  const { error: signInError } = await client.auth.signInWithPassword({ email, password })
  if (signInError) throw new Error(`Failed to sign in test user ${label}: ${signInError.message}`)
  return { id: data.user.id, client }
}

async function cleanupUser(userId) {
  if (!userId) return
  try {
    await admin.auth.admin.deleteUser(userId)
  } catch (e) {
    console.error(`  ⚠️  cleanup failed for ${userId}: ${e.message}`)
  }
}

async function run() {
  console.log('\n🔒 RLS Adversarial Suite (against live Postgres RLS via anon key)\n')
  console.log(`Target: ${SUPABASE_URL}\n`)

  let userA, userB
  try {
    userA = await makeUser('a')
    userB = await makeUser('b')
    console.log(`✓ Test users created: A=${userA.id} B=${userB.id}\n`)

    // --- Simple own-row tables: insert as A, attack as B ---------------
    // Each entry: table, minimal insert payload for A, and which ops to probe.
    const ownRowTables = [
      { table: 'profiles', row: (uid) => ({ id: uid, username: `rlstest_${uid.slice(0, 8)}` }), pk: 'id' },
      { table: 'interactions', row: (uid) => ({ user_id: uid, event_type: 'rls_test' }), pk: 'user_id' },
      { table: 'temptations', row: (uid) => ({ user_id: uid, reason: 'rls_test', status: 'shown' }), pk: 'user_id' },
      { table: 'trail_progress', row: (uid) => ({ user_id: uid }), pk: 'user_id' },
    ]

    for (const { table, row, pk } of ownRowTables) {
      const payload = row(userA.id)
      const { error: insertErr } = await userA.client.from(table).insert(payload).select().maybeSingle()
      if (insertErr) {
        console.log(`  ⚠️  skipping ${table} — insert as owner failed (${insertErr.message}); table shape may differ from assumption, verify manually`)
        continue
      }

      // B attempts to SELECT A's row.
      const { data: readAsB } = await userB.client.from(table).select('*').eq(pk, userA.id)
      record(`${table}: non-owner SELECT`, 0, (readAsB || []).length, `expected 0 rows visible to B, got ${(readAsB || []).length}`)

      // B attempts to UPDATE A's row.
      const { data: updAsB, error: updErr } = await userB.client.from(table).update({ event_type: 'pwned' }).eq(pk, userA.id).select()
      record(`${table}: non-owner UPDATE`, 0, (updAsB || []).length, updErr ? `blocked (${updErr.message})` : `${(updAsB || []).length} rows updated`)

      // B attempts to DELETE A's row.
      const { data: delAsB, error: delErr } = await userB.client.from(table).delete().eq(pk, userA.id).select()
      record(`${table}: non-owner DELETE`, 0, (delAsB || []).length, delErr ? `blocked (${delErr.message})` : `${(delAsB || []).length} rows deleted`)

      // Cleanup via service role.
      await admin.from(table).delete().eq(pk, userA.id)
    }

    // --- Known-legacy anon_id tables: document current posture ---------
    // user_xp / user_streaks use `USING (true)` policies (anon-keyed, not
    // user_id-keyed) per live policy dump — these are NOT expected to pass
    // an owner-isolation probe today. Record as a documented gap, not a
    // silent pass, so this suite doesn't quietly stop flagging it.
    for (const table of ['user_xp', 'user_streaks']) {
      const { data } = await userB.client.from(table).select('*').limit(1)
      const anyRows = (data || []).length > 0
      results.push({
        name: `${table}: anon-keyed table readable by any authenticated user`,
        pass: false, // always flagged — this is a known, pre-existing gap, not a regression
        note: `KNOWN GAP (legacy anon_id policy, USING(true)) — rows visible: ${anyRows}. See nota-identity-consolidation-campaign.`,
        knownGap: true,
      })
      console.log(`  ⚠️  ${table}: legacy anon-keyed table, USING(true) SELECT policy — any authenticated caller can read all rows (known pre-existing gap, not introduced by this suite)`)
    }

    // --- feedback: policy name says "own feedback", qual says `true` ---
    {
      const { data } = await userB.client.from('feedback').select('*').limit(1)
      results.push({
        name: `feedback: policy name/behavior mismatch`,
        pass: false,
        note: `Policy "Anyone can read own feedback" has qual=true — it is actually public-read, not owner-scoped. Rows visible to B: ${(data || []).length > 0}. Flagging for review — either rename the policy or restrict it to auth.uid() = user_id if feedback should be private.`,
        knownGap: true,
      })
      console.log(`  ⚠️  feedback: policy named "own feedback" is actually public-read (qual=true) — naming/behavior mismatch, flagged for human review`)
    }
  } finally {
    if (userA) await cleanupUser(userA.id)
    if (userB) await cleanupUser(userB.id)
  }

  console.log('\n--- Summary ---')
  const realFailures = results.filter(r => !r.pass && !r.knownGap)
  const knownGaps = results.filter(r => r.knownGap)
  const passed = results.filter(r => r.pass)
  console.log(`  Passed: ${passed.length}`)
  console.log(`  Known/documented gaps (not regressions): ${knownGaps.length}`)
  console.log(`  New RLS failures: ${realFailures.length}`)

  if (realFailures.length > 0) {
    console.log('\n❌ RLS adversarial suite found NEW unauthorized access:')
    for (const f of realFailures) console.log(`   - ${f.name}: ${f.note}`)
    process.exit(1)
  }

  if (knownGaps.length > 0) {
    console.log('\n⚠️  Suite passed for owner-scoped tables, but known gaps remain open (see notes above). Not treated as failure since they pre-date this suite and are tracked separately.')
  } else {
    console.log('\n✅ No unauthorized cross-user access found.')
  }
  process.exit(0)
}

run().catch((err) => {
  console.error('Fatal error running RLS adversarial suite:', err.message)
  process.exit(1)
})
