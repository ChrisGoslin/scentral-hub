-- ============================================================
-- 20260608_scent_debt_and_library_v2.sql
-- Implements Library Extension Fields and Scent Debt RPC
-- ============================================================

-- 1. Extend Fragrances Library Schema
ALTER TABLE fragrances 
ADD COLUMN IF NOT EXISTS clone_target text,
ADD COLUMN IF NOT EXISTS accords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS versatility_score int DEFAULT 5;

-- 2. Add fragrance_id to wear_logs if it was missing in some versions
-- The prompt implies we need to track frequencies of specific bottles.
ALTER TABLE wear_logs 
ADD COLUMN IF NOT EXISTS fragrance_id uuid REFERENCES fragrances(id) ON DELETE CASCADE;

-- 3. The "Scent Debt" Protocol RPC
-- Logic: Isolate bottom 20% of user collection by wear frequency
CREATE OR REPLACE FUNCTION get_scent_debt(p_user_id uuid)
RETURNS TABLE (
  fragrance_id uuid,
  brand text,
  name text,
  wear_count bigint,
  is_debt boolean
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_bottles int;
  v_debt_cutoff int;
BEGIN
  -- Get total size of user wardrobe
  SELECT count(*) INTO v_total_bottles 
  FROM user_collection 
  WHERE user_id = p_user_id;

  -- 20% threshold
  v_debt_cutoff := ceil(v_total_bottles * 0.2);

  RETURN QUERY
  WITH stats AS (
    SELECT 
      uc.fragrance_id,
      f.brand,
      f.name,
      count(wl.id) as wear_count
    FROM user_collection uc
    JOIN fragrances f ON f.id = uc.fragrance_id
    LEFT JOIN wear_logs wl ON wl.fragrance_id = uc.fragrance_id AND wl.user_id = p_user_id
    WHERE uc.user_id = p_user_id
    GROUP BY uc.fragrance_id, f.brand, f.name
  ),
  ranked_stats AS (
    SELECT 
      *,
      row_number() OVER (ORDER BY wear_count ASC, name ASC) as rank
    FROM stats
  )
  SELECT 
    rs.fragrance_id,
    rs.brand,
    rs.name,
    rs.wear_count,
    (rs.rank <= v_debt_cutoff) as is_debt
  FROM ranked_stats rs
  ORDER BY rs.wear_count ASC;
END;
$$;

-- 4. Collection Optimization Score RPC
CREATE OR REPLACE FUNCTION get_collection_health(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_wears bigint;
  v_distinct_fragrances_worn bigint;
  v_collection_size bigint;
  v_equilibrium_score float;
  v_diversity_score float;
BEGIN
  SELECT count(*), count(distinct fragrance_id) INTO v_total_wears, v_distinct_fragrances_worn
  FROM wear_logs WHERE user_id = p_user_id;

  SELECT count(*) INTO v_collection_size
  FROM user_collection WHERE user_id = p_user_id;

  IF v_collection_size = 0 THEN RETURN jsonb_build_object('score', 0); END IF;

  -- Equilibrium: How evenly are we wearing the collection?
  v_equilibrium_score := (v_distinct_fragrances_worn::float / v_collection_size::float) * 50;
  
  -- Diversity: Growth/Density metric (Mocked for now based on size/wears ratio)
  v_diversity_score := LEAST(50, (v_collection_size::float / 10.0) * 10);

  RETURN jsonb_build_object(
    'score', floor(v_equilibrium_score + v_diversity_score),
    'equilibrium', round(v_equilibrium_score::numeric, 1),
    'diversity', round(v_diversity_score::numeric, 1),
    'total_wears', v_total_wears,
    'bottles', v_collection_size
  );
END;
$$;
