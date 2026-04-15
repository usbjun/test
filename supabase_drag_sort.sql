-- ============================================================
-- 並び替え用 sort_order 列の追加
-- Supabase SQL Editor で実行してください
-- ============================================================

-- sort_order 列追加
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- 既存データを id 順で初期化
UPDATE products SET sort_order = id WHERE sort_order IS NULL;

-- ソート用インデックス
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);

-- ============================================================
-- 並び替え一括更新用ストアドファンクション
-- ============================================================
CREATE OR REPLACE FUNCTION batch_update_sort_order(updates JSONB)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates) LOOP
    UPDATE products
    SET sort_order = (item->>'sort_order')::INTEGER
    WHERE id = (item->>'id')::BIGINT;
  END LOOP;
END;
$$;
