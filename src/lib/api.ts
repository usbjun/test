import { supabase } from './supabase';
import { Product, CellDataMap, CellDataEntry, ScheduleValue, ProductStatus } from '../types';

export function computeStatus(schedule: ScheduleValue[]): ProductStatus {
  const hasStock = schedule.some(v => v === '○');
  const hasIncoming = schedule.some(v => v === '?');
  const hasMaybe = schedule.some(v => v === '△') && !hasStock;
  if (hasStock) return 'has';
  if (hasIncoming || hasMaybe) return 'incoming';
  return 'none';
}

function rowToProduct(row: {
  id: number; name: string; category: string;
  arrival: number; schedule: ScheduleValue[]; sort_order?: number;
}): Product {
  const schedule = (row.schedule ?? []).slice(0, 26) as ScheduleValue[];
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? '',
    arrival: row.arrival,
    schedule,
    status: computeStatus(schedule),
    sortOrder: row.sort_order ?? row.id,
  };
}

// ── READ ──────────────────────────────────────────────────────

export async function fetchUserRole(): Promise<'admin' | 'viewer'> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .single();
  if (error || !data) return 'viewer';
  return data.role as 'admin' | 'viewer';
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, arrival, schedule, sort_order')
    .order('sort_order', { nullsFirst: false })
    .order('id');
  if (error) throw error;
  const products = (data ?? []).map(rowToProduct);
  // 診断: ○マークがあるのに status が 'has' でない商品をコンソールに出力
  products.forEach(p => {
    if (p.schedule.some(v => v === '○') && p.status !== 'has') {
      console.warn('[不整合]', p.name, '\nschedule:', JSON.stringify(p.schedule));
    }
  });
  return products;
}

export async function fetchCellData(): Promise<CellDataMap> {
  const { data, error } = await supabase
    .from('cell_data')
    .select('product_id, month_index, arrival_qty, sold_qty');
  if (error) throw error;
  const map: CellDataMap = {};
  for (const row of data ?? []) {
    map[`${row.product_id}_${row.month_index}`] = { arrival: row.arrival_qty, sold: row.sold_qty };
  }
  return map;
}

// ── CREATE ───────────────────────────────────────────────────

export async function createProduct(name: string, category: string): Promise<Product> {
  const emptySchedule: ScheduleValue[] = Array(26).fill(null);
  // 末尾に追加するため sort_order を最大値 + 1 に設定
  const { data: maxData } = await supabase
    .from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const maxOrder = (maxData?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('products')
    .insert({ name, category, arrival: 0, schedule: emptySchedule, sort_order: maxOrder })
    .select('id, name, category, arrival, schedule, sort_order')
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

// ── UPDATE ────────────────────────────────────────────────────

export async function updateArrival(id: number, arrival: number): Promise<void> {
  const { error } = await supabase.from('products').update({ arrival }).eq('id', id);
  if (error) throw error;
}

export async function updateScheduleCell(id: number, schedule: ScheduleValue[]): Promise<void> {
  const { error } = await supabase.from('products').update({ schedule }).eq('id', id);
  if (error) throw error;
}

export async function updateCategory(id: number, category: string): Promise<void> {
  const { error } = await supabase.from('products').update({ category }).eq('id', id);
  if (error) throw error;
}

// ── REORDER ──────────────────────────────────────────────────

export async function reorderProducts(items: { id: number; sortOrder: number }[]): Promise<void> {
  const updates = items.map(({ id, sortOrder }) => ({ id, sort_order: sortOrder }));
  const { error } = await supabase.rpc('batch_update_sort_order', { updates: JSON.stringify(updates) });
  if (error) {
    // フォールバック: 個別更新
    await Promise.all(items.map(({ id, sortOrder }) =>
      supabase.from('products').update({ sort_order: sortOrder }).eq('id', id)
    ));
  }
}

// ── UPSERT: cell_data ─────────────────────────────────────────

export async function upsertCellData(
  productId: number, monthIndex: number, data: CellDataEntry
): Promise<void> {
  const { error } = await supabase
    .from('cell_data')
    .upsert(
      { product_id: productId, month_index: monthIndex, arrival_qty: data.arrival, sold_qty: data.sold },
      { onConflict: 'product_id,month_index' }
    );
  if (error) throw error;
}

export async function batchCreateProducts(
  rows: { name: string; category: string; arrival: number }[]
): Promise<Product[]> {
  const { data: maxData } = await supabase
    .from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const baseOrder = (maxData?.[0]?.sort_order ?? 0) + 1;
  const emptySchedule: ScheduleValue[] = Array(26).fill(null);

  const inserts = rows.map((r, i) => ({
    name: r.name,
    category: r.category,
    arrival: r.arrival,
    schedule: emptySchedule,
    sort_order: baseOrder + i,
  }));

  const { data, error } = await supabase
    .from('products')
    .insert(inserts)
    .select('id, name, category, arrival, schedule, sort_order');
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function updateProductName(id: number, name: string): Promise<void> {
  const { error } = await supabase.from('products').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
