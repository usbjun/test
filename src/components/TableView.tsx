import { useRef, useState } from 'react';
import { Product, CellDataEntry, ScheduleValue } from '../types';
import { MONTHS, getYearSpans } from '../data/products';
import Cell from './Cell';
import CategoryInput from './CategoryInput';

interface TableViewProps {
  products: Product[];
  allCategories: string[];
  monthFilter: number;
  getCellData: (pid: number, mi: number) => CellDataEntry;
  onCellClick: (pid: number, mi: number, x: number, y: number) => void;
  onTooltip: (pid: number, mi: number, x: number, y: number) => void;
  onTooltipMove: (x: number, y: number) => void;
  onTooltipHide: () => void;
  onArrivalChange: (pid: number, val: string) => void;
  onCategoryChange: (pid: number, category: string) => void;
  bulkStatusActive: boolean;
  bulkCategoryValue: string | undefined;
  onBulkCategoryApply: (pid: number) => void;
  onReorder: (draggedId: number, targetId: number) => void;
  sortBy: 'default' | 'category';
}

export default function TableView({
  products, allCategories, monthFilter,
  getCellData, onCellClick, onTooltip, onTooltipMove, onTooltipHide,
  onArrivalChange, onCategoryChange,
  bulkStatusActive, bulkCategoryValue, onBulkCategoryApply,
  onReorder, sortBy,
}: TableViewProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const canDragId = useRef<number | null>(null);

  if (products.length === 0) {
    return <div className="empty-state"><div className="icon">🔍</div><p>該当する商品が見つかりません</p></div>;
  }

  const monthsToShow = monthFilter >= 0 ? [monthFilter] : MONTHS.map((_, i) => i);
  const yearSpans = getYearSpans(monthsToShow);
  const isDraggable = sortBy === 'default';
  const isCatBulk = bulkCategoryValue !== undefined;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr className="year-row">
            {isDraggable && <th style={{ width: 28 }} />}
            <th style={{ width: 260 }}>商品名</th>
            <th style={{ width: 120 }}>カテゴリ</th>
            <th style={{ width: 80 }}>入荷数</th>
            {yearSpans.map((span, i) => (
              <th key={span.year} colSpan={span.count}
                style={{ textAlign: 'center', borderLeft: i > 0 ? '2px solid var(--border)' : undefined }}>
                {span.year}年度
              </th>
            ))}
          </tr>
          <tr className="month-row">
            {isDraggable && <th style={{ width: 28 }} />}
            <th className="product-col">商品名</th>
            <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 110 }}>カテゴリ</th>
            <th className="arrival-col">入荷数</th>
            {monthsToShow.map(i => (
              <th key={i} style={i === 2 ? { borderLeft: '2px solid var(--border)' } : undefined}>
                {MONTHS[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, ri) => {
            const arrivalDisplay = p.arrival > 0 ? p.arrival.toLocaleString() : '—';
            const isDragging = draggedId === p.id;
            const isOver = dragOverId === p.id;
            const nameClickable = isCatBulk;

            return (
              <tr
                key={p.id}
                draggable={isDraggable}
                style={{
                  animationDelay: `${ri * 0.02}s`,
                  opacity: isDragging ? 0.35 : 1,
                  borderTop: isOver ? '3px solid var(--blue)' : undefined,
                  background: nameClickable ? 'rgba(61,125,202,0.03)' : undefined,
                }}
                onDragStart={e => {
                  if (!isDraggable || canDragId.current !== p.id) { e.preventDefault(); return; }
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggedId(p.id);
                }}
                onDragOver={e => {
                  if (!isDraggable || draggedId === p.id) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverId(p.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={e => {
                  e.preventDefault();
                  if (draggedId !== null && draggedId !== p.id) onReorder(draggedId, p.id);
                  setDraggedId(null); setDragOverId(null); canDragId.current = null;
                }}
                onDragEnd={() => {
                  setDraggedId(null); setDragOverId(null); canDragId.current = null;
                }}
              >
                {/* ドラッグハンドル */}
                {isDraggable && (
                  <td style={{ padding: 0, width: 28 }}>
                    <div
                      className="drag-handle"
                      onMouseDown={() => { canDragId.current = p.id; }}
                      onMouseUp={() => { if (draggedId === null) canDragId.current = null; }}
                    >⠿</div>
                  </td>
                )}

                {/* 商品名 */}
                <td
                  className="product-name"
                  style={nameClickable ? { cursor: 'pointer' } : undefined}
                  onClick={nameClickable ? () => onBulkCategoryApply(p.id) : undefined}
                  title={nameClickable ? `クリックして「${bulkCategoryValue}」を適用` : undefined}
                >
                  {p.name}
                </td>

                {/* カテゴリ */}
                <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                  <CategoryInput
                    value={p.category}
                    categories={allCategories}
                    onSave={cat => onCategoryChange(p.id, cat)}
                    bulkMode={isCatBulk}
                    onBulkApply={() => onBulkCategoryApply(p.id)}
                  />
                </td>

                {/* 入荷数 */}
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

                {/* スケジュールセル */}
                {monthsToShow.map(i => (
                  <td key={i} style={i === 2 ? { borderLeft: '2px solid var(--border)' } : undefined}>
                    <Cell
                      value={p.schedule[i]} pid={p.id} mi={i}
                      cellData={getCellData(p.id, i)}
                      onClick={onCellClick}
                      onMouseEnter={onTooltip} onMouseMove={onTooltipMove} onMouseLeave={onTooltipHide}
                      variant="table" bulkEditActive={bulkStatusActive}
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
