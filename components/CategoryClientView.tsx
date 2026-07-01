'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from './Header';
import CategoryNav from './CategoryNav';
import ItemsGrid from './ItemsGrid';
import Footer from './Footer';
import { getLocalizedSlug, getDbSlug } from '@/lib/slugs';
import type { SiteSettings } from '@/lib/settings';
import type { Category, MenuItem } from '@/lib/types';

interface Props {
  categories: Category[];
  items: MenuItem[];
  initialSlug: string;
  locale: string;
  settings: SiteSettings;
  translations: {
    backToMenu: string;
    items: string;
  };
}

export default function CategoryClientView({
  categories,
  items,
  initialSlug,
  locale,
  settings,
  translations,
}: Props) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);

  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const name = activeCategory
    ? locale === 'tr' ? activeCategory.name_tr : activeCategory.name_en
    : activeSlug;

  const heroImg = activeCategory?.image_url || null;
  const filteredItems = items.filter((item) => item.category_id === activeCategory?.id);

  // Sync browser back/forward buttons with client state
  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/');
      const urlSlug = pathParts[pathParts.length - 1];
      if (urlSlug) {
        const dbSlug = getDbSlug(urlSlug);
        if (categories.some(c => c.slug === dbSlug)) {
          setActiveSlug(dbSlug);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [categories]);

  const handleCategoryChange = (dbSlug: string) => {
    setActiveSlug(dbSlug);
    // Smooth scroll the viewport back to the top of the menu
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update browser history path shallowly with localized slug
    const urlSlug = getLocalizedSlug(dbSlug, locale);
    window.history.pushState(null, '', `/${locale}/category/${urlSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header locale={locale} settings={settings} />
      
      {/* Category Nav Switcher */}
      <CategoryNav 
        categories={categories} 
        activeSlug={activeSlug} 
        locale={locale} 
        onSelectCategory={handleCategoryChange}
      />

      {/* Main Content Area - Keyed to force a clean animation cycle on transition */}
      <div key={activeSlug} className="animate-fade-in">
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/85 to-black/30" />

            {/* Back to Home Link */}
            <Link
              href={`/${locale}`}
              className="absolute top-4 left-4 flex items-center gap-1 bg-[#0f0f0f]/70 border border-[#333] backdrop-blur-sm text-[#ccc] text-xs font-medium px-3 py-1.5 rounded-full hover:border-[#D4A843]/50 hover:text-[#D4A843] transition-colors"
            >
              <ChevronLeft size={13} />
              {translations.backToMenu}
            </Link>

            {/* Title & Count */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 sm:px-6">
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#f0ece4] drop-shadow">{name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-[1.5px] w-8 bg-[#D4A843] rounded-full" />
                <p className="text-[#999] text-xs">{filteredItems.length} {translations.items}</p>
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
              {translations.backToMenu}
            </Link>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#f0ece4]">{name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-[1.5px] w-8 bg-[#D4A843] rounded-full" />
              <p className="text-[#555] text-xs">{filteredItems.length} {translations.items}</p>
            </div>
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-5">
          <ItemsGrid items={filteredItems} locale={locale} />
        </main>
      </div>

      <Footer />
    </div>
  );
}
