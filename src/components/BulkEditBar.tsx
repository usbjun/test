import { ScheduleValue } from '../types';

interface BulkEditBarProps {
  bulkEditValue: ScheduleValue | undefined;
  onChange: (v: ScheduleValue | undefined) => void;
}

const OPTIONS: { label: string; value: ScheduleValue; cls: string }[] = [
  { label: '○ 在庫あり',  value: '○', cls: 'bulk-ok' },
  { label: '△ 少量/未定', value: '△', cls: 'bulk-maybe' },
  { label: '? 確認中',    value: '?',  cls: 'bulk-unknown' },
  { label: '— 空欄',      value: null, cls: 'bulk-none' },
];

export default function BulkEditBar({ bulkEditValue, onChange }: BulkEditBarProps) {
  return (
    <div className="bulk-edit-bar">
      <span className="bulk-edit-label">一括編集モード</span>
      <span className="bulk-edit-hint">マークを選んでセルをクリックすると一括で変更されます</span>
      <div className="bulk-edit-options">
        {OPTIONS.map(opt => (
          <button
            key={String(opt.value)}
            className={`bulk-btn ${opt.cls}${bulkEditValue !== undefined && String(bulkEditValue) === String(opt.value) ? ' active' : ''}`}
            onClick={() => onChange(
              bulkEditValue !== undefined && String(bulkEditValue) === String(opt.value)
                ? undefined  // 同じボタンを再クリック → モード解除
                : opt.value
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button className="bulk-exit-btn" onClick={() => onChange(undefined)}>✕ 終了</button>
    </div>
  );
}
