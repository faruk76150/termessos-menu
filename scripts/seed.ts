/**
 * Seed Supabase with all menu categories and items from local menuData.
 * Run: npx tsx scripts/seed.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, MENU_ITEMS } from '../lib/menuData';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding categories...');
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .upsert(CATEGORIES.map((c) => ({ ...c })), { onConflict: 'slug' })
    .select();

  if (catErr) { console.error('Categories error:', catErr.message); process.exit(1); }
  console.log(`  ✓ ${cats?.length} categories`);

  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));

  console.log('Seeding menu items...');
  const items = MENU_ITEMS.map((item, idx) => ({
    category_id: catMap[item.category_slug],
    slug: item.slug,
    name_tr: item.name_tr,
    name_en: item.name_en,
    description_tr: item.description_tr ?? '',
    description_en: item.description_en ?? '',
    price: item.price,
    image_url: item.image_url ?? null,
    is_active: true,
    is_featured: item.is_featured ?? false,
    display_order: idx,
  })).filter((i) => i.category_id);

  const { data: rows, error: itemErr } = await supabase
    .from('menu_items')
    .upsert(items, { onConflict: 'slug' })
    .select();

  if (itemErr) { console.error('Items error:', itemErr.message); process.exit(1); }
  console.log(`  ✓ ${rows?.length} items`);
  console.log('Done!');
}

seed();
