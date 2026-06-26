export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { unstable_noStore as noStore } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { CATEGORIES, MENU_ITEMS } from '@/lib/menuData';
import { getSettings } from '@/lib/settings';
import ItemsGrid from '@/components/ItemsGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Category, MenuItem } from '@/lib/types';

async function getCategoryWithItems(slug: string): Promise<{ category: Category | null; items: MenuItem[] }> {
  try {
    const db = supabaseClient();
    const { data: cat } = await db
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (!cat) throw new Error('not found');

    const { data: items } = await db
      .from('menu_items')
      .select('*')
      .eq('category_id', cat.id)
      .eq('is_active', true)
      .order('display_order');

    return { category: cat, items: items || [] };
  } catch {
    const catData = CATEGORIES.find((c) => c.slug === slug);
    const category: Category | null = catData ? { ...catData, id: slug } : null;
    const items: MenuItem[] = MENU_ITEMS
      .filter((i) => i.category_slug === slug)
      .map((i, idx) => ({
        id: String(idx),
        category_id: slug,
        slug: i.slug,
        name_tr: i.name_tr,
        name_en: i.name_en,
        description_tr: i.description_tr || '',
        description_en: i.description_en || '',
        price: i.price,
        image_url: i.image_url || null,
        is_active: true,
        is_featured: i.is_featured || false,
        display_order: idx,
      }));
    return { category, items };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  noStore();
  const { locale, slug } = await params;
  const [t, { category, items }, settings] = await Promise.all([
    getTranslations('category'),
    getCategoryWithItems(slug),
    getSettings(),
  ]);

  const name = category
    ? locale === 'tr'
      ? category.name_tr
      : category.name_en
    : slug;

  const heroImg = category?.image_url || null;

  return (
    <div className="min-h-screen" style={{ background: '#f8f6f1' }}>
      <Header locale={locale} settings={settings} />

      {/* Category hero */}
      {heroImg && (
        <div className="relative h-40 sm:h-56 w-full overflow-hidden">
          <Image
            src={heroImg}
            alt={name}
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-wide drop-shadow-sm">
              {name}
            </h1>
            <p className="text-white/70 text-sm mt-1">{items.length} {t('items')}</p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-5">
        {/* Back + title when no hero */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1 text-stone-500 hover:text-brand-700 text-sm font-medium transition-colors"
          >
            <ChevronLeft size={16} />
            {t('backToMenu')}
          </Link>
        </div>

        {!heroImg && (
          <div className="mb-5">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-800">{name}</h1>
            <p className="text-stone-400 text-sm mt-1">{items.length} {t('items')}</p>
          </div>
        )}

        <ItemsGrid items={items} locale={locale} />
      </main>

      <Footer />
    </div>
  );
}
