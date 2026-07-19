-- 011_search_indexes.sql sorts lexicographically before 20260507_
-- initial_schema.sql, so on a fresh replay this always no-ops before
-- public.fragrances exists. 20260624005016_011_search_indexes.sql now
-- carries the real (identical, IF NOT EXISTS) index creation positioned
-- after fragrances actually exists — duplicating that body here as well
-- added no coverage (any environment reaching this file too early always
-- skips it) and tripped SonarQube's duplication gate. Left as a
-- documented no-op.
SELECT 1;
