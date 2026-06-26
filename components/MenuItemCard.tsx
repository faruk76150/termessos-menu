import Image from 'next/image';
import { Utensils } from 'lucide-react';
import type { MenuItem } from '@/lib/types';

interface Props { item: MenuItem; locale: string }

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(price) + ' ₺';
}

export default function MenuItemCard({ item, locale }: Props) {
  const name = locale === 'tr' ? item.name_tr : item.name_en;
  const desc = locale === 'tr' ? item.description_tr : item.description_en;
  const img = item.image_url || null;

  return (
    <div className="group flex items-center gap-4 bg-white rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all duration-200 border border-stone-100">
      {/* Thumbnail */}
      <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-stone-100">
        {img ? (
          <Image
            src={img}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-6 h-6 text-stone-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-stone-800 text-[15px] sm:text-base leading-snug line-clamp-2">
          {name}
        </h3>
        {desc && (
          <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">{desc}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <span className="inline-block bg-brand-50 text-brand-700 font-semibold text-sm sm:text-[15px] px-2.5 py-1 rounded-lg">
          {formatPrice(item.price)}
        </span>
      </div>
    </div>
  );
}
