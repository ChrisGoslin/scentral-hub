-- Seed 3 guiding trails for launch (Prompt 12)
-- Step types: hook, fact, term, experience, people_like_you, tip, creator, data

-- Trail 1: Spraying Technique
INSERT INTO trails (title, hook, slug, published, created_at) VALUES (
  'Spraying Technique',
  'You''re probably spraying it wrong.',
  'spraying-technique',
  true,
  now()
) ON CONFLICT DO NOTHING
RETURNING id AS trail_id \gset

INSERT INTO trail_steps (trail_id, position, step_type, content) VALUES
(
  (SELECT id FROM trails WHERE slug = 'spraying-technique' LIMIT 1),
  1,
  'hook',
  jsonb_build_object(
    'headline', 'You''re probably spraying it wrong.',
    'body', 'Most people spray fragrances at the wrong distance, on the wrong parts of their body, and with the wrong number of sprays.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'spraying-technique' LIMIT 1),
  2,
  'fact',
  jsonb_build_object(
    'headline', 'The pulse points rule',
    'body', 'Spray on warm areas: wrists, inside of elbows, behind ears, base of throat. Heat accelerates diffusion — your fragrance will project faster and last longer.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'spraying-technique' LIMIT 1),
  3,
  'term',
  jsonb_build_object(
    'term', 'Spritz distance',
    'definition', 'Hold the nozzle 3–6 inches away from your skin. Too close clogs the atomiser; too far wastes product.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'spraying-technique' LIMIT 1),
  4,
  'tip',
  jsonb_build_object(
    'headline', '1–3 spritzes is usually enough',
    'body', 'Start with one spray on a pulse point. If you need more, add one spray to another pulse point. Avoid oversaturating — it''s worse than too little.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'spraying-technique' LIMIT 1),
  5,
  'data',
  jsonb_build_object(
    'stat_label', 'Ideal humidity for fragrance',
    'stat_value', '40–60%',
    'source', 'Skin chemistry research'
  )
);

-- Trail 2: Longevity & Skin Chemistry
INSERT INTO trails (title, hook, slug, published, created_at) VALUES (
  'Longevity & Skin Chemistry',
  'Longevity is a two-person problem.',
  'longevity-skin-chemistry',
  true,
  now()
) ON CONFLICT DO NOTHING;

INSERT INTO trail_steps (trail_id, position, step_type, content) VALUES
(
  (SELECT id FROM trails WHERE slug = 'longevity-skin-chemistry' LIMIT 1),
  1,
  'hook',
  jsonb_build_object(
    'headline', 'Longevity is a two-person problem.',
    'body', 'A fragrance that lasts 8 hours on one person might fade in 2 on another. Your skin chemistry is half the equation.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'longevity-skin-chemistry' LIMIT 1),
  2,
  'fact',
  jsonb_build_object(
    'headline', 'Skin pH matters',
    'body', 'More acidic skin (pH 4–5) holds fragrances longer than neutral or alkaline skin (pH 7+). Moisturising raises skin pH temporarily, which can extend longevity.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'longevity-skin-chemistry' LIMIT 1),
  3,
  'term',
  jsonb_build_object(
    'term', 'Projection',
    'definition', 'How far a fragrance travels from your skin. Strong projection = scent cloud around you; weak = only you can smell it.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'longevity-skin-chemistry' LIMIT 1),
  4,
  'tip',
  jsonb_build_object(
    'headline', 'If a fragrance fades fast, try a different body part',
    'body', 'Your neck might have different chemistry than your wrists. Some people find chest and shoulders hold scent longer.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'longevity-skin-chemistry' LIMIT 1),
  5,
  'data',
  jsonb_build_object(
    'stat_label', 'Average fragrance longevity variance',
    'stat_value', '2–4 hours',
    'source', 'Wearer feedback aggregation'
  )
);

-- Trail 3: Anosmia (Why You Can't Smell Your Own Fragrance)
INSERT INTO trails (title, hook, slug, published, created_at) VALUES (
  'Anosmia: Why You Can''t Smell Yourself',
  'After 15 minutes, you disappear.',
  'anosmia-why-you-cant-smell-yourself',
  true,
  now()
) ON CONFLICT DO NOTHING;

INSERT INTO trail_steps (trail_id, position, step_type, content) VALUES
(
  (SELECT id FROM trails WHERE slug = 'anosmia-why-you-cant-smell-yourself' LIMIT 1),
  1,
  'hook',
  jsonb_build_object(
    'headline', 'After 15 minutes, you disappear.',
    'body', 'This is called anosmia. Your nose stops detecting a constant smell — even though everyone around you can still smell you.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'anosmia-why-you-cant-smell-yourself' LIMIT 1),
  2,
  'fact',
  jsonb_build_object(
    'headline', 'It''s a feature, not a bug',
    'body', 'Your olfactory system evolved to alert you to *changes* in smell — not constant ones. Once a fragrance stabilises, your brain stops reporting it.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'anosmia-why-you-cant-smell-yourself' LIMIT 1),
  3,
  'term',
  jsonb_build_object(
    'term', 'Olfactory adaptation',
    'definition', 'The phenomenon where your nose stops detecting a smell after prolonged exposure, even though the smell is still present.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'anosmia-why-you-cant-smell-yourself' LIMIT 1),
  4,
  'tip',
  jsonb_build_object(
    'headline', 'Trust other people''s feedback, not your own nose',
    'body', 'If someone says your fragrance smells nice 3 hours after you applied it, believe them. You can''t verify it yourself.'
  )
),
(
  (SELECT id FROM trails WHERE slug = 'anosmia-why-you-cant-smell-yourself' LIMIT 1),
  5,
  'data',
  jsonb_build_object(
    'stat_label', 'Time to anosmia onset',
    'stat_value', '10–20 minutes',
    'source', 'Olfactory neuroscience'
  )
);
