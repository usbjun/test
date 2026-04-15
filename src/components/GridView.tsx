import { Product, CellDataEntry } from '../types';
import { MONTHS } from '../data/products';
import Cell from './Cell';

interface GridViewProps {
  products: Product[];
  monthFilter: number;
  getCellData: (pid: number, mi: number) => CellDataEntry;
  onCellClick: (pid: number, mi: number, x: number, y: number) => void;
  onTooltip: (pid: number, mi: number, x: number, y: number) => void;
  onTooltipMove: (x: number, y: number) => void;
  onTooltipHide: () => void;
}

// 13 pairs: [0,1],[2,3],...,[24,25]
const PAIRS: [number, number][] = Array.from({ length: 13 }, (_, i) => [i * 2, i * 2 + 1]);

export default function GridView({
  products, getCellData,
  onCellClick, onTooltip, onTooltipMove, onTooltipHide,
}: GridViewProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🔍</div>
        <p>該当する商品が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="grid-view">
      {products.map((p, ri) => {
        const badgeClass = p.status === 'has' ? 'has' : p.status === 'incoming' ? 'incoming' : 'none';
        const badgeText = p.status === 'has' ? '在庫あり' : p.status === 'incoming' ? '入荷予定' : '在庫なし';

        return (
          <div
            key={p.id}
            className={`product-card ${p.status === 'has' ? 'has-stock' : 'no-stock'}`}
            style={{ animationDelay: `${ri * 0.03}s` }}
          >
            <div className="card-header">
              <div className="card-name">{p.name}</div>
              <div className="card-meta">
                <span className={`stock-badge ${badgeClass}`}>{badgeText}</span>
                {p.arrival > 0 && (
                  <span className="card-arrival-amount">
                    入荷数 <strong>{p.arrival.toLocaleString()}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="card-schedule">
              <div className="schedule-label">
                <span>入荷スケジュール</span>
                <span className="schedule-label-hint">上段=前半 / 下段=後半</span>
              </div>
              <div className="schedule-grid">
                {PAIRS.map(([a, b]) => {
                  const mNum = MONTHS[a].replace('前', '').replace('後', '').replace('(26)', '');
                  return (
                    <div key={a} className="month-cell">
                      <div className="month-cell-label">{mNum}</div>
                      <Cell
                        value={p.schedule[a]}
                        pid={p.id}
                        mi={a}
                        cellData={getCellData(p.id, a)}
                        onClick={onCellClick}
                        onMouseEnter={onTooltip}
                        onMouseMove={onTooltipMove}
                        onMouseLeave={onTooltipHide}
                        variant="grid"
                        monthLabel={MONTHS[a]}
                      />
                      <Cell
                        value={p.schedule[b]}
                        pid={p.id}
                        mi={b}
                        cellData={getCellData(p.id, b)}
                        onClick={onCellClick}
                        onMouseEnter={onTooltip}
                        onMouseMove={onTooltipMove}
                        onMouseLeave={onTooltipHide}
                        variant="grid"
                        monthLabel={MONTHS[b]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
