import { TooltipState, Product, CellDataEntry } from '../types';
import { MONTHS } from '../data/products';

interface TooltipProps {
  tooltip: TooltipState;
  products: Product[];
  getCellData: (pid: number, mi: number) => CellDataEntry;
}

const STATUS_LABEL: Record<string, string> = {
  '○': '在庫あり',
  '△': '少量/未定',
  '?': '確認中',
};

export default function Tooltip({ tooltip, products, getCellData }: TooltipProps) {
  const { pid, mi, x, y } = tooltip;
  const product = products.find(p => p.id === pid);
  const val = product?.schedule[mi] ?? null;
  const d = getCellData(pid, mi);
  const iconLabel = val ? STATUS_LABEL[val] ?? 'なし' : 'なし';

  const pw = 160, ph = 120;
  let left = x + 14, top = y + 14;
  if (left + pw > window.innerWidth) left = x - pw;
  if (top + ph > window.innerHeight) top = y - ph;

  return (
    <div
      className="tooltip-overlay"
      style={{ left, top }}
    >
      <div className="tooltip-month">{MONTHS[mi]}</div>
      <div className="tooltip-row">
        <span className="tooltip-key">ステータス</span>
        <span className="tooltip-val">{val || '—'} {iconLabel}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">入荷数</span>
        <span className="tooltip-val">{d.arrival > 0 ? d.arrival.toLocaleString() : '—'}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-key">消化数</span>
        <span className="tooltip-val">{d.sold > 0 ? d.sold.toLocaleString() : '—'}</span>
      </div>
      <div className="tooltip-hint">クリックで編集</div>
    </div>
  );
}
