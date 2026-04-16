import { useEffect, useRef } from 'react';
import { PopupState, Product, ScheduleValue, CellDataEntry } from '../types';
import { MONTHS } from '../data/products';

interface CellPopupProps {
  popup: PopupState;
  products: Product[];
  getCellData: (pid: number, mi: number) => CellDataEntry;
  onClose: () => void;
  onSelectIcon: (val: ScheduleValue) => void;
  onUpdateCellData: (data: CellDataEntry) => void;
}

export default function CellPopup({
  popup, products, getCellData,
  onClose, onSelectIcon, onUpdateCellData,
}: CellPopupProps) {
  const { pid, mi, x, y } = popup;
  const product = products.find(p => p.id === pid);
  const val = product?.schedule[mi] ?? null;
  const d = getCellData(pid, mi);
  const ref = useRef<HTMLDivElement>(null);

  // Position popup avoiding viewport edges
  const pw = 200, ph = 220;
  let left = x + 10, top = y + 10;
  if (left + pw > window.innerWidth - 10) left = x - pw - 10;
  if (top + ph > window.innerHeight - 10) top = y - ph - 10;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const iconBtns: { key: string; label: string; val: ScheduleValue }[] = [
    { key: 'ok', label: '○', val: '○' },
    { key: 'maybe', label: '△', val: '△' },
    { key: 'unknown', label: '?', val: '?' },
    { key: 'none', label: '—', val: null },
  ];

  const activeClass = (v: ScheduleValue) => {
    if (v === '○' && val === '○') return 'active-ok';
    if (v === '△' && val === '△') return 'active-maybe';
    if (v === '?' && val === '?') return 'active-unknown';
    if (v === null && val === null) return 'active-none';
    return '';
  };

  const title = `${product?.name.substring(0, 18)}… / ${MONTHS[mi]}`;

  return (
    <div className="cell-popup" ref={ref} style={{ left, top }}>
      <button className="popup-close" onClick={onClose}>✕</button>
      <div className="cell-popup-title">{title}</div>

      <div className="icon-picker">
        {iconBtns.map(btn => (
          <button
            key={btn.key}
            className={`icon-btn ${activeClass(btn.val)}`}
            onClick={() => onSelectIcon(btn.val)}
          >{btn.label}</button>
        ))}
      </div>

      <div className="popup-field">
        <label>入荷数</label>
        <input
          className="popup-input"
          type="number"
          min={0}
          defaultValue={d.arrival || ''}
          placeholder="0"
          onChange={e => onUpdateCellData({
            arrival: parseInt(e.target.value) || 0,
            sold: d.sold,
          })}
        />
      </div>
      <div className="popup-field">
        <label>消化数</label>
        <input
          className="popup-input"
          type="number"
          min={0}
          defaultValue={d.sold || ''}
          placeholder="0"
          onChange={e => onUpdateCellData({
            arrival: d.arrival,
            sold: parseInt(e.target.value) || 0,
          })}
        />
      </div>
    </div>
  );
}
