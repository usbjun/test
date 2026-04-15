interface HeaderProps {
  skuCount: number;
  userEmail: string;
  onLogout: () => void;
}

export default function Header({ skuCount, userEmail, onLogout }: HeaderProps) {
  return (
    <header>
      <div className="header-inner">
        <div className="pokeball-icon" />
        <div className="header-title">
          ポケモン 再入荷在庫管理
          <span>Pokémon Restock Inventory Chart</span>
        </div>
        <div className="header-controls">
          <div className="sku-display">
            総SKU数 <strong>{skuCount}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👤 {userEmail}</span>
            <button
              onClick={onLogout}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 12,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
