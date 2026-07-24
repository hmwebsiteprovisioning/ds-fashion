import { CartItem } from '@/types/cart';

/**
 * Extracts and formats all attached characteristics (Color, Size, Material, Fit, Style, etc.)
 * for a CartItem so they can be displayed consistently across Cart Drawer, Cart Page, and Checkout.
 */
export function getItemCharacteristics(
  item: CartItem,
  language: string = 'bg'
): Array<{ label: string; value: string }> {
  const list: Array<{ label: string; value: string }> = [];
  const addedKeys = new Set<string>();

  const formatKeyName = (key: string): string => {
    const k = key.toLowerCase().trim();
    if (['color', 'colour', 'цвят'].includes(k)) return language === 'bg' ? 'Цвят' : 'Color';
    if (['size', 'размер'].includes(k)) return language === 'bg' ? 'Размер' : 'Size';
    if (['material', 'материя', 'материал'].includes(k)) return language === 'bg' ? 'Материя' : 'Material';
    if (['fit', 'кройка'].includes(k)) return language === 'bg' ? 'Кройка' : 'Fit';
    if (['style', 'стил'].includes(k)) return language === 'bg' ? 'Стил' : 'Style';
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Add explicit color first if available
  if (item.color) {
    const label = language === 'bg' ? 'Цвят' : 'Color';
    list.push({ label, value: item.color });
    addedKeys.add('color');
    addedKeys.add('colour');
    addedKeys.add('цвят');
  }

  // Add explicit size if available
  if (item.size) {
    const label = language === 'bg' ? 'Размер' : 'Size';
    list.push({ label, value: item.size });
    addedKeys.add('size');
    addedKeys.add('размер');
  }

  // Add all other options / propertyValues
  const extraProps = { ...(item.propertyValues || {}), ...(item.options || {}) };
  Object.entries(extraProps).forEach(([rawKey, val]) => {
    if (!val) return;
    const kLower = rawKey.toLowerCase().trim();
    if (!addedKeys.has(kLower)) {
      addedKeys.add(kLower);
      list.push({ label: formatKeyName(rawKey), value: String(val) });
    }
  });

  return list;
}
