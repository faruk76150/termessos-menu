import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';

interface Props {
  category: Category;
  locale: string;
  variant?: 'banner' | 'grid';
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';

export default function CategoryCard({ category, locale, variant = 'grid' }: Props) {
  const name = locale === 'tr' ? category.name_tr : category.name_en;
  const img = category.image_url || PLACEHOLDER;
  const isBanner = variant === 'banner';

  return (
    <Link
      href={`/${locale}/category/${category.slug}`}
      className={`group relative overflow-hidden block border border-[#2a2a2a] hover:border-[#D4A843]/40 transition-all duration-300 ${
        isBanner
          ? 'rounded-xl w-full' // landscape banner on mobile
          : 'rounded-xl aspect-square' // square card on desktop grid
      }`}
      style={isBanner ? { aspectRatio: '16/6' } : undefined}
    >
      <Image
        src={img}
        alt={name}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        style={{ filter: 'brightness(0.55)', ...(isBanner ? {} : {}) }}
        sizes={isBanner ? '100vw' : '(max-width: 1024px) 33vw, 25vw'}
        unoptimized
      />
      {/* Gradient: left-heavy on banner, bottom-heavy on grid */}
      <div
        className={`absolute inset-0 ${
          isBanner
            ? 'bg-gradient-to-r from-black/80 via-black/30 to-transparent'
            : 'bg-gradient-to-t from-black/85 via-black/20 to-transparent'
        }`}
      />

      {/* Label */}
      <div className={`absolute ${isBanner ? 'left-0 top-0 bottom-0 flex flex-col justify-center pl-5' : 'bottom-0 left-0 right-0 p-3'}`}>
        <p className="font-display font-semibold text-[#f0ece4] leading-tight line-clamp-2 drop-shadow"
          style={{ fontSize: isBanner ? '1.2rem' : '0.875rem' }}
        >
          {name}
        </p>
        <div className="h-[1.5px] w-6 bg-[#D4A843] mt-1.5 rounded-full opacity-80 group-hover:w-10 transition-all duration-300" />
      </div>

      {/* Arrow on banner */}
      {isBanner && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#D4A843]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </Link>
  );
}
