-- ============================================================
-- ポケモン 再入荷在庫管理 — Supabase セットアップ SQL
-- Supabase の SQL Editor にそのまま貼り付けて実行してください
-- ============================================================

-- ------------------------------------------------------------
-- 1. テーブル作成
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      TEXT    NOT NULL UNIQUE,
  arrival   INTEGER NOT NULL DEFAULT 0,
  schedule  JSONB   NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cell_data (
  product_id  BIGINT   NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  month_index SMALLINT NOT NULL CHECK (month_index >= 0 AND month_index < 26),
  arrival_qty INTEGER  NOT NULL DEFAULT 0,
  sold_qty    INTEGER  NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, month_index)
);

-- ------------------------------------------------------------
-- 2. updated_at 自動更新トリガー
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- 3. Row Level Security（開発用: 全操作を許可）
-- 本番環境では認証に合わせてポリシーを絞ってください
-- ------------------------------------------------------------

ALTER TABLE products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_products"  ON products;
DROP POLICY IF EXISTS "allow_all_cell_data" ON cell_data;

CREATE POLICY "allow_all_products"  ON products  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_cell_data" ON cell_data FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 4. シードデータ（初期商品40件）
-- 既にデータがある場合は INSERT をスキップします
-- ------------------------------------------------------------

INSERT INTO products (name, arrival, schedule) VALUES
('SWING VIGNETTE Collection2', 0,
 '[null,"○","○",null,"○","○","○","○","○","○","△",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ぽけっとBONSAI2　小さな四季の物語', 0,
 '[null,"○","○",null,"○","○","○","○","○","○","△",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン OVALTIQUE COLLECTION', 0,
 '[null,"○","○",null,"○","○","○","○","○",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン　Circular diorama collection', 850,
 '["○","○","○",null,"○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○"]'::jsonb),

('ポケットモンスター　SWING VIGNETTE collection 3', 0,
 '[null,"○","○",null,"○","○","○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン POCKET STATUE -ドラゴンタイプ-', 693,
 '["○",null,null,null,"○","○","○","○","○","○","○",null,null,null,null,"?","?","?","?","?","?",null,null,null,null,null]'::jsonb),

('ポケモン　和の窓', 770,
 '["○","○",null,null,null,"○","○","○","○","○","○","○","○","○",null,null,null,"?","?","?","?","?","?",null,null,null]'::jsonb),

('Pokémon VINTAGE COLLECTION Type:Steel', 0,
 '[null,"○","○",null,"○","○","○",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケットモンスター　Romantic Collection', 939,
 '["○","○","○",null,"○","○",null,null,"○","○","○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null]'::jsonb),

('ポケットモンスター STARRIUM SERIES 夢見る月夜の星散歩', 0,
 '[null,"○",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('Pokémon GEMSTONE COLLECTION 光り輝くしんぴのキセキ', 843,
 '["○",null,null,null,null,"○","○","○","○","○","○","○",null,null,null,"?","?","?","?","?","?",null,null,null,null,null]'::jsonb),

('ぽけっとBONSAI3-移りゆく季節と共に-', 0,
 '[null,null,null,null,null,null,null,null,null,"?","?","?","?","?","?","?","?","?","?","?","?",null,null,null,null,null]'::jsonb),

('ポケットモンスター テラリウムコレクション15', 862,
 '["○",null,null,null,null,"○","○","○","○","○","○",null,null,null,null,"?","?","?","?","?","?",null,null,null,null,null]'::jsonb),

('Pokémon　NIGHTY NIGHT collection', 0,
 '[null,"○","○",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケットモンスター　森の小さなおはなしシリーズ Peaceful Moments!', 0,
 '[null,"○","○",null,"○","○","○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン Little Night Collection2〜闇夜の小さないたずら〜', 1091,
 '["○",null,null,null,null,"○","○","○","○","○","○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null]'::jsonb),

('POKÉMON NEON PARTY★', 1231,
 '["○","○","○",null,null,null,null,null,"○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○","○",null]'::jsonb),

('ポケットモンスター　LANTERN DIORAMA', 1180,
 '["○",null,null,null,null,null,null,"○","○","○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン ふんわりゆらりん飾り', 0,
 '[null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△",null,null,null,null,null,null,null,null,null]'::jsonb),

('SWING VIGNETTE collection4 ゆらめくポケモンのひととき', 2349,
 '["○",null,null,null,null,null,null,"○","○","○","○","○","○","○","○","○","○","○","△","△","△",null,null,"?","?","?"]'::jsonb),

('ポケットモンスター Diamond Dust', 0,
 '[null,"○","○",null,"○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケットモンスター DesQ Relaxing Home!', 0,
 '[null,"○","○",null,"○","○","○","○","○","○","○",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン Circular diorama collection2 〜きらめきの瞬間〜', 800,
 '["○","○","○",null,"○","○","○","○","○","○","○","○","○","○",null,null,null,null,null,null,null,null,null,null,null,null]'::jsonb),

('ポケモン DecorativeFrameCollection2 -枠を超えて、広がる世界-', 2754,
 '["○",null,null,null,"○","○","○","○","○","○","○","○",null,null,null,"?","?","?","?","?","?",null,null,null,null,null]'::jsonb),

('ポケモン OVALTIQUE COLLECTION2-Luminous-', 2719,
 '["○",null,null,"○","○","○","○","○","○","○","○","○",null,null,null,"?","?","?","?","?","?",null,null,null,null,null]'::jsonb),

('ポケモン Pop Melody', 0,
 '[null,null,null,null,null,null,null,null,"○","○","○","○","○","○","○","○","△","△","△","△",null,null,null,null,null,null]'::jsonb),

('Pokémon Kaichu Collection', 0,
 '[null,null,null,null,null,null,null,null,null,"○","○","○","○","○","○","○","○","△","△","△","△",null,null,null,null,null]'::jsonb),

('ポケモン Sweet Craft Collection', 0,
 '[null,null,null,null,null,null,null,null,null,"○","○","○","○","○","○","○","○","△","△","△","△",null,null,null,null,null]'::jsonb),

('テラリウムコレクション10 ポケモン30周年記念ver.', 0,
 '[null,null,null,null,null,null,null,null,null,"○","○","○","○","○","○","○","○","△","△","△","△",null,null,null,null,null]'::jsonb),

('ポケモン Romantic Collection 2', 0,
 '[null,null,null,null,null,null,null,null,null,null,"○","○","○","○","○","○","○","○","△","△","△","△",null,null,null,null]'::jsonb),

('Pokémon Journey with you! 1弾', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△","△","△","△","△",null,null,null]'::jsonb),

('ポケモン  Poké Shower Splash!', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△","△","△","△","△",null,null,null]'::jsonb),

('ポケモン Windowsill collection', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△","△","△","△","△",null,null,null]'::jsonb),

('Pokémon Journey with you! 2弾', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△","△","△","△",null,null,null]'::jsonb),

('Pokémon Journey with you! 3弾', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△","△","△",null,null,null]'::jsonb),

('イーブイ&フレンズ スフィアスケープコレクション', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△","△","△"]'::jsonb),

('ポケモンRain drop', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△","△"]'::jsonb),

('エスパータイプ　Wave of ｐｓｙchic', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△","△"]'::jsonb),

('SWING VIGNETTE collection 5', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△","△"]'::jsonb),

('ポケットモンスター Aqua Moment Collection', 0,
 '[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"△","△","△","△","△"]'::jsonb)

ON CONFLICT (name) DO NOTHING;
