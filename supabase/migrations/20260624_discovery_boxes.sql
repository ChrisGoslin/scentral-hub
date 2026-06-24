-- Discovery Boxes: curated fragrance sample sets for Shopify storefront
create table if not exists discovery_boxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  fragrance_ids text[] not null, -- array of fragrance UUIDs in this box
  shopify_product_id text not null, -- Shopify product ID for the box bundle
  price_cents int, -- price in cents (optional; source of truth is Shopify)
  tier text default 'discovery', -- 'discovery', 'connoisseur', 'curator'
  theme text, -- 'oud', 'fresh', 'warm', 'floral', etc. for filtering
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  active boolean default true
);

create index idx_discovery_boxes_slug on discovery_boxes(slug);
create index idx_discovery_boxes_theme on discovery_boxes(theme);
create index idx_discovery_boxes_active on discovery_boxes(active);

comment on table discovery_boxes is 'Curated fragrance sample sets — link to Shopify products for checkout';
comment on column discovery_boxes.fragrance_ids is 'Array of fragrance IDs in display order';
comment on column discovery_boxes.shopify_product_id is 'Shopify product ID for the bundle variant';
