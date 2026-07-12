/**
 * Admin Chart Colors - Consistent Palette
 *
 * Limited palette (4-6 colors) used consistently across all admin charts.
 * Colors are muted for professional appearance.
 */

// Primary chart color palette (4 colors for categories) — Tailwind class names
export const CHART_COLORS = {
  primary: 'bg-primary',
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
} as const;

// Hex colors for Recharts (SVG fill/stroke)
export const CHART_HEX_COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  info: '#0ea5e9',
  warning: '#f59e0b',
  muted: '#94a3b8',
} as const;

export const CHART_HEX_PALETTE = [
  CHART_HEX_COLORS.primary,
  CHART_HEX_COLORS.success,
  CHART_HEX_COLORS.info,
  CHART_HEX_COLORS.warning,
  CHART_HEX_COLORS.muted,
  '#64748b',
] as const;

// Extended palette (6 colors max) for when needed
export const CHART_COLORS_EXTENDED = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.info,
  CHART_COLORS.warning,
  'bg-slate-400',
  'bg-slate-500',
] as const;

// Category to color mapping (consistent across all pages)
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  Clothes: CHART_COLORS.primary,
  Shoes: CHART_COLORS.success,
  Accessories: CHART_COLORS.warning,
  Perfumes: CHART_COLORS.success,
  Watches: CHART_COLORS.primary,
  Apparel: CHART_COLORS.warning,
};

/**
 * Get Tailwind class color for a category
 */
export function getCategoryColor(category: string, index: number = 0): string {
  const mapped = CATEGORY_COLOR_MAP[category];
  if (mapped) return mapped;
  return CHART_COLORS_EXTENDED[index % CHART_COLORS_EXTENDED.length];
}

/**
 * Get hex color for Recharts
 */
export function getCategoryHexColor(category: string, index: number = 0): string {
  const hexMap: Record<string, string> = {
    Clothes: CHART_HEX_COLORS.primary,
    Shoes: CHART_HEX_COLORS.success,
    Accessories: CHART_HEX_COLORS.warning,
    Perfumes: CHART_HEX_COLORS.success,
    Watches: CHART_HEX_COLORS.primary,
    Apparel: CHART_HEX_COLORS.warning,
  };
  return hexMap[category] ?? CHART_HEX_PALETTE[index % CHART_HEX_PALETTE.length];
}
