-- Run this script in the Supabase SQL Editor to enable Auth-Role checking

-- 1. Drop existing admins table to prevent schema mismatch constraints
DROP TABLE IF EXISTS public.admins CASCADE;

-- 2. Create the admins table mapping auth.users(id) to admin panel access
CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE, -- References auth.users(id)
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Setup RLS Policies
DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service write admins" ON public.admins;
CREATE POLICY "Service write admins" ON public.admins FOR ALL USING (auth.role() = 'service_role');

-- 4. How to add an admin:
-- Go to Supabase Auth -> Users -> Create User (e.g. admin@termessoshotel.com.tr)
-- Copy the generated User ID (UUID) and replace 'YOUR_USER_ID_UUID_HERE' below:
--
-- INSERT INTO public.admins (user_id) 
-- VALUES ('YOUR_USER_ID_UUID_HERE')
-- ON CONFLICT (user_id) DO NOTHING;
