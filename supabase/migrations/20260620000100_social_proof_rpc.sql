CREATE OR REPLACE FUNCTION get_fragrance_social_proof(fragrance_ids uuid[])
RETURNS TABLE(fragrance_id uuid, owner_count bigint)
LANGUAGE sql STABLE AS $$
  SELECT fragrance_id, COUNT(*) as owner_count
  FROM collections
  WHERE fragrance_id = ANY(fragrance_ids)
  GROUP BY fragrance_id;
$$;
