#!/usr/bin/env node
/**
 * dsar-delete-user.mjs
 * DSAR (Data Subject Access Request) user deletion script
 * Deletes all personal data for a user across all tables.
 * 
 * Requires explicit --confirm flag to execute (otherwise dry-run).
 * 
 * Usage:
 *   node scripts/dsar-delete-user.mjs <user-id>
 *   node scripts/dsar-delete-user.mjs <user-id> --dry-run
 *   node scripts/dsar-delete-user.mjs <user-id> --confirm
 */

import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const userId = args[0]
const isDryRun = args.includes('--dry-run') || !args.includes('--confirm')
const isConfirmed = args.includes('--confirm')

if (!userId) {
  console.error('Usage: node dsar-delete-user.mjs <user-id> [--dry-run|--confirm]')
  process.exit(1)
}

// Validate UUID format
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
  console.error('Invalid user ID format (not a valid UUID)')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Tables that will cascade-delete via user_id FK constraint
const CASCADE_DELETE_TABLES = [
  'noseprints',
  'shelf_items',
  'shelf_events',
  'blind_ranking_sessions',
  'blind_ranking_choices',
  'traces',
  'trace_reactions',
  'trails',
  'trail_steps',
  'trail_progress',
  'temptations',
  'evolution_events',
  'noseprint_history',
  'interactions',
  'insights_cache',
  'aura_cache',
  'collections',
  'wear_logs',
  'spritz_schedules',
  'wear_posts',
  'post_likes',
  'creator_reels',
  'swap_offers',
  'feedback',
]

async function run() {
  console.log(`\n🔒 DSAR User Deletion ${isDryRun ? '(DRY-RUN)' : '(CONFIRMED)'}`)
  console.log(`   User ID: ${userId}`)
  console.log(`   Mode: ${isDryRun ? 'DRY-RUN (no changes)' : 'CONFIRMED (will delete)'}`)
  console.log()

  // Verify user exists
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
  if (authError || !authUser?.user) {
    console.error(`❌ User not found (or no access): ${authError?.message || 'Unknown error'}`)
    process.exit(1)
  }

  console.log(`✓ User found: ${authUser.user.email || '(no email)'}`)
  console.log()

  const deletedCounts = {}

  // Collect row counts for each table (dry-run or actual)
  console.log('Scanning tables...')
  for (const table of CASCADE_DELETE_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      // Table might not exist or user has no rows — silent skip
      continue
    }

    if (count && count > 0) {
      deletedCounts[table] = count
      console.log(`  ${table}: ${count} rows`)
    }
  }

  // Check profiles table (keyed by anon_id, may link to this user)
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('anon_id', { count: 'exact' })
    .eq('user_id', userId)

  if (!profilesError && profilesData && profilesData.length > 0) {
    deletedCounts['profiles'] = profilesData.length
    console.log(`  profiles: ${profilesData.length} rows`)
  }

  console.log()

  const totalRows = Object.values(deletedCounts).reduce((a, b) => a + b, 0)
  console.log(`Total rows to delete: ${totalRows}`)
  console.log()

  if (isDryRun) {
    console.log('✓ DRY-RUN complete. No changes made.')
    console.log()
    console.log('To actually delete this user, run:')
    console.log(`  node scripts/dsar-delete-user.mjs ${userId} --confirm`)
    console.log()
    process.exit(0)
  }

  if (!isConfirmed) {
    console.log('⚠️  This action is permanent. Add --confirm to execute.')
    process.exit(1)
  }

  // Confirmed execution: delete the user
  console.log('Executing deletions...')
  console.log()

  // Delete from auth.users → all CASCADE rules will trigger
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

  if (deleteError) {
    console.error(`❌ Failed to delete user from auth.users: ${deleteError.message}`)
    process.exit(1)
  }

  console.log('✅ User deleted from auth.users (all cascades triggered)')
  console.log()
  console.log('Summary:')
  for (const [table, count] of Object.entries(deletedCounts)) {
    console.log(`  ${table}: ${count} rows deleted`)
  }
  console.log()
  console.log(`✅ DSAR deletion complete for ${userId}`)
}

run().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
