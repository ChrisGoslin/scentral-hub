#!/bin/bash
# Troubleshooting utilities for common nota. issues

set -e

if [ -z "$1" ]; then
  echo "Usage: ./ops-troubleshoot.sh <command> [args]"
  echo ""
  echo "Commands:"
  echo "  rate-limits [days]        Check read_generated rate limit usage (default: 7 days)"
  echo "  shelf-ineligible          Find fragrances blocked by eligibility trigger"
  echo "  auth-claims [user-id]     Check if user's legacy data was claimed"
  echo "  blind-buys [user-id]      List user's blind purchases"
  echo "  shelf-stats               Aggregate shelf statistics"
  echo ""
  exit 1
fi

COMMAND=$1

case $COMMAND in
  rate-limits)
    DAYS=${2:-7}
    echo "Rate limits in the last $DAYS days:"
    supabase sql <<EOF --project-id lrkdwobnemczvhpixpky
    SELECT
      user_id,
      COUNT(*) as generation_count,
      MIN(created_at) as first_at,
      MAX(created_at) as last_at
    FROM interactions
    WHERE event_type = 'read_generated'
    AND created_at > now() - interval '$DAYS days'
    GROUP BY user_id
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 20;
EOF
    ;;

  shelf-ineligible)
    echo "Fragrances blocked by eligibility trigger:"
    supabase sql <<EOF --project-id lrkdwobnemczvhpixpky
    SELECT
      si.user_id,
      si.fragrance_id,
      f.name,
      f.brand,
      c.status
    FROM shelf_items si
    LEFT JOIN collections c ON si.user_id = c.user_id AND si.fragrance_id = c.fragrance_id
    LEFT JOIN fragrances f ON si.fragrance_id = f.id
    WHERE c.status IS NULL
    LIMIT 50;
EOF
    echo ""
    echo "To fix: INSERT INTO collections SELECT DISTINCT ... (see HANDOVER.md)"
    ;;

  auth-claims)
    if [ -z "$2" ]; then
      echo "Usage: ./ops-troubleshoot.sh auth-claims <user-id>"
      exit 1
    fi
    USER_ID=$2
    echo "Checking if user $USER_ID has claimed legacy data:"
    supabase sql <<EOF --project-id lrkdwobnemczvhpixpky
    SELECT
      'temptations' as table_name, COUNT(*) as row_count
    FROM temptations WHERE user_id = '$USER_ID'
    UNION ALL
    SELECT 'shelf_events', COUNT(*) FROM shelf_events WHERE user_id = '$USER_ID'
    UNION ALL
    SELECT 'evolution_events', COUNT(*) FROM evolution_events WHERE user_id = '$USER_ID'
    UNION ALL
    SELECT 'noseprint_history', COUNT(*) FROM noseprint_history WHERE user_id = '$USER_ID';
EOF
    ;;

  blind-buys)
    if [ -z "$2" ]; then
      echo "Usage: ./ops-troubleshoot.sh blind-buys <user-id>"
      exit 1
    fi
    USER_ID=$2
    echo "Blind purchases for user $USER_ID:"
    supabase sql <<EOF --project-id lrkdwobnemczvhpixpky
    SELECT
      si.rank,
      f.name,
      f.brand,
      si.blind_buy,
      si.created_at
    FROM shelf_items si
    LEFT JOIN fragrances f ON si.fragrance_id = f.id
    WHERE si.user_id = '$USER_ID'
    AND si.blind_buy = true
    ORDER BY si.rank;
EOF
    ;;

  shelf-stats)
    echo "Shelf statistics:"
    supabase sql <<EOF --project-id lrkdwobnemczvhpixpky
    SELECT
      COUNT(DISTINCT user_id) as users_with_shelf,
      COUNT(*) as total_items,
      ROUND(AVG(rank)) as avg_rank,
      COUNT(CASE WHEN blind_buy THEN 1 END) as blind_buys,
      COUNT(CASE WHEN tier = 'S' THEN 1 END) as s_tier,
      COUNT(CASE WHEN tier = 'A' THEN 1 END) as a_tier,
      COUNT(CASE WHEN tier = 'B' THEN 1 END) as b_tier,
      COUNT(CASE WHEN tier = 'C' THEN 1 END) as c_tier
    FROM shelf_items;
EOF
    ;;

  *)
    echo "Unknown command: $COMMAND"
    exit 1
    ;;
esac
