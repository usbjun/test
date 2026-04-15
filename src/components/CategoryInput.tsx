import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCategoryColor } from '../lib/categoryColors';

interface CategoryInputProps {
  value: string;
  categories: string[];       // ソート済み
  onSave: (value: string) => void;
  small?: boolean;
  bulkMode?: boolean;         // true のときはクリックで onBulkApply を呼ぶ
  onBulkApply?: () => void;
}

export default function CategoryInput({
  value, categories, onSave, small,
  bulkMode = false, onBulkApply,
}: CategoryInputProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropRect, setDropRect] = useState<DOMRect | null>(null);

  const color = value ? getCategoryColor(value, categories) : null;

  // 編集モード開始時にドロップダウン位置を計算
  useEffect(() => {
    if (!editing) return;
    const updatePos = () => {
      if (inputRef.current) setDropRect(inputRef.current.getBoundingClientRect());
    };
    updatePos();
    // スクロール時も追従
    window.addEventListener('scroll', updatePos, true);
    return () => window.removeEventListener('scroll', updatePos, true);
  }, [editing]);

  // 外クリックで確定
  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        // ポータル内クリックは除外
        const portal = document.getElementById('cat-portal');
        if (portal && portal.contains(e.target as Node)) return;
        commit(input);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing, input]);

  function handleChipClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (bulkMode) {
      onBulkApply?.();
      return;
    }
    setInput(value);
    setEditing(true);
  }

  function commit(val: string) {
    onSave(val.trim());
    setEditing(false);
    setDropRect(null);
  }

  const suggestions = categories.filter(c =>
    c.toLowerCase().includes(input.toLowerCase())
  );

  // ── 非編集: チップ表示 ──────────────────────────────────
  if (!editing) {
    const isBulkTarget = bulkMode && onBulkApply;
    return (
      <span
        className={`category-chip${value ? '' : ' empty'}${small ? ' small' : ''}`}
        style={{
          ...(color ? { background: color.bg, color: color.text, border: `1px solid ${color.border}` } : {}),
          cursor: isBulkTarget ? 'crosshair' : 'pointer',
          ...(isBulkTarget ? { outline: '2px dashed var(--blue)', outlineOffset: 1 } : {}),
        }}
        onClick={handleChipClick}
        title={isBulkTarget ? 'クリックで一括適用' : 'クリックして編集'}
      >
        {value || '＋ 設定'}
      </span>
    );
  }

  // ── 編集中: インプット ＋ ポータルドロップダウン ─────────
  return (
    <>
      <div ref={wrapRef} style={{ display: 'inline-block', position: 'relative' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (inputRef.current) setDropRect(inputRef.current.getBoundingClientRect());
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') commit(input);
            if (e.key === 'Escape') { setEditing(false); setDropRect(null); }
          }}
          style={{
            width: small ? 90 : 110, padding: '3px 8px',
            border: '2px solid var(--blue)', borderRadius: 6,
            fontSize: small ? 11 : 12, fontFamily: 'inherit',
            background: '#fff', outline: 'none',
          }}
          placeholder="カテゴリ名…"
          autoFocus
        />
      </div>

      {/* ドロップダウンを body 直下にポータルとしてレンダリング（table の overflow を回避）*/}
      {dropRect && suggestions.length > 0 && createPortal(
        <div
          id="cat-portal"
          style={{
            position: 'fixed',
            top: dropRect.bottom + 4,
            left: dropRect.left,
            zIndex: 9999,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            minWidth: Math.max(dropRect.width, 140),
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.map(cat => {
            const c = getCategoryColor(cat, categories);
            return (
              <div
                key={cat}
                onMouseDown={e => { e.preventDefault(); commit(cat); }}
                style={{
                  padding: '8px 14px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: c?.bg ?? '#fff', color: c?.text ?? 'inherit',
                  borderBottom: '1px solid var(--surface3)',
                  transition: 'filter 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.93)')}
                onMouseLeave={e => (e.currentTarget.style.filter = '')}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: c?.text ?? '#999', flexShrink: 0,
                }} />
                {cat}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
