import { generateMonthLabel, generateFyGroups } from '../data/products';

interface MonthFilterProps {
  monthFilter: number;
  onMonthFilter: (i: number) => void;
  totalMonths: number;
}

export default function MonthFilter({ monthFilter, onMonthFilter, totalMonths }: MonthFilterProps) {
  const fyGroups = generateFyGroups(totalMonths);

  return (
    <div className="month-filter">
      <button
        className={`month-tab${monthFilter === -1 ? ' active' : ''}`}
        onClick={() => onMonthFilter(-1)}
      >全期間</button>

      {fyGroups.map(group => (
        <span key={group.year}>
          <span className="month-tab year-label">{group.year}年度</span>
          {group.indices.map(i => (
            <button
              key={i}
              className={`month-tab${monthFilter === i ? ' active' : ''}`}
              onClick={() => onMonthFilter(i)}
            >{generateMonthLabel(i)}</button>
          ))}
        </span>
      ))}
    </div>
  );
}
