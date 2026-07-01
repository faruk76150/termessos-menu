-- Supabase Setup: Menu Images Bucket, Upload Policies & Indexes
-- Run this script in the Supabase SQL Editor

-- 1. Create the storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Note: RLS is already enabled on storage.objects by default in Supabase.
-- (No need to run ALTER TABLE storage.objects, which requires superuser privileges).

-- 3. Policy: Allow public read access to objects in the menu-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- 4. Policy: Allow admin users (service_role or authenticated role) full control over objects
DROP POLICY IF EXISTS "Admin CRUD Access" ON storage.objects;
CREATE POLICY "Admin CRUD Access"
ON storage.objects FOR ALL
TO service_role, authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- 5. Performance Indexes: Optimize item/category fetching when ordered by display_order
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_items_order ON menu_items(display_order);
