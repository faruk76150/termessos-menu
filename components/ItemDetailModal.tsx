'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { X, Utensils } from 'lucide-react';
import type { MenuItem } from '@/lib/types';

interface Props {
  item: MenuItem;
  locale: string;
  onClose: () => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'decimal', minimumFractionDigits: 2 }).format(price) + ' ₺';
}

export default function ItemDetailModal({ item, locale, onClose }: Props) {
  const name = locale === 'tr' ? item.name_tr : item.name_en;
  const altName = locale === 'tr' ? item.name_en : item.name_tr;
  const desc = locale === 'tr' ? item.description_tr : item.description_en;
  const img = item.image_url || null;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-stone-100">
          {img ? (
            <Image
              src={img}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 448px"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-50">
              <Utensils className="w-16 h-16 text-stone-200" strokeWidth={1} />
            </div>
          )}
          {/* Gradient overlay at bottom of image */}
          {img && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          )}
          {/* Price on image */}
          <div className="absolute bottom-3 left-4">
            <span className="bg-brand-700 text-white font-bold text-lg px-4 py-1.5 rounded-xl shadow-lg">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="font-display font-bold text-2xl text-stone-900 leading-tight">
              {name}
            </h2>
            {item.is_featured && (
              <span className="shrink-0 mt-1 text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {locale === 'tr' ? 'Önerilen' : 'Featured'}
              </span>
            )}
          </div>

          {altName && altName !== name && (
            <p className="text-xs text-stone-400 mb-3 italic">{altName}</p>
          )}

          {desc ? (
            <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
          ) : (
            <p className="text-stone-300 text-sm italic">
              {locale === 'tr' ? 'Açıklama mevcut değil.' : 'No description available.'}
            </p>
          )}

          {/* Drag handle for mobile (visual cue) */}
          <div className="mt-5 flex justify-center sm:hidden">
            <div className="w-10 h-1 rounded-full bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
