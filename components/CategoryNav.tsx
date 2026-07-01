'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { getLocalizedSlug } from '@/lib/slugs';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  activeSlug: string;
  locale: string;
  onSelectCategory?: (slug: string) => void;
}

// Module-level variable to persist horizontal scroll position across page unmounts/remounts
let globalScrollLeft = 0;

export default function CategoryNav({ categories, activeSlug, locale, onSelectCategory }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Restore scroll position on mount and listen to user scrolling to persist position
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = globalScrollLeft;
    }

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      globalScrollLeft = container.scrollLeft;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Auto-center active category pill only if it is not fully visible in the container viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerLeft = container.scrollLeft;
      const containerRight = containerLeft + containerWidth;
      
      const activeElLeft = (activeEl as HTMLElement).offsetLeft;
      const activeElWidth = (activeEl as HTMLElement).offsetWidth;
      
      // Check if the active category is fully visible in the current scroll view.
      // We buffer by 5px to account for rounding/pixel-snapping variations.
      const isVisible = (activeElLeft >= containerLeft - 5) && 
                        ((activeElLeft + activeElWidth) <= containerRight + 5);
      
      if (!isVisible) {
        container.scrollTo({
          left: activeElLeft - (containerWidth / 2) + (activeElWidth / 2),
          behavior: 'smooth',
        });
      }
    }
  }, [activeSlug]);

  return (
    <div className="sticky top-14 z-30 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#1e1e1e] w-full">
      <div
        ref={containerRef}
        className="max-w-5xl mx-auto flex items-center overflow-x-auto category-nav-scrollbar px-4 py-3 gap-2"
      >
        {categories.map((cat) => {
          const name = locale === 'tr' ? cat.name_tr : cat.name_en;
          const isActive = cat.slug === activeSlug;

          const handleClick = (e: React.MouseEvent) => {
            if (onSelectCategory) {
              e.preventDefault();
              onSelectCategory(cat.slug);
            }
          };

          return (
            <Link
              key={cat.id}
              href={`/${locale}/category/${getLocalizedSlug(cat.slug, locale)}`}
              onClick={handleClick}
              scroll={false}
              data-active={isActive ? 'true' : 'false'}
              className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#D4A843] border-[#D4A843] text-[#0f0f0f] shadow-md pointer-events-none'
                  : 'bg-[#141414] border-[#222] text-[#888] hover:text-[#f0ece4] hover:border-[#D4A843]/40'
              }`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
