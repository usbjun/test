/** 月インデックスの上限（120 = 約10年分） */
export const MAX_MONTHS = 120;

/**
 * インデックスからカレンダー年月を算出する内部ヘルパー。
 * インデックス 0 = 2025年4月前半、1 = 2025年4月後半、2 = 2025年5月前半、…
 */
function indexToCalendar(index: number): { calYear: number; calMonth: number; half: '前' | '後' } {
  const monthOffset = Math.floor(index / 2);
  const calMonthIdx = (3 + monthOffset) % 12; // 0=1月, 3=4月
  const calMonth = calMonthIdx + 1;
  const calYear = 2025 + Math.floor((3 + monthOffset) / 12);
  const half = index % 2 === 0 ? '前' : '後';
  return { calYear, calMonth, half };
}

/**
 * インデックスから表示ラベルを生成する。
 * calYear > 2025 の場合は年を括弧で付加して重複を避ける。
 * 例: 0→'4前', 2→'5前', 24→'4前(26)', 26→'5前(26)', 50→'5前(27)', 65→'12後(27)'
 */
export function generateMonthLabel(index: number): string {
  const { calYear, calMonth, half } = indexToCalendar(index);
  if (calYear > 2025) {
    return `${calMonth}${half}(${calYear % 100})`;
  }
  return `${calMonth}${half}`;
}

/**
 * インデックスから年度（会計年度: 5月始まり）を返す。
 * 例: 0→'2025', 2→'2026', 26→'2027', 50→'2028'
 */
export function getFiscalYear(index: number): string {
  const { calYear, calMonth } = indexToCalendar(index);
  return String(calMonth >= 5 ? calYear + 1 : calYear);
}

/**
 * 表示する月数を受け取り、年度ごとにグループ化した配列を返す。
 * MonthFilter タブの動的生成に使用。
 */
export function generateFyGroups(totalMonths: number): { year: string; indices: number[] }[] {
  const groups: { year: string; indices: number[] }[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const yr = getFiscalYear(i);
    const last = groups[groups.length - 1];
    if (!last || last.year !== yr) {
      groups.push({ year: yr, indices: [i] });
    } else {
      last.indices.push(i);
    }
  }
  return groups;
}

/**
 * 表示する月インデックス配列を受け取り、年度スパン情報を返す。
 * テーブルヘッダーの年度 colspan 計算に使用。
 */
export function getYearSpans(monthsToShow: number[]): { year: string; count: number }[] {
  const spans: { year: string; count: number }[] = [];
  for (const i of monthsToShow) {
    const yr = getFiscalYear(i);
    const last = spans[spans.length - 1];
    if (!last || last.year !== yr) {
      spans.push({ year: yr, count: 1 });
    } else {
      last.count++;
    }
  }
  return spans;
}

// ── 後方互換エクスポート ──────────────────────────────────────
// 既存コードが MONTHS[i] / FISCAL_YEARS[i] を参照しているため維持する。
// インデックス 0〜MAX_MONTHS-1 まで事前計算。

export const MONTHS: string[] = Array.from(
  { length: MAX_MONTHS },
  (_, i) => generateMonthLabel(i)
);

export const FISCAL_YEARS: string[] = Array.from(
  { length: MAX_MONTHS },
  (_, i) => getFiscalYear(i)
);
