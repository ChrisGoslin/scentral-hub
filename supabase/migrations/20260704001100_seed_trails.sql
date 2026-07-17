-- Seed 3 guiding trails for launch (Prompt 12)
-- Step types: hook, fact, term, experience, people_like_you, tip, creator, data

INSERT INTO trails (title, hook, slug, published, created_at) VALUES
  ('Spraying Technique', 'You''re probably spraying it wrong.', 'spraying-technique', true, now()),
  ('Longevity & Skin Chemistry', 'Longevity is a two-person problem.', 'longevity-skin-chemistry', true, now()),
  ('Anosmia: Why You Can''t Smell Yourself', 'After 15 minutes, you disappear.', 'anosmia-why-you-cant-smell-yourself', true, now())
ON CONFLICT DO NOTHING;

WITH steps(slug, position, step_type, content) AS (
  VALUES
    ('spraying-technique', 1, 'hook', jsonb_build_object(
      'headline', 'You''re probably spraying it wrong.',
      'body', 'Most people spray fragrances at the wrong distance, on the wrong parts of their body, and with the wrong number of sprays.'
    )),
    ('spraying-technique', 2, 'fact', jsonb_build_object(
      'headline', 'The pulse points rule',
      'body', 'Spray on warm areas: wrists, inside of elbows, behind ears, base of throat. Heat accelerates diffusion — your fragrance will project faster and last longer.'
    )),
    ('spraying-technique', 3, 'term', jsonb_build_object(
      'term', 'Spritz distance',
      'definition', 'Hold the nozzle 3–6 inches away from your skin. Too close clogs the atomiser; too far wastes product.'
    )),
    ('spraying-technique', 4, 'tip', jsonb_build_object(
      'headline', '1–3 spritzes is usually enough',
      'body', 'Start with one spray on a pulse point. If you need more, add one spray to another pulse point. Avoid oversaturating — it''s worse than too little.'
    )),
    ('spraying-technique', 5, 'data', jsonb_build_object(
      'stat_label', 'Ideal humidity for fragrance',
      'stat_value', '40–60%',
      'source', 'Skin chemistry research'
    )),
    ('longevity-skin-chemistry', 1, 'hook', jsonb_build_object(
      'headline', 'Longevity is a two-person problem.',
      'body', 'A fragrance that lasts 8 hours on one person might fade in 2 on another. Your skin chemistry is half the equation.'
    )),
    ('longevity-skin-chemistry', 2, 'fact', jsonb_build_object(
      'headline', 'Skin pH matters',
      'body', 'More acidic skin (pH 4–5) holds fragrances longer than neutral or alkaline skin (pH 7+). Moisturising raises skin pH temporarily, which can extend longevity.'
    )),
    ('longevity-skin-chemistry', 3, 'term', jsonb_build_object(
      'term', 'Projection',
      'definition', 'How far a fragrance travels from your skin. Strong projection = scent cloud around you; weak = only you can smell it.'
    )),
    ('longevity-skin-chemistry', 4, 'tip', jsonb_build_object(
      'headline', 'If a fragrance fades fast, try a different body part',
      'body', 'Your neck might have different chemistry than your wrists. Some people find chest and shoulders hold scent longer.'
    )),
    ('longevity-skin-chemistry', 5, 'data', jsonb_build_object(
      'stat_label', 'Average fragrance longevity variance',
      'stat_value', '2–4 hours',
      'source', 'Wearer feedback aggregation'
    )),
    ('anosmia-why-you-cant-smell-yourself', 1, 'hook', jsonb_build_object(
      'headline', 'After 15 minutes, you disappear.',
      'body', 'This is called anosmia. Your nose stops detecting a constant smell — even though everyone around you can still smell you.'
    )),
    ('anosmia-why-you-cant-smell-yourself', 2, 'fact', jsonb_build_object(
      'headline', 'It''s a feature, not a bug',
      'body', 'Your olfactory system evolved to alert you to *changes* in smell — not constant ones. Once a fragrance stabilises, your brain stops reporting it.'
    )),
    ('anosmia-why-you-cant-smell-yourself', 3, 'term', jsonb_build_object(
      'term', 'Olfactory adaptation',
      'definition', 'The phenomenon where your nose stops detecting a smell after prolonged exposure, even though the smell is still present.'
    )),
    ('anosmia-why-you-cant-smell-yourself', 4, 'tip', jsonb_build_object(
      'headline', 'Trust other people''s feedback, not your own nose',
      'body', 'If someone says your fragrance smells nice 3 hours after you applied it, believe them. You can''t verify it yourself.'
    )),
    ('anosmia-why-you-cant-smell-yourself', 5, 'data', jsonb_build_object(
      'stat_label', 'Time to anosmia onset',
      'stat_value', '10–20 minutes',
      'source', 'Olfactory neuroscience'
    ))
)
INSERT INTO trail_steps (trail_id, position, step_type, content)
SELECT trails.id, steps.position, steps.step_type, steps.content
FROM steps
JOIN trails ON trails.slug = steps.slug
ON CONFLICT DO NOTHING;
