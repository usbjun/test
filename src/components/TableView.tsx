import { Product, CellDataEntry } from '../types';
import { MONTHS, MONTH_YEARS } from '../data/products';
import Cell from './Cell';

interface TableViewProps {
  products: Product[];
  monthFilter: number;
  getCellData: (pid: number, mi: number) => CellDataEntry;
  onCellClick: (pid: number, mi: number, x: number, y: number) => void;
  onTooltip: (pid: number, mi: number, x: number, y: number) => void;
  onTooltipMove: (x: number, y: number) => void;
  onTooltipHide: () => void;
  onArrivalChange: (pid: number, val: string) => void;
}

export default function TableView({
  products, monthFilter,
  getCellData, onCellClick, onTooltip, onTooltipMove, onTooltipHide,
  onArrivalChange,
}: TableViewProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🔍</div>
        <p>該当する商品が見つかりません</p>
      </div>
    );
  }

  const monthsToShow = monthFilter >= 0 ? [monthFilter] : MONTHS.map((_, i) => i);
  const y2025cols = monthsToShow.filter(i => MONTH_YEARS[i] === '2025').length;
  const y2026cols = monthsToShow.filter(i => MONTH_YEARS[i] === '2026').length;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          {monthFilter < 0 ? (
            <tr className="year-row">
              <th style={{ width: 280 }}>商品名</th>
              <th>入荷数</th>
              <th colSpan={y2025cols} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>2025年度</th>
              <th colSpan={y2026cols} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>2026年度</th>
            </tr>
          ) : (
            <tr className="year-row">
              <th style={{ width: 280 }}></th>
              <th></th>
              <th>{MONTH_YEARS[monthFilter]}年度</th>
            </tr>
          )}
          <tr className="month-row">
            <th className="product-col">商品名</th>
            <th className="arrival-col">入荷数</th>
            {monthsToShow.map(i => (
              <th
                key={i}
                style={i === 18 ? { borderLeft: '2px solid var(--border)' } : undefined}
              >{MONTHS[i]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, ri) => {
            const arrivalDisplay = p.arrival > 0 ? p.arrival.toLocaleString() : '—';
            return (
              <tr key={p.id} style={{ animationDelay: `${ri * 0.02}s` }}>
                <td className="product-name">{p.name}</td>
                <td className={`arrival-col-td${p.arrival === 0 ? ' zero' : ''}`}>
                  <input
                    className={`arrival-input${p.arrival === 0 ? ' zero' : ''}`}
                    type="text"
                    defaultValue={arrivalDisplay}
                    key={arrivalDisplay}
                    onBlur={e => onArrivalChange(p.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    title="クリックして編集"
                  />
                </td>
                {monthsToShow.map(i => (
                  <td
                    key={i}
                    style={i === 18 ? { borderLeft: '2px solid var(--border)' } : undefined}
                  >
                    <Cell
                      value={p.schedule[i]}
                      pid={p.id}
                      mi={i}
                      cellData={getCellData(p.id, i)}
                      onClick={onCellClick}
                      onMouseEnter={onTooltip}
                      onMouseMove={onTooltipMove}
                      onMouseLeave={onTooltipHide}
                      variant="table"
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
