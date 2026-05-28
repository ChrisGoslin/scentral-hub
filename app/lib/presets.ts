import { Fragrance } from './types';

export const PRESET_FRAGRANCES: Fragrance[] = [
  {
    id: 'lattafa-raghba',
    name: 'Raghba',
    brand: 'Lattafa',
    notes: {
      top: ['bergamot', 'lemon', 'pink pepper'],
      heart: ['rose', 'geranium', 'jasmine'],
      base: ['amber', 'oud', 'musk']
    }
  },
  {
    id: 'afnan-turathi',
    name: 'Turathi',
    brand: 'Afnan',
    notes: {
      top: ['saffron', 'cardamom', 'clove'],
      heart: ['rose', 'iris', 'patchouli'],
      base: ['sandalwood', 'vetiver', 'cedarwood']
    }
  },
  {
    id: 'ajmal-wazn',
    name: 'Wazn Al Oud',
    brand: 'Ajmal',
    notes: {
      top: ['ginger', 'cinnamon', 'citrus'],
      heart: ['oud', 'agarwood', 'incense'],
      base: ['amber', 'musk', 'leather']
    }
  }
];
