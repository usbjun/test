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
  variant?: 'table' | 'grid';
  monthLabel?: string;
  bulkEditActive?: boolean;
}

export default function Cell({
  value, pid, mi, cellData,
  onClick, onMouseEnter, onMouseMove, onMouseLeave,
  variant = 'table', monthLabel = '',
  bulkEditActive = false,
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

  const bulkClass = bulkEditActive ? ' bulk-target' : '';

  if (variant === 'grid') {
    let cls = `month-cell-dot dot-empty${bulkClass}`;
    let icon = '';
    if (value === '○') { cls = `month-cell-dot dot-ok${bulkClass}`; icon = '○'; }
    else if (value === '△') { cls = `month-cell-dot dot-maybe${bulkClass}`; icon = '△'; }
    else if (value === '?') { cls = `month-cell-dot dot-unknown${bulkClass}`; icon = '?'; }
    return (
      <div className={cls} title={monthLabel} {...handlers}>
        {icon}
        {hasData && <span style={{ position: 'absolute', top: -1, right: -1, width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', display: 'block' }} />}
      </div>
    );
  }

  // table variant
  if (value === '○') return (
    <span className={`cell-ok${bulkClass}`} {...handlers}>
      ○{hasData && <span className="cell-data-dot" />}
    </span>
  );
  if (value === '△') return (
    <span className={`cell-maybe${bulkClass}`} {...handlers}>
      △{hasData && <span className="cell-data-dot" />}
    </span>
  );
  if (value === '?') return (
    <span className={`cell-unknown${bulkClass}`} {...handlers}>
      ?{hasData && <span className="cell-data-dot" />}
    </span>
  );
  return (
    <span className={`cell-empty-clickable${bulkClass}`} {...handlers}>
      ＋{hasData && <span className="cell-data-dot" />}
    </span>
  );
}
