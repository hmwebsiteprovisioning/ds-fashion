export type ColorSwatch = { name: string; hex: string };

/** Known color names (BG + EN) mapped to hex for storefront swatches */
const COLOR_HEX_MAP: Record<string, string> = {
  'бежово': '#c8b49a',
  beige: '#c8b49a',
  'черно': '#1E1B18',
  black: '#1E1B18',
  'бяло': '#f5f5f5',
  white: '#f5f5f5',
  'кафяво': '#6b4c3b',
  brown: '#6b4c3b',
  chocolate: '#6b4c3b',
  'сиво': '#9e9e9e',
  grey: '#9e9e9e',
  gray: '#9e9e9e',
  'тъмносиньо': '#1c2951',
  navy: '#1c2951',
  blue: '#3b6ea8',
  'синьо': '#3b6ea8',
  red: '#8b2e2e',
  'червено': '#8b2e2e',
  green: '#4a6b4a',
  'зелено': '#4a6b4a',
  pink: '#d4a5a5',
  'розово': '#d4a5a5',
  gold: '#B98236',
  'златисто': '#B98236',
  cream: '#f0e6d8',
  'кремаво': '#f0e6d8',
  olive: '#6b6b3a',
  'маслинено': '#6b6b3a',
};

const DEFAULT_HEX = '#9e9e9e';

export function colorNameToHex(name: string): string {
  const key = name.trim().toLowerCase();
  return COLOR_HEX_MAP[key] ?? DEFAULT_HEX;
}

export function toColorSwatch(name: string): ColorSwatch {
  return { name, hex: colorNameToHex(name) };
}

/** Preset swatches for filter UI (matches storefront design) */
export const PRESET_COLOR_SWATCHES: ColorSwatch[] = [
  { name: 'Бежово', hex: '#c8b49a' },
  { name: 'Черно', hex: '#1E1B18' },
  { name: 'Бяло', hex: '#f5f5f5' },
  { name: 'Кафяво', hex: '#6b4c3b' },
  { name: 'Сиво', hex: '#9e9e9e' },
  { name: 'Тъмносиньо', hex: '#1c2951' },
];

export function matchesColorFilter(productColor: string, selectedColors: string[]): boolean {
  if (!selectedColors.length) return true;
  const normalized = productColor.trim().toLowerCase();
  return selectedColors.some((c) => {
    const sel = c.trim().toLowerCase();
    return normalized === sel || normalized.includes(sel) || sel.includes(normalized);
  });
}
