-- Reference catalogue: well-known fragrances from major houses
-- Embeddings intentionally excluded — to be backfilled separately via embedding pipeline
-- Uses ON CONFLICT DO NOTHING to be safe on re-runs

CREATE UNIQUE INDEX IF NOT EXISTS fragrances_brand_name_key ON fragrances (brand, name);

INSERT INTO fragrances (
  brand, name, family,
  top_notes, heart_notes, base_notes,
  gender_profile, projection, use_case,
  phase, phase_label, is_user_created, concentration
) VALUES

-- ──────────────────────────────────────────────────────────────────────────────
-- CHRISTIAN DIOR
-- ──────────────────────────────────────────────────────────────────────────────
('Christian Dior', 'Sauvage EDT', 'Woody Aromatic',
 ARRAY['Bergamot', 'Pepper'], ARRAY['Sichuan Pepper', 'Lavender', 'Pink Pepper', 'Vetiver', 'Patchouli', 'Geranium', 'Elemi'], ARRAY['Ambroxan', 'Cedar', 'Labdanum'],
 'Men', 'Strong', 'Office, Date Night, Versatile All-Season', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Christian Dior', 'Sauvage EDP', 'Woody Spicy',
 ARRAY['Bergamot', 'Nutmeg'], ARRAY['Lavender', 'Pepper', 'Patchouli', 'Sichuan Pepper'], ARRAY['Ambroxan', 'Labdanum', 'Vanilla'],
 'Men', 'Strong', 'Evening, Date Night, Cold Weather', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Christian Dior', 'Sauvage Parfum', 'Woody Aromatic',
 ARRAY['Bergamot'], ARRAY['Lavender', 'Cardamom', 'Pepper'], ARRAY['Sandalwood', 'Ambroxan', 'Vanilla', 'Haitian Vetiver'],
 'Men', 'Strong', 'Evening, Cold Weather, Special Occasion', 1, 'Endothermic Anchor', false, 'Parfum'),

('Christian Dior', 'Fahrenheit', 'Leather Woody',
 ARRAY['Mandarin Orange', 'Hawthorn', 'Chamomile'], ARRAY['Nutmeg', 'Violet', 'Jasmine', 'Lily-of-the-Valley', 'Cedar'], ARRAY['Vetiver', 'Leather', 'Sandalwood', 'Musk', 'Amber'],
 'Men', 'Strong', 'Evening, Formal, Cold Weather', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Christian Dior', 'Dior Homme Intense', 'Iris Floral',
 ARRAY['Lemon Verbena', 'Iris'], ARRAY['Iris', 'Lavender', 'Pear', 'Ambrette'], ARRAY['Vetiver', 'Virginia Cedar', 'Ambroxan'],
 'Men', 'Moderate', 'Evening, Formal, Cold Weather', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Christian Dior', 'Dior Homme Parfum', 'Iris Leather',
 ARRAY['Bergamot', 'Carrot'], ARRAY['Iris', 'Lavender', 'Rose', 'Geranium'], ARRAY['Vetiver', 'Patchouli', 'Leather', 'Amber', 'Sandalwood'],
 'Men', 'Strong', 'Evening, Formal, Cold Weather', 1, 'Endothermic Anchor', false, 'Parfum'),

