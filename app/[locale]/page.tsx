export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { supabaseClient } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/menuData';
import { getSettings } from '@/lib/settings';
import CategoryGrid from '@/components/CategoryGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Category } from '@/lib/types';

async function getCategories(): Promise<Category[]> {
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

export default async function MenuHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, categories, settings] = await Promise.all([
    getTranslations('home'),
    getCategories(),
    getSettings(),
  ]);

  const foodCats = categories.filter((c) => !c.is_drink);
  const drinkCats = categories.filter((c) => c.is_drink);

  const foodLabel = locale === 'tr' ? settings.food_section_label_tr : settings.food_section_label_en;
  const drinksLabel = locale === 'tr' ? settings.drinks_section_label_tr : settings.drinks_section_label_en;

  return (
    <div className="min-h-screen" style={{ background: '#f8f6f1' }}>
      <Header locale={locale} settings={settings} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-6 sm:pt-8">
        {/* Page heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-stone-800 tracking-wide">
            {t('welcome')}
          </h1>
          <p className="text-stone-400 text-sm mt-2 tracking-wide">
            {settings.restaurant_name} · {settings.restaurant_location.split('/')[0].trim()}
          </p>
        </div>

        {/* Food */}
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="h-px flex-1 bg-stone-200" />
            <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-brand-600">
              {foodLabel}
            </h2>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          <CategoryGrid categories={foodCats} locale={locale} />
        </section>

        {/* Drinks */}
        <section>
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="h-px flex-1 bg-stone-200" />
            <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-brand-600">
              {drinksLabel}
            </h2>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          <CategoryGrid categories={drinkCats} locale={locale} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
