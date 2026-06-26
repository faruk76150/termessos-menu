'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Clock, Phone } from 'lucide-react';
import type { SiteSettings } from '@/lib/settings';

interface Props {
  locale: string;
  settings: SiteSettings;
}

export default function Header({ locale, settings }: Props) {
  const pathname = usePathname();
  const otherLocale = locale === 'tr' ? 'en' : 'tr';
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const phone = settings.restaurant_phone;
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <header className="bg-stone-950 text-stone-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-display font-bold text-base text-white leading-none">
            {settings.restaurant_name.charAt(0)}
          </div>
          <div className="leading-none">
            <p className="font-display font-semibold text-[15px] tracking-wide">{settings.restaurant_name}</p>
            <p className="text-[10px] text-stone-500 tracking-widest uppercase mt-0.5">{settings.restaurant_tagline}</p>
          </div>
        </Link>

        {/* Info — hidden on very small, shown as row on sm+ */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-brand-500" /> {settings.restaurant_location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-brand-500" /> {settings.restaurant_hours}
          </span>
          <a href={phoneHref} className="flex items-center gap-1 hover:text-stone-300 transition-colors">
            <Phone size={11} className="text-brand-500" /> {phone}
          </a>
        </div>

        {/* Lang switcher */}
        <Link
          href={otherPath}
          className="shrink-0 text-[11px] font-semibold tracking-widest border border-stone-700 px-3 py-1.5 rounded-full hover:bg-stone-800 hover:border-stone-600 transition-colors"
        >
          {otherLocale.toUpperCase()}
        </Link>
      </div>

      {/* Mobile info strip */}
      <div className="sm:hidden border-t border-stone-800 bg-stone-900">
        <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto scrollbar-hide text-[11px] text-stone-500">
          <span className="flex items-center gap-1 shrink-0">
            <MapPin size={10} className="text-brand-500" /> {settings.restaurant_location.split('/')[0].trim()}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock size={10} className="text-brand-500" /> {settings.restaurant_hours}
          </span>
          <a href={phoneHref} className="flex items-center gap-1 shrink-0 hover:text-stone-300">
            <Phone size={10} className="text-brand-500" /> {phone}
          </a>
        </div>
      </div>
    </header>
  );
}
