'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Utensils, Star } from 'lucide-react';
import ItemDetailModal from './ItemDetailModal';
import type { MenuItem } from '@/lib/types';

interface Props { items: MenuItem[]; locale: string }

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'decimal', minimumFractionDigits: 2 }).format(price) + ' ₺';
}

export default function ItemsGrid({ items, locale }: Props) {
  const [selected, setSelected] = useState<MenuItem | null>(null);

  return (
    <>
      {/* 2-col visual grid on mobile, 3-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const name = locale === 'tr' ? item.name_tr : item.name_en;
          const img = item.image_url || null;

          return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group flex flex-col bg-[#181818] border border-[#242424] hover:border-[#D4A843]/30 rounded-xl overflow-hidden text-left cursor-pointer active:scale-[0.98] transition-all duration-200"
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-[#1e1e1e] shrink-0">
                {img ? (
                  <Image
                    src={img}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-400"
                    style={{ filter: 'brightness(0.88)' }}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-[#333]" strokeWidth={1} />
                  </div>
                )}
                {item.is_featured && (
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#D4A843] flex items-center justify-center shadow">
                    <Star className="w-2.5 h-2.5 text-[#0f0f0f] fill-[#0f0f0f]" />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 p-2.5 gap-1">
                <p className="font-display font-semibold text-[#f0ece4] text-[13px] sm:text-sm leading-snug line-clamp-2">
                  {name}
                </p>
                <p className="font-bold text-[#D4A843] text-xs sm:text-sm mt-auto tracking-wide">
                  {formatPrice(item.price)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <ItemDetailModal
          item={selected}
          locale={locale}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
