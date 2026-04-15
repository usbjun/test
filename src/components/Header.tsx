interface HeaderProps {
  skuCount: number;
}

export default function Header({ skuCount }: HeaderProps) {
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
        </div>
      </div>
    </header>
  );
}
