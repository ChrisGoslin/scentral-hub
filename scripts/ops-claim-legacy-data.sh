#!/bin/bash
# Force-claim legacy anon_id data to a user_id

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./ops-claim-legacy-data.sh <user-uuid> <anon-id>"
  echo ""
  echo "This script manually claims legacy anon_id data to an authenticated user_id."
  echo ""
  echo "Example:"
  echo "  ./ops-claim-legacy-data.sh 550e8400-e29b-41d4-a716-446655440000 550e8400-e29b-legacy"
  exit 1
fi

USER_ID=$1
ANON_ID=$2

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Claim Legacy Data                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "User ID:  $USER_ID"
echo "Anon ID:  $ANON_ID"
echo ""

read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo "Claiming data..."
echo ""

# Run migrations
cat > /tmp/claim-migration.sql << EOF
-- Claim temptations
UPDATE temptations SET user_id = '$USER_ID' WHERE anon_id = '$ANON_ID' AND user_id IS NULL;

-- Claim shelf_events
UPDATE shelf_events SET user_id = '$USER_ID' WHERE anon_id = '$ANON_ID' AND user_id IS NULL;

-- Claim evolution_events
UPDATE evolution_events SET user_id = '$USER_ID' WHERE anon_id = '$ANON_ID' AND user_id IS NULL;

-- Claim noseprint_history (if exists)
UPDATE noseprint_history SET user_id = '$USER_ID' WHERE anon_id = '$ANON_ID' AND user_id IS NULL;

-- Claim collections (if using legacy user_xp/streaks)
-- (Note: collections uses user_id by default, not anon_id)
EOF

# Execute
supabase sql -f /tmp/claim-migration.sql --project-id lrkdwobnemczvhpixpky

echo ""
echo "✅ Legacy data claimed successfully!"
echo ""
echo "Next steps:"
echo "  1. User should log out"
echo "  2. User logs back in with their email"
echo "  3. Legacy data will be visible in their account"
echo ""
