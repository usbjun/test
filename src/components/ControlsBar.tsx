import { StatusFilter, ViewMode } from '../types';

interface Counts {
  all: number;
  has: number;
  incoming: number;
  none: number;
}

interface ControlsBarProps {
  searchQuery: string;
  onSearch: (q: string) => void;
  statusFilter: StatusFilter;
  onStatusFilter: (f: StatusFilter) => void;
  counts: Counts;
  currentView: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export default function ControlsBar({
  searchQuery, onSearch,
  statusFilter, onStatusFilter,
  counts, currentView, onViewChange,
}: ControlsBarProps) {
  return (
    <div className="controls-bar">
      <div className="controls-inner">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-box"
            type="text"
            placeholder="商品名で検索…"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        {(['all', 'has', 'incoming', 'none'] as StatusFilter[]).map(f => {
          const labels: Record<StatusFilter, string> = {
            all: 'すべて', has: '在庫あり', incoming: '入荷予定', none: '在庫なし',
          };
          return (
            <button
              key={f}
              className={`filter-btn${statusFilter === f ? ' active' : ''}`}
              onClick={() => onStatusFilter(f)}
              style={f === 'all' ? { fontWeight: 700 } : undefined}
            >
              {labels[f]} <span className="count">{counts[f]}</span>
            </button>
          );
        })}

        <div className="view-toggle">
          <button
            className={`view-btn${currentView === 'table' ? ' active' : ''}`}
            onClick={() => onViewChange('table')}
            title="テーブル表示"
          >⊞</button>
          <button
            className={`view-btn${currentView === 'grid' ? ' active' : ''}`}
            onClick={() => onViewChange('grid')}
            title="カード表示"
          >⊟</button>
        </div>
      </div>
    </div>
  );
}
