import { useState, useCallback, useEffect } from 'react';
import {
  Product, CellDataMap, CellDataEntry,
  PopupState, TooltipState,
  ScheduleValue, StatusFilter, ViewMode,
} from './types';
import * as api from './lib/api';
import Header from './components/Header';
import LegendBar from './components/LegendBar';
import ControlsBar from './components/ControlsBar';
import MonthFilter from './components/MonthFilter';
import StatsRow from './components/StatsRow';
import TableView from './components/TableView';
import GridView from './components/GridView';
import CellPopup from './components/CellPopup';
import Tooltip from './components/Tooltip';

function computeStatus(schedule: ScheduleValue[]) {
  const hasStock = schedule.some(v => v === '○');
  const hasIncoming = schedule.some(v => v === '?');
  const hasMaybe = schedule.some(v => v === '△') && !hasStock;
  if (hasStock) return 'has' as const;
  if (hasIncoming || hasMaybe) return 'incoming' as const;
  return 'none' as const;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cellData, setCellData] = useState<CellDataMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewMode>('table');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [monthFilter, setMonthFilter] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // ── 初回データ取得 ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [prods, cells] = await Promise.all([
          api.fetchProducts(),
          api.fetchCellData(),
        ]);
        setProducts(prods);
        setCellData(cells);
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── セルデータ取得 ──────────────────────────────────────────
  const getCellData = useCallback((pid: number, mi: number): CellDataEntry => {
    return cellData[`${pid}_${mi}`] || { arrival: 0, sold: 0 };
  }, [cellData]);

  // ── フィルタリング ──────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (statusFilter === 'has' && p.status !== 'has') return false;
    if (statusFilter === 'incoming' && p.status !== 'incoming') return false;
    if (statusFilter === 'none' && p.status !== 'none') return false;
    if (monthFilter >= 0 && !p.schedule[monthFilter]) return false;
    return true;
  });

  const countsBase = products.filter(p => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (monthFilter >= 0 && !p.schedule[monthFilter]) return false;
    return true;
  });

  const counts = {
    all: countsBase.length,
    has: countsBase.filter(p => p.status === 'has').length,
    incoming: countsBase.filter(p => p.status === 'incoming').length,
    none: countsBase.filter(p => p.status === 'none').length,
  };

  // ── CRUD ハンドラー（楽観的更新 → DB同期）─────────────────

  async function handleArrivalChange(pid: number, val: string) {
    const clean = val.replace(/[,，—]/g, '').trim();
    const num = parseInt(clean, 10);
    const arrival = isNaN(num) ? 0 : num;

    // 楽観的更新
    setProducts(prev => prev.map(p => p.id === pid ? { ...p, arrival } : p));

    try {
      await api.updateArrival(pid, arrival);
    } catch {
      // ロールバック
      setProducts(prev => prev.map(p =>
        p.id === pid ? { ...p, arrival: products.find(x => x.id === pid)?.arrival ?? 0 } : p
      ));
      alert('入荷数の保存に失敗しました');
    }
  }

  async function handleSelectIcon(val: ScheduleValue) {
    if (!popup) return;
    const { pid, mi } = popup;
    const target = products.find(p => p.id === pid);
    if (!target) return;

    const newSchedule = [...target.schedule] as ScheduleValue[];
    newSchedule[mi] = val;
    const newStatus = computeStatus(newSchedule);

    // 楽観的更新
    setProducts(prev => prev.map(p =>
      p.id === pid ? { ...p, schedule: newSchedule, status: newStatus } : p
    ));

    try {
      await api.updateScheduleCell(pid, newSchedule);
    } catch {
      // ロールバック
      setProducts(prev => prev.map(p =>
        p.id === pid ? { ...p, schedule: target.schedule, status: target.status } : p
      ));
      alert('スケジュールの保存に失敗しました');
    }
  }

  async function handleUpdateCellData(data: CellDataEntry) {
    if (!popup) return;
    const { pid, mi } = popup;
    const key = `${pid}_${mi}`;

    // 楽観的更新
    setCellData(prev => ({ ...prev, [key]: data }));

    try {
      await api.upsertCellData(pid, mi, data);
    } catch {
      alert('セルデータの保存に失敗しました');
    }
  }

  // ── イベントハンドラー ──────────────────────────────────────

  function handleCellClick(pid: number, mi: number, x: number, y: number) {
    setTooltip(null);
    setPopup({ pid, mi, x, y });
  }

  function handleTooltip(pid: number, mi: number, x: number, y: number) {
    setTooltip({ pid, mi, x, y });
  }

  function handleTooltipMove(x: number, y: number) {
    setTooltip(prev => prev ? { ...prev, x, y } : null);
  }

  // ── ローディング / エラー ───────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32 }}>⏳</div>
        <div>データを読み込み中…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif', color: 'var(--red)' }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontWeight: 700 }}>接続エラー</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center' }}>{error}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>.env.local の Supabase 設定を確認してください</div>
      </div>
    );
  }

  // ── メイン画面 ──────────────────────────────────────────────

  return (
    <div className="wrapper">
      <Header skuCount={products.length} />
      <LegendBar />
      <ControlsBar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        counts={counts}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <main>
        <MonthFilter monthFilter={monthFilter} onMonthFilter={setMonthFilter} />
        <StatsRow products={filteredProducts} />
        {currentView === 'table' ? (
          <TableView
            products={filteredProducts}
            monthFilter={monthFilter}
            getCellData={getCellData}
            onCellClick={handleCellClick}
            onTooltip={handleTooltip}
            onTooltipMove={handleTooltipMove}
            onTooltipHide={() => setTooltip(null)}
            onArrivalChange={handleArrivalChange}
          />
        ) : (
          <GridView
            products={filteredProducts}
            monthFilter={monthFilter}
            getCellData={getCellData}
            onCellClick={handleCellClick}
            onTooltip={handleTooltip}
            onTooltipMove={handleTooltipMove}
            onTooltipHide={() => setTooltip(null)}
          />
        )}
      </main>

      {tooltip && (
        <Tooltip tooltip={tooltip} products={products} getCellData={getCellData} />
      )}
      {popup && (
        <CellPopup
          popup={popup}
          products={products}
          getCellData={getCellData}
          onClose={() => setPopup(null)}
          onSelectIcon={handleSelectIcon}
          onUpdateCellData={handleUpdateCellData}
        />
      )}
    </div>
  );
}
