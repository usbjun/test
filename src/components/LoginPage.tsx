import { useState } from 'react';
import { signIn } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <img src="/logo.png" alt="ロゴ" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 20 }} />

        <h1 style={styles.title}>再入荷在庫管理表アプリ</h1>
        <p style={styles.sub}>社内専用システム — ログインが必要です</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@company.co.jp"
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? '確認中…' : 'ログイン'}
          </button>
        </form>

        <p style={styles.note}>
          アカウントが必要な方は管理者にお問い合わせください
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff5f3 0%, #f0f5ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
    border: '1px solid #dde2ee',
    textAlign: 'center',
  },
  title: {
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    fontSize: 18, fontWeight: 900,
    color: '#E3350D', marginBottom: 6,
    letterSpacing: '0.03em',
  },
  sub: { fontSize: 12, color: '#6b7a99', marginBottom: 28 },
  form: { textAlign: 'left' },
  field: { marginBottom: 16 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.07em', textTransform: 'uppercase' as const,
    color: '#6b7a99', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '10px 14px',
    border: '1px solid #dde2ee', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit',
    color: '#1a1f2e', background: '#f0f2f7',
    outline: 'none', boxSizing: 'border-box' as const,
  },
  error: {
    background: 'rgba(227,53,13,0.08)',
    border: '1px solid rgba(227,53,13,0.25)',
    borderRadius: 8, padding: '8px 12px',
    fontSize: 13, color: '#E3350D',
    marginBottom: 16,
  },
  btn: {
    width: '100%', padding: '11px',
    background: '#E3350D', color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: 15, fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer',
    marginTop: 4, letterSpacing: '0.03em',
  },
  note: { fontSize: 11, color: '#6b7a99', marginTop: 20 },
};
