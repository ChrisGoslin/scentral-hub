/**
 * lib/barcode-db.ts
 * Mock barcode database — maps EAN/UPC codes to fragrance_id
 * In production, this would be a Supabase table
 */

export interface BarcodeEntry {
  barcode: string
  fragrance_id: string
  brand: string
  name: string
}

/**
 * Mock database of 100+ barcode → fragrance mappings
 * Format: valid EAN-13 (13 digits) or UPC-A (12 digits)
 */
export const BARCODE_DATABASE: BarcodeEntry[] = [
  // Niche/Indie Brands (EAN-13 format starting with 59)
  { barcode: '5901362033976', fragrance_id: 'fr_1', brand: 'Byredo', name: 'Burning Rose' },
  { barcode: '5901234123457', fragrance_id: 'fr_2', brand: 'Creed', name: 'Aventus' },
  { barcode: '5412345678901', fragrance_id: 'fr_3', brand: 'Heeley', name: 'Sel Marin' },
  { barcode: '5901111111111', fragrance_id: 'fr_4', brand: 'Maison Francis Kurkdjian', name: 'À la rose' },
  { barcode: '5902222222222', fragrance_id: 'fr_5', brand: 'Penhaligon\'s', name: 'Elisium' },
  { barcode: '5903333333333', fragrance_id: 'fr_6', brand: 'Orto Parisi', name: 'Megamare' },
  { barcode: '5904444444444', fragrance_id: 'fr_7', brand: 'Giardini di Toscana', name: 'Giardino Segreto' },
  { barcode: '5905555555555', fragrance_id: 'fr_8', brand: 'Maison Margiela', name: 'Beach Walk' },
  { barcode: '5906666666666', fragrance_id: 'fr_9', brand: 'Susanne Lang', name: 'Eau de Nil' },
  { barcode: '5907777777777', fragrance_id: 'fr_10', brand: 'Norne', name: 'Fjordur' },

  // Designer Fragrances (EAN-13 format)
  { barcode: '5910001111111', fragrance_id: 'fr_11', brand: 'Dior', name: 'Sauvage' },
  { barcode: '5910002222222', fragrance_id: 'fr_12', brand: 'Chanel', name: 'Bleu de Chanel' },
  { barcode: '5910003333333', fragrance_id: 'fr_13', brand: 'Tom Ford', name: 'Noir Extreme' },
  { barcode: '5910004444444', fragrance_id: 'fr_14', brand: 'Yves Saint Laurent', name: 'La Nuit de l\'Homme' },
  { barcode: '5910005555555', fragrance_id: 'fr_15', brand: 'Guerlain', name: 'L\'Homme Prada' },
  { barcode: '5910006666666', fragrance_id: 'fr_16', brand: 'Versace', name: 'Eros' },
  { barcode: '5910007777777', fragrance_id: 'fr_17', brand: 'Armani', name: 'Acqua di Parma Blu Mediterraneo' },
  { barcode: '5910008888888', fragrance_id: 'fr_18', brand: 'Prada', name: 'Luna Rossa Black' },
  { barcode: '5910009999999', fragrance_id: 'fr_19', brand: 'Hermès', name: 'H24' },
  { barcode: '5910010101010', fragrance_id: 'fr_20', brand: 'Cartier', name: 'L\'Envoutement Noir' },

  // Luxury Houses (EAN-13)
  { barcode: '5920001111111', fragrance_id: 'fr_21', brand: 'Roja Dove', name: 'Diaghilev' },
  { barcode: '5920002222222', fragrance_id: 'fr_22', brand: 'Miu Miu', name: 'L\'Eau Rosée' },
  { barcode: '5920003333333', fragrance_id: 'fr_23', brand: 'Balenciaga', name: 'Florabotanica' },
  { barcode: '5920004444444', fragrance_id: 'fr_24', brand: 'Burberry', name: 'Hero' },
  { barcode: '5920005555555', fragrance_id: 'fr_25', brand: 'Dolce & Gabbana', name: 'The One EDP' },
  { barcode: '5920006666666', fragrance_id: 'fr_26', brand: 'Calvin Klein', name: 'Obsession' },
  { barcode: '5920007777777', fragrance_id: 'fr_27', brand: 'Givenchy', name: 'L\'Homme Prada Intense' },
  { barcode: '5920008888888', fragrance_id: 'fr_28', brand: 'Lancome', name: 'Hypnôse' },
  { barcode: '5920009999999', fragrance_id: 'fr_29', brand: 'Estée Lauder', name: 'Beautiful' },
  { barcode: '5920010101010', fragrance_id: 'fr_30', brand: 'Marc Jacobs', name: 'Daisy' },

  // Niche/Artisanal (EAN-13)
  { barcode: '5930001111111', fragrance_id: 'fr_31', brand: 'Diptyque', name: 'Do Son' },
  { barcode: '5930002222222', fragrance_id: 'fr_32', brand: 'Jo Malone', name: 'Lime Basil & Mandarin' },
  { barcode: '5930003333333', fragrance_id: 'fr_33', brand: 'Frederic Malle', name: 'Carnal Flower' },
  { barcode: '5930004444444', fragrance_id: 'fr_34', brand: 'Miller Harris', name: 'L\'Homme Bleu' },
  { barcode: '5930005555555', fragrance_id: 'fr_35', brand: 'Etat Libre d\'Orange', name: 'La Fin du Monde' },
  { barcode: '5930006666666', fragrance_id: 'fr_36', brand: 'Tauer Perfumes', name: 'L\'Air du Désert Marocain' },
  { barcode: '5930007777777', fragrance_id: 'fr_37', brand: 'Olfactive Studio', name: 'Lumière Blanche' },
  { barcode: '5930008888888', fragrance_id: 'fr_38', brand: 'Zoologist', name: 'Hyrax' },
  { barcode: '5930009999999', fragrance_id: 'fr_39', brand: 'Kerosene', name: 'Accord No. 1' },
  { barcode: '5930010101010', fragrance_id: 'fr_40', brand: 'Serge Lutens', name: 'À La Nuit' },

  // Indie/Emerging (EAN-13)
  { barcode: '5940001111111', fragrance_id: 'fr_41', brand: 'Ellis Brooklyn', name: 'FLOWERBOMB' },
  { barcode: '5940002222222', fragrance_id: 'fr_42', brand: 'Maison Louis Marie', name: 'No. 04 Bousquet' },
  { barcode: '5940003333333', fragrance_id: 'fr_43', brand: 'D.S. & Durga', name: 'Mississippi Medicine' },
  { barcode: '5940004444444', fragrance_id: 'fr_44', brand: 'April Aromatics', name: 'Mulholland' },
  { barcode: '5940005555555', fragrance_id: 'fr_45', brand: 'Peyro Parfums', name: 'Aether' },
  { barcode: '5940006666666', fragrance_id: 'fr_46', brand: 'Roxana Illuminated Perfume', name: 'Roxana' },
  { barcode: '5940007777777', fragrance_id: 'fr_47', brand: 'Goticca', name: 'Sombre' },
  { barcode: '5940008888888', fragrance_id: 'fr_48', brand: 'Sixteen92', name: 'Toasted Hazelnut & Chocolate' },
  { barcode: '5940009999999', fragrance_id: 'fr_49', brand: 'Mellifluence', name: 'Honey Whisper' },
  { barcode: '5940010101010', fragrance_id: 'fr_50', brand: 'Frassrand', name: 'Matcha Shimmer' },

  // Asian Fragrances (EAN-13)
  { barcode: '5950001111111', fragrance_id: 'fr_51', brand: 'Apivita', name: 'Rose & Honey' },
  { barcode: '5950002222222', fragrance_id: 'fr_52', brand: 'Lush', name: 'Twilight' },
  { barcode: '5950003333333', fragrance_id: 'fr_53', brand: 'Kyoto Ocha', name: 'Green Tea' },
  { barcode: '5950004444444', fragrance_id: 'fr_54', brand: 'Hokkaido Perfume', name: 'Lavender Field' },
  { barcode: '5950005555555', fragrance_id: 'fr_55', brand: 'Shanghai Tang', name: 'Essence' },
  { barcode: '5950006666666', fragrance_id: 'fr_56', brand: 'Mumbai Musk', name: 'Sandalwood' },
  { barcode: '5950007777777', fragrance_id: 'fr_57', brand: 'Bangkok Rose', name: 'Incense' },
  { barcode: '5950008888888', fragrance_id: 'fr_58', brand: 'Seoul Scent', name: 'Korean Rose' },
  { barcode: '5950009999999', fragrance_id: 'fr_59', brand: 'Hanoi Heritage', name: 'Oud & Amber' },
  { barcode: '5950010101010', fragrance_id: 'fr_60', brand: 'Bali Botanicals', name: 'Frangipani' },

  // Masculine Focus (UPC-A format, 12 digits)
  { barcode: '012345678901', fragrance_id: 'fr_61', brand: 'Givenchy', name: 'Gentleman Reserve Privée' },
  { barcode: '012345678902', fragrance_id: 'fr_62', brand: 'Paco Rabanne', name: '1 Million Intense' },
  { barcode: '012345678903', fragrance_id: 'fr_63', brand: 'Acqua di Gio', name: 'Profumo' },
  { barcode: '012345678904', fragrance_id: 'fr_64', brand: 'Spicebomb', name: 'Extreme' },
  { barcode: '012345678905', fragrance_id: 'fr_65', brand: 'Montblanc', name: 'Legend Spirit' },
  { barcode: '012345678906', fragrance_id: 'fr_66', brand: 'Hugo Boss', name: 'Bottled Intense' },
  { barcode: '012345678907', fragrance_id: 'fr_67', brand: 'Jean Paul Gaultier', name: 'Le Male Elixir' },
  { barcode: '012345678908', fragrance_id: 'fr_68', brand: 'Nicce London', name: 'Attitude' },
  { barcode: '012345678909', fragrance_id: 'fr_69', brand: 'Lacoste', name: 'Essential Sport' },
  { barcode: '012345678910', fragrance_id: 'fr_70', brand: 'Nautica', name: 'Blue Sail' },

  // Feminine Focus (UPC-A)
  { barcode: '012345678911', fragrance_id: 'fr_71', brand: 'Marc Jacobs', name: 'Decadence' },
  { barcode: '012345678912', fragrance_id: 'fr_72', brand: 'Chanel', name: 'Coco Mademoiselle' },
  { barcode: '012345678913', fragrance_id: 'fr_73', brand: 'Lancôme', name: 'Trésor' },
  { barcode: '012345678914', fragrance_id: 'fr_74', brand: 'Carolina Herrera', name: 'Good Girl' },
  { barcode: '012345678915', fragrance_id: 'fr_75', brand: 'Guerlain', name: 'La Vie Est Belle' },
  { barcode: '012345678916', fragrance_id: 'fr_76', brand: 'YSL', name: 'Black Opium' },
  { barcode: '012345678917', fragrance_id: 'fr_77', brand: 'Prada', name: 'Candy' },
  { barcode: '012345678918', fragrance_id: 'fr_78', brand: 'Dior', name: 'Poison' },
  { barcode: '012345678919', fragrance_id: 'fr_79', brand: 'Estée Lauder', name: 'Pleasures' },
  { barcode: '012345678920', fragrance_id: 'fr_80', brand: 'Clinique', name: 'Happy' },

  // Unisex/Niche (UPC-A)
  { barcode: '012345678921', fragrance_id: 'fr_81', brand: 'Maison Margiela', name: 'Replica Lazy Sunday' },
  { barcode: '012345678922', fragrance_id: 'fr_82', brand: 'CdG Scent 2', name: 'Avocado' },
  { barcode: '012345678923', fragrance_id: 'fr_83', brand: 'Issey Miyake', name: 'L\'Eau d\'Issey' },
  { barcode: '012345678924', fragrance_id: 'fr_84', brand: 'Jil Sander', name: 'Sunlight' },
  { barcode: '012345678925', fragrance_id: 'fr_85', brand: 'Helmut Lang', name: 'Eau de Cologne' },
  { barcode: '012345678926', fragrance_id: 'fr_86', brand: 'Comme des Garçons', name: 'English' },
  { barcode: '012345678927', fragrance_id: 'fr_87', brand: 'Maison Margiela', name: 'Replica Beach Walk' },
  { barcode: '012345678928', fragrance_id: 'fr_88', brand: 'Perfumer\'s Workshop', name: 'Tea Rose' },
  { barcode: '012345678929', fragrance_id: 'fr_89', brand: 'Heeley', name: 'Sel Marin' },
  { barcode: '012345678930', fragrance_id: 'fr_90', brand: 'Frapin', name: 'Séville' },

  // Specialty/Limited (EAN-13)
  { barcode: '5960001111111', fragrance_id: 'fr_91', brand: 'Miller Harris', name: 'Citara Gourmande' },
  { barcode: '5960002222222', fragrance_id: 'fr_92', brand: 'Bruno Fazzolari', name: 'Sorriso' },
  { barcode: '5960003333333', fragrance_id: 'fr_93', brand: 'Yosh', name: 'Amber Sky' },
  { barcode: '5960004444444', fragrance_id: 'fr_94', brand: 'Geranium & Olibanum', name: 'Bergamote & Lavender' },
  { barcode: '5960005555555', fragrance_id: 'fr_95', brand: 'Olfactory Art', name: 'Divine' },
  { barcode: '5960006666666', fragrance_id: 'fr_96', brand: 'Florentia', name: 'Tuscan Leather' },
  { barcode: '5960007777777', fragrance_id: 'fr_97', brand: 'Penumbra', name: 'Noir Absolu' },
  { barcode: '5960008888888', fragrance_id: 'fr_98', brand: 'Xerjoff', name: 'Naxos' },
  { barcode: '5960009999999', fragrance_id: 'fr_99', brand: 'Orto Parisi', name: 'Fico d\'Amalfi' },
  { barcode: '5960010101010', fragrance_id: 'fr_100', brand: 'Tauer', name: 'L\'Air du Desert Marocain' },

  // Additional entries to reach 100+
  { barcode: '5961111111111', fragrance_id: 'fr_101', brand: 'Parfums de Marly', name: 'Heeley Sel Marin' },
  { barcode: '5961222222222', fragrance_id: 'fr_102', brand: 'Rumi', name: 'Saffron Bergamot' },
  { barcode: '5961333333333', fragrance_id: 'fr_103', brand: 'SmellyJelly', name: 'Honeyed Blooms' },
  { barcode: '5961444444444', fragrance_id: 'fr_104', brand: 'Olfactory', name: 'Silk Road' },
  { barcode: '5961555555555', fragrance_id: 'fr_105', brand: 'Antiquarian', name: 'Tobacco & Sage' },
]

/**
 * Lookup fragrance by barcode
 */
export function lookupFragranceByBarcode(barcode: string): BarcodeEntry | null {
  return BARCODE_DATABASE.find(entry => entry.barcode === barcode) ?? null
}

/**
 * Get all barcodes (useful for testing)
 */
export function getAllBarcodes(): string[] {
  return BARCODE_DATABASE.map(entry => entry.barcode)
}

/**
 * Search barcodes by fragrance_id
 */
export function lookupBarcodeByFragranceId(fragrance_id: string): BarcodeEntry | null {
  return BARCODE_DATABASE.find(entry => entry.fragrance_id === fragrance_id) ?? null
}
