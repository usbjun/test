import { ScheduleValue, CellDataEntry } from '../types';

interface CellProps {
  value: ScheduleValue;
  pid: number;
  mi: number;
  cellData: CellDataEntry;
  onClick: (pid: number, mi: number, x: number, y: number) => void;
  onMouseEnter: (pid: number, mi: number, x: number, y: number) => void;
  onMouseMove: (x: number, y: number) => void;
  onMouseLeave: () => void;
  /** 'table' renders pill cells; 'grid' renders dot cells */
  variant?: 'table' | 'grid';
  monthLabel?: string;
}

export default function Cell({
  value, pid, mi, cellData,
  onClick, onMouseEnter, onMouseMove, onMouseLeave,
  variant = 'table', monthLabel = '',
}: CellProps) {
  const hasData = cellData.arrival > 0 || cellData.sold > 0;

  const handlers = {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(pid, mi, e.clientX, e.clientY);
    },
    onMouseEnter: (e: React.MouseEvent) => onMouseEnter(pid, mi, e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => onMouseMove(e.clientX, e.clientY),
    onMouseLeave,
  };

  if (variant === 'grid') {
    let cls = 'month-cell-dot dot-empty';
    let icon = '';
    if (value === '○') { cls = 'month-cell-dot dot-ok'; icon = '○'; }
    else if (value === '△') { cls = 'month-cell-dot dot-maybe'; icon = '△'; }
    else if (value === '?') { cls = 'month-cell-dot dot-unknown'; icon = '?'; }
    return (
      <div className={cls} title={monthLabel} {...handlers}>
        {icon}
        {hasData && <span style={{ position: 'absolute', top: -1, right: -1, width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', display: 'block' }} />}
      </div>
    );
  }

  // Table variant
  if (value === '○') {
    return (
      <span className="cell-ok" {...handlers}>
        ○
        {hasData && <span className="cell-data-dot" />}
      </span>
    );
  }
  if (value === '△') {
    return (
      <span className="cell-maybe" {...handlers}>
        △
        {hasData && <span className="cell-data-dot" />}
      </span>
    );
  }
  if (value === '?') {
    return (
      <span className="cell-unknown" {...handlers}>
        ?
        {hasData && <span className="cell-data-dot" />}
      </span>
    );
  }
  return (
    <span className="cell-empty-clickable" {...handlers}>
      ＋
      {hasData && <span className="cell-data-dot" />}
    </span>
  );
}
