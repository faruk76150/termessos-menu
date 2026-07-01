export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { unstable_noStore as noStore } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { supabaseClient } from '@/lib/supabase';
import { CATEGORIES, MENU_ITEMS } from '@/lib/menuData';
import { getSettings } from '@/lib/settings';
import CategoryClientView from '@/components/CategoryClientView';
import { getDbSlug } from '@/lib/slugs';
import type { Category, MenuItem } from '@/lib/types';

async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabaseClient()
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    if (error || !data?.length) throw error;
    return data;
  } catch {
    return CATEGORIES.map((c, i) => ({ ...c, id: String(i + 1) }));
  }
}

async function getAllMenuItems(allCategories: Category[]): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabaseClient()
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    if (error) throw error;
    return data || [];
  } catch {
    // Fallback: Map static menu items to category IDs based on slug
    return MENU_ITEMS.map((item, idx) => {
      const cat = allCategories.find((c) => c.slug === item.category_slug);
      return {
        id: String(idx),
        category_id: cat ? cat.id : item.category_slug,
        slug: item.slug,
        name_tr: item.name_tr,
        name_en: item.name_en,
        description_tr: item.description_tr || '',
        description_en: item.description_en || '',
        price: item.price,
        image_url: item.image_url || null,
        is_active: true,
        is_featured: item.is_featured || false,
        display_order: idx,
      };
    });
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  noStore();
  const { locale, slug } = await params;
  const dbSlug = getDbSlug(slug);
  const allCategories = await getAllCategories();
  
  const [t, allItems, settings] = await Promise.all([
    getTranslations('category'),
    getAllMenuItems(allCategories),
    getSettings(),
  ]);

  return (
    <CategoryClientView
      categories={allCategories}
      items={allItems}
      initialSlug={dbSlug}
      locale={locale}
      settings={settings}
      translations={{
        backToMenu: t('backToMenu'),
        items: t('items'),
      }}
    />
  );
}
