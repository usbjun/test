import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  onRenameProduct: (pid: number, name: string) => void;
  onDeleteProduct: (pid: number) => void;
  onClearCells: (pid: number) => void;
  bulkStatusActive: boolean;
  bulkCategoryValue: string | undefined;
  onBulkCategoryApply: (pid: number) => void;
  onReorder: (draggedId: number, targetId: number) => void;
  sortBy: 'default' | 'category';
}

interface SettingsState {
  id: number;
  name: string;
  rect: DOMRect;
  confirmDelete: boolean;
}

export default function TableView({
  products, allCategories, monthFilter,
  getCellData, onCellClick, onTooltip, onTooltipMove, onTooltipHide,
  onArrivalChange, onCategoryChange, onRenameProduct, onDeleteProduct, onClearCells,
  bulkStatusActive, bulkCategoryValue, onBulkCategoryApply,
  onReorder, sortBy,
}: TableViewProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const canDragId = useRef<number | null>(null);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [settingsInput, setSettingsInput] = useState('');

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const topScrollInnerRef = useRef<HTMLDivElement>(null);

  // 上部スクロールバーと本体の幅・位置を同期
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    const topScroll = topScrollRef.current;
    const inner = topScrollInnerRef.current;
    if (!wrapper || !topScroll || !inner) return;

    const syncWidth = () => { inner.style.width = `${wrapper.scrollWidth}px`; };
    syncWidth();
    const obs = new ResizeObserver(syncWidth);
    obs.observe(wrapper);

    let syncing = false;
    const onTop = () => { if (!syncing) { syncing = true; wrapper.scrollLeft = topScroll.scrollLeft; syncing = false; } };
    const onTable = () => { if (!syncing) { syncing = true; topScroll.scrollLeft = wrapper.scrollLeft; syncing = false; } };
    topScroll.addEventListener('scroll', onTop);
    wrapper.addEventListener('scroll', onTable);

    return () => {
      obs.disconnect();
      topScroll.removeEventListener('scroll', onTop);
      wrapper.removeEventListener('scroll', onTable);
    };
  }, []);

  if (products.length === 0) {
    return <div className="empty-state"><div className="icon">🔍</div><p>該当する商品が見つかりません</p></div>;
  }

  const monthsToShow = monthFilter >= 0 ? [monthFilter] : MONTHS.map((_, i) => i);
  const yearSpans = getYearSpans(monthsToShow);
  const isDraggable = sortBy === 'default';
  const isCatBulk = bulkCategoryValue !== undefined;

  function openSettings(e: React.MouseEvent, p: Product) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSettings({ id: p.id, name: p.name, rect, confirmDelete: false });
    setSettingsInput(p.name);
  }

  function closeSettings() {
    setSettings(null);
  }

  function commitRename() {
    if (!settings) return;
    const trimmed = settingsInput.trim();
    if (trimmed && trimmed !== settings.name) {
      onRenameProduct(settings.id, trimmed);
    }
    closeSettings();
  }

  function commitDelete() {
    if (!settings) return;
    onDeleteProduct(settings.id);
    closeSettings();
  }

  return (
    <>
      {/* 上部スクロールバー */}
      <div ref={topScrollRef} className="top-scrollbar">
        <div ref={topScrollInnerRef} style={{ height: 1 }} />
      </div>
      <div ref={tableWrapperRef} className="table-wrapper">
        <table>
          <thead>
            <tr className="year-row">
              {isDraggable && <th className="sticky-th year-th" style={{ width: 28 }} />}
              <th className="sticky-th year-th" style={{ width: 260 }}>商品名</th>
              <th className="sticky-th year-th" style={{ width: 120 }}>カテゴリ</th>
              <th className="sticky-th year-th" style={{ width: 80 }}>入荷数</th>
              {yearSpans.map((span, i) => (
                <th key={span.year} colSpan={span.count}
                  className="sticky-th year-th"
                  style={{ textAlign: 'center', borderLeft: i > 0 ? '2px solid var(--border)' : undefined }}>
                  {span.year}年度
                </th>
              ))}
            </tr>
            <tr className="month-row">
              {isDraggable && <th className="sticky-th month-th" style={{ width: 28 }} />}
              <th className="sticky-th month-th product-col">商品名</th>
              <th className="sticky-th month-th" style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 110 }}>カテゴリ</th>
              <th className="sticky-th month-th arrival-col">入荷数</th>
              {monthsToShow.map(i => (
                <th key={i} className="sticky-th month-th" style={i === 2 ? { borderLeft: '2px solid var(--border)' } : undefined}>
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
                  className="product-row"
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="product-settings-btn"
                        onClick={e => openSettings(e, p)}
                        title="商品を編集・削除"
                      >⚙</button>
                      <span>{p.name}</span>
                    </div>
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

      {/* 商品設定ポップアップ */}
      {settings && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onMouseDown={closeSettings}
          />
          <div
            className="product-settings-popup"
            style={{
              position: 'fixed',
              top: settings.rect.bottom + 6,
              left: settings.rect.left,
              zIndex: 9999,
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="settings-popup-title">商品設定</div>

            {/* 商品名変更 */}
            <div className="settings-section">
              <label className="settings-label">商品名</label>
              <input
                className="settings-input"
                value={settingsInput}
                onChange={e => setSettingsInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') closeSettings(); }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button className="settings-btn-save" onClick={commitRename}>保存</button>
                <button className="settings-btn-cancel" onClick={closeSettings}>キャンセル</button>
              </div>
            </div>

            <div className="settings-divider" />

            {/* セルクリア */}
            <div className="settings-section">
              <button
                className="settings-btn-clear"
                onClick={() => { onClearCells(settings.id); closeSettings(); }}
              >スケジュールをすべてクリア</button>
            </div>

            <div className="settings-divider" />

            {/* 削除 */}
            <div className="settings-section">
              {!settings.confirmDelete ? (
                <button
                  className="settings-btn-delete"
                  onClick={() => setSettings(s => s ? { ...s, confirmDelete: true } : null)}
                >この商品を削除</button>
              ) : (
                <div>
                  <div className="settings-confirm-text">本当に削除しますか？</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="settings-btn-delete-confirm" onClick={commitDelete}>削除する</button>
                    <button className="settings-btn-cancel"
                      onClick={() => setSettings(s => s ? { ...s, confirmDelete: false } : null)}>
                      戻る
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
