import { Product } from '../types';

interface StatsRowProps {
  products: Product[];
}

export default function StatsRow({ products }: StatsRowProps) {
  const totalArrival = products.reduce((s, p) => s + p.arrival, 0);
  const hasCount = products.filter(p => p.status === 'has').length;
  const incomingCount = products.filter(p => p.status === 'incoming').length;

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
