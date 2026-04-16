interface HeaderProps {
  skuCount: number;
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
}

const LEGEND_ITEMS = [
  { chip: '○', label: '在庫あり / 入荷予定', bg: 'var(--ok-bg)', color: 'var(--ok)', border: 'rgba(74,222,128,0.3)' },
  { chip: '△', label: '少量 / 未定',         bg: 'var(--maybe-bg)', color: 'var(--maybe)', border: 'rgba(250,204,21,0.3)' },
  { chip: '?', label: '確認中',               bg: 'var(--unknown-bg)', color: 'var(--unknown)', border: 'rgba(96,165,250,0.3)' },
  { chip: '—', label: 'なし',                 bg: 'var(--none-bg)', color: 'var(--text-muted)', border: 'var(--border)' },
];

export default function Header({ skuCount, userEmail, isAdmin, onLogout }: HeaderProps) {
  return (
    <header>
      <div className="header-inner">
        <div className="pokeball-icon" />
        <div className="header-title">
          再入荷在庫管理
          <span>Restock Inventory Chart</span>
        </div>

        {/* 凡例（中央） */}
        <div className="header-legend">
          {LEGEND_ITEMS.map(item => (
            <div key={item.chip} className="header-legend-item">
              <div className="header-legend-chip" style={{
                background: item.bg, color: item.color,
                border: `1px solid ${item.border}`,
              }}>{item.chip}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="header-controls">
          <div className="sku-display">
            総SKU数 <strong>{skuCount}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="header-user-email">👤 {userEmail}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: isAdmin ? 'var(--ok-bg)' : 'var(--surface3)',
              color: isAdmin ? 'var(--ok)' : 'var(--text-muted)',
              border: `1px solid ${isAdmin ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`,
            }}>{isAdmin ? '管理者' : '閲覧者'}</span>
            <button
              onClick={onLogout}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '4px 10px', fontSize: 12,
                color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >ログアウト</button>
          </div>
        </div>
      </div>
    </header>
  );
}
