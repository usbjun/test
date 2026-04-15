export default function LegendBar() {
  return (
    <div className="legend-bar">
      <div className="legend-inner">
        <span className="legend-label">凡例</span>
        <div className="legend-item">
          <div className="legend-chip" style={{ background: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid rgba(74,222,128,0.3)' }}>○</div>
          <span>在庫あり / 入荷予定</span>
        </div>
        <div className="legend-item">
          <div className="legend-chip" style={{ background: 'var(--maybe-bg)', color: 'var(--maybe)', border: '1px solid rgba(250,204,21,0.3)' }}>△</div>
          <span>少量 / 未定</span>
        </div>
        <div className="legend-item">
          <div className="legend-chip" style={{ background: 'var(--unknown-bg)', color: 'var(--unknown)', border: '1px solid rgba(96,165,250,0.3)' }}>?</div>
          <span>確認中</span>
        </div>
        <div className="legend-item">
          <div className="legend-chip" style={{ background: 'var(--none-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>—</div>
          <span>なし</span>
        </div>
      </div>
    </div>
  );
}
