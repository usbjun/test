export const MONTHS = [
  '4前','4後','5前','5後','6前','6後','7前','7後',
  '8前','8後','9前','9後','10前','10後','11前','11後',
  '12前','12後','1前','1後','2前','2後','3前','3後',
  '4前(26)','4後(26)',
];

// 5月始まり年度:
//   4前・4後（April 2025）→ 2025年度（前年度末）
//   5前 〜 4後(26)        → 2026年度
export const FISCAL_YEARS = [
  '2025','2025',                                           // Apr 2025
  '2026','2026','2026','2026','2026','2026','2026','2026', // May–Aug 2025
  '2026','2026','2026','2026','2026','2026','2026','2026', // Sep–Dec 2025
  '2026','2026','2026','2026','2026','2026','2026','2026', // Jan–Apr 2026
];

export const FY_GROUPS: { year: string; indices: number[] }[] = [
  { year: '2025', indices: [0, 1] },
  { year: '2026', indices: Array.from({ length: 24 }, (_, i) => i + 2) },
];

/** テーブルヘッダー年度 span 情報を生成 */
export function getYearSpans(monthsToShow: number[]) {
  const spans: { year: string; count: number }[] = [];
  for (const i of monthsToShow) {
    const yr = FISCAL_YEARS[i];
    if (!spans.length || spans[spans.length - 1].year !== yr) {
      spans.push({ year: yr, count: 1 });
    } else {
      spans[spans.length - 1].count++;
    }
  }
  return spans;
}
