import { Product } from '../types';
import { computeStatus } from '../lib/api';

interface StatsRowProps {
  products: Product[];
  monthFilter: number;
}

// スケジュール配列の基準: index 0 = 2025年4月前半
function getCurrentMonthIndex(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const half = now.getDate() > 15 ? 1 : 0;
  const monthsFromRef = (year - 2025) * 12 + (month - 4);
  if (monthsFromRef < 0) return 0;
  return Math.min(monthsFromRef * 2 + half, 25);
}

export default function StatsRow({ products, monthFilter }: StatsRowProps) {
  const totalArrival = products.reduce((s, p) => s + p.arrival, 0);
  const targetIndex = monthFilter >= 0 ? monthFilter : getCurrentMonthIndex();
  const hasCount = products.filter(p => p.schedule[targetIndex] === '○').length;
  const incomingCount = products.filter(p => computeStatus(p.schedule) === 'incoming').length;

  const stats = [
    { icon: '📦', value: products.length, label: '表示中の商品' },
    { icon: '✅', value: hasCount, label: '在庫あり' },
    { icon: '🔜', value: incomingCount, label: '入荷予定あり' },
    { icon: '🎁', value: totalArrival.toLocaleString(), label: '合計入荷数量' },
  ];

  return (
    <div className="stats-row">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon">{s.icon}</div>
          <div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
