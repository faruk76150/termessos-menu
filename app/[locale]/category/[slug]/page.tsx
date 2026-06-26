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
    ? locale === 'tr' ? category.name_tr : category.name_en
    : slug;

  const heroImg = category?.image_url || null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header locale={locale} settings={settings} />

      {/* Hero */}
      {heroImg ? (
        <div className="relative h-48 sm:h-60 w-full overflow-hidden">
          <Image
            src={heroImg}
            alt={name}
            fill
            className="object-cover brightness-50"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/40 to-transparent" />

          {/* Back */}
          <Link
            href={`/${locale}`}
            className="absolute top-4 left-4 flex items-center gap-1 bg-[#0f0f0f]/70 border border-[#333] backdrop-blur-sm text-[#ccc] text-xs font-medium px-3 py-1.5 rounded-full hover:border-[#D4A843]/50 hover:text-[#D4A843] transition-colors"
          >
            <ChevronLeft size={13} />
            {t('backToMenu')}
          </Link>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 sm:px-6">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#f0ece4] drop-shadow">{name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[1.5px] w-8 bg-[#D4A843] rounded-full" />
              <p className="text-[#666] text-xs">{items.length} {t('items')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-[#1e1e1e] px-4 py-5 sm:px-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-[#555] hover:text-[#D4A843] text-sm font-medium transition-colors mb-3"
          >
            <ChevronLeft size={14} />
            {t('backToMenu')}
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#f0ece4]">{name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-[1.5px] w-8 bg-[#D4A843] rounded-full" />
            <p className="text-[#555] text-xs">{items.length} {t('items')}</p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-5">
        <ItemsGrid items={items} locale={locale} />
      </main>

      <Footer />
    </div>
  );
}
