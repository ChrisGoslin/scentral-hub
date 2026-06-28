CREATE OR REPLACE FUNCTION get_also_owned_fragrances(f_id TEXT, limit_count INT DEFAULT 6)
RETURNS TABLE (fragrance_id TEXT, owner_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.fragrance_id, COUNT(*) AS owner_count
  FROM collections c
  WHERE c.user_id IN (
    SELECT user_id FROM collections WHERE collections.fragrance_id = f_id
  )
  AND c.fragrance_id != f_id
  GROUP BY c.fragrance_id
  ORDER BY owner_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
