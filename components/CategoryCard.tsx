import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';

interface Props { category: Category; locale: string }

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';

export default function CategoryCard({ category, locale }: Props) {
  const name = locale === 'tr' ? category.name_tr : category.name_en;
  const img = category.image_url || PLACEHOLDER;

  return (
    <Link
      href={`/${locale}/category/${category.slug}`}
      className="group relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <Image
        src={img}
        alt={name}
        fill
        className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        unoptimized
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Hover tint */}
      <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/20 transition-colors duration-300" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-display font-semibold text-white text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-brand-200 transition-colors">
          {name}
        </p>
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
          <span className="text-brand-300 text-[11px] font-medium tracking-wide">Görüntüle</span>
          <svg className="w-3 h-3 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
