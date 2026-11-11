-- ============================================================
-- 月数拡張マイグレーション
-- Supabase SQL Editor で実行してください
-- ============================================================

-- 1. app_config テーブル（アプリ設定を保存）
CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- 初期値: 66ヶ月（2025年4月 〜 2027年12月）
INSERT INTO app_config (key, value)
VALUES ('total_months', '66'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS 設定
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_config_read_all" ON app_config;
CREATE POLICY "app_config_read_all"
  ON app_config FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "app_config_write_admin" ON app_config;
CREATE POLICY "app_config_write_admin"
  ON app_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 2. cell_data の month_index 上限を緩和（26 → 199）
ALTER TABLE cell_data DROP CONSTRAINT IF EXISTS cell_data_month_index_check;
ALTER TABLE cell_data ADD CONSTRAINT cell_data_month_index_check
  CHECK (month_index >= 0 AND month_index < 200);
