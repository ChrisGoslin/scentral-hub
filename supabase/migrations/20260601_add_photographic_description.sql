-- Add photographic_description for UI fallback
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS photographic_description TEXT;
