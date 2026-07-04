-- Legacy 1..10 rank check conflicts with the approved 20-slot S/A/B/C shelf model.
-- shelf_items_rank_range (-20..20, <>0, negative transient ranks for two-phase reorder)
-- remains the binding constraint. Applied to prod via MCP 2026-07-04.
ALTER TABLE shelf_items DROP CONSTRAINT IF EXISTS shelf_items_rank_check;
