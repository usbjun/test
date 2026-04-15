import { StatusFilter, ViewMode, ScheduleValue } from '../types';
import { getCategoryColor } from '../lib/categoryColors';

interface Counts { all: number; has: number; incoming: number; none: number; }

interface ControlsBarProps {
  searchQuery: string; onSearch: (q: string) => void;
  statusFilter: StatusFilter; onStatusFilter: (f: StatusFilter) => void;
  counts: Counts;
  currentView: ViewMode; onViewChange: (v: ViewMode) => void;
  categories: string[];
  categoryFilter: string; onCategoryFilter: (c: string) => void;
  sortBy: 'default' | 'category'; onSortBy: (s: 'default' | 'category') => void;
  bulkStatusValue: ScheduleValue | undefined;
  bulkCategoryValue: string | undefined;
  onBulkEditToggle: () => void;
  onAddProduct: () => void;
}

export default function ControlsBar({
  searchQuery, onSearch, statusFilter, onStatusFilter, counts,
  currentView, onViewChange, categories, categoryFilter, onCategoryFilter,
  sortBy, onSortBy, bulkStatusValue, bulkCategoryValue, onBulkEditToggle, onAddProduct,
}: ControlsBarProps) {
  const bulkActive = bulkStatusValue !== undefined || bulkCategoryValue !== undefined;

  const statusButtons: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'has', label: '在庫あり' },
    { key: 'incoming', label: '入荷予定' },
    { key: 'none', label: '在庫なし' },
  ];

  return (
    <div className="controls-bar">
      {/* Row 1 */}
      <div className="controls-inner">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-box" type="text" placeholder="商品名で検索…"
            value={searchQuery} onChange={e => onSearch(e.target.value)} />
        </div>

        {statusButtons.map(({ key, label }) => (
          <button key={key}
            className={`filter-btn${statusFilter === key ? ' active' : ''}`}
            onClick={() => onStatusFilter(key)}
            style={key === 'all' ? { fontWeight: 700 } : undefined}
          >
            {label} <span className="count">{counts[key]}</span>
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="add-product-btn" onClick={onAddProduct}>＋ 商品追加</button>
          <button
            className={`filter-btn${bulkActive ? ' active' : ''}`}
            onClick={onBulkEditToggle}
          >✏️ 一括編集</button>
          <div className="view-toggle">
            <button className={`view-btn${currentView === 'table' ? ' active' : ''}`}
              onClick={() => onViewChange('table')} title="テーブル表示">⊞</button>
            <button className={`view-btn${currentView === 'grid' ? ' active' : ''}`}
              onClick={() => onViewChange('grid')} title="カード表示">⊟</button>
          </div>
        </div>
      </div>

      {/* Row 2: カテゴリ */}
      {categories.length > 0 && (
        <div className="controls-inner" style={{ paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <span className="legend-label" style={{ flexShrink: 0 }}>カテゴリ</span>

          <button
            className={`month-tab${categoryFilter === 'all' ? ' active' : ''}`}
            onClick={() => onCategoryFilter('all')}
            style={{ borderRadius: 20 }}
          >すべて</button>

          {categories.map(cat => {
            const color = getCategoryColor(cat, categories);
            const isActive = categoryFilter === cat;
            return (
              <button key={cat}
                className={`month-tab${isActive ? ' active' : ''}`}
                onClick={() => onCategoryFilter(cat)}
                style={{
                  borderRadius: 20,
                  ...(isActive
                    ? (color ? { background: color.bg, borderColor: color.border, color: color.text } : {})
                    : (color ? { borderColor: color.border, color: color.text } : {})
                  ),
                }}
              >{cat}</button>
            );
          })}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="legend-label">並び順</span>
            <button className={`filter-btn${sortBy === 'default' ? ' active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => onSortBy('default')}>デフォルト</button>
            <button className={`filter-btn${sortBy === 'category' ? ' active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => onSortBy('category')}>カテゴリ順</button>
          </div>
        </div>
      )}
    </div>
  );
}
