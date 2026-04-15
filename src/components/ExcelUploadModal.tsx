import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

interface ParsedRow {
  name: string;
  category: string;
  arrival: number;
  error?: string;
}

interface ExcelUploadModalProps {
  onUpload: (rows: { name: string; category: string; arrival: number }[]) => Promise<void>;
  onClose: () => void;
}

export default function ExcelUploadModal({ onUpload, onClose }: ExcelUploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // header: false → 配列形式で取得
        const raw: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const parsed: ParsedRow[] = [];
        for (let i = 0; i < raw.length; i++) {
          const row = raw[i];
          const name = String(row[0] ?? '').trim();
          if (!name) continue; // 空行スキップ
          const category = String(row[1] ?? '').trim();
          const arrivalRaw = row[2];
          const arrival = typeof arrivalRaw === 'number'
            ? Math.max(0, Math.round(arrivalRaw))
            : parseInt(String(arrivalRaw ?? '0').replace(/[,，]/g, ''), 10) || 0;
          parsed.push({ name, category, arrival });
        }

        if (parsed.length === 0) {
          setError('有効なデータが見つかりませんでした。A列に商品名が入力されているか確認してください。');
        }
        setRows(parsed);
      } catch {
        setError('ファイルの読み込みに失敗しました。Excel ファイル（.xlsx / .xls）を選択してください。');
        setRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleConfirm() {
    const valid = rows.filter(r => r.name);
    if (valid.length === 0) return;
    setLoading(true);
    try {
      await onUpload(valid);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box excel-upload-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Excelから商品を一括登録</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 形式説明 */}
          <div className="excel-format-note">
            <div className="excel-format-title">ファイル形式</div>
            <table className="excel-format-table">
              <thead>
                <tr>
                  <th>A列</th><th>B列</th><th>C列</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>商品名（必須）</td>
                  <td>カテゴリ</td>
                  <td>入荷数（数値）</td>
                </tr>
                <tr className="example-row">
                  <td>ポケモン ○○コレクション</td>
                  <td>ポケモン</td>
                  <td>500</td>
                </tr>
              </tbody>
            </table>
            <div className="excel-format-note-text">・1行目がヘッダーの場合は自動でスキップします（商品名が空の行は無視）</div>
          </div>

          {/* ファイル選択 */}
          <div
            className="excel-drop-zone"
            onClick={() => fileRef.current?.click()}
          >
            <div className="excel-drop-icon">📂</div>
            <div className="excel-drop-text">
              {fileName ? fileName : 'クリックしてファイルを選択'}
            </div>
            <div className="excel-drop-sub">.xlsx / .xls</div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>

          {error && <div className="excel-error">{error}</div>}

          {/* プレビュー */}
          {rows.length > 0 && (
            <div className="excel-preview">
              <div className="excel-preview-header">
                プレビュー <span className="excel-preview-count">{rows.length} 件</span>
              </div>
              <div className="excel-preview-table-wrap">
                <table className="excel-preview-table">
                  <thead>
                    <tr><th>#</th><th>商品名</th><th>カテゴリ</th><th>入荷数</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td className="preview-no">{i + 1}</td>
                        <td>{r.name}</td>
                        <td>{r.category || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td style={{ textAlign: 'right' }}>
                          {r.arrival > 0 ? r.arrival.toLocaleString() : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose} disabled={loading}>キャンセル</button>
          <button
            className="modal-btn-add"
            onClick={handleConfirm}
            disabled={rows.length === 0 || loading}
          >
            {loading ? '登録中…' : `${rows.length} 件を登録`}
          </button>
        </div>
      </div>
    </div>
  );
}
