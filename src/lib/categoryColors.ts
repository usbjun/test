export interface CategoryColor {
  bg: string;
  text: string;
  border: string;
}

const PALETTE: CategoryColor[] = [
  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // blue
  { bg: '#dcfce7', text: '#166534', border: '#86efac' }, // green
  { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // amber
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' }, // pink
  { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' }, // violet
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' }, // orange
  { bg: '#cffafe', text: '#155e75', border: '#67e8f9' }, // cyan
  { bg: '#fdf4ff', text: '#701a75', border: '#e879f9' }, // fuchsia
  { bg: '#fff1f2', text: '#881337', border: '#fda4af' }, // rose
  { bg: '#f0fdf4', text: '#14532d', border: '#4ade80' }, // emerald
];

/** カテゴリ名 → 色オブジェクト（ソート済みカテゴリ一覧で色が安定する） */
export function getCategoryColor(category: string, sortedCategories: string[]): CategoryColor | null {
  if (!category) return null;
  const index = sortedCategories.indexOf(category);
  if (index === -1) return PALETTE[0];
  return PALETTE[index % PALETTE.length];
}
