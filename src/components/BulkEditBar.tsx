import { ScheduleValue } from '../types';
import { getCategoryColor } from '../lib/categoryColors';

interface BulkEditBarProps {
  bulkStatusValue: ScheduleValue | undefined;
  onStatusChange: (v: ScheduleValue | undefined) => void;
  bulkCategoryValue: string | undefined;
  onCategoryChange: (v: string | undefined) => void;
  categories: string[];
  onClose: () => void;
}

const STATUS_OPTIONS: { label: string; value: ScheduleValue; cls: string }[] = [
  { label: '○ 在庫あり',  value: '○', cls: 'bulk-ok' },
  { label: '△ 少量/未定', value: '△', cls: 'bulk-maybe' },
  { label: '? 確認中',    value: '?',  cls: 'bulk-unknown' },
  { label: '— 空欄',      value: null, cls: 'bulk-none' },
];

export default function BulkEditBar({
  bulkStatusValue, onStatusChange,
  bulkCategoryValue, onCategoryChange,
  categories, onClose,
}: BulkEditBarProps) {
  const anyActive = bulkStatusValue !== undefined || bulkCategoryValue !== undefined;
  const hint = bulkCategoryValue !== undefined
    ? '商品名をクリックするとカテゴリを一括適用できます'
    : 'マークを選んでセルをクリックすると一括で変更されます';

  return (
    <div className="bulk-edit-bar">
      <span className="bulk-edit-label">一括編集モード</span>
      <span className="bulk-edit-hint">{hint}</span>

      {/* ステータスボタン */}
      <div className="bulk-edit-section-label">ステータス:</div>
      <div className="bulk-edit-options">
        {STATUS_OPTIONS.map(opt => {
          const isActive = bulkStatusValue !== undefined &&
            String(bulkStatusValue) === String(opt.value);
          return (
            <button
              key={String(opt.value)}
              className={`bulk-btn ${opt.cls}${isActive ? ' active' : ''}`}
              onClick={() => {
                onCategoryChange(undefined);
                onStatusChange(isActive ? undefined : opt.value);
              }}
            >{opt.label}</button>
          );
        })}
      </div>

      {/* カテゴリボタン（カテゴリが存在する場合のみ） */}
      {categories.length > 0 && (
        <>
          <div className="bulk-edit-section-label">カテゴリ:</div>
          <div className="bulk-edit-options">
            {categories.map(cat => {
              const color = getCategoryColor(cat, categories);
              const isActive = bulkCategoryValue === cat;
              return (
                <button
                  key={cat}
                  className={`bulk-btn${isActive ? ' active' : ''}`}
                  style={isActive && color
                    ? { background: color.bg, borderColor: color.border, color: color.text, boxShadow: `0 0 0 2px ${color.border}` }
                    : color ? { borderColor: color.border, color: color.text } : undefined
                  }
                  onClick={() => {
                    onStatusChange(undefined);
                    onCategoryChange(isActive ? undefined : cat);
                  }}
                >{cat}</button>
              );
            })}
          </div>
        </>
      )}

      <button className="bulk-exit-btn" onClick={onClose}>✕ 終了</button>
    </div>
  );
}
