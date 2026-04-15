export type ScheduleValue = '○' | '△' | '?' | null;
export type ProductStatus = 'has' | 'incoming' | 'none';
export type StatusFilter = 'all' | 'has' | 'incoming' | 'none';
export type ViewMode = 'table' | 'grid';

export interface Product {
  id: number;
  name: string;
  category: string;
  arrival: number;
  schedule: ScheduleValue[];
  status: ProductStatus;
  sortOrder: number;
}

export interface CellDataEntry {
  arrival: number;
  sold: number;
}

export type CellDataMap = Record<string, CellDataEntry>;

export interface TooltipState {
  pid: number;
  mi: number;
  x: number;
  y: number;
}

export interface PopupState {
  pid: number;
  mi: number;
  x: number;
  y: number;
}
