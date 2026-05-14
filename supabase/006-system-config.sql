-- System configuration table (key-value store)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "Anyone can read system_config"
  ON system_config FOR SELECT
  USING (true);

-- Only admins can write
CREATE POLICY "Only admins can write system_config"
  ON system_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update system_config"
  ON system_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert defaults
INSERT INTO system_config (key, value) VALUES
  ('app_name', 'PadelRush'),
  ('app_logo', 'PR'),
  ('primary_color', '#c96442'),
  ('default_sport', 'padel'),
  ('default_sets', '2'),
  ('tiebreak_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
