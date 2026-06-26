'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { X, Utensils, Star } from 'lucide-react';
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-[#141414] border border-[#2a2a2a] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-[#0f0f0f]/80 border border-[#333] text-[#888] hover:text-[#f0ece4] rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-[#1a1a1a] shrink-0">
          {img ? (
            <Image
              src={img}
              alt={name}
              fill
              className="object-cover brightness-90"
              sizes="(max-width: 640px) 100vw, 448px"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Utensils className="w-14 h-14 text-[#333]" strokeWidth={1} />
            </div>
          )}
          {img && <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 via-transparent to-transparent" />}
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-7 overflow-y-auto">
          {/* Price */}
          <div className="inline-block bg-[#1e1a0e] border border-[#D4A843]/40 text-[#D4A843] font-bold text-lg px-4 py-1 rounded-lg mb-3 tracking-wide">
            {formatPrice(item.price)}
          </div>

          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display font-bold text-2xl text-[#f0ece4] leading-tight flex-1">{name}</h2>
            {item.is_featured && (
              <span className="shrink-0 flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-widest bg-[#1e1a0e] text-[#D4A843] px-2 py-0.5 rounded-full border border-[#D4A843]/30">
                <Star className="w-2.5 h-2.5 fill-[#D4A843]" />
                {locale === 'tr' ? 'Önerilen' : 'Featured'}
              </span>
            )}
          </div>

          {altName && altName !== name && (
            <p className="text-xs text-[#555] mt-0.5 italic">{altName}</p>
          )}

          {/* Divider */}
          <div className="h-px bg-[#2a2a2a] my-3" />

          {desc ? (
            <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
          ) : (
            <p className="text-[#444] text-sm italic">
              {locale === 'tr' ? 'Açıklama mevcut değil.' : 'No description available.'}
            </p>
          )}

          {/* Mobile handle */}
          <div className="mt-5 flex justify-center sm:hidden">
            <div className="w-10 h-1 rounded-full bg-[#333]" />
          </div>
        </div>
      </div>
    </div>
  );
}
