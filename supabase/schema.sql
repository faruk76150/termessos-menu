-- Termessos Hotel QR Menu Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_tr text NOT NULL,
  name_en text NOT NULL,
  image_url text,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  is_drink boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name_tr text NOT NULL,
  name_en text NOT NULL,
  description_tr text DEFAULT '',
  description_en text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read items" ON menu_items FOR SELECT USING (true);

-- Allow service role to write
CREATE POLICY "Service write categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write items" ON menu_items FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_slug ON menu_items(slug);
CREATE INDEX IF NOT EXISTS idx_items_active ON menu_items(is_active);

-- Admins table for auth-role mapping by Supabase Auth User ID
DROP TABLE IF EXISTS public.admins CASCADE;
CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE, -- References auth.users(id)
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check admin mappings (read-only), but only service role to modify
CREATE POLICY "Public read admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Service write admins" ON public.admins FOR ALL USING (auth.role() = 'service_role');

