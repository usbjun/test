import { useState, useEffect, useRef } from 'react';

interface AddProductModalProps {
  existingCategories: string[];
  onAdd: (name: string, category: string) => Promise<void>;
  onClose: () => void;
}

export default function AddProductModal({ existingCategories, onAdd, onClose }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('商品名を入力してください'); return; }
    setError(null);
    setLoading(true);
    try {
      await onAdd(name.trim(), category.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '追加に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const cats = Array.from(new Set(existingCategories.filter(Boolean))).sort();

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.title}>商品を追加</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>商品名 <span style={{ color: 'var(--red)' }}>*</span></label>
            <input
              ref={nameRef}
              style={s.input}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: ポケモン ○○コレクション"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>カテゴリ</label>
            <input
              style={s.input}
              type="text"
              list="category-list"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="例: フィギュア"
            />
            <datalist id="category-list">
              {cats.map(c => <option key={c} value={c} />)}
            </datalist>
            {cats.length > 0 && (
              <div style={s.catChips}>
                {cats.map(c => (
                  <button
                    key={c} type="button"
                    style={{ ...s.chip, ...(category === c ? s.chipActive : {}) }}
                    onClick={() => setCategory(c)}
                  >{c}</button>
                ))}
              </div>
            )}
          </div>

          {error && <div style={s.error}>{error}</div>}

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>キャンセル</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? '追加中…' : '+ 追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 4000,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 14,
    padding: '24px 28px', width: '100%', maxWidth: 440,
    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    border: '1px solid var(--border)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: "'M PLUS Rounded 1c', sans-serif", fontSize: 16, fontWeight: 900, color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer' },
  field: { marginBottom: 16 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.07em', textTransform: 'uppercase' as const,
    color: 'var(--text-muted)', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '9px 13px',
    border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit', color: 'var(--text)',
    background: 'var(--surface2)', outline: 'none', boxSizing: 'border-box' as const,
  },
  catChips: { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 8 },
  chip: {
    padding: '3px 10px', borderRadius: 20,
    border: '1px solid var(--border)', background: 'var(--surface2)',
    fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
  },
  chipActive: { background: 'var(--blue-dark)', borderColor: 'var(--blue)', color: '#fff' },
  error: {
    background: 'rgba(227,53,13,0.08)', border: '1px solid rgba(227,53,13,0.25)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--red)', marginBottom: 12,
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: {
    padding: '9px 18px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--surface2)',
    fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '9px 20px', borderRadius: 8, border: 'none',
    background: 'var(--red)', color: '#fff',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
};
