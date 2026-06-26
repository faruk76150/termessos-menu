DROP POLICY IF EXISTS "Service write categories" ON categories;
DROP POLICY IF EXISTS "Service write items" ON menu_items;

CREATE POLICY "Service write categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write items" ON menu_items FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
