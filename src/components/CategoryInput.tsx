import { useState, useRef, useEffect } from 'react';
import { getCategoryColor } from '../lib/categoryColors';

interface CategoryInputProps {
  value: string;
  categories: string[];        // 既存カテゴリ一覧（ソート済み）
  onSave: (value: string) => void;
  small?: boolean;
}

export default function CategoryInput({ value, categories, onSave, small }: CategoryInputProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const color = value ? getCategoryColor(value, categories) : null;

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        commit(input);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing, input]);

  function startEdit() {
    setInput(value);
    setEditing(true);
  }

  function commit(val: string) {
    onSave(val.trim());
    setEditing(false);
  }

  const suggestions = categories.filter(c =>
    c.toLowerCase().includes(input.toLowerCase())
  );

  if (!editing) {
    return (
      <span
        className={`category-chip${value ? '' : ' empty'}${small ? ' small' : ''}`}
        style={color ? { background: color.bg, color: color.text, border: `1px solid ${color.border}`, cursor: 'pointer' } : undefined}
        onClick={startEdit}
        title="クリックして編集"
      >
        {value || '＋ 設定'}
      </span>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block', zIndex: 1000 }}>
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') commit(input);
          if (e.key === 'Escape') { setEditing(false); }
        }}
        style={{
          width: small ? 90 : 110, padding: '3px 8px',
          border: '2px solid var(--blue)', borderRadius: 6,
          fontSize: small ? 11 : 12, fontFamily: 'inherit',
          background: '#fff', outline: 'none',
        }}
        placeholder="カテゴリ名…"
      />
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 2,
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.13)',
          minWidth: 130, maxHeight: 200, overflowY: 'auto', zIndex: 6000,
        }}>
          {suggestions.map(cat => {
            const c = getCategoryColor(cat, categories);
            return (
              <div
                key={cat}
                onMouseDown={e => { e.preventDefault(); commit(cat); }}
                style={{
                  padding: '7px 12px', cursor: 'pointer', fontSize: 12,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                  borderBottom: '1px solid var(--surface3)',
                  background: c?.bg, color: c?.text,
                  transition: 'filter 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.95)')}
                onMouseLeave={e => (e.currentTarget.style.filter = '')}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: c?.text, flexShrink: 0,
                }} />
                {cat}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
