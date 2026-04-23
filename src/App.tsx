import { useState, useCallback, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  Product, CellDataMap, CellDataEntry,
  PopupState, TooltipState, ScheduleValue, StatusFilter, ViewMode,
} from './types';
import * as api from './lib/api';
import { computeStatus } from './lib/api';
import { supabase } from './lib/supabase';
import { signOut } from './lib/auth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import ControlsBar from './components/ControlsBar';
import MonthFilter from './components/MonthFilter';
import StatsRow from './components/StatsRow';
import TableView from './components/TableView';
import GridView from './components/GridView';
import CellPopup from './components/CellPopup';
import Tooltip from './components/Tooltip';
import BulkEditBar from './components/BulkEditBar';
import AddProductModal from './components/AddProductModal';
import ExcelUploadModal from './components/ExcelUploadModal';


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
  const [isAdmin, setIsAdmin] = useState(false);

  // ── UI 状態 ─────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<ViewMode>(
    () => window.innerWidth <= 640 ? 'grid' : 'table'
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'category'>('default');
  const [monthFilter, setMonthFilter] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // 一括編集 (ステータス / カテゴリ)
  const [bulkStatusValue, setBulkStatusValue] = useState<ScheduleValue | undefined>(undefined);
  const [bulkCategoryValue, setBulkCategoryValue] = useState<string | undefined>(undefined);
  const bulkEditOpen = bulkStatusValue !== undefined || bulkCategoryValue !== undefined;

  // ── ドラッグ一括適用 ────────────────────────────────────────
  const isBulkDragging = useRef(false);
  const lastBulkCell = useRef<string | null>(null);
  // 最新の applyBulkStatus を常に参照できるよう ref に保持
  const applyBulkStatusRef = useRef<((pid: number, mi: number) => void) | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isBulkDragging.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      const cell = (el as HTMLElement).closest('[data-bulk-pid]') as HTMLElement | null;
      if (!cell) return;
      const pid = parseInt(cell.dataset.bulkPid!, 10);
      const mi = parseInt(cell.dataset.bulkMi!, 10);
      const key = `${pid}_${mi}`;
      if (lastBulkCell.current === key) return;
      lastBulkCell.current = key;
      applyBulkStatusRef.current?.(pid, mi);
    };
    const onMouseUp = () => {
      isBulkDragging.current = false;
      lastBulkCell.current = null;
      document.body.classList.remove('bulk-dragging');
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // ── 初回データ取得 ──────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([api.fetchProducts(), api.fetchCellData(), api.fetchUserRole()])
      .then(([prods, cells, role]) => {
        setProducts(prods);
        setCellData(cells);
        setIsAdmin(role === 'admin');
      })
      .catch(e => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [session]);

  // ── カテゴリ一覧（ソート済み）──────────────────────────────
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  // ── フィルター & ソート ─────────────────────────────────────
  const getCellData = useCallback((pid: number, mi: number): CellDataEntry => (
    cellData[`${pid}_${mi}`] || { arrival: 0, sold: 0 }
  ), [cellData]);

  let filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && computeStatus(p.schedule) !== statusFilter) return false;
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
    has: countsBase.filter(p => computeStatus(p.schedule) === 'has').length,
    incoming: countsBase.filter(p => computeStatus(p.schedule) === 'incoming').length,
    none: countsBase.filter(p => computeStatus(p.schedule) === 'none').length,
  };

  // ── CRUD ────────────────────────────────────────────────────

  async function handleAddProduct(name: string, category: string) {
    const newProduct = await api.createProduct(name, category);
    setProducts(prev => [...prev, newProduct]);
  }

  async function handleBatchUpload(rows: { name: string; category: string; arrival: number }[]) {
    const newProducts = await api.batchCreateProducts(rows);
    setProducts(prev => [...prev, ...newProducts]);
  }

  async function handleArrivalChange(pid: number, val: string) {
    const arrival = parseInt(val.replace(/[,，—]/g, '').trim(), 10);
    const n = isNaN(arrival) ? 0 : arrival;
    setProducts(prev => prev.map(p => p.id === pid ? { ...p, arrival: n } : p));
    api.updateArrival(pid, n).catch(() => alert('入荷数の保存に失敗しました'));
  }

  async function handleCategoryChange(pid: number, category: string) {
    setProducts(prev => prev.map(p => p.id === pid ? { ...p, category } : p));
    api.updateCategory(pid, category).catch(() => alert('カテゴリの保存に失敗しました'));
  }

  async function handleRenameProduct(pid: number, name: string) {
    setProducts(prev => prev.map(p => p.id === pid ? { ...p, name } : p));
    api.updateProductName(pid, name).catch(() => alert('商品名の保存に失敗しました'));
  }

  async function handleDeleteProduct(pid: number) {
    setProducts(prev => prev.filter(p => p.id !== pid));
    api.deleteProduct(pid).catch(() => alert('商品の削除に失敗しました'));
  }

  async function handleClearCells(pid: number) {
    const emptySchedule = Array(26).fill(null) as ScheduleValue[];
    setProducts(prev => prev.map(p =>
      p.id === pid ? { ...p, schedule: emptySchedule, status: 'none' } : p
    ));
    api.updateScheduleCell(pid, emptySchedule).catch(() => alert('セルのクリアに失敗しました'));
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
    api.updateScheduleCell(pid, newSchedule).catch(() => {
      setProducts(prev => prev.map(p => p.id === pid ? target : p));
      alert('スケジュールの保存に失敗しました');
    });
  }

  async function handleUpdateCellData(data: CellDataEntry) {
    if (!popup) return;
    const { pid, mi } = popup;
    setCellData(prev => ({ ...prev, [`${pid}_${mi}`]: data }));
    api.upsertCellData(pid, mi, data).catch(() => alert('セルデータの保存に失敗しました'));
  }

  // ── ドラッグ並び替え ─────────────────────────────────────
  async function handleReorder(draggedId: number, targetId: number) {
    const prev = [...products];
    const newProducts = [...products];
    const fromIdx = newProducts.findIndex(p => p.id === draggedId);
    const toIdx = newProducts.findIndex(p => p.id === targetId);
    const [moved] = newProducts.splice(fromIdx, 1);
    newProducts.splice(toIdx, 0, moved);
    const withOrder = newProducts.map((p, i) => ({ ...p, sortOrder: i }));
    setProducts(withOrder);
    try {
      await api.reorderProducts(withOrder.map(p => ({ id: p.id, sortOrder: p.sortOrder })));
    } catch {
      setProducts(prev);
      alert('並び替えの保存に失敗しました');
    }
  }

  // ── 一括ステータス適用（クリック・ドラッグ共通） ──────────
  // functional update で常に最新スケジュールを取得し、同行複数セルも正しく反映
  function applyBulkStatus(pid: number, mi: number) {
    if (bulkStatusValue === undefined) return;
    setProducts(prev => {
      const target = prev.find(p => p.id === pid);
      if (!target) return prev;
      const newSchedule = [...target.schedule] as ScheduleValue[];
      newSchedule[mi] = bulkStatusValue;
      api.updateScheduleCell(pid, newSchedule).catch(() =>
        setProducts(p2 => p2.map(p => p.id === pid ? target : p))
      );
      return prev.map(p =>
        p.id === pid ? { ...p, schedule: newSchedule, status: computeStatus(newSchedule) } : p
      );
    });
  }
  // ref を毎レンダーで更新（グローバル mousemove から参照するため）
  applyBulkStatusRef.current = applyBulkStatus;

  // ドラッグ開始（mousedown）
  function handleBulkDragStart(pid: number, mi: number) {
    isBulkDragging.current = true;
    lastBulkCell.current = `${pid}_${mi}`;
    document.body.classList.add('bulk-dragging');
    applyBulkStatus(pid, mi);
  }

  // ── セルクリック（通常 / ステータス一括 / カテゴリ一括） ──
  function handleCellClick(pid: number, mi: number, x: number, y: number) {
    if (bulkStatusValue !== undefined) {
      applyBulkStatus(pid, mi);
      return;
    }
    setTooltip(null);
    setPopup({ pid, mi, x, y });
  }

  // カテゴリ一括適用（商品名クリック）
  function handleBulkCategoryApply(pid: number) {
    if (bulkCategoryValue === undefined) return;
    handleCategoryChange(pid, bulkCategoryValue);
  }

  // 一括編集バーの開閉
  function handleBulkEditToggle() {
    if (bulkEditOpen) {
      setBulkStatusValue(undefined);
      setBulkCategoryValue(undefined);
    } else {
      setBulkStatusValue('○'); // 開いたときはステータス○をデフォルト選択
    }
  }

  // ── ローディング / エラー / 認証 ──────────────────────────
  if (session === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-muted)' }}>読み込み中…</div>
  );
  if (!session) return <LoginPage />;
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16, color:'var(--text-muted)' }}>
      <div style={{ fontSize:32 }}>⏳</div><div>データを読み込み中…</div>
    </div>
  );
  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16, color:'var(--red)' }}>
      <div style={{ fontSize:32 }}>⚠️</div><div style={{ fontWeight:700 }}>接続エラー</div>
      <div style={{ fontSize:13, color:'var(--text-muted)' }}>{error}</div>
    </div>
  );

  return (
    <div className="wrapper">
      <Header skuCount={products.length} userEmail={session.user.email ?? ''} isAdmin={isAdmin} onLogout={signOut} />
      <ControlsBar
        searchQuery={searchQuery} onSearch={setSearchQuery}
        statusFilter={statusFilter} onStatusFilter={setStatusFilter} counts={counts}
        currentView={currentView} onViewChange={setCurrentView}
        categories={categories} categoryFilter={categoryFilter} onCategoryFilter={setCategoryFilter}
        sortBy={sortBy} onSortBy={setSortBy}
        bulkStatusValue={bulkStatusValue} bulkCategoryValue={bulkCategoryValue}
        onBulkEditToggle={handleBulkEditToggle}
        onAddProduct={() => setShowAddModal(true)}
        onExcelUpload={() => setShowExcelModal(true)}
        isAdmin={isAdmin}
      />

      {isAdmin && bulkEditOpen && (
        <BulkEditBar
          bulkStatusValue={bulkStatusValue} onStatusChange={v => { setBulkStatusValue(v); setBulkCategoryValue(undefined); }}
          bulkCategoryValue={bulkCategoryValue} onCategoryChange={v => { setBulkCategoryValue(v); setBulkStatusValue(undefined); }}
          categories={categories}
          onClose={() => { setBulkStatusValue(undefined); setBulkCategoryValue(undefined); }}
        />
      )}

      <main>
        <MonthFilter monthFilter={monthFilter} onMonthFilter={setMonthFilter} />
        <StatsRow products={filtered} monthFilter={monthFilter} />
        {currentView === 'table' ? (
          <TableView
            products={filtered} allCategories={categories} monthFilter={monthFilter}
            getCellData={getCellData}
            onCellClick={handleCellClick}
            onTooltip={(pid,mi,x,y) => { if (!bulkStatusValue) setTooltip({pid,mi,x,y}); }}
            onTooltipMove={(x,y) => setTooltip(prev => prev ? {...prev,x,y} : null)}
            onTooltipHide={() => setTooltip(null)}
            onArrivalChange={handleArrivalChange}
            onCategoryChange={handleCategoryChange}
            onRenameProduct={handleRenameProduct}
            onDeleteProduct={handleDeleteProduct}
            onClearCells={handleClearCells}
            bulkStatusActive={bulkStatusValue !== undefined}
            bulkCategoryValue={bulkCategoryValue}
            onBulkCategoryApply={handleBulkCategoryApply}
            onBulkDragStart={handleBulkDragStart}
            onReorder={handleReorder}
            sortBy={sortBy}
            isAdmin={isAdmin}
          />
        ) : (
          <GridView
            products={filtered} allCategories={categories} monthFilter={monthFilter}
            getCellData={getCellData}
            onCellClick={handleCellClick}
            onTooltip={(pid,mi,x,y) => { if (!bulkStatusValue) setTooltip({pid,mi,x,y}); }}
            onTooltipMove={(x,y) => setTooltip(prev => prev ? {...prev,x,y} : null)}
            onTooltipHide={() => setTooltip(null)}
            onCategoryChange={handleCategoryChange}
            bulkStatusActive={bulkStatusValue !== undefined}
            bulkCategoryValue={bulkCategoryValue}
            onBulkCategoryApply={handleBulkCategoryApply}
            onBulkDragStart={handleBulkDragStart}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {tooltip && <Tooltip tooltip={tooltip} products={products} getCellData={getCellData} />}
      {popup && (
        <CellPopup popup={popup} products={products} getCellData={getCellData}
          onClose={() => setPopup(null)}
          onSelectIcon={handleSelectIcon} onUpdateCellData={handleUpdateCellData} />
      )}
      {showAddModal && (
        <AddProductModal existingCategories={categories}
          onAdd={handleAddProduct} onClose={() => setShowAddModal(false)} />
      )}
      {showExcelModal && (
        <ExcelUploadModal
          onUpload={handleBatchUpload} onClose={() => setShowExcelModal(false)} />
      )}
    </div>
  );
}
