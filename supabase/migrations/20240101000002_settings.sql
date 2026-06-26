CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Service write settings" ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT ALL ON settings TO service_role;
GRANT SELECT ON settings TO anon, authenticated;

INSERT INTO settings (key, value) VALUES
  ('restaurant_name', 'Termessos Hotel'),
  ('restaurant_tagline', 'Hotel & Restaurant'),
  ('restaurant_location', 'Göreme / Nevşehir'),
  ('restaurant_hours', '07:00 – 00:00'),
  ('restaurant_phone', '+90 384 271 24 95'),
  ('restaurant_email', 'info@termessoshotel.com.tr'),
  ('food_section_label_tr', 'Yiyecekler'),
  ('food_section_label_en', 'Food'),
  ('drinks_section_label_tr', 'İçecekler'),
  ('drinks_section_label_en', 'Drinks')
ON CONFLICT (key) DO NOTHING;
