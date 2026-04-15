import { Product, CellDataEntry, ScheduleValue } from '../types';
import { MONTHS, getYearSpans } from '../data/products';
import Cell from './Cell';
import * as api from '../lib/api';
import { useState } from 'react';

interface TableViewProps {
  products: Product[];
  monthFilter: number;
  getCellData: (pid: number, mi: number) => CellDataEntry;
  onCellClick: (pid: number, mi: number, x: number, y: number) => void;
  onTooltip: (pid: number, mi: number, x: number, y: number) => void;
  onTooltipMove: (x: number, y: number) => void;
  onTooltipHide: () => void;
  onArrivalChange: (pid: number, val: string) => void;
  onCategoryChange: (pid: number, category: string) => void;
  bulkEditActive: boolean;
}

export default function TableView({
  products, monthFilter,
  getCellData, onCellClick, onTooltip, onTooltipMove, onTooltipHide,
  onArrivalChange, onCategoryChange,
  bulkEditActive,
}: TableViewProps) {
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

  if (products.length === 0) {
    return <div className="empty-state"><div className="icon">🔍</div><p>該当する商品が見つかりません</p></div>;
  }

  const monthsToShow = monthFilter >= 0 ? [monthFilter] : MONTHS.map((_, i) => i);
  const yearSpans = getYearSpans(monthsToShow);

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr className="year-row">
            <th style={{ width: 260 }}>商品名</th>
            <th style={{ width: 110 }}>カテゴリ</th>
            <th style={{ width: 80 }}>入荷数</th>
            {yearSpans.map((span, i) => (
              <th
                key={span.year}
                colSpan={span.count}
                style={{ textAlign: 'center', borderLeft: i > 0 ? '2px solid var(--border)' : undefined }}
              >{span.year}年度</th>
            ))}
          </tr>
          <tr className="month-row">
            <th className="product-col">商品名</th>
            <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 100 }}>カテゴリ</th>
            <th className="arrival-col">入荷数</th>
            {monthsToShow.map(i => {
              const isFirstOf2025 = i === 2;
              return (
                <th
                  key={i}
                  style={isFirstOf2025 ? { borderLeft: '2px solid var(--border)' } : undefined}
                >{MONTHS[i]}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {products.map((p, ri) => {
            const arrivalDisplay = p.arrival > 0 ? p.arrival.toLocaleString() : '—';
            return (
              <tr key={p.id} style={{ animationDelay: `${ri * 0.02}s` }}>
                <td className="product-name">{p.name}</td>

                {/* カテゴリ セル */}
                <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                  {editingCatId === p.id ? (
                    <input
                      autoFocus
                      className="arrival-input"
                      style={{ width: 90, color: 'var(--text)', textAlign: 'center' }}
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
                      className={`category-chip${p.category ? '' : ' empty'}`}
                      onClick={() => setEditingCatId(p.id)}
                      title="クリックして編集"
                    >
                      {p.category || '＋ 設定'}
                    </span>
                  )}
                </td>

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
                    style={i === 2 ? { borderLeft: '2px solid var(--border)' } : undefined}
                  >
                    <Cell
                      value={p.schedule[i]}
                      pid={p.id} mi={i}
                      cellData={getCellData(p.id, i)}
                      onClick={onCellClick}
                      onMouseEnter={onTooltip}
                      onMouseMove={onTooltipMove}
                      onMouseLeave={onTooltipHide}
                      variant="table"
                      bulkEditActive={bulkEditActive}
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
