import { Product, CellDataEntry } from '../types';
import { MONTHS } from '../data/products';
import Cell from './Cell';
import CategoryInput from './CategoryInput';
import { getCategoryColor } from '../lib/categoryColors';
import { computeStatus } from '../lib/api';

interface GridViewProps {
  products: Product[];
  allCategories: string[];
  monthFilter: number;
  getCellData: (pid: number, mi: number) => CellDataEntry;
  onCellClick: (pid: number, mi: number, x: number, y: number) => void;
  onTooltip: (pid: number, mi: number, x: number, y: number) => void;
  onTooltipMove: (x: number, y: number) => void;
  onTooltipHide: () => void;
  onCategoryChange: (pid: number, category: string) => void;
  bulkStatusActive: boolean;
  bulkCategoryValue: string | undefined;
  onBulkCategoryApply: (pid: number) => void;
  onBulkDragStart?: (pid: number, mi: number) => void;
}

const PAIRS: [number, number][] = Array.from({ length: 13 }, (_, i) => [i * 2, i * 2 + 1]);

export default function GridView({
  products, allCategories, getCellData,
  onCellClick, onTooltip, onTooltipMove, onTooltipHide,
  onCategoryChange, bulkStatusActive, bulkCategoryValue, onBulkCategoryApply, onBulkDragStart,
}: GridViewProps) {
  if (products.length === 0) {
    return <div className="empty-state"><div className="icon">🔍</div><p>該当する商品が見つかりません</p></div>;
  }

  const isCatBulk = bulkCategoryValue !== undefined;

  return (
    <div className="grid-view">
      {products.map((p, ri) => {
        const liveStatus = computeStatus(p.schedule);
        const badgeClass = liveStatus === 'has' ? 'has' : liveStatus === 'incoming' ? 'incoming' : 'none';
        const badgeText = liveStatus === 'has' ? '在庫あり' : liveStatus === 'incoming' ? '入荷予定' : '在庫なし';
        const catColor = p.category ? getCategoryColor(p.category, allCategories) : null;

        return (
          <div
            key={p.id}
            className={`product-card ${liveStatus === 'has' ? 'has-stock' : 'no-stock'}${isCatBulk ? ' cat-bulk-target' : ''}`}
            style={{ animationDelay: `${ri * 0.03}s` }}
            onClick={isCatBulk ? () => onBulkCategoryApply(p.id) : undefined}
            title={isCatBulk ? `クリックして「${bulkCategoryValue}」を適用` : undefined}
          >
            <div className="card-header">
              {/* カテゴリバッジ */}
              {p.category && catColor && (
                <div style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                  fontSize: 10, fontWeight: 700,
                  background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}`,
                  marginBottom: 6,
                }}>
                  {p.category}
                </div>
              )}
              <div className="card-name">{p.name}</div>
              <div className="card-meta">
                <span className={`stock-badge ${badgeClass}`}>{badgeText}</span>
                <div style={{ marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
                  <CategoryInput
                    value={p.category}
                    categories={allCategories}
                    onSave={cat => onCategoryChange(p.id, cat)}
                    small
                    bulkMode={isCatBulk}
                    onBulkApply={() => onBulkCategoryApply(p.id)}
                  />
                </div>
              </div>
              {p.arrival > 0 && (
                <div className="card-arrival-amount" style={{ marginTop: 4 }}>
                  入荷数 <strong>{p.arrival.toLocaleString()}</strong>
                </div>
              )}
            </div>
            <div className="card-schedule" onClick={e => e.stopPropagation()}>
              <div className="schedule-label">
                <span>入荷スケジュール</span>
                <span className="schedule-label-hint">上段=前半 / 下段=後半</span>
              </div>
              <div className="schedule-grid">
                {PAIRS.map(([a, b]) => {
                  const mNum = MONTHS[a].replace('前','').replace('後','').replace('(26)','');
                  return (
                    <div key={a} className="month-cell">
                      <div className="month-cell-label">{mNum}</div>
                      <Cell value={p.schedule[a]} pid={p.id} mi={a} cellData={getCellData(p.id, a)}
                        onClick={onCellClick} onMouseEnter={onTooltip} onMouseMove={onTooltipMove} onMouseLeave={onTooltipHide}
                        variant="grid" monthLabel={MONTHS[a]} bulkEditActive={bulkStatusActive}
                        onBulkMouseDown={onBulkDragStart} />
                      <Cell value={p.schedule[b]} pid={p.id} mi={b} cellData={getCellData(p.id, b)}
                        onClick={onCellClick} onMouseEnter={onTooltip} onMouseMove={onTooltipMove} onMouseLeave={onTooltipHide}
                        variant="grid" monthLabel={MONTHS[b]} bulkEditActive={bulkStatusActive}
                        onBulkMouseDown={onBulkDragStart} />
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
