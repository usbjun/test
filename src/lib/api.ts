import { supabase } from './supabase';
import { Product, CellDataMap, CellDataEntry, ScheduleValue, ProductStatus } from '../types';

// ── helpers ──────────────────────────────────────────────────

function computeStatus(schedule: ScheduleValue[]): ProductStatus {
  const hasStock = schedule.some(v => v === '○');
  const hasIncoming = schedule.some(v => v === '?');
  const hasMaybe = schedule.some(v => v === '△') && !hasStock;
  if (hasStock) return 'has';
  if (hasIncoming || hasMaybe) return 'incoming';
  return 'none';
}

function rowToProduct(row: {
  id: number; name: string; category: string;
  arrival: number; schedule: ScheduleValue[];
}): Product {
  const schedule = (row.schedule ?? []).slice(0, 26) as ScheduleValue[];
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? '',
    arrival: row.arrival,
    schedule,
    status: computeStatus(schedule),
  };
}

// ── READ ─────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, arrival, schedule')
    .order('id');
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function fetchCellData(): Promise<CellDataMap> {
  const { data, error } = await supabase
    .from('cell_data')
    .select('product_id, month_index, arrival_qty, sold_qty');
  if (error) throw error;
  const map: CellDataMap = {};
  for (const row of data ?? []) {
    map[`${row.product_id}_${row.month_index}`] = {
      arrival: row.arrival_qty,
      sold: row.sold_qty,
    };
  }
  return map;
}

// ── CREATE ───────────────────────────────────────────────────

export async function createProduct(name: string, category: string): Promise<Product> {
  const emptySchedule: ScheduleValue[] = Array(26).fill(null);
  const { data, error } = await supabase
    .from('products')
    .insert({ name, category, arrival: 0, schedule: emptySchedule })
    .select('id, name, category, arrival, schedule')
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

// ── UPDATE: arrival ───────────────────────────────────────────

export async function updateArrival(id: number, arrival: number): Promise<void> {
  const { error } = await supabase
    .from('products').update({ arrival }).eq('id', id);
  if (error) throw error;
}

// ── UPDATE: schedule ──────────────────────────────────────────

export async function updateScheduleCell(id: number, schedule: ScheduleValue[]): Promise<void> {
  const { error } = await supabase
    .from('products').update({ schedule }).eq('id', id);
  if (error) throw error;
}

// ── UPDATE: category ──────────────────────────────────────────

export async function updateCategory(id: number, category: string): Promise<void> {
  const { error } = await supabase
    .from('products').update({ category }).eq('id', id);
  if (error) throw error;
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

// ── DELETE ────────────────────────────────────────────────────

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
