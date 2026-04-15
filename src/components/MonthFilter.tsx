import { MONTHS } from '../data/products';

interface MonthFilterProps {
  monthFilter: number;
  onMonthFilter: (i: number) => void;
}

export default function MonthFilter({ monthFilter, onMonthFilter }: MonthFilterProps) {
  return (
    <div className="month-filter">
      <button
        className={`month-tab${monthFilter === -1 ? ' active' : ''}`}
        onClick={() => onMonthFilter(-1)}
      >全期間</button>

      <span className="month-tab year-label">2025年度</span>
      {MONTHS.slice(0, 18).map((m, i) => (
        <button
          key={i}
          className={`month-tab${monthFilter === i ? ' active' : ''}`}
          onClick={() => onMonthFilter(i)}
        >{m}</button>
      ))}

      <span className="month-tab year-label">2026年度</span>
      {MONTHS.slice(18).map((m, i) => (
        <button
          key={i + 18}
          className={`month-tab${monthFilter === i + 18 ? ' active' : ''}`}
          onClick={() => onMonthFilter(i + 18)}
        >{m}</button>
      ))}
    </div>
  );
}
