-- ============================================================
-- カテゴリ列追加 — 既存DBに対して実行してください
-- ============================================================

-- category 列を追加（既存商品は空文字列で初期化）
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';

-- カテゴリ + 名前でのソート用インデックス
CREATE INDEX IF NOT EXISTS idx_products_category_name
  ON products (category, name);
