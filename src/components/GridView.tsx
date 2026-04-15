import { useState } from 'react';
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
  onCategoryChange: (pid: number, category: string) => void;
  bulkEditActive: boolean;
}

const PAIRS: [number, number][] = Array.from({ length: 13 }, (_, i) => [i * 2, i * 2 + 1]);

export default function GridView({
  products, getCellData,
  onCellClick, onTooltip, onTooltipMove, onTooltipHide,
  onCategoryChange, bulkEditActive,
}: GridViewProps) {
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

  if (products.length === 0) {
    return <div className="empty-state"><div className="icon">🔍</div><p>該当する商品が見つかりません</p></div>;
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
                {/* カテゴリ インライン編集 */}
                {editingCatId === p.id ? (
                  <input
                    autoFocus
                    className="arrival-input"
                    style={{ width: 80, fontSize: 11, color: 'var(--text)', marginLeft: 'auto' }}
                    defaultValue={p.category}
                    onBlur={e => {
                      onCategoryChange(p.id, e.target.value.trim());
                      setEditingCatId(null);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                      if (e.key === 'Escape') setEditingCatId(null);
                    }}
                  />
                ) : (
                  <span
                    className={`category-chip small${p.category ? '' : ' empty'}`}
                    onClick={() => setEditingCatId(p.id)}
                    title="クリックして編集"
                    style={{ marginLeft: 'auto' }}
                  >
                    {p.category || '＋'}
                  </span>
                )}
              </div>
              {p.arrival > 0 && (
                <div className="card-arrival-amount" style={{ marginTop: 4 }}>
                  入荷数 <strong>{p.arrival.toLocaleString()}</strong>
                </div>
              )}
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
                      <Cell value={p.schedule[a]} pid={p.id} mi={a} cellData={getCellData(p.id, a)}
                        onClick={onCellClick} onMouseEnter={onTooltip} onMouseMove={onTooltipMove} onMouseLeave={onTooltipHide}
                        variant="grid" monthLabel={MONTHS[a]} bulkEditActive={bulkEditActive} />
                      <Cell value={p.schedule[b]} pid={p.id} mi={b} cellData={getCellData(p.id, b)}
                        onClick={onCellClick} onMouseEnter={onTooltip} onMouseMove={onTooltipMove} onMouseLeave={onTooltipHide}
                        variant="grid" monthLabel={MONTHS[b]} bulkEditActive={bulkEditActive} />
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
