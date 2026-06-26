export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { MapPin, Clock, Phone } from 'lucide-react';
import Image from 'next/image';
import { supabaseClient } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/menuData';
import { getSettings } from '@/lib/settings';
import CategoryGrid from '@/components/CategoryGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Category } from '@/lib/types';

const HERO_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85';

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
  const phoneHref = `tel:${settings.restaurant_phone.replace(/\s+/g, '')}`;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header locale={locale} settings={settings} />

      {/* Full-bleed hero */}
      <section className="relative h-[48vh] min-h-[280px] max-h-[420px] w-full overflow-hidden">
        <Image
          src={HERO_IMG}
          alt={settings.restaurant_name}
          fill
          className="object-cover"
          style={{ filter: 'brightness(0.35)' }}
          unoptimized
          priority
        />
        {/* Gradient: transparent top → solid bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />

        {/* Centred badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#D4A843]/60" />
            <span className="text-[#D4A843] text-[10px] font-semibold tracking-[0.45em] uppercase">
              {t('welcome')}
            </span>
            <div className="h-px w-10 bg-[#D4A843]/60" />
          </div>
          <h1 className="font-display font-bold text-[#f0ece4] text-4xl sm:text-5xl leading-tight tracking-wide">
            {settings.restaurant_name}
          </h1>
          <p className="text-[#777] text-[11px] tracking-[0.3em] uppercase mt-2">
            {settings.restaurant_tagline}
          </p>
        </div>

        {/* Info strip pinned to bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-5 px-4 pb-4 text-xs text-[#888]">
          <span className="flex items-center gap-1.5">
            <MapPin size={11} className="text-[#D4A843]" />
            {settings.restaurant_location}
          </span>
          <span className="w-px h-3 bg-[#333]" />
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-[#D4A843]" />
            {settings.restaurant_hours}
          </span>
          <span className="w-px h-3 bg-[#333]" />
          <a href={phoneHref} className="flex items-center gap-1.5 text-[#888] hover:text-[#D4A843] transition-colors">
            <Phone size={11} className="text-[#D4A843]" />
            {settings.restaurant_phone}
          </a>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-8">
        {/* Food section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-[#222]" />
            <h2 className="font-display font-semibold text-[#D4A843] text-[11px] tracking-[0.4em] uppercase">
              {foodLabel}
            </h2>
            <div className="h-px flex-1 bg-[#222]" />
          </div>
          <CategoryGrid categories={foodCats} locale={locale} />
        </section>

        {/* Drinks section */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-[#222]" />
            <h2 className="font-display font-semibold text-[#D4A843] text-[11px] tracking-[0.4em] uppercase">
              {drinksLabel}
            </h2>
            <div className="h-px flex-1 bg-[#222]" />
          </div>
          <CategoryGrid categories={drinkCats} locale={locale} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
