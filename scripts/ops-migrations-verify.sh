#!/bin/bash
# Verify all nota. migrations are applied to Supabase

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         nota. Migration Verification                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ID="lrkdwobnemczvhpixpky"

echo "Checking migrations on project: $PROJECT_ID"
echo ""

# Expected migrations
EXPECTED=(
  "db001_collections_status_enum"
  "db002_shelf_items_blind_buy"
  "db003_shelf_tiers_eligibility"
  "backfill_shelf_items_eligibility"
  "db006_identity_model_migration"
  "db007_blind_buy_propagation"
)

echo "Expected migrations:"
for migration in "${EXPECTED[@]}"; do
  echo "  • $migration"
done
echo ""

# Get applied migrations
echo "Fetching applied migrations from Supabase..."
APPLIED=$(supabase migration list --project-id "$PROJECT_ID" 2>/dev/null | grep -E "db001|db002|db003|db006|db007|backfill" | awk '{print $NF}')

echo "Applied migrations on Supabase:"
echo "$APPLIED" | while read migration; do
  echo "  ✅ $migration"
done
echo ""

# Verify each expected migration
echo "Verification:"
ALL_FOUND=true
for expected in "${EXPECTED[@]}"; do
  if echo "$APPLIED" | grep -q "$expected"; then
    echo "  ✅ $expected"
  else
    echo "  ❌ $expected — NOT FOUND"
    ALL_FOUND=false
  fi
done
echo ""

if [ "$ALL_FOUND" = true ]; then
  echo "✅ All nota. migrations are applied!"
  exit 0
else
  echo "❌ Some migrations are missing. Run the deployment script to apply them."
  exit 1
fi
