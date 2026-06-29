-- Create discovery_boxes table
CREATE TABLE discovery_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme text NOT NULL,
  fragrances uuid[] DEFAULT '{}',
  price_gbp numeric,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE discovery_boxes ENABLE ROW LEVEL SECURITY;

-- Public read-only access
CREATE POLICY "Anyone can view discovery boxes"
  ON discovery_boxes FOR SELECT
  USING (true);

-- Create index on is_active for faster queries
CREATE INDEX idx_discovery_boxes_active ON discovery_boxes(is_active DESC, created_at DESC);