('Christian Dior', 'Miss Dior EDP', 'Floral Chypre',
 ARRAY['Calabrian Bergamot', 'Blood Orange'], ARRAY['Rose de Grasse', 'Peony', 'Lily-of-the-Valley'], ARRAY['Patchouli', 'Amberwood', 'White Musk'],
 'Women', 'Moderate', 'Date Night, Spring, Feminine Daywear', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Christian Dior', 'J''adore EDP', 'Floral',
 ARRAY['Pear', 'Cantaloupe', 'Magnolia', 'Ivy'], ARRAY['Jasmine', 'Plum', 'Orchid', 'Violet', 'Rose', 'Lily-of-the-Valley', 'Tuberose'], ARRAY['Blackberry Musk', 'Sandalwood', 'Cedar', 'Amber'],
 'Women', 'Strong', 'Evening, Date Night, Special Occasion', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Christian Dior', 'Poison Girl', 'Oriental Floral',
 ARRAY['Orange', 'Bitter Orange'], ARRAY['Rose', 'Grasse Rose'], ARRAY['Vanilla', 'Sandalwood', 'Musk'],
 'Women', 'Strong', 'Evening, Night Out, Date Night', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Christian Dior', 'Dior Homme Sport', 'Fresh Aromatic',
 ARRAY['Grapefruit', 'Blood Orange', 'Elemi'], ARRAY['Lavender', 'Vetiver'], ARRAY['Cedar'],
 'Men', 'Moderate', 'Casual Daytime, Sport, Office Summer', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Christian Dior', 'Gris Dior', 'Floral Musk',
 ARRAY['Bergamot', 'Iris'], ARRAY['Jasmine', 'Rose', 'Peony'], ARRAY['Musk', 'White Cedar', 'Sandalwood', 'Ambrette'],
 'Unisex', 'Moderate', 'Evening, Formal, Special Occasion', 2, 'Textural Modulator', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- YVES SAINT LAURENT
-- ──────────────────────────────────────────────────────────────────────────────
('Yves Saint Laurent', 'La Nuit de l''Homme', 'Woody Oriental',
 ARRAY['Cardamom', 'Bergamot'], ARRAY['Lavender', 'Coumarin', 'Cedar', 'Vetiver'], ARRAY['Vetiver', 'White Musk', 'Amberwood'],
 'Men', 'Moderate', 'Evening, Date Night, Romantic', 1, 'Endothermic Anchor', false, 'Eau de Toilette'),

('Yves Saint Laurent', 'La Nuit de l''Homme EDP', 'Woody Spicy',
 ARRAY['Pepper', 'Cardamom'], ARRAY['Lavender', 'Coumarin', 'Amberwood'], ARRAY['Vetiver', 'Patchouli', 'Musk', 'Cedar'],
 'Men', 'Strong', 'Evening, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Yves Saint Laurent', 'L''Homme', 'Woody Spicy',
 ARRAY['Grapefruit', 'Ginger', 'Basil'], ARRAY['Violet', 'Spices', 'Cardamom', 'Pepper'], ARRAY['Vetiver', 'Tonka Bean', 'White Musk', 'Cedar'],
 'Men', 'Moderate', 'Office, Casual, Versatile', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Yves Saint Laurent', 'Y EDT', 'Fresh Woody',
 ARRAY['Bergamot', 'Ginger', 'Apple'], ARRAY['Sage', 'Geranium', 'Juniper Berry', 'Violet'], ARRAY['Cedar', 'Fir Resin', 'Ambergris', 'Tonka Bean'],
 'Men', 'Strong', 'Office, Casual, Versatile All-Season', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Yves Saint Laurent', 'Y EDP', 'Woody Aromatic',
 ARRAY['Bergamot', 'Ginger'], ARRAY['Sage', 'Violet', 'Geranium'], ARRAY['Cedar', 'Ambergris', 'Sandalwood', 'Tonka Bean'],
 'Men', 'Strong', 'Evening, Office, Year-Round', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Yves Saint Laurent', 'Libre EDP', 'Floral Fougere',
 ARRAY['Mandarin Orange', 'Petitgrain', 'Lavender'], ARRAY['Lavender', 'Orange Blossom', 'Jasmine'], ARRAY['Ambergris', 'Musk', 'Vanilla', 'Cedar', 'Oakmoss'],
 'Women', 'Strong', 'Evening, Date Night, Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Yves Saint Laurent', 'Black Opium EDP', 'Oriental Vanilla',
 ARRAY['Pink Pepper', 'Orange Blossom', 'Pear'], ARRAY['Coffee', 'Jasmine', 'Bitter Almond'], ARRAY['Vanilla', 'Patchouli', 'White Musk', 'Cashmere Wood', 'Cedar'],
 'Women', 'Strong', 'Night Out, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Yves Saint Laurent', 'Mon Paris EDP', 'Floral Fruity',
 ARRAY['Strawberry', 'Raspberry', 'Pear'], ARRAY['Peony', 'Jasmine', 'Rose'], ARRAY['White Musk', 'Patchouli', 'Amberwood'],
 'Women', 'Moderate', 'Casual Daytime, Date, Spring', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Yves Saint Laurent', 'Kouros', 'Aromatic Fougere',
 ARRAY['Aldehydes', 'Bergamot', 'Artemisia', 'Coriander'], ARRAY['Clary Sage', 'Cinnamon', 'Carnation', 'Jasmine', 'Orris Root', 'Rose', 'Geranium', 'Patchouli'], ARRAY['Castoreum', 'Civet', 'Musk', 'Oakmoss', 'Vetiver', 'Honey', 'Amber', 'Sandalwood'],
 'Men', 'Beast Mode', 'Evening, Formal, Cold Weather, Bold Statement', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Yves Saint Laurent', 'Myslf', 'Fresh Woody',
 ARRAY['Bergamot', 'Ginger'], ARRAY['Cardamom', 'Davana', 'Vetiver'], ARRAY['Akigalawood', 'Ambroxan', 'Sandalwood', 'Tonka Bean'],
 'Men', 'Moderate', 'Office, Casual, Versatile', 3, 'Exothermic Top', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- CREED
-- ──────────────────────────────────────────────────────────────────────────────
('Creed', 'Aventus', 'Fruity Chypre',
 ARRAY['Blackcurrant', 'Apple', 'Bergamot', 'Pineapple'], ARRAY['Jasmine', 'Rose', 'Birch', 'Patchouli'], ARRAY['Oakmoss', 'Ambergris', 'Musk', 'Vanilla'],
 'Men', 'Strong', 'Office, Date Night, Versatile, Special Occasion', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Creed', 'Green Irish Tweed', 'Fresh Aromatic',
 ARRAY['Violet Leaf', 'Verbena', 'Lemon'], ARRAY['Iris', 'Sandalwood'], ARRAY['Ambergris', 'Sandalwood', 'Vetiver'],
 'Men', 'Moderate', 'Spring, Casual, Classic Daily', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Creed', 'Silver Mountain Water', 'Fresh Aquatic',
 ARRAY['Bergamot', 'Mandarin Orange', 'Green Tea'], ARRAY['Blackcurrant', 'Galbanum', 'Peach'], ARRAY['Musk', 'Sandalwood', 'Neroli'],
 'Men', 'Moderate', 'Office, Casual, Spring/Summer', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Creed', 'Millesime Imperial', 'Fresh Marine',
 ARRAY['Bergamot', 'Lemon', 'Mandarin Orange'], ARRAY['Sea Notes', 'Iris', 'Melon', 'Peach'], ARRAY['Musk', 'Ambergris', 'Sandalwood'],
 'Unisex', 'Moderate', 'Summer, Beach, Casual Daytime', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Creed', 'Viking', 'Fresh Woody',
 ARRAY['Pepper', 'Grapefruit', 'Cardamom'], ARRAY['Rose', 'Lavender', 'Vetiver', 'Patchouli'], ARRAY['Sandalwood', 'Ambergris', 'Cedar'],
 'Men', 'Strong', 'Versatile, Office, Date Night', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Creed', 'Viking Cologne', 'Fresh Citrus',
 ARRAY['Grapefruit', 'Lemon', 'Mandarin Orange'], ARRAY['Geranium', 'Lavender', 'Pink Pepper'], ARRAY['Vetiver', 'Sandalwood', 'White Musk'],
 'Men', 'Moderate', 'Daytime, Summer, Office', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Creed', 'Bois du Portugal', 'Woody Fougere',
 ARRAY['Bergamot', 'Lavender', 'Cardamom', 'Rosemary'], ARRAY['Cedar', 'Sandalwood', 'Rose'], ARRAY['Amber', 'Labdanum', 'Vetiver', 'Oakmoss', 'Leather', 'Musk'],
 'Men', 'Moderate', 'Cold Weather, Evening, Classic Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Creed', 'Original Santal', 'Woody Sandalwood',
 ARRAY['Violet Leaf', 'Apple', 'Petitgrain'], ARRAY['Sandalwood', 'Jasmine', 'Iris'], ARRAY['Sandalwood', 'Musk', 'Vetiver', 'Ambergris'],
 'Unisex', 'Moderate', 'Versatile, Casual, Daily Comfort', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Creed', 'Royal Oud', 'Woody Oud',
 ARRAY['Pink Pepper', 'Lemon', 'Grapefruit'], ARRAY['Oud', 'Violet', 'Iris', 'Cedar'], ARRAY['Sandalwood', 'Ambergris', 'Musk'],
 'Unisex', 'Moderate', 'Evening, Formal, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Creed', 'Himalaya', 'Fresh Woody',
 ARRAY['Bergamot', 'Lemon', 'Grapefruit'], ARRAY['Rosemary', 'Juniper Berry', 'Lavender'], ARRAY['Sandalwood', 'Musk', 'Cashmere Wood', 'Virginia Cedar'],
 'Men', 'Moderate', 'Office, Casual, All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Creed', 'Erolfa', 'Fresh Marine',
 ARRAY['Neroli', 'Juniper Berry', 'Coriander'], ARRAY['Geranium', 'Water Lily', 'Carrot', 'Iris', 'Violet'], ARRAY['Sandalwood', 'Musk', 'Civet', 'Ambergris', 'Vetiver'],
 'Men', 'Moderate', 'Summer, Casual Outdoor, Office', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Creed', 'Tabarome Millesime', 'Woody Aromatic',
 ARRAY['Bergamot', 'Juniper Berry', 'Grapefruit'], ARRAY['Tobacco', 'Cedar', 'Galbanum', 'Orris'], ARRAY['Sandalwood', 'Ambergris', 'Vetiver', 'Musk'],
 'Men', 'Moderate', 'Evening, Cold Weather, Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Creed', 'Virgin Island Water', 'Fresh Tropical',
 ARRAY['Bergamot', 'Lime', 'Mandarin Orange'], ARRAY['Coconut', 'Ginger', 'Rum'], ARRAY['Musk', 'White Cedar', 'Sandalwood'],
 'Unisex', 'Moderate', 'Summer, Beach, Vacation', 3, 'Exothermic Top', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- PARFUMS DE MARLY
-- ──────────────────────────────────────────────────────────────────────────────
('Parfums de Marly', 'Layton', 'Sweet Aromatic',
 ARRAY['Bergamot', 'Apple', 'Lavender'], ARRAY['Violet', 'Geranium', 'Jasmine', 'Cardamom'], ARRAY['Vanilla', 'Sandalwood', 'Guaiac Wood', 'Pepper'],
 'Men', 'Strong', 'Versatile, Office, Date Night', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Layton Exclusif', 'Sweet Aromatic Spicy',
 ARRAY['Bergamot', 'Apple', 'Lavender', 'Pink Pepper'], ARRAY['Violet', 'Geranium', 'Cinnamon', 'Jasmine'], ARRAY['Vanilla', 'Sandalwood', 'Guaiac Wood', 'Amber'],
 'Men', 'Strong', 'Evening, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Parfums de Marly', 'Pegasus', 'Sweet Aromatic',
 ARRAY['Bergamot', 'Apple', 'Lavender'], ARRAY['Jasmine', 'Geranium'], ARRAY['Sandalwood', 'Vanilla', 'White Musk', 'Tonka Bean'],
 'Men', 'Strong', 'Office, Casual, Versatile All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Herod', 'Tobacco Vanilla',
 ARRAY['Nutmeg', 'Bergamot', 'Cinnamon'], ARRAY['Vanilla', 'Tobacco', 'Cypress'], ARRAY['Vanilla', 'Vetiver', 'Benzoin', 'Papyrus'],
 'Men', 'Strong', 'Evening, Cold Weather, Date Night', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Parfums de Marly', 'Percival', 'Fresh Woody',
 ARRAY['Bergamot', 'Apple', 'Grapefruit'], ARRAY['Rose', 'Lavender', 'Geranium'], ARRAY['White Musk', 'Sandalwood', 'Cedar', 'Patchouli'],
 'Men', 'Moderate', 'Office, Spring/Summer, Daily', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Greenley', 'Fresh Aromatic',
 ARRAY['Bergamot', 'Lemon', 'Cardamom'], ARRAY['Lavender', 'Basil', 'Tarragon'], ARRAY['Vetiver', 'Cedar', 'Sandalwood'],
 'Men', 'Moderate', 'Office, Spring, Casual Daytime', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Parfums de Marly', 'Carlisle', 'Woody Spicy',
 ARRAY['Nutmeg', 'Bergamot', 'Pink Pepper'], ARRAY['Rose', 'Jasmine', 'Vetiver'], ARRAY['Sandalwood', 'Leather', 'Amber', 'Musk'],
 'Men', 'Strong', 'Evening, Cold Weather, Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Delina', 'Floral Fruity',
 ARRAY['Rhubarb', 'Lychee', 'Bergamot'], ARRAY['Rose', 'Peony', 'Turkish Rose', 'Magnolia', 'Nutmeg'], ARRAY['Cashmere Wood', 'Musk', 'Vanilla', 'Iso E Super'],
 'Women', 'Strong', 'Date Night, Spring, Feminine Signature', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Oriana', 'Gourmand Floral',
 ARRAY['Bergamot', 'Pear', 'Rhubarb'], ARRAY['Peony', 'Rose', 'Iris', 'Jasmine'], ARRAY['Vanilla', 'Sandalwood', 'Musk', 'Benzoin'],
 'Women', 'Strong', 'Evening, Date Night, Special Occasion', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Cassili', 'Floral Powdery',
 ARRAY['Bergamot', 'Pear', 'Peach'], ARRAY['Peony', 'Rose', 'Heliotrope'], ARRAY['Sandalwood', 'Musk', 'White Cedar'],
 'Women', 'Moderate', 'Office, Casual, Spring/Summer', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Parfums de Marly', 'Sedley', 'Fresh Aromatic',
 ARRAY['Cucumber', 'Grapefruit', 'Mint', 'Cardamom'], ARRAY['Sage', 'Lavender', 'Geranium'], ARRAY['Driftwood', 'Cedar', 'Ambroxan', 'White Musk'],
 'Men', 'Moderate', 'Summer, Casual, Office', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Parfums de Marly', 'Galloway', 'Fresh Woody',
 ARRAY['Bergamot', 'Apple', 'Grapefruit'], ARRAY['Geranium', 'Lavender', 'Violet'], ARRAY['Cedar', 'Sandalwood', 'White Musk', 'Ambroxan'],
 'Men', 'Moderate', 'Casual, Office, Spring', 3, 'Exothermic Top', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- BYREDO
-- ──────────────────────────────────────────────────────────────────────────────
('Byredo', 'Bal d''Afrique', 'Floral Woody Musk',
 ARRAY['African Violet', 'Bergamot', 'Cyclamen'], ARRAY['Marigold', 'Neroli', 'Jasmine', 'Vetiver'], ARRAY['Musk', 'Sandalwood', 'Amber'],
 'Unisex', 'Moderate', 'Casual, Artsy Events, Day-to-Night', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Byredo', 'Bibliothèque', 'Warm Woody',
 ARRAY['Peach', 'Plum', 'Saffron'], ARRAY['Iris', 'Peach', 'Rose'], ARRAY['Leather', 'Sandalwood', 'Vanilla', 'Musk'],
 'Unisex', 'Moderate', 'Evening, Cold Weather, Intellectual Atmosphere', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Byredo', 'Mojave Ghost', 'Woody Floral',
 ARRAY['Sapodilla', 'Magnolia', 'Nectarine', 'Ambrette'], ARRAY['Violet', 'Sandalwood', 'Chestnut'], ARRAY['Virginia Cedar', 'Woods', 'Musk'],
 'Unisex', 'Moderate', 'Casual, Summer, Artsy', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Byredo', 'Gypsy Water', 'Fresh Woody',
 ARRAY['Bergamot', 'Lemon', 'Pepper'], ARRAY['Juniper Berry', 'Orris', 'Pine Needles', 'Incense'], ARRAY['Sandalwood', 'Amber', 'Vanilla', 'Musk'],
 'Unisex', 'Moderate', 'Casual, Outdoors, Bohemian', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Byredo', 'Blanche', 'Floral Musk',
 ARRAY['Aldehydes', 'Pink Pepper', 'Neroli'], ARRAY['Rose', 'Peony', 'Iris', 'Vetiver'], ARRAY['White Musk', 'Sandalwood', 'Cedar'],
 'Women', 'Moderate', 'Daily Wear, Clean Signature, Office', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Byredo', 'Rose of No Man''s Land', 'Floral',
 ARRAY['Bergamot', 'Turkish Pepper'], ARRAY['Pink Pepper', 'Rose', 'Raspberry Blossom'], ARRAY['Papyrus', 'Musk', 'Amber'],
 'Unisex', 'Moderate', 'Spring, Romantic, Artsy Events', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Byredo', 'Oud Immortel', 'Woody Oud',
 ARRAY['Pink Pepper', 'Cardamom'], ARRAY['Oud', 'Cistus', 'Incense'], ARRAY['Musk', 'Ambergris', 'Leather'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Byredo', 'Super Cedar', 'Fresh Woody',
 ARRAY['Rose', 'Bergamot'], ARRAY['Cedarwood', 'Rose'], ARRAY['Musk', 'Vetiver', 'Ambroxan'],
 'Unisex', 'Moderate', 'Clean, Office, Casual Everyday', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Byredo', 'Tobacco Mandarin', 'Warm Spicy Citrus',
 ARRAY['Mandarin Orange', 'Bergamot', 'Grapefruit'], ARRAY['Tobacco', 'Clove', 'Vetiver'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Vanilla'],
 'Unisex', 'Moderate', 'Evening, Cool Weather, Date Night', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- TOM FORD PRIVATE BLEND
-- ──────────────────────────────────────────────────────────────────────────────
('Tom Ford', 'Tobacco Vanille', 'Oriental Vanilla',
 ARRAY['Tobacco Leaf', 'Spices'], ARRAY['Tobacco Blossom', 'Jasmine', 'Ginger', 'Cinnamon', 'Cocoa'], ARRAY['Vanilla', 'Tonka Bean', 'Oakmoss', 'Wood Sap', 'Dried Fruits'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold Statement', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Tom Ford', 'Oud Wood', 'Woody Oud',
 ARRAY['Rosewood', 'Cardamom', 'Chinese Pepper'], ARRAY['Oud', 'Sandalwood', 'Vetiver'], ARRAY['Tonka Bean', 'Amber', 'Musk'],
 'Unisex', 'Moderate', 'Evening, Formal, Office', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Tom Ford', 'Black Orchid', 'Floral Oriental',
 ARRAY['Truffle', 'Gardenia', 'Black Currant', 'Ylang-Ylang', 'Bergamot'], ARRAY['Orchid', 'Fruit', 'Lotus Wood', 'Patchouli'], ARRAY['Vanilla', 'Vetiver', 'Sandalwood', 'Amber', 'Dark Chocolate'],
 'Unisex', 'Strong', 'Evening, Night Out, Seductive', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Tom Ford', 'Noir de Noir', 'Floral Oriental',
 ARRAY['Black Truffle', 'Saffron', 'Pepper'], ARRAY['Dark Rose', 'Oud', 'Orchid', 'Tree Moss'], ARRAY['Vanilla', 'Patchouli', 'Sandalwood', 'Musk'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Seductive', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Tom Ford', 'Lost Cherry', 'Fruity Gourmand',
 ARRAY['Cherry', 'Turkish Rose', 'Bitter Almond'], ARRAY['Cherry Liqueur', 'Black Cherry', 'Toasted Tonka'], ARRAY['Sandalwood', 'Vetiver', 'Clove', 'Vanilla', 'Peru Balsam'],
 'Unisex', 'Strong', 'Evening, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Tom Ford', 'Neroli Portofino', 'Fresh Citrus',
 ARRAY['Bergamot', 'Lemon', 'Orange', 'Mandarin Orange', 'Neroli'], ARRAY['Rosemary', 'Lavender', 'Jasmine', 'Myrtle', 'Pittosporum'], ARRAY['Amber', 'Oakmoss', 'Angelica Root', 'Sea Water'],
 'Unisex', 'Moderate', 'Summer, Beach, Casual Daytime', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Tom Ford', 'Soleil Blanc', 'Solar Floral',
 ARRAY['Cardamom', 'Saffron', 'Bergamot'], ARRAY['Hibiscus', 'Heliotrope', 'Ylang-Ylang', 'Tiare'], ARRAY['Amber', 'Coconut', 'Sandalwood', 'Musk'],
 'Unisex', 'Moderate', 'Summer, Beach, Resort', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Tom Ford', 'Costa Azzurra', 'Fresh Marine',
 ARRAY['Lemon', 'Sea Notes', 'Bergamot'], ARRAY['Cypress', 'Rosemary', 'Cistus', 'Myrtle', 'Rock Rose'], ARRAY['Amber', 'Musk', 'Driftwood', 'Oakmoss'],
 'Unisex', 'Moderate', 'Summer, Beach, Coastal Outdoors', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Tom Ford', 'Tuscan Leather', 'Leather',
 ARRAY['Raspberry', 'Saffron', 'Thyme'], ARRAY['Jasmine', 'Olibanum', 'Woody Notes'], ARRAY['Leather', 'Amber', 'Oakmoss', 'Suede', 'White Musk'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Tom Ford', 'Fucking Fabulous', 'Sweet Leather',
 ARRAY['Clary Sage', 'Oregano'], ARRAY['Leather', 'Iris', 'Orris'], ARRAY['Tonka Bean', 'Cashmeran', 'Almond'],
 'Unisex', 'Moderate', 'Evening, Date Night, Bold Expression', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Tom Ford', 'Beau de Jour', 'Fresh Fougere',
 ARRAY['Bergamot', 'Lavender', 'Clary Sage'], ARRAY['Jasmine', 'Hedione', 'Violet Leaf'], ARRAY['Vetiver', 'Oakmoss', 'Benzyl Salicylate', 'Musk'],
 'Men', 'Moderate', 'Office, Casual, Everyday', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Tom Ford', 'Rose Prick', 'Floral Spicy',
 ARRAY['Bergamot', 'Cinnamon', 'Clove', 'Ginger'], ARRAY['Rose', 'Ylang-Ylang', 'Jasmine', 'Geranium'], ARRAY['Amber', 'Sandalwood', 'Patchouli', 'Musk'],
 'Unisex', 'Moderate', 'Evening, Date Night, Romantic', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Tom Ford', 'Grey Vetiver', 'Woody Aromatic',
 ARRAY['Grapefruit', 'Vetiver', 'Orange', 'Bergamot'], ARRAY['Sage', 'Orris', 'Geranium', 'Cardamom'], ARRAY['Vetiver', 'Oakmoss', 'Amber', 'Sandalwood'],
 'Men', 'Moderate', 'Office, Versatile, All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- MAISON MARGIELA REPLICA
-- ──────────────────────────────────────────────────────────────────────────────
('Maison Margiela', 'Replica By the Fireplace', 'Warm Spicy',
 ARRAY['Pink Peppercorn', 'Cloves', 'Orange'], ARRAY['Chestnut', 'Guaiac Wood', 'Cashmeran'], ARRAY['Vanilla', 'Musk', 'Peru Balsam'],
 'Unisex', 'Moderate', 'Cold Weather, Evening, Cozy Occasions', 1, 'Endothermic Anchor', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Bubble Bath', 'Aquatic Floral',
 ARRAY['Aldehydes', 'Lemon'], ARRAY['Jasmine', 'Lily-of-the-Valley', 'Iris', 'Rose'], ARRAY['White Musk', 'Soapy Notes', 'Cedarwood'],
 'Unisex', 'Weak', 'Casual, Morning Ritual, Clean Skin', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Beach Walk', 'Fresh Marine',
 ARRAY['Bergamot', 'Lemon', 'Pink Pepper'], ARRAY['Coconut Milk', 'Iris', 'Jasmine'], ARRAY['White Musk', 'Sandalwood', 'Ambergris', 'Amber'],
 'Unisex', 'Moderate', 'Summer, Beach, Vacation', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Flower Market', 'Floral Green',
 ARRAY['Galbanum', 'Cyclamen', 'Bergamot'], ARRAY['Violet', 'Peony', 'Peach Blossom'], ARRAY['White Musk', 'Sandalwood', 'Ambergris'],
 'Unisex', 'Moderate', 'Spring, Casual Daytime, Fresh', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Coffee Break', 'Gourmand',
 ARRAY['Coffee', 'Cardamom'], ARRAY['Cinnamon', 'Almond', 'Java Coffee'], ARRAY['Sandalwood', 'Vanilla', 'Cocoa', 'Musk'],
 'Unisex', 'Moderate', 'Casual, Morning, Office Comfort', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Under the Lemon Trees', 'Fresh Citrus',
 ARRAY['Lemon', 'Bergamot', 'Petitgrain'], ARRAY['Mango', 'Jasmine', 'Orris Root', 'Cardamom'], ARRAY['Amber', 'Musk', 'Sandalwood'],
 'Unisex', 'Moderate', 'Summer, Casual, Daytime Fresh', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica At the Barber''s', 'Fresh Fougere',
 ARRAY['Mint', 'Bergamot', 'Sage'], ARRAY['Lavender', 'Violet', 'Iris', 'Orris'], ARRAY['Musk', 'Sandalwood', 'Guaiac Wood'],
 'Men', 'Moderate', 'Morning, Office, Classic Daily', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Sailing Day', 'Fresh Aquatic',
 ARRAY['Citrus', 'Sea Notes', 'Bergamot'], ARRAY['Aquatic Notes', 'Iris', 'Rosemary'], ARRAY['Vetiver', 'Cedar', 'Musk', 'Ambergris'],
 'Unisex', 'Moderate', 'Summer, Casual, Outdoors', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica Lazy Sunday Morning', 'Floral Musk',
 ARRAY['Aldehydes', 'Rose'], ARRAY['Iris', 'Peony', 'Lily', 'Jasmine'], ARRAY['White Musk', 'Sandalwood', 'Amber'],
 'Unisex', 'Weak', 'Casual, Weekend, Morning', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Maison Margiela', 'Replica On a Date', 'Floral Woody',
 ARRAY['Bergamot', 'Plum', 'Raspberry'], ARRAY['Rose', 'Iris', 'Jasmine'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Vanilla'],
 'Unisex', 'Moderate', 'Date Night, Evening, Romantic', 2, 'Textural Modulator', false, 'Eau de Toilette'),

-- ──────────────────────────────────────────────────────────────────────────────
-- BY KILIAN
-- ──────────────────────────────────────────────────────────────────────────────
('Kilian', 'Black Phantom', 'Gourmand Oriental',
 ARRAY['Dark Rum', 'Blackcurrant', 'Lemon'], ARRAY['Caramel', 'Coffee', 'Jasmine'], ARRAY['Vanilla', 'Musk', 'Benzoin', 'Vetiver'],
 'Unisex', 'Strong', 'Evening, Night Out, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Kilian', 'Angels'' Share', 'Gourmand Bourbon',
 ARRAY['Cognac', 'Cinnamon', 'Cardamom'], ARRAY['Bourbon', 'Sandalwood', 'Cloves', 'Vanilla'], ARRAY['Vanilla', 'Tonka Bean', 'Oak', 'Amber'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Date Night', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Kilian', 'Good Girl Gone Bad', 'White Floral',
 ARRAY['Orange Blossom', 'Neroli', 'Aldehydes'], ARRAY['Tuberose', 'Jasmine', 'Rose', 'Lily-of-the-Valley'], ARRAY['Musk', 'Amber', 'Vetiver', 'Sandalwood'],
 'Women', 'Moderate', 'Evening, Date Night, Feminine Signature', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Kilian', 'Love Don''t Be Shy', 'Floral Gourmand',
 ARRAY['Bergamot', 'Neroli'], ARRAY['Orange Blossom', 'Jasmine', 'Marshmallow'], ARRAY['Musk', 'Amber', 'Honey', 'Vanilla'],
 'Unisex', 'Moderate', 'Date Night, Romantic, Casual Evening', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Kilian', 'Straight to Heaven', 'Oriental Rum',
 ARRAY['Bergamot', 'Cardamom', 'Pink Pepper'], ARRAY['Patchouli', 'Rum', 'Orris Root', 'Civet'], ARRAY['Vanilla', 'Musk', 'Sandalwood', 'Amber'],
 'Men', 'Strong', 'Evening, Bold Statement, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Kilian', 'Back to Black', 'Oriental Honey',
 ARRAY['Apple', 'Honey', 'Saffron'], ARRAY['Tobacco', 'Immortelle', 'Jasmine'], ARRAY['Vanilla', 'Musk', 'Amber', 'Dark Rum'],
 'Unisex', 'Strong', 'Evening, Night Out, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Kilian', 'Princess', 'Floral Fruity',
 ARRAY['Lychee', 'Mandarin Orange', 'Peach', 'Grapefruit'], ARRAY['Peony', 'Rose', 'Vanilla', 'Jasmine'], ARRAY['White Musk', 'Sandalwood', 'Heliotrope'],
 'Women', 'Moderate', 'Casual, Date, Spring/Summer', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Kilian', 'Apple Brandy on the Rocks', 'Fruity Gourmand',
 ARRAY['Apple', 'Bergamot', 'Cinnamon'], ARRAY['Apple Brandy', 'Cardamom', 'Tonka Bean'], ARRAY['Vanilla', 'Musk', 'Sandalwood', 'Amber'],
 'Unisex', 'Moderate', 'Evening, Date Night, Cool Weather', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Kilian', 'Moonlight in Heaven', 'Fresh Tropical',
 ARRAY['Bergamot', 'Grapefruit', 'Lemon'], ARRAY['Coconut', 'Mango', 'Jasmine'], ARRAY['White Musk', 'Sandalwood', 'Ambroxan'],
 'Unisex', 'Moderate', 'Summer, Vacation, Casual', 3, 'Exothermic Top', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- INITIO PARFUMS PRIVES
-- ──────────────────────────────────────────────────────────────────────────────
('Initio', 'Oud for Greatness', 'Woody Oud',
 ARRAY['Saffron', 'Agarwood (Oud)', 'Nutmeg'], ARRAY['Patchouli', 'Cypriol Oil', 'Labdanum'], ARRAY['Ambergris', 'Vetiver', 'Benzoin', 'Musk'],
 'Unisex', 'Beast Mode', 'Evening, Bold Statement, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Initio', 'Atomic Rose', 'Floral Musky',
 ARRAY['Pink Peppercorn', 'Davana', 'Aldehydes'], ARRAY['Rose', 'Orris', 'Jasmine'], ARRAY['Ambergris', 'White Musk', 'Civet', 'Sandalwood'],
 'Unisex', 'Strong', 'Date Night, Evening, Feminine Signature', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Initio', 'Side Effect', 'Vanilla Musk',
 ARRAY['Nutmeg', 'Pink Pepper'], ARRAY['Davana', 'Ambrette', 'Cashmeran'], ARRAY['Vanilla', 'Ambroxan', 'Musk', 'Tonka Bean'],
 'Unisex', 'Strong', 'Everyday, Office, Versatile Signature', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Initio', 'Rehab', 'Fresh Aromatic',
 ARRAY['Bergamot', 'Lemon', 'Pepper'], ARRAY['Lavender', 'Ambrette', 'Sage'], ARRAY['Ambroxan', 'Cashmeran', 'Musk', 'Vetiver'],
 'Unisex', 'Strong', 'Office, Casual, All-Season', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Initio', 'Addictive Vibration', 'Fruity Floral',
 ARRAY['Pink Pepper', 'Aldehydes', 'Bergamot'], ARRAY['Rose', 'Jasmine', 'Iris', 'Tuberose'], ARRAY['Musk', 'Ambroxan', 'Vetiver', 'Sandalwood'],
 'Women', 'Moderate', 'Casual, Date, Spring', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Initio', 'Magnetic Blend 7', 'Musky Woody',
 ARRAY['Pepper', 'Cardamom'], ARRAY['Sandalwood', 'Cypriol', 'Ambrette'], ARRAY['Ambroxan', 'Musk', 'Vetiver', 'Amber'],
 'Unisex', 'Moderate', 'Casual, Office, Everyday', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Initio', 'Paragon', 'Fresh Woody',
 ARRAY['Bergamot', 'Grapefruit', 'Cardamom'], ARRAY['Lavender', 'Geranium', 'Clary Sage'], ARRAY['Sandalwood', 'Ambroxan', 'Musk', 'Cedar'],
 'Men', 'Strong', 'Office, Casual, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Initio', 'Black Gold Project', 'Woody Oriental',
 ARRAY['Saffron', 'Black Pepper'], ARRAY['Oud', 'Patchouli', 'Labdanum'], ARRAY['Ambergris', 'Leather', 'Benzoin', 'Musk'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold Statement', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Initio', 'Musk Therapy', 'Clean Musk',
 ARRAY['Bergamot', 'Cardamom', 'Pink Pepper'], ARRAY['Ambrette', 'Cashmeran', 'Davana'], ARRAY['Ambroxan', 'White Musk', 'Sandalwood', 'Vanilla'],
 'Unisex', 'Moderate', 'Daily Wear, Clean Signature, Office', 2, 'Textural Modulator', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- AMOUAGE
-- ──────────────────────────────────────────────────────────────────────────────
('Amouage', 'Interlude Man', 'Smoky Woody',
 ARRAY['Bergamot', 'Oregano', 'C10 Aldehyde'], ARRAY['Incense', 'Sandalwood', 'Amber', 'Orchid'], ARRAY['Oud', 'Leather', 'Patchouli', 'Oakmoss'],
 'Men', 'Beast Mode', 'Evening, Special Occasion, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Amouage', 'Interlude Woman', 'Floral Oriental',
 ARRAY['Bergamot', 'Angelica', 'Cyclamen'], ARRAY['Rose', 'Incense', 'Labdanum', 'Papyrus'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Vetiver'],
 'Women', 'Strong', 'Evening, Special Occasion, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Amouage', 'Reflection Man', 'Floral Woody Musk',
 ARRAY['Grapefruit', 'Rosemary', 'Benzoin'], ARRAY['Orris', 'Jasmine', 'Neroli', 'Lily-of-the-Valley', 'Petitgrain'], ARRAY['Sandalwood', 'Musk', 'Ambergris', 'Vetiver'],
 'Men', 'Moderate', 'Office, Casual, All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Amouage', 'Reflection Woman', 'Floral White',
 ARRAY['Bergamot', 'Tarragon'], ARRAY['Jasmine', 'Rose', 'Lily-of-the-Valley', 'Orris'], ARRAY['Sandalwood', 'Musk', 'Ambergris', 'Vetiver'],
 'Women', 'Moderate', 'Office, Spring, Daytime', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Amouage', 'Dia Man', 'Woody Aromatic',
 ARRAY['Bergamot', 'Cardamom', 'Aldehydes'], ARRAY['Coriander', 'Neroli', 'Rose', 'Orris'], ARRAY['Sandalwood', 'Amber', 'Vetiver', 'Oakmoss', 'Musk'],
 'Men', 'Moderate', 'Office, Formal, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Amouage', 'Epic Man', 'Woody Oriental',
 ARRAY['Frankincense', 'Pepper', 'Coriander'], ARRAY['Cardamom', 'Labdanum', 'Rose', 'Sandalwood'], ARRAY['Oud', 'Myrrh', 'Patchouli', 'Vetiver'],
 'Men', 'Strong', 'Evening, Cold Weather, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Amouage', 'Memoir Man', 'Woody Smoky',
 ARRAY['Wormwood', 'Black Pepper', 'Cardamom'], ARRAY['Papyrus', 'Labdanum', 'Guaiac Wood', 'Frankincense'], ARRAY['Sandalwood', 'Agarwood', 'Patchouli', 'Vetiver', 'Leather'],
 'Men', 'Strong', 'Evening, Special Occasion, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Amouage', 'Jubilation XXV Men', 'Oriental Amber',
 ARRAY['Blackcurrant', 'Coriander', 'Bergamot', 'Lavender'], ARRAY['Frankincense', 'Rose', 'Oakmoss', 'Cinnamon', 'Orris'], ARRAY['Oud', 'Patchouli', 'Sandalwood', 'Amber', 'Musk'],
 'Men', 'Strong', 'Evening, Formal, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Amouage', 'Gold Man', 'Floral Oriental',
 ARRAY['Frankincense', 'Coriander', 'Bergamot', 'Lily-of-the-Valley'], ARRAY['Rose', 'Orris', 'Jasmine', 'Lily-of-the-Valley'], ARRAY['Sandalwood', 'Oud', 'Musk', 'Amber', 'Benzoin'],
 'Men', 'Strong', 'Formal, Special Occasion, Evening', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Amouage', 'Honour Man', 'Woody Floral',
 ARRAY['Tarragon', 'Bergamot', 'Black Pepper'], ARRAY['Orris', 'Jasmine', 'Rosemary', 'Violet'], ARRAY['Sandalwood', 'Amber', 'Patchouli', 'Vetiver', 'Musk'],
 'Men', 'Moderate', 'Office, Formal, Evening', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Amouage', 'Beach Hut Man', 'Fresh Aromatic',
 ARRAY['Bergamot', 'Grapefruit', 'Mint'], ARRAY['Juniper Berry', 'Lavender', 'Sea Notes'], ARRAY['Sandalwood', 'Musk', 'Ambergris', 'Cedar'],
 'Men', 'Moderate', 'Summer, Casual, Beach', 3, 'Exothermic Top', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- XERJOFF
-- ──────────────────────────────────────────────────────────────────────────────
('Xerjoff', 'Naxos', 'Oriental Tobacco',
 ARRAY['Bergamot', 'Italian Lemon', 'Lavender'], ARRAY['Iris', 'Tobacco', 'Honey', 'Jasmine'], ARRAY['Vanilla', 'Tonka Bean', 'Musk', 'Sandalwood'],
 'Unisex', 'Strong', 'Evening, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Xerjoff', 'Erba Pura', 'Fresh Fruity',
 ARRAY['Citrus', 'Lemon', 'Bergamot'], ARRAY['Jasmine', 'Rose', 'Fruity Notes'], ARRAY['Sandalwood', 'Vanilla', 'White Musk', 'Ambergris'],
 'Unisex', 'Strong', 'Summer, Casual, Versatile', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Xerjoff', '40 Knots', 'Fresh Marine',
 ARRAY['Sea Notes', 'Bergamot', 'Mandarin Orange'], ARRAY['Aquatic Notes', 'Jasmine', 'Rose'], ARRAY['Sandalwood', 'Musk', 'Ambergris'],
 'Unisex', 'Moderate', 'Summer, Casual, Outdoors', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Xerjoff', 'Casamorati 1888', 'Warm Spicy Amber',
 ARRAY['Bergamot', 'Orange Blossom', 'Black Pepper'], ARRAY['Rose', 'Iris', 'Jasmine', 'Cardamom'], ARRAY['Sandalwood', 'Amber', 'Vanilla', 'Musk', 'Patchouli'],
 'Unisex', 'Moderate', 'Evening, Date Night, Autumn', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Xerjoff', 'Alexandria II', 'Fruity Floral',
 ARRAY['Bergamot', 'Grapefruit', 'Calabrian Bergamot'], ARRAY['Orange Blossom', 'Jasmine', 'Iris', 'Rose'], ARRAY['Sandalwood', 'Vanilla', 'White Musk', 'Cedar'],
 'Unisex', 'Strong', 'Evening, Date, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Xerjoff', 'Lira', 'Fresh Floral',
 ARRAY['Bergamot', 'Lemon', 'Calabrian Bergamot'], ARRAY['Iris', 'Rose', 'Neroli', 'Jasmine'], ARRAY['Sandalwood', 'Musk', 'Ambergris', 'Cedar'],
 'Unisex', 'Moderate', 'Spring/Summer, Casual, Office', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Xerjoff', 'Nio', 'Woody Amber',
 ARRAY['Bergamot', 'Grapefruit', 'Orange'], ARRAY['Davana', 'Rose', 'Jasmine', 'Carrot Seeds'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Patchouli'],
 'Unisex', 'Moderate', 'Casual, Evening, Autumn', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Xerjoff', 'Italica', 'Fresh Citrus Woody',
 ARRAY['Calabrian Bergamot', 'Sicilian Lemon', 'Grapefruit'], ARRAY['Iris', 'Jasmine', 'Neroli', 'Ambrette'], ARRAY['Sandalwood', 'Musk', 'White Cedar', 'Ambergris'],
 'Unisex', 'Moderate', 'Summer, Office, Casual', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Xerjoff', 'Casamorati Mefisto', 'Woody Spicy',
 ARRAY['Bergamot', 'Grapefruit', 'Black Pepper'], ARRAY['Cardamom', 'Cinnamon', 'Iris', 'Vetiver'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Patchouli'],
 'Men', 'Strong', 'Evening, Cold Weather, Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- MONTALE
-- ──────────────────────────────────────────────────────────────────────────────
('Montale', 'Black Aoud', 'Woody Oud',
 ARRAY['Raspberry', 'Rose'], ARRAY['Rose', 'Patchouli', 'Oud'], ARRAY['Musk', 'Sandalwood', 'Oakmoss', 'Amber'],
 'Unisex', 'Beast Mode', 'Evening, Cold Weather, Bold Statement', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Montale', 'Intense Café', 'Gourmand Oriental',
 ARRAY['Coffee', 'Vanilla', 'Saffron'], ARRAY['Musk', 'Rose', 'Jasmine', 'Coffee'], ARRAY['Vanilla', 'Patchouli', 'Benzoin', 'Cedar'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Cozy', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Montale', 'Roses Musk', 'Floral Musk',
 ARRAY['Pink Pepper', 'Lemon'], ARRAY['Rose', 'Peony'], ARRAY['White Musk', 'Cedar', 'Sandalwood'],
 'Unisex', 'Moderate', 'Spring, Casual, Office', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Montale', 'Oud Dream', 'Woody Oud Floral',
 ARRAY['Saffron', 'Bergamot', 'Cardamom'], ARRAY['Oud', 'Rose', 'Geranium'], ARRAY['Sandalwood', 'Patchouli', 'Amber', 'Musk'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Montale', 'White Musk', 'Clean Musk',
 ARRAY['Bergamot', 'Lemon'], ARRAY['Rose', 'Iris', 'Jasmine'], ARRAY['White Musk', 'Sandalwood', 'Cedar'],
 'Unisex', 'Moderate', 'Casual, Office, Clean Everyday', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Montale', 'Dark Purple', 'Floral Fruity',
 ARRAY['Plum', 'Violet', 'Bergamot'], ARRAY['Rose', 'Iris', 'Ylang-Ylang'], ARRAY['Musk', 'Sandalwood', 'Patchouli', 'Amber'],
 'Women', 'Moderate', 'Date Night, Evening, Autumn', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Montale', 'Wild Aoud', 'Woody Oud Spicy',
 ARRAY['Bergamot', 'Pink Pepper', 'Saffron'], ARRAY['Oud', 'Rose', 'Sandalwood'], ARRAY['Vetiver', 'Musk', 'Amber', 'Patchouli'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold Statement', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Montale', 'Crystal Flowers', 'Fresh Floral',
 ARRAY['Aldehydes', 'Neroli', 'Bergamot'], ARRAY['Jasmine', 'Iris', 'Rose', 'Peony'], ARRAY['Amber', 'Musk', 'Sandalwood', 'Cedarwood'],
 'Unisex', 'Moderate', 'Spring, Casual, Feminine', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Montale', 'Vanilla Extasy', 'Vanilla Floral',
 ARRAY['Bergamot', 'Lemon'], ARRAY['Rose', 'Iris', 'Jasmine', 'Lily-of-the-Valley'], ARRAY['Vanilla', 'Musk', 'Sandalwood', 'Amber'],
 'Women', 'Moderate', 'Casual, Date, Autumn/Winter', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Montale', 'Oud Tobacco', 'Tobacco Oud',
 ARRAY['Bergamot', 'Pink Pepper', 'Cardamom'], ARRAY['Tobacco', 'Oud', 'Rose'], ARRAY['Sandalwood', 'Amber', 'Patchouli', 'Musk'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- MANCERA
-- ──────────────────────────────────────────────────────────────────────────────
('Mancera', 'Cedrat Boisé', 'Fresh Citrus Woody',
 ARRAY['Calabrian Bergamot', 'Cardamom', 'Grapefruit'], ARRAY['Vetiver', 'Patchouli', 'Oakmoss'], ARRAY['Sandalwood', 'Ambergris', 'Musk'],
 'Men', 'Strong', 'Office, Versatile, All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Mancera', 'Red Tobacco', 'Tobacco Spicy',
 ARRAY['Saffron', 'Cloves', 'Cinnamon'], ARRAY['Tobacco', 'Rose', 'Patchouli', 'Guaiac Wood'], ARRAY['Vanilla', 'Amber', 'Musk', 'Sandalwood'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Mancera', 'Black to Musk', 'Musky Woody',
 ARRAY['Bergamot', 'Cardamom', 'Elemi'], ARRAY['Patchouli', 'Ambrette', 'Cypriol'], ARRAY['Musk', 'Ambroxan', 'Sandalwood', 'Benzoin'],
 'Unisex', 'Moderate', 'Casual, Office, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Mancera', 'Instant Crush', 'Floral Gourmand',
 ARRAY['Bergamot', 'Raspberry', 'Lemon'], ARRAY['Rose', 'Jasmine', 'Iris', 'Peony'], ARRAY['Vanilla', 'Musk', 'Sandalwood', 'Cashmeran'],
 'Unisex', 'Moderate', 'Date Night, Casual, Spring', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Mancera', 'Roses Vanille', 'Floral Vanilla',
 ARRAY['Raspberry', 'Bergamot', 'Lemon'], ARRAY['Rose', 'Peony', 'Orchid'], ARRAY['Vanilla', 'Musk', 'Sandalwood', 'Patchouli'],
 'Women', 'Moderate', 'Date Night, Evening, Feminine', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Mancera', 'Wild Fruits', 'Fruity Fresh',
 ARRAY['Bergamot', 'Peach', 'Orange', 'Lemon'], ARRAY['Raspberry', 'Red Fruits', 'Violet', 'Rose'], ARRAY['Musk', 'Sandalwood', 'Cedar'],
 'Unisex', 'Moderate', 'Summer, Casual, Daytime', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Mancera', 'Aoud Forest', 'Woody Oud',
 ARRAY['Bergamot', 'Grapefruit', 'Cardamom'], ARRAY['Oud', 'Patchouli', 'Vetiver', 'Rose'], ARRAY['Sandalwood', 'Amber', 'Musk'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold Statement', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Mancera', 'Soleil de Capri', 'Fresh Citrus Floral',
 ARRAY['Bergamot', 'Lemon', 'Orange', 'Grapefruit'], ARRAY['Jasmine', 'Peony', 'Rose'], ARRAY['Musk', 'Sandalwood', 'White Cedar'],
 'Unisex', 'Moderate', 'Summer, Beach, Daytime', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Mancera', 'Amber Fever', 'Oriental Amber',
 ARRAY['Bergamot', 'Cardamom', 'Saffron'], ARRAY['Amber', 'Rose', 'Vanilla', 'Jasmine'], ARRAY['Patchouli', 'Musk', 'Labdanum', 'Sandalwood'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Date Night', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Mancera', 'Holidays Man', 'Fresh Aquatic',
 ARRAY['Grapefruit', 'Bergamot', 'Lemon'], ARRAY['Aquatic Notes', 'Geranium', 'Neroli'], ARRAY['Driftwood', 'Musk', 'Ambergris', 'Cedar'],
 'Men', 'Moderate', 'Summer, Beach, Vacation', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Mancera', 'Homme Intense', 'Woody Spicy',
 ARRAY['Bergamot', 'Pink Pepper', 'Coriander'], ARRAY['Oakmoss', 'Vetiver', 'Patchouli', 'Geranium'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Cedar'],
 'Men', 'Strong', 'Evening, Cold Weather, Formal', 2, 'Textural Modulator', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- RASASI
-- ──────────────────────────────────────────────────────────────────────────────
('Rasasi', 'La Yuqawam Homme', 'Woody Aromatic',
 ARRAY['Bergamot', 'Cardamom', 'Mandarin Orange'], ARRAY['Rose', 'Geranium', 'Vetiver', 'Orris'], ARRAY['Amber', 'Musk', 'Sandalwood', 'Cedar'],
 'Men', 'Strong', 'Office, Versatile, Evening', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Rasasi', 'He Is Him', 'Fresh Aromatic',
 ARRAY['Bergamot', 'Grapefruit', 'Mint'], ARRAY['Lavender', 'Cardamom', 'Rosemary'], ARRAY['Cedar', 'White Musk', 'Sandalwood'],
 'Men', 'Moderate', 'Casual, Office, Daytime', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Rasasi', 'Egra', 'Fresh Aquatic',
 ARRAY['Bergamot', 'Lemon', 'Grapefruit'], ARRAY['Aquatic Notes', 'Jasmine', 'Violet'], ARRAY['Sandalwood', 'Musk', 'Cedar', 'Ambergris'],
 'Men', 'Moderate', 'Summer, Casual, Outdoors', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Rasasi', 'Dhan Al Oudh Al Nokhba', 'Woody Oud',
 ARRAY['Saffron', 'Rose'], ARRAY['Oud', 'Sandalwood', 'Patchouli'], ARRAY['Amber', 'Musk', 'Vetiver'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Bold', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Rasasi', 'Chastity Man', 'Woody Spicy',
 ARRAY['Bergamot', 'Black Pepper', 'Cardamom'], ARRAY['Jasmine', 'Rose', 'Violet', 'Orris'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Cedar'],
 'Men', 'Moderate', 'Office, Evening, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Rasasi', 'Blue Lady', 'Fresh Floral',
 ARRAY['Bergamot', 'Lime', 'Grapefruit'], ARRAY['Jasmine', 'Rose', 'Iris', 'Lily'], ARRAY['White Musk', 'Cedar', 'Sandalwood'],
 'Women', 'Moderate', 'Casual, Spring, Office', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Rasasi', 'Hawas', 'Fresh Aquatic Woody',
 ARRAY['Bergamot', 'Mandarin Orange', 'Pepper'], ARRAY['Aquatic Notes', 'Vetiver', 'Patchouli', 'Geranium'], ARRAY['Musk', 'Ambergris', 'Sandalwood', 'Oakmoss'],
 'Men', 'Strong', 'Office, Daytime, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Rasasi', 'Al Wisam Day', 'Fresh Aromatic',
 ARRAY['Bergamot', 'Grapefruit', 'Lavender'], ARRAY['Geranium', 'Cardamom', 'Rosemary'], ARRAY['Sandalwood', 'Cedar', 'Musk', 'Amber'],
 'Men', 'Moderate', 'Daytime, Office, Casual', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Rasasi', 'Al Wisam Night', 'Oriental Spicy',
 ARRAY['Cardamom', 'Bergamot', 'Cinnamon'], ARRAY['Rose', 'Oud', 'Jasmine', 'Amber'], ARRAY['Sandalwood', 'Musk', 'Vetiver', 'Amber'],
 'Men', 'Strong', 'Evening, Night Out, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Rasasi', 'Faqat Lak', 'Floral Oriental',
 ARRAY['Bergamot', 'Lemon', 'Peach'], ARRAY['Rose', 'Jasmine', 'Violet', 'Orris'], ARRAY['Sandalwood', 'Musk', 'Amber', 'Vanilla'],
 'Women', 'Moderate', 'Date Night, Evening, Romantic', 2, 'Textural Modulator', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- SWISS ARABIAN
-- ──────────────────────────────────────────────────────────────────────────────
('Swiss Arabian', 'Wajd', 'Oud Floral',
 ARRAY['Saffron', 'Cardamom', 'Bergamot'], ARRAY['Oud', 'Rose', 'Sandalwood'], ARRAY['Amber', 'Musk', 'Patchouli'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Bold', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Swiss Arabian', 'Layali Rouge', 'Oriental Floral',
 ARRAY['Bergamot', 'Mandarin Orange', 'Lemon'], ARRAY['Rose', 'Jasmine', 'Ylang-Ylang', 'Lily'], ARRAY['Amber', 'Musk', 'Sandalwood', 'Patchouli'],
 'Women', 'Strong', 'Evening, Date Night, Feminine', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Swiss Arabian', 'Hayati', 'Floral Musky',
 ARRAY['Bergamot', 'Lemon', 'Neroli'], ARRAY['Jasmine', 'Rose', 'Iris', 'Peony'], ARRAY['White Musk', 'Sandalwood', 'Cedar', 'Amber'],
 'Women', 'Moderate', 'Casual, Spring, Daily', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Swiss Arabian', 'Shadha', 'Oriental Floral',
 ARRAY['Bergamot', 'Orange Blossom'], ARRAY['Rose', 'Jasmine', 'Violet', 'Geranium'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Vanilla'],
 'Women', 'Moderate', 'Evening, Date Night, Traditional', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Swiss Arabian', 'Bade''e Al Oud Amethyst', 'Oud Woody Floral',
 ARRAY['Saffron', 'Rose', 'Bergamot'], ARRAY['Oud', 'Patchouli', 'Sandalwood', 'Violet'], ARRAY['Amber', 'Musk', 'Labdanum'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Swiss Arabian', 'Ghayaati', 'Fresh Woody',
 ARRAY['Bergamot', 'Cardamom', 'Grapefruit'], ARRAY['Vetiver', 'Sandalwood', 'Jasmine'], ARRAY['Amber', 'Musk', 'Cedar'],
 'Men', 'Moderate', 'Office, Casual, All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Swiss Arabian', 'Nouf', 'Floral Powdery',
 ARRAY['Bergamot', 'Neroli', 'Aldehydes'], ARRAY['Rose', 'Iris', 'Jasmine', 'Peony'], ARRAY['Sandalwood', 'White Musk', 'Amber', 'Cedar'],
 'Women', 'Moderate', 'Casual, Spring, Feminine', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Swiss Arabian', 'Mukhaltat Maliki', 'Oriental Woody',
 ARRAY['Saffron', 'Bergamot', 'Cardamom'], ARRAY['Oud', 'Rose', 'Amber', 'Sandalwood'], ARRAY['Musk', 'Patchouli', 'Vetiver', 'Incense'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Traditional', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Swiss Arabian', 'Shaghaf Oud Aswad', 'Oud Dark Woody',
 ARRAY['Bergamot', 'Saffron', 'Black Pepper'], ARRAY['Oud', 'Patchouli', 'Rose'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Incense'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Bold Statement', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- LATTAFA PRIDE
-- ──────────────────────────────────────────────────────────────────────────────
('Lattafa Pride', 'Al Qiam Gold', 'Oriental Amber',
 ARRAY['Saffron', 'Bergamot', 'Black Pepper'], ARRAY['Rose', 'Oud', 'Amber'], ARRAY['Sandalwood', 'Musk', 'Patchouli', 'Vanilla'],
 'Unisex', 'Strong', 'Evening, Cold Weather, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Lattafa Pride', 'Ithar', 'Woody Oud',
 ARRAY['Saffron', 'Cardamom', 'Bergamot'], ARRAY['Oud', 'Rose', 'Patchouli'], ARRAY['Amber', 'Musk', 'Sandalwood', 'Vanilla'],
 'Unisex', 'Strong', 'Evening, Bold Statement, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Lattafa Pride', 'Moon Shine', 'Floral Musky',
 ARRAY['Bergamot', 'Lemon', 'Neroli'], ARRAY['Jasmine', 'Rose', 'Iris', 'Peony'], ARRAY['White Musk', 'Sandalwood', 'Amber', 'Cedar'],
 'Women', 'Moderate', 'Casual, Date, Spring', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Lattafa Pride', 'Bade''e Leil', 'Oriental Spicy',
 ARRAY['Cardamom', 'Bergamot', 'Saffron'], ARRAY['Rose', 'Oud', 'Jasmine'], ARRAY['Amber', 'Musk', 'Patchouli', 'Sandalwood'],
 'Men', 'Strong', 'Evening, Night Out, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Lattafa Pride', 'Al Ameed Gold', 'Oud Oriental',
 ARRAY['Saffron', 'Bergamot', 'Rose'], ARRAY['Oud', 'Sandalwood', 'Amber'], ARRAY['Musk', 'Vetiver', 'Patchouli'],
 'Unisex', 'Strong', 'Evening, Formal, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Lattafa Pride', 'Niche Oud', 'Smoky Oud',
 ARRAY['Bergamot', 'Saffron', 'Cardamom'], ARRAY['Oud', 'Cypriol', 'Incense'], ARRAY['Sandalwood', 'Amber', 'Musk', 'Leather'],
 'Unisex', 'Strong', 'Evening, Bold, Special Occasion', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- AFNAN (additional — avoids: 9PM Elixir, 9PM Rebel, Dehn Al Oudh Abiyad,
--         Lynked Freedom, S. Not Only Intense, Supremacy CE, Turathi Electric,
--         Turathi Homme Brown)
-- ──────────────────────────────────────────────────────────────────────────────
('Afnan', '9PM EDP', 'Oriental Spicy',
 ARRAY['Bergamot', 'Pink Pepper', 'Lavender'], ARRAY['Jasmine', 'Patchouli', 'Amber'], ARRAY['Vanilla', 'Tonka Bean', 'Musk', 'Sandalwood'],
 'Men', 'Strong', 'Evening, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Afnan', 'Rare Carbon', 'Woody Aromatic',
 ARRAY['Bergamot', 'Cardamom', 'Black Pepper'], ARRAY['Vetiver', 'Patchouli', 'Amber'], ARRAY['Sandalwood', 'Musk', 'Cedar', 'Oud'],
 'Men', 'Strong', 'Evening, Office, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Afnan', 'Supremacy Silver', 'Fresh Aromatic',
 ARRAY['Bergamot', 'Grapefruit', 'Lavender'], ARRAY['Geranium', 'Jasmine', 'Vetiver'], ARRAY['Cedar', 'White Musk', 'Sandalwood', 'Ambroxan'],
 'Men', 'Moderate', 'Office, Casual, All-Season', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Afnan', 'Blue Shade', 'Fresh Aquatic',
 ARRAY['Bergamot', 'Grapefruit', 'Sea Notes'], ARRAY['Aquatic Notes', 'Lavender', 'Geranium'], ARRAY['Cedar', 'Musk', 'Sandalwood'],
 'Men', 'Moderate', 'Summer, Casual, Office', 3, 'Exothermic Top', false, 'Eau de Toilette'),

('Afnan', 'Soiree', 'Floral Woody',
 ARRAY['Bergamot', 'Mandarin Orange', 'Pink Pepper'], ARRAY['Rose', 'Iris', 'Jasmine', 'Peony'], ARRAY['Sandalwood', 'Musk', 'Amber', 'Cedar'],
 'Women', 'Moderate', 'Evening, Date Night, Feminine', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Afnan', 'Ornament', 'Oriental Amber',
 ARRAY['Bergamot', 'Saffron', 'Cardamom'], ARRAY['Rose', 'Oud', 'Sandalwood'], ARRAY['Amber', 'Musk', 'Patchouli', 'Vanilla'],
 'Unisex', 'Strong', 'Evening, Special Occasion, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

-- ──────────────────────────────────────────────────────────────────────────────
-- ARMAF (additional — avoids: Beach Party, Black Saffron, CDN Urban Man Elixir,
--         Hunter Intense, Odyssey Homme, Odyssey Limoni Fresh, Odyssey Mega)
-- ──────────────────────────────────────────────────────────────────────────────
('Armaf', 'Club de Nuit Intense Man EDT', 'Fruity Chypre',
 ARRAY['Blackcurrant', 'Lemon', 'Apple', 'Pineapple'], ARRAY['Jasmine', 'Birch', 'Rose'], ARRAY['Ambergris', 'Musk', 'Patchouli', 'Vanilla', 'Oakmoss'],
 'Men', 'Beast Mode', 'Evening, Date Night, Office', 2, 'Textural Modulator', false, 'Eau de Toilette'),

('Armaf', 'Club de Nuit Intense Man EDP', 'Fruity Chypre',
 ARRAY['Blackcurrant', 'Lemon', 'Apple', 'Pineapple'], ARRAY['Jasmine', 'Birch', 'Rose'], ARRAY['Ambergris', 'Musk', 'Patchouli', 'Vanilla'],
 'Men', 'Beast Mode', 'Evening, Date Night, Cold Weather', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Armaf', 'Club de Nuit Untold', 'Woody Oriental',
 ARRAY['Apple', 'Lemon', 'Bergamot'], ARRAY['Jasmine', 'Rose', 'Patchouli'], ARRAY['Ambergris', 'Musk', 'Amber', 'Vanilla'],
 'Unisex', 'Strong', 'Evening, Date Night, Versatile', 1, 'Endothermic Anchor', false, 'Eau de Parfum'),

('Armaf', 'Club de Nuit Blue Iconic', 'Fresh Aquatic',
 ARRAY['Bergamot', 'Grapefruit', 'Lavender', 'Aquatic Notes'], ARRAY['Jasmine', 'Violet', 'Iris'], ARRAY['Sandalwood', 'Cedar', 'White Musk', 'Ambergris'],
 'Men', 'Moderate', 'Summer, Office, Daytime', 3, 'Exothermic Top', false, 'Eau de Parfum'),

('Armaf', 'Magnificent', 'Woody Amber',
 ARRAY['Bergamot', 'Pink Pepper', 'Cardamom'], ARRAY['Rose', 'Jasmine', 'Patchouli'], ARRAY['Amber', 'Sandalwood', 'Musk', 'Oud'],
 'Men', 'Strong', 'Evening, Office, All-Season', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Armaf', 'Tag Him', 'Fresh Fougere',
 ARRAY['Bergamot', 'Lavender', 'Cardamom'], ARRAY['Jasmine', 'Iris', 'Geranium'], ARRAY['Sandalwood', 'Cedar', 'Musk', 'Patchouli'],
 'Men', 'Moderate', 'Office, Casual, Versatile', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Armaf', 'Shades Wood', 'Woody Spicy',
 ARRAY['Bergamot', 'Black Pepper', 'Cardamom'], ARRAY['Vetiver', 'Patchouli', 'Jasmine', 'Iris'], ARRAY['Sandalwood', 'Musk', 'Amber', 'Cedar'],
 'Men', 'Moderate', 'Evening, Cold Weather, Office', 2, 'Textural Modulator', false, 'Eau de Parfum'),

('Armaf', 'Tresor de Nuit', 'Floral Oriental',
 ARRAY['Bergamot', 'Peach', 'Raspberry'], ARRAY['Rose', 'Jasmine', 'Peony'], ARRAY['Musk', 'Vanilla', 'Amber', 'Sandalwood'],
 'Women', 'Moderate', 'Evening, Date Night, Feminine', 1, 'Endothermic Anchor', false, 'Eau de Parfum')

ON CONFLICT (brand, name) DO NOTHING;
