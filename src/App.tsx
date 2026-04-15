import { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  Product, CellDataMap, CellDataEntry,
  PopupState, TooltipState,
  ScheduleValue, StatusFilter, ViewMode,
} from './types';
import * as api from './lib/api';
import { supabase } from './lib/supabase';
import { signOut } from './lib/auth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import LegendBar from './components/LegendBar';
import ControlsBar from './components/ControlsBar';
import MonthFilter from './components/MonthFilter';
import StatsRow from './components/StatsRow';
import TableView from './components/TableView';
import GridView from './components/GridView';
import CellPopup from './components/CellPopup';
import Tooltip from './components/Tooltip';
import BulkEditBar from './components/BulkEditBar';
import AddProductModal from './components/AddProductModal';

function computeStatus(schedule: ScheduleValue[]) {
  const hasStock = schedule.some(v => v === '○');
  const hasIncoming = schedule.some(v => v === '?');
  const hasMaybe = schedule.some(v => v === '△') && !hasStock;
  if (hasStock) return 'has' as const;
  if (hasIncoming || hasMaybe) return 'incoming' as const;
  return 'none' as const;
}

export default function App() {
  // ── 認証 ───────────────────────────────────────────────────
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // ── データ ─────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [cellData, setCellData] = useState<CellDataMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI状態 ─────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<ViewMode>('table');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'category'>('default');
  const [monthFilter, setMonthFilter] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [bulkEditValue, setBulkEditValue] = useState<ScheduleValue | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);

  // ── 初回データ取得 ──────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([api.fetchProducts(), api.fetchCellData()])
      .then(([prods, cells]) => { setProducts(prods); setCellData(cells); })
      .catch(e => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [session]);

  // ── カテゴリ一覧 ────────────────────────────────────────────
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  // ── フィルター＆ソート ─────────────────────────────────────
  const getCellData = useCallback((pid: number, mi: number): CellDataEntry => (
    cellData[`${pid}_${mi}`] || { arrival: 0, sold: 0 }
  ), [cellData]);

  let filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (monthFilter >= 0 && !p.schedule[monthFilter]) return false;
    return true;
  });

  if (sortBy === 'category') {
    filtered = [...filtered].sort((a, b) =>
      (a.category || 'zzz').localeCompare(b.category || 'zzz', 'ja') ||
      a.name.localeCompare(b.name, 'ja')
    );
  }

  const countsBase = products.filter(p => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (monthFilter >= 0 && !p.schedule[monthFilter]) return false;
    return true;
  });
  const counts = {
    all: countsBase.length,
    has: countsBase.filter(p => p.status === 'has').length,
    incoming: countsBase.filter(p => p.status === 'incoming').length,
    none: countsBase.filter(p => p.status === 'none').length,
  };

  // ── CRUD ────────────────────────────────────────────────────

  async function handleAddProduct(name: string, category: string) {
    const newProduct = await api.createProduct(name, category);
    setProducts(prev => [...prev, newProduct]);
  }

  async function handleArrivalChange(pid: number, val: string) {
    const num = parseInt(val.replace(/[,，—]/g, '').trim(), 10);
    const arrival = isNaN(num) ? 0 : num;
    setProducts(prev => prev.map(p => p.id === pid ? { ...p, arrival } : p));
    try { await api.updateArrival(pid, arrival); } catch { alert('入荷数の保存に失敗しました'); }
  }

  async function handleCategoryChange(pid: number, category: string) {
    setProducts(prev => prev.map(p => p.id === pid ? { ...p, category } : p));
    try { await api.updateCategory(pid, category); } catch { alert('カテゴリの保存に失敗しました'); }
  }

  async function handleSelectIcon(val: ScheduleValue) {
    if (!popup) return;
    const { pid, mi } = popup;
    const target = products.find(p => p.id === pid);
    if (!target) return;
    const newSchedule = [...target.schedule] as ScheduleValue[];
    newSchedule[mi] = val;
    setProducts(prev => prev.map(p =>
      p.id === pid ? { ...p, schedule: newSchedule, status: computeStatus(newSchedule) } : p
    ));
    try {
      await api.updateScheduleCell(pid, newSchedule);
    } catch {
      setProducts(prev => prev.map(p => p.id === pid ? { ...target } : p));
      alert('スケジュールの保存に失敗しました');
    }
  }

  async function handleUpdateCellData(data: CellDataEntry) {
    if (!popup) return;
    const { pid, mi } = popup;
    setCellData(prev => ({ ...prev, [`${pid}_${mi}`]: data }));
    try { await api.upsertCellData(pid, mi, data); } catch { alert('セルデータの保存に失敗しました'); }
  }

  // ── セルクリック（通常 or 一括編集） ──────────────────────
  function handleCellClick(pid: number, mi: number, x: number, y: number) {
    if (bulkEditValue !== undefined) {
      // 一括編集モード: ポップアップなしで即反映
      const target = products.find(p => p.id === pid);
      if (!target) return;
      const newSchedule = [...target.schedule] as ScheduleValue[];
      newSchedule[mi] = bulkEditValue;
      setProducts(prev => prev.map(p =>
        p.id === pid ? { ...p, schedule: newSchedule, status: computeStatus(newSchedule) } : p
      ));
      api.updateScheduleCell(pid, newSchedule).catch(() => {
        setProducts(prev => prev.map(p => p.id === pid ? { ...target } : p));
      });
      return;
    }
    setTooltip(null);
    setPopup({ pid, mi, x, y });
  }

  // ── ローディング / エラー / 未認証 ────────────────────────
  if (session === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>読み込み中…</div>
  );
  if (!session) return <LoginPage />;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 32 }}>⏳</div><div>データを読み込み中…</div>
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, color: 'var(--red)' }}>
      <div style={{ fontSize: 32 }}>⚠️</div><div style={{ fontWeight: 700 }}>接続エラー</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
    </div>
  );

  // ── メイン ─────────────────────────────────────────────────
  return (
    <div className="wrapper">
      <Header skuCount={products.length} userEmail={session.user.email ?? ''} onLogout={signOut} />
      <LegendBar />
      <ControlsBar
        searchQuery={searchQuery} onSearch={setSearchQuery}
        statusFilter={statusFilter} onStatusFilter={setStatusFilter} counts={counts}
        currentView={currentView} onViewChange={setCurrentView}
        categories={categories} categoryFilter={categoryFilter} onCategoryFilter={setCategoryFilter}
        sortBy={sortBy} onSortBy={setSortBy}
        bulkEditValue={bulkEditValue}
        onBulkEditToggle={() => setBulkEditValue(prev => prev !== undefined ? undefined : '○')}
        onAddProduct={() => setShowAddModal(true)}
      />

      {bulkEditValue !== undefined && (
        <BulkEditBar bulkEditValue={bulkEditValue} onChange={setBulkEditValue} />
      )}

      <main>
        <MonthFilter monthFilter={monthFilter} onMonthFilter={setMonthFilter} />
        <StatsRow products={filtered} />
        {currentView === 'table' ? (
          <TableView
            products={filtered} monthFilter={monthFilter}
            getCellData={getCellData}
            onCellClick={handleCellClick}
            onTooltip={(pid, mi, x, y) => { if (bulkEditValue === undefined) setTooltip({ pid, mi, x, y }); }}
            onTooltipMove={(x, y) => setTooltip(prev => prev ? { ...prev, x, y } : null)}
            onTooltipHide={() => setTooltip(null)}
            onArrivalChange={handleArrivalChange}
            onCategoryChange={handleCategoryChange}
            bulkEditActive={bulkEditValue !== undefined}
          />
        ) : (
          <GridView
            products={filtered} monthFilter={monthFilter}
            getCellData={getCellData}
            onCellClick={handleCellClick}
            onTooltip={(pid, mi, x, y) => { if (bulkEditValue === undefined) setTooltip({ pid, mi, x, y }); }}
            onTooltipMove={(x, y) => setTooltip(prev => prev ? { ...prev, x, y } : null)}
            onTooltipHide={() => setTooltip(null)}
            onCategoryChange={handleCategoryChange}
            bulkEditActive={bulkEditValue !== undefined}
          />
        )}
      </main>

      {tooltip && <Tooltip tooltip={tooltip} products={products} getCellData={getCellData} />}
      {popup && (
        <CellPopup
          popup={popup} products={products} getCellData={getCellData}
          onClose={() => setPopup(null)}
          onSelectIcon={handleSelectIcon}
          onUpdateCellData={handleUpdateCellData}
        />
      )}
      {showAddModal && (
        <AddProductModal
          existingCategories={categories}
          onAdd={handleAddProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
